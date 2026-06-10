import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { getVisibleIssueTypes, JIRA_ISSUE_TYPES, roleLabel, uById } from '../utils/helpers';
import { AppIcon, Icons } from './icons';
import RichTextEditor from './RichTextEditor';
import WorkItemSectionChat from './WorkItemSectionChat';

const EMPTY_FORM = {
  summary: '',
  description: '',
  status: 'To Do',
  prio: 'Medium',
  assign: '',
  reporter: '',
  sprint: 'Current Sprint',
  due: '',
  labels: '',
  components: '',
  fixVersion: '',
  affectsVersion: '',
  storyPoints: '',
  epicLink: '',
  environment: 'Staging',
  sev: 'Medium',
  url: '',
  dueTime: '',
  linked: '',
  message: '',
  postpones: false,
  epicName: '',
  startDate: '',
  epicColor: '#2563EB',
};

const ISSUE_TYPE_ICONS = {
  story: Icons.fileText,
  task: Icons.check,
  bug: Icons.bug,
  epic: Icons.flag,
  feature: Icons.layers,
};

function Field({ label, required, hint, children }) {
  return (
    <div className="fl">
      <label>
        {label}
        {required && <span className="cw-required"> *</span>}
      </label>
      {children}
      {hint && <div className="cw-field-hint">{hint}</div>}
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div className="fl">
      <label>{label}</label>
      <div className="fi fi-readonly">{value}</div>
    </div>
  );
}

export default function CreateWorkItemModal() {
  const {
    modal,
    setModal,
    createTab,
    project,
    users,
    user,
    permissions,
    toast,
    refreshProjects,
    addNotification,
  } = useApp();

  const [tab, setTab] = useState('story');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tabChats, setTabChats] = useState({});
  const [chatDrafts, setChatDrafts] = useState({});

  const visibleTabs = useMemo(() => getVisibleIssueTypes(permissions), [permissions]);

  const memOpts = project?.members
    ? project.members.map((id) => uById(users, id)).filter(Boolean)
    : users ?? [];

  const epicOptions = project?.epics ?? [];

  useEffect(() => {
    if (modal !== 'create') return;
    const initial = visibleTabs.some((t) => t.id === createTab) ? createTab : visibleTabs[0]?.id || 'story';
    setTab(initial);
    setForm({ ...EMPTY_FORM, reporter: user?.id || '' });
  }, [modal, createTab, visibleTabs, user?.id]);

  if (modal !== 'create' || !project) return null;

  if (visibleTabs.length === 0) {
    return (
      <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
        <div className="modal cw-modal">
          <div className="modal-hd">
            <span className="modal-title">Create work item</span>
            <button type="button" className="modal-x" onClick={() => setModal(null)} aria-label="Close">
              <AppIcon icon={Icons.x} size={16} />
            </button>
          </div>
          <div className="modal-body">
            <p className="t-muted-sm">Your role does not have permission to create work items.</p>
          </div>
        </div>
      </div>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const activeType = JIRA_ISSUE_TYPES.find((t) => t.id === tab) || visibleTabs[0];
  const issueType = activeType?.type || 'Story';

  const getChatMessages = () => tabChats[tab] || [];
  const getChatDraft = () => chatDrafts[tab] || '';

  const setChatDraft = (value) => {
    setChatDrafts((prev) => ({ ...prev, [tab]: value }));
  };

  const sendChat = () => {
    const text = (chatDrafts[tab] || '').trim();
    if (!text) return;
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      userId: user?.id || '',
      userName: user?.name || 'Unknown',
      createdAt: new Date().toISOString(),
    };
    setTabChats((prev) => ({ ...prev, [tab]: [...(prev[tab] || []), msg] }));
    setChatDrafts((prev) => ({ ...prev, [tab]: '' }));
  };

  const collectTabComments = () => tabChats[tab] || [];

  const close = () => {
    if (saving) return;
    setModal(null);
    setForm(EMPTY_FORM);
    setTabChats({});
    setChatDrafts({});
  };

  const stripHtml = (html) =>
    String(html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const submit = async () => {
    if (!permissions[activeType.perm]) {
      return toast(`You cannot create ${activeType.label} items`, 'err');
    }
    if (!form.summary.trim()) return toast('Summary is required', 'err');
    if (tab === 'bug' && !stripHtml(form.description)) {
      return toast('Description is required for bugs', 'err');
    }
    if (tab === 'epic' && !form.epicName.trim()) {
      return toast('Epic name is required', 'err');
    }

    setSaving(true);
    try {
      const comments = collectTabComments();
      if (tab === 'bug') {
        const created = await api.createBug(project.id, {
          title: form.summary.trim(),
          description: stripHtml(form.description),
          url: form.url,
          dueTime: form.dueTime,
          message: form.message,
          sev: form.sev,
          prio: form.prio,
          assign: form.assign,
          linked: form.linked,
          postpones: form.postpones,
          environment: form.environment,
          affectsVersion: form.affectsVersion,
          reporter: form.reporter,
          comments,
        });
        await api.createIssue(project.id, {
          title: form.summary.trim(),
          type: 'Bug',
          description: form.description,
          prio: form.prio,
          assign: form.assign,
          sprint: form.sprint,
          due: form.due,
          status: 'Open',
          reporter: form.reporter,
          labels: form.labels,
          environment: form.environment,
          affectsVersion: form.affectsVersion,
          linked: created.id,
          comments,
        });
        if (form.postpones) {
          const u = uById(users, form.assign);
          await addNotification(
            `<strong>Priority Bug ${created.id}</strong>: ${form.summary} — ${u?.name}'s tasks postponed`,
            'bug'
          );
          toast(`⚠ Priority bug — ${u?.name || 'assignee'}'s tasks postponed`, 'warn');
        } else {
          toast(`${created.id} reported ✓`, 'ok');
        }
      } else if (tab === 'epic') {
        const created = await api.createEpic(project.id, {
          epicName: form.epicName.trim(),
          title: form.summary.trim(),
          description: form.description,
          prio: form.prio,
          assign: form.assign,
          status: form.status,
          start: form.startDate,
          due: form.due,
          color: form.epicColor,
          reporter: form.reporter,
          labels: form.labels,
          comments,
        });
        await addNotification(
          `<strong>${user.name}</strong> created epic <strong>${created.issue.id}</strong>: ${form.summary.trim()}`,
          'task'
        );
        toast(`${created.issue.id} epic created ✓`, 'ok');
      } else {
        const created = await api.createIssue(project.id, {
          title: form.summary.trim(),
          type: issueType,
          description: form.description,
          prio: form.prio,
          assign: form.assign,
          sprint: form.sprint,
          due: form.due,
          status: form.status,
          reporter: form.reporter,
          labels: form.labels,
          components: form.components,
          fixVersion: form.fixVersion,
          storyPoints: form.storyPoints,
          epicLink: form.epicLink,
          comments,
        });
        await addNotification(
          `<strong>${user.name}</strong> created <strong>${created.id}</strong>: ${form.summary.trim()}`,
          'task'
        );
        toast(`${created.id} created ✓`, 'ok');
      }
      await refreshProjects();
      close();
    } catch (e) {
      toast(e.message || 'Failed to create work item', 'err');
    } finally {
      setSaving(false);
    }
  };

  const userOpts = <option value="">Unassigned</option>;
  const showSprintFields = tab !== 'epic';
  const showHierarchyFields = tab === 'story' || tab === 'task' || tab === 'feature';

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal cw-modal">
        <div className="modal-hd">
          <span className="modal-title">Create {activeType.label}</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>

        <div className="cw-tabs cw-tabs-jira" role="tablist" aria-label="Issue type">
          {visibleTabs.map((t) => {
            const TypeIcon = ISSUE_TYPE_ICONS[t.id] || Icons.circle;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`cw-tab cw-tab-jira${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className={`chip ${t.chip} cw-tab-type-chip`}>{t.label}</span>
                <AppIcon icon={TypeIcon} size={14} className="cw-tab-type-icon" />
              </button>
            );
          })}
        </div>

        <div className="modal-body cw-body">
          <div className="cw-intro">
            Required fields are marked <span className="cw-required">*</span>. Switch issue type above — same as
            Jira&apos;s Create dialog (Story, Task, Bug, Epic, Feature).
          </div>

          <div className="cw-section">
            <div className="cw-section-title">Required</div>
            <Field label="Summary" required>
              <input
                className="fi"
                value={form.summary}
                onChange={(e) => set({ summary: e.target.value })}
                placeholder={`Short ${issueType.toLowerCase()} summary`}
              />
            </Field>
            {tab === 'epic' && (
              <Field label="Epic Name" required hint="Short label shown on child stories in the roadmap.">
                <input
                  className="fi"
                  value={form.epicName}
                  onChange={(e) => set({ epicName: e.target.value })}
                  placeholder="e.g. Auth & Security"
                />
              </Field>
            )}
            <Field
              label="Description"
              required={tab === 'bug'}
              hint="Rich text — bold, lists, checklists, code blocks, tables, links, @mentions, emoji, colors, alignment."
            >
              <RichTextEditor
                value={form.description}
                onChange={(html) => set({ description: html })}
                placeholder="Describe the work item… Type / for quick commands."
              />
            </Field>
          </div>

          <div className="cw-section">
            <div className="cw-section-title">Details</div>
            <div className="f2">
              <ReadonlyField label="Project" value={`${project.name} (${project.code})`} />
              <ReadonlyField label="Issue Type" value={issueType} />
            </div>
            <div className="f2">
              <Field label="Status">
                <select className="fs" value={form.status} onChange={(e) => set({ status: e.target.value })}>
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Code Review</option>
                  <option>Testing</option>
                  <option>Blocked</option>
                  <option>Done</option>
                  {tab === 'bug' && <option>Open</option>}
                </select>
              </Field>
              <Field label="Priority">
                <select className="fs" value={form.prio} onChange={(e) => set({ prio: e.target.value })}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </Field>
            </div>
            <div className="f2">
              <Field label="Assignee">
                <select className="fs" value={form.assign} onChange={(e) => set({ assign: e.target.value })}>
                  {userOpts}
                  {memOpts.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({roleLabel(u.role)})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reporter" hint="Optional — who reported this item.">
                <select className="fs" value={form.reporter} onChange={(e) => set({ reporter: e.target.value })}>
                  <option value="">None</option>
                  {memOpts.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({roleLabel(u.role)})
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {showSprintFields && (
              <div className="f2">
                <Field label="Sprint">
                  <select className="fs" value={form.sprint} onChange={(e) => set({ sprint: e.target.value })}>
                    <option>Current Sprint</option>
                    <option>Next Sprint</option>
                    <option>Backlog</option>
                    {(project.sprints ?? []).map((s) => (
                      <option key={s.num} value={`Sprint ${s.num}`}>
                        Sprint {s.num} — {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Due Date">
                  <input type="date" className="fi" value={form.due} onChange={(e) => set({ due: e.target.value })} />
                </Field>
              </div>
            )}
          </div>

          {showHierarchyFields && (
            <div className="cw-section">
              <div className="cw-section-title">
                {tab === 'story' ? 'Story fields' : tab === 'task' ? 'Task fields' : 'Feature fields'}
              </div>
              <div className="f2">
                {tab === 'story' && (
                  <Field label="Story Points" hint="Estimate complexity (Fibonacci: 1, 2, 3, 5, 8, 13…).">
                    <input
                      className="fi"
                      value={form.storyPoints}
                      onChange={(e) => set({ storyPoints: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </Field>
                )}
                <Field label="Epic Link" hint="Link this item to a parent epic on the roadmap.">
                  <select className="fs" value={form.epicLink} onChange={(e) => set({ epicLink: e.target.value })}>
                    <option value="">None</option>
                    {epicOptions.map((ep) => (
                      <option key={ep.name} value={ep.name}>
                        {ep.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="f2">
                <Field label="Labels">
                  <input
                    className="fi"
                    value={form.labels}
                    onChange={(e) => set({ labels: e.target.value })}
                    placeholder="frontend, api, sprint-7"
                  />
                </Field>
                <Field label="Components">
                  <input
                    className="fi"
                    value={form.components}
                    onChange={(e) => set({ components: e.target.value })}
                    placeholder="e.g. Payments, Auth"
                  />
                </Field>
              </div>
              <Field label="Fix Version">
                <input
                  className="fi"
                  value={form.fixVersion}
                  onChange={(e) => set({ fixVersion: e.target.value })}
                  placeholder="e.g. v4.0.0"
                />
              </Field>
            </div>
          )}

          {tab === 'bug' && (
            <div className="cw-section">
              <div className="cw-section-title">Bug fields</div>
              <div className="f2">
                <Field label="Severity">
                  <select className="fs" value={form.sev} onChange={(e) => set({ sev: e.target.value })}>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </Field>
                <Field label="Environment">
                  <select className="fs" value={form.environment} onChange={(e) => set({ environment: e.target.value })}>
                    <option>Development</option>
                    <option>Staging</option>
                    <option>UAT</option>
                    <option>Production</option>
                  </select>
                </Field>
              </div>
              <div className="f2">
                <Field label="Affects Version">
                  <input
                    className="fi"
                    value={form.affectsVersion}
                    onChange={(e) => set({ affectsVersion: e.target.value })}
                    placeholder="e.g. v3.9.2"
                  />
                </Field>
                <Field label="Linked issue">
                  <input
                    className="fi"
                    value={form.linked}
                    onChange={(e) => set({ linked: e.target.value })}
                    placeholder="e.g. PHXN-279"
                  />
                </Field>
              </div>
              <Field label="URL">
                <input
                  type="url"
                  className="fi"
                  value={form.url}
                  onChange={(e) => set({ url: e.target.value })}
                  placeholder="https://staging.example.com/page"
                />
              </Field>
              <div className="f2">
                <Field label="Due date & time">
                  <input
                    type="datetime-local"
                    className="fi"
                    value={form.dueTime}
                    onChange={(e) => set({ dueTime: e.target.value })}
                  />
                </Field>
                <Field label="Labels">
                  <input
                    className="fi"
                    value={form.labels}
                    onChange={(e) => set({ labels: e.target.value })}
                    placeholder="regression, mobile"
                  />
                </Field>
              </div>
              <Field label="Message" hint="Internal note for the assignee.">
                <textarea
                  className="fa"
                  rows={2}
                  value={form.message}
                  onChange={(e) => set({ message: e.target.value })}
                  placeholder="Escalation notes or context…"
                />
              </Field>
              <div className="fl bug-form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={form.postpones}
                    onChange={(e) => set({ postpones: e.target.checked })}
                  />
                  Mark as priority bug — postpone assignee&apos;s tasks
                </label>
              </div>
            </div>
          )}

          {tab === 'epic' && (
            <div className="cw-section">
              <div className="cw-section-title">Epic fields</div>
              <div className="f2">
                <Field label="Start Date">
                  <input
                    type="date"
                    className="fi"
                    value={form.startDate}
                    onChange={(e) => set({ startDate: e.target.value })}
                  />
                </Field>
                <Field label="Due Date">
                  <input type="date" className="fi" value={form.due} onChange={(e) => set({ due: e.target.value })} />
                </Field>
              </div>
              <div className="f2">
                <Field label="Epic Color" hint="Shown on the product roadmap timeline.">
                  <div className="cw-color-row">
                    <input
                      type="color"
                      className="cw-color-input"
                      value={form.epicColor}
                      onChange={(e) => set({ epicColor: e.target.value })}
                    />
                    <input
                      className="fi"
                      value={form.epicColor}
                      onChange={(e) => set({ epicColor: e.target.value })}
                    />
                  </div>
                </Field>
                <Field label="Labels">
                  <input
                    className="fi"
                    value={form.labels}
                    onChange={(e) => set({ labels: e.target.value })}
                    placeholder="roadmap, q3"
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="cw-section">
            <WorkItemSectionChat
              title={`${activeType.label} chat`}
              messages={getChatMessages()}
              draft={getChatDraft()}
              onDraftChange={setChatDraft}
              onSend={sendChat}
              user={user}
            />
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn fx g4${tab === 'bug' ? ' btn-red' : ' btn-primary'}`}
            onClick={submit}
            disabled={saving}
          >
            <AppIcon icon={tab === 'bug' ? Icons.bug : Icons.plus} size={14} />
            {saving ? 'Creating…' : `Create ${issueType}`}
          </button>
        </div>
      </div>
    </div>
  );
}

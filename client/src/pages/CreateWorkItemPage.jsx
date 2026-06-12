import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { getVisibleIssueTypes, WORK_ITEM_TYPES, roleLabel, uById, WORKFLOW_STATUSES } from '../utils/helpers';
import { AppIcon, Icons } from '../components/icons';
import RichTextEditor from '../components/RichTextEditor';
import WorkItemSectionChat from '../components/WorkItemSectionChat';
import SubtaskBuilder from '../components/SubtaskBuilder';
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
  summary: '',
  description: '',
  status: 'Dev Progress',
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

const TITLE_FIELD_BY_TAB = {
  story: { label: 'Story name', placeholder: 'Story name' },
  task: { label: 'Task name', placeholder: 'Task name' },
  bug: { label: 'Bug name', placeholder: 'Bug name' },
  epic: { label: 'Epic name', placeholder: 'Epic name' },
  feature: { label: 'Feature name', placeholder: 'Feature name' },
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

export default function CreateWorkItemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { project, users, user, permissions, toast, refreshProjects, addNotification } = useApp();

  const [tab, setTab] = useState('story');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tabChats, setTabChats] = useState({});
  const [chatDrafts, setChatDrafts] = useState({});
  const [subtasks, setSubtasks] = useState([]);

  const visibleTabs = useMemo(() => getVisibleIssueTypes(permissions), [permissions]);
  const typeParam = searchParams.get('type') || 'story';

  const memOpts = project?.members
    ? project.members.map((id) => uById(users, id)).filter(Boolean)
    : users ?? [];

  const epicOptions = project?.epics ?? [];

  useEffect(() => {
    const initial = visibleTabs.some((t) => t.id === typeParam) ? typeParam : visibleTabs[0]?.id || 'story';
    setTab(initial);
  }, [typeParam, visibleTabs]);

  useEffect(() => {
    setForm({ ...EMPTY_FORM, reporter: user?.id || '' });
    setSubtasks([]);
    setTabChats({});
    setChatDrafts({});
  }, [user?.id]);

  const goBack = () => {
    const from = location.state?.from;
    if (from && from !== '/create') {
      navigate(from);
      return;
    }
    navigate(-1);
  };

  if (!project) return null;

  if (visibleTabs.length === 0) {
    return (
      <>
        <PageHeader title="Create work item" subtitle="You do not have permission to create work items." />
        <div className="card" style={{ padding: 20 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={goBack}>
            Go back
          </button>
        </div>
      </>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const activeType = WORK_ITEM_TYPES.find((t) => t.id === tab) || visibleTabs[0];
  const issueType = activeType?.type || 'Story';
  const titleField = TITLE_FIELD_BY_TAB[tab] || { label: 'Summary', placeholder: 'Short summary' };

  const switchTab = (id) => {
    setTab(id);
    setSearchParams({ type: id }, { replace: true });
  };

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

  const cancel = () => {
    if (saving) return;
    goBack();
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
    if (!form.summary.trim()) return toast(`${titleField.label} is required`, 'err');
    if (tab === 'bug' && !stripHtml(form.description)) {
      return toast('Description is required for bugs', 'err');
    }
    if (tab === 'epic' && !form.epicName.trim()) {
      return toast('Roadmap label is required', 'err');
    }
    const validSubtasks = tab === 'feature' ? subtasks.filter((st) => st.title.trim()) : [];

    setSaving(true);
    try {
      const comments = collectTabComments();
      let createdId = null;

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
        const issue = await api.createIssue(project.id, {
          title: form.summary.trim(),
          type: 'Bug',
          description: form.description,
          prio: form.prio,
          assign: form.assign,
          sprint: form.sprint,
          due: form.due,
          status: 'Dev Progress',
          reporter: form.reporter,
          labels: form.labels,
          environment: form.environment,
          affectsVersion: form.affectsVersion,
          linked: created.id,
          comments,
        });
        createdId = issue.id;
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
        createdId = created.issue.id;
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
        createdId = created.id;
        if (tab === 'feature' && validSubtasks.length > 0) {
          for (const st of validSubtasks) {
            await api.createIssue(project.id, {
              title: st.title.trim(),
              type: 'Sub-task',
              parentId: created.id,
              description: st.description || '',
              url: st.url || '',
              message: st.message || '',
              assign: st.assign,
              prio: st.prio || form.prio,
              sprint: form.sprint,
              due: st.due || form.due,
              status: 'Dev Progress',
              reporter: form.reporter,
              epicLink: form.epicLink,
              labels: form.labels,
            });
          }
        }
        await addNotification(
          `<strong>${user.name}</strong> created <strong>${created.id}</strong>: ${form.summary.trim()}${
            validSubtasks.length ? ` (+${validSubtasks.length} sub-tasks)` : ''
          }`,
          'task'
        );
        toast(
          validSubtasks.length
            ? `${created.id} created with ${validSubtasks.length} sub-task${validSubtasks.length !== 1 ? 's' : ''} ✓`
            : `${created.id} created ✓`,
          'ok'
        );
      }
      await refreshProjects();
      navigate(createdId ? `/tasks/${createdId}` : tab === 'bug' ? '/bugs' : '/backlog');
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
    <div className="create-work-item-page">
      <div className="create-work-item-back">
        <button type="button" className="btn btn-ghost btn-sm fx g4" onClick={cancel} disabled={saving}>
          <AppIcon icon={Icons.arrowRight} size={14} style={{ transform: 'rotate(180deg)' }} />
          Back
        </button>
      </div>

      <PageHeader
        title={`Create ${activeType.label}`}
        subtitle={`${project.name} · Create work item`}
      />

      <div className="card create-work-item-card">
        <div className="cw-tabs cw-tabs-type create-work-item-tabs" role="tablist" aria-label="Issue type">
          {visibleTabs.map((t) => {
            const TypeIcon = ISSUE_TYPE_ICONS[t.id] || Icons.circle;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`cw-tab cw-tab-type${tab === t.id ? ' active' : ''}`}
                onClick={() => switchTab(t.id)}
              >
                <span className={`chip ${t.chip} cw-tab-type-chip`}>{t.label}</span>
                <AppIcon icon={TypeIcon} size={14} className="cw-tab-type-icon" />
              </button>
            );
          })}
        </div>

        <div className="create-work-item-body cw-body">
          <div className="cw-intro">
            Required fields are marked <span className="cw-required">*</span>. Switch issue type above (Story, Task,
            Bug, Epic, Feature). Features support sub-tasks with individual assignees.
          </div>

          <div className="cw-section">
            <div className="cw-section-title">Required</div>
            <Field label={titleField.label} required>
              <input
                className="fi"
                value={form.summary}
                onChange={(e) => set({ summary: e.target.value })}
                placeholder={titleField.placeholder}
              />
            </Field>
            {tab === 'epic' && (
              <Field label="Roadmap label" required hint="Short label shown on child stories in the roadmap.">
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
                  {WORKFLOW_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
              {tab === 'feature' && (
                <SubtaskBuilder subtasks={subtasks} onChange={setSubtasks} members={memOpts} />
              )}
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

        <div className="create-work-item-foot modal-foot">
          <button type="button" className="btn btn-ghost" onClick={cancel} disabled={saving}>
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

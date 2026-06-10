import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import {
  MEMBER_ROLE_OPTIONS,
  MEMBER_STATUS_OPTIONS,
  PROJECT_PHASES,
  REPORTS_TO_ROLE_IDS,
  roleLabel,
  TRAINING_OPTIONS,
  uById,
} from '../utils/helpers';

const emptyMember = () => ({
  name: '',
  role: 'developer',
  status: 'Active',
  projectIds: [],
  reportsTo: '',
  training: [],
  ontime: 100,
});
import { AppIcon, Icons } from './icons';
import CreateWorkItemModal from './CreateWorkItemModal';

function Modal({ id, title, width, children, footer }) {
  const { modal, setModal } = useApp();
  if (modal !== id) return null;
  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={width ? { width } : undefined}>
        <div className="modal-hd">
          <span className="modal-title">{title}</span>
          <button className="modal-x" onClick={() => setModal(null)} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export default function Modals() {
  const {
    modal,
    setModal,
    project,
    projects,
    users,
    user,
    assignCtx,
    setAssignCtx,
    toast,
    refreshProjects,
    refreshUsers,
    addNotification,
    switchProject,
    setProject,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isGlobalTeamAdd = location.pathname === '/team-members';

  const emptyNp = () => ({
    name: '',
    clientName: '',
    desc: '',
    start: '',
    end: '',
    spDur: '2 weeks',
    method: 'Scrum',
    pmId: '',
    phase: 'mock',
    teamLeadId: '',
    scopeDocs: [],
  });
  const [np, setNp] = useState(emptyNp);
  const [assign, setAssign] = useState({ assignId: '', prio: 'Medium' });
  const [member, setMember] = useState(emptyMember());
  const [req, setReq] = useState({ title: '', type: 'FR', prio: 'Must Have' });
  const [tc, setTc] = useState({ title: '', suite: '', type: 'Automated', assign: '', linked: '' });
  const [ticket, setTicket] = useState({ title: '', prio: 'P3 - Medium', assign: '' });

  const memOpts = project?.members
    ? project.members.map((id) => uById(users, id)).filter(Boolean)
    : users ?? [];

  useEffect(() => {
    if (modal === 'assign' && assignCtx.userId) {
      setAssign((a) => ({ ...a, assignId: assignCtx.userId }));
    }
  }, [modal, assignCtx]);

  useEffect(() => {
    if (modal !== 'addmem') return;
    setMember({
      ...emptyMember(),
      projectIds: !isGlobalTeamAdd && project?.id ? [project.id] : [],
    });
  }, [modal, isGlobalTeamAdd, project?.id]);

  const teamLeadOptions = (users ?? []).filter((u) => u.role === 'teamlead');

  const onScopeDocs = (e) => {
    const files = Array.from(e.target.files || []);
    setNp((n) => ({
      ...n,
      scopeDocs: files.map((f) => ({
        name: f.name,
        size: f.size,
        added: new Date().toISOString().slice(0, 10),
      })),
    }));
  };

  const createProject = async () => {
    const name = np.name.trim();
    if (!name) return toast('Project name required', 'err');
    try {
      const created = await api.createProject({ ...np, name });
      const data = await refreshProjects();
      const newProj = data.find((p) => p.id === created.id) || created;
      setProject(newProj);
      setModal(null);
      setNp(emptyNp());
      toast(`Project "${name}" created ✓`, 'ok');
      navigate('/dashboard');
    } catch (e) {
      toast(e.message || 'Failed to create project', 'err');
    }
  };

  const confirmAssign = async () => {
    if (!assign.assignId) return toast('Select assignee', 'err');
    await api.assignTask(project.id, { issueId: assignCtx.issueId, assignId: assign.assignId, prio: assign.prio });
    const u = uById(users, assign.assignId);
    await addNotification(`<strong>${user.name}</strong> assigned ${assignCtx.issueId || 'a task'} to <strong>${u?.name}</strong>`, 'task');
    await refreshProjects();
    setModal(null);
    toast(`Assigned to ${u?.name || 'member'} ✓`, 'ok');
  };

  const managerOptions = (users ?? []).filter((u) => REPORTS_TO_ROLE_IDS.includes(u.role));

  const toggleMemberProject = (projectId, checked) => {
    setMember((m) => ({
      ...m,
      projectIds: checked
        ? [...new Set([...m.projectIds, projectId])]
        : m.projectIds.filter((id) => id !== projectId),
    }));
  };

  const toggleMemberTraining = (program, checked) => {
    setMember((m) => ({
      ...m,
      training: checked
        ? [...new Set([...m.training, program])]
        : m.training.filter((t) => t !== program),
    }));
  };

  const addMember = async () => {
    if (!member.name.trim()) return toast('Name required', 'err');
    if (!member.reportsTo) return toast('Reported By is required', 'err');
    const projectIds = isGlobalTeamAdd
      ? member.projectIds
      : [...new Set([...(member.projectIds || []), project?.id].filter(Boolean))];
    const payload = {
      name: member.name.trim(),
      role: member.role,
      status: member.status,
      reportsTo: member.reportsTo,
      training: member.training,
      ontime: member.ontime,
      projectIds,
    };
    try {
      const u = isGlobalTeamAdd
        ? await api.createUser(payload)
        : await api.addMember(project.id, payload);
      await Promise.all([refreshProjects(), refreshUsers()]);
      setModal(null);
      setMember(emptyMember());
      toast(u.name + ' added ✓', 'ok');
    } catch (e) {
      toast(e.message || 'Failed to add member', 'err');
    }
  };

  const addReq = async () => {
    if (!req.title.trim()) return toast('Title required', 'err');
    const r = await api.addRequirement(project.id, req);
    setModal(null);
    setReq({ title: '', type: 'FR', prio: 'Must Have' });
    await refreshProjects();
    toast(r.id + ' added ✓', 'ok');
  };

  const addTC = async () => {
    if (!tc.title.trim()) return toast('Title required', 'err');
    await api.addTestCase(project.id, tc);
    await refreshProjects();
    setModal(null);
    setTc({ title: '', suite: '', type: 'Automated', assign: '', linked: '' });
    toast('Test case added ✓', 'ok');
  };

  const addTicketFn = async () => {
    if (!ticket.title.trim()) return toast('Title required', 'err');
    await api.addTicket(project.id, ticket);
    await refreshProjects();
    setModal(null);
    setTicket({ title: '', prio: 'P3 - Medium', assign: '' });
    toast('Ticket logged ✓', 'ok');
  };

  const assignIssue = assignCtx.issueId
    ? project?.issues.find((i) => i.id === assignCtx.issueId)
    : null;

  const userOpts = (
    <option value="">-- Select --</option>
  );

  return (
    <>
      <Modal
        id="newproj"
        title="Create New Project"
        width="540px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={createProject}>
              Create
            </button>
          </>
        }
      >
        <div className="fl"><label>Project Name *</label><input className="fi" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} placeholder="e.g. Phoenix Platform v4.0" /></div>
        <div className="fl"><label>Client Name</label><input className="fi" value={np.clientName} onChange={(e) => setNp({ ...np, clientName: e.target.value })} placeholder="e.g. Acme Corporation" /></div>
        <div className="fl"><label>Description</label><textarea className="fa" value={np.desc} onChange={(e) => setNp({ ...np, desc: e.target.value })} placeholder="Brief overview…" rows={2} /></div>
        <div className="f2">
          <div className="fl">
            <label>Status *</label>
            <select className="fs" value={np.phase} onChange={(e) => setNp({ ...np, phase: e.target.value })}>
              {PROJECT_PHASES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Team Leader</label>
            <select className="fs" value={np.teamLeadId} onChange={(e) => setNp({ ...np, teamLeadId: e.target.value })}>
              <option value="">Select team leader…</option>
              {(teamLeadOptions.length ? teamLeadOptions : users ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.role === 'teamlead' ? '' : ` (${u.role})`}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="f2">
          <div className="fl"><label>Start Date</label><input type="date" className="fi" value={np.start} onChange={(e) => setNp({ ...np, start: e.target.value })} /></div>
          <div className="fl"><label>End Date</label><input type="date" className="fi" value={np.end} onChange={(e) => setNp({ ...np, end: e.target.value })} /></div>
        </div>
        <div className="f2">
          <div className="fl"><label>Sprint Duration</label><select className="fs" value={np.spDur} onChange={(e) => setNp({ ...np, spDur: e.target.value })}><option>1 week</option><option>2 weeks</option><option>3 weeks</option></select></div>
          <div className="fl"><label>Methodology</label><select className="fs" value={np.method} onChange={(e) => setNp({ ...np, method: e.target.value })}><option>Scrum</option><option>Kanban</option><option>SAFe</option></select></div>
        </div>
        <div className="fl">
          <label>Project Manager</label>
          <select className="fs" value={np.pmId} onChange={(e) => setNp({ ...np, pmId: e.target.value })}>
            <option value="">Select project manager…</option>
            {(users ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="fl">
          <label>Scope Requirement Documents</label>
          <input
            type="file"
            className="fi scope-doc-input"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
            onChange={onScopeDocs}
          />
          <div className="t-muted-xs mt4">Upload BRD, FRD, or scope documents (PDF, Word, Excel, text)</div>
          {np.scopeDocs.length > 0 && (
            <ul className="scope-doc-list">
              {np.scopeDocs.map((doc) => (
                <li key={doc.name} className="scope-doc-item">
                  <AppIcon icon={Icons.fileText} size={14} />
                  <span>{doc.name}</span>
                  <span className="scope-doc-size">
                    {doc.size > 1024 * 1024
                      ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.max(1, Math.round(doc.size / 1024))} KB`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {modal === 'switch' && (
        <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ width: 400 }}>
            <div className="modal-hd"><span className="modal-title">Switch Project</span><button className="modal-x" onClick={() => setModal(null)} aria-label="Close"><AppIcon icon={Icons.x} size={16} /></button></div>
            <div className="modal-body" style={{ padding: 0 }}>
              {projects.map((p) => (
                <div key={p.id} onClick={() => { switchProject(p.id); setModal(null); navigate('/dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--g100)', cursor: 'pointer' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <div style={{ flex: 1 }}><div className="t-navy-sm">{p.name}</div><div className="t-muted-xs">Sprint {p.curSprint}/{p.totalSprints}</div></div>
                  <span className={`chip ${p.status === 'ontrack' ? 'chip-green' : p.status === 'delayed' ? 'chip-red' : 'chip-amber'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateWorkItemModal />

      <Modal id="assign" title="Assign Task" width="460px" footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary fx g4" onClick={confirmAssign}><AppIcon icon={Icons.userPlus} size={14} />Assign Task</button></>}>
        <div className="fl"><label>Task</label><div className="fi" style={{ background: 'var(--g50)', color: 'var(--heading)', fontWeight: 600 }}>{assignIssue ? `${assignIssue.id} — ${assignIssue.title}` : 'New assignment'}</div></div>
        <div className="fl"><label>Assign To *</label><select className="fs" value={assign.assignId} onChange={(e) => setAssign({ ...assign, assignId: e.target.value })}>{userOpts}{memOpts.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select></div>
        <div className="fl"><label>Priority</label><select className="fs" value={assign.prio} onChange={(e) => setAssign({ ...assign, prio: e.target.value })}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
      </Modal>

      <Modal id="addmem" title="Add Team Member" width="560px" footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary fx g4" onClick={addMember}><AppIcon icon={Icons.userPlus} size={14} />Add Member</button></>}>
        <div className="fl">
          <label>Name *</label>
          <input className="fi" value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} placeholder="e.g. Alex Morgan" />
        </div>
        <div className="f2">
          <div className="fl">
            <label>Role *</label>
            <select className="fs" value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })}>
              {MEMBER_ROLE_OPTIONS.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Status</label>
            <select className="fs" value={member.status} onChange={(e) => setMember({ ...member, status: e.target.value })}>
              {MEMBER_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="fl">
          <label>Projects</label>
          <div className="member-project-picks">
            {(projects ?? []).length === 0 && (
              <div className="t-muted-xs">No projects available yet.</div>
            )}
            {(projects ?? []).map((p) => (
              <label key={p.id} className="member-project-pick">
                <input
                  type="checkbox"
                  checked={member.projectIds.includes(p.id)}
                  onChange={(e) => toggleMemberProject(p.id, e.target.checked)}
                />
                <span className="member-project-dot" style={{ background: p.color }} />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
          <div className="t-muted-xs mt4">Select one or more projects for this member.</div>
        </div>
        <div className="fl">
          <label>Training & Learning</label>
          <div className="member-project-picks">
            {TRAINING_OPTIONS.map((t) => (
              <label key={t} className="member-project-pick">
                <input
                  type="checkbox"
                  checked={member.training.includes(t)}
                  onChange={(e) => toggleMemberTraining(t, e.target.checked)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <div className="t-muted-xs mt4">Select one or more training programs for this member.</div>
        </div>
        <div className="fl">
          <label>Reported By *</label>
          <select
            className="fs"
            value={member.reportsTo}
            required
            onChange={(e) => setMember({ ...member, reportsTo: e.target.value })}
          >
            <option value="" disabled>Select manager…</option>
            {managerOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({roleLabel(u.role)})</option>
            ))}
          </select>
          <div className="t-muted-xs mt4">Who this member reports to or works under.</div>
        </div>
        <div className="fl">
          <label>On-Time %</label>
          <input
            className="fi"
            type="number"
            min={0}
            max={100}
            value={member.ontime}
            onChange={(e) => setMember({ ...member, ontime: Number(e.target.value) })}
          />
          <div className="t-muted-xs mt4">Initial on-time delivery target (0–100%). Assigned tasks and bugs update automatically.</div>
        </div>
      </Modal>

      <Modal id="req" title="Add Requirement" width="480px" footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary fx g4" onClick={addReq}><AppIcon icon={Icons.fileText} size={14} />Add Requirement</button></>}>
        <div className="fl"><label>Title *</label><input className="fi" value={req.title} onChange={(e) => setReq({ ...req, title: e.target.value })} /></div>
        <div className="f2">
          <div className="fl"><label>Type</label><select className="fs" value={req.type} onChange={(e) => setReq({ ...req, type: e.target.value })}><option value="FR">Functional (FR)</option><option value="NFR">Non-Functional (NFR)</option></select></div>
          <div className="fl"><label>Priority</label><select className="fs" value={req.prio} onChange={(e) => setReq({ ...req, prio: e.target.value })}><option>Must Have</option><option>Should Have</option><option>Could Have</option><option>Won&apos;t Have</option></select></div>
        </div>
      </Modal>

      <Modal id="tc" title="Add Test Case" width="480px" footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary fx g4" onClick={addTC}><AppIcon icon={Icons.clipboardCheck} size={14} />Add Test Case</button></>}>
        <div className="fl"><label>Test Case Title *</label><input className="fi" value={tc.title} onChange={(e) => setTc({ ...tc, title: e.target.value })} /></div>
        <div className="f2">
          <div className="fl"><label>Suite</label><input className="fi" value={tc.suite} onChange={(e) => setTc({ ...tc, suite: e.target.value })} /></div>
          <div className="fl"><label>Type</label><select className="fs" value={tc.type} onChange={(e) => setTc({ ...tc, type: e.target.value })}><option>Automated</option><option>Manual</option><option>Performance</option><option>Load</option><option>Security</option></select></div>
        </div>
        <div className="f2">
          <div className="fl"><label>Assignee</label><select className="fs" value={tc.assign} onChange={(e) => setTc({ ...tc, assign: e.target.value })}>{userOpts}{memOpts.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <div className="fl"><label>Linked Issue</label><input className="fi" value={tc.linked} onChange={(e) => setTc({ ...tc, linked: e.target.value })} /></div>
        </div>
      </Modal>

      <Modal id="ticket" title="Log Support Ticket" width="460px" footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary fx g4" onClick={addTicketFn}><AppIcon icon={Icons.plus} size={14} />Log Ticket</button></>}>
        <div className="fl"><label>Issue Title *</label><input className="fi" value={ticket.title} onChange={(e) => setTicket({ ...ticket, title: e.target.value })} /></div>
        <div className="fl"><label>Priority</label><select className="fs" value={ticket.prio} onChange={(e) => setTicket({ ...ticket, prio: e.target.value })}><option>P1 - Critical</option><option>P2 - High</option><option>P3 - Medium</option><option>P4 - Low</option></select></div>
      </Modal>
    </>
  );
}

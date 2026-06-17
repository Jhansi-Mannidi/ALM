import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { AppIcon, Icons } from '../components/icons';
import FinanceActionsMenu from '../workspace/pages/finance/FinanceActionsMenu';
import PageHeader from '../components/PageHeader';
import TimeTrackerButton from '../components/TimeTrackerButton';
import { can, isWorkflowComplete, uById, workflowStatusChip } from '../utils/helpers';
import { sumMinutesForTarget, todayISO } from '../utils/timeHelpers';

function formatBugDue(dueTime) {
  if (!dueTime) return '—';
  const d = new Date(dueTime);
  if (Number.isNaN(d.getTime())) return dueTime;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const FILTERS = [
  ['all', 'All', null],
  ['critical', 'Critical', Icons.circleAlert],
  ['high', 'High', Icons.alertTriangle],
  ['open', 'In Pipeline', null],
  ['prod', 'Prod', null],
];

export default function BugsPage() {
  const { role, user, project, users, permissions, toast, refreshProjects } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [bugFil, setBugFil] = useState('all');
  const [bugSearch, setBugSearch] = useState('');

  if (!project) return null;

  let bugs = project.bugs;
  if (bugFil === 'critical') bugs = bugs.filter((b) => b.sev === 'Critical');
  else if (bugFil === 'high') bugs = bugs.filter((b) => b.sev === 'High');
  else if (bugFil === 'open') bugs = bugs.filter((b) => !isWorkflowComplete(b.status));
  else if (bugFil === 'prod') bugs = bugs.filter((b) => isWorkflowComplete(b.status));
  if (bugSearch) {
    const q = bugSearch.toLowerCase();
    bugs = bugs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q) ||
        (b.message || '').toLowerCase().includes(q) ||
        (b.url || '').toLowerCase().includes(q),
    );
  }

  const tot = project.bugs.length;
  const crit = project.bugs.filter((b) => b.sev === 'Critical').length;
  const open = project.bugs.filter((b) => !isWorkflowComplete(b.status)).length;
  const res = project.bugs.filter((b) => isWorkflowComplete(b.status)).length;
  const affected = project.bugs.filter((b) => b.postpones).length;

  const resolveBug = async (bugId) => {
    try {
      await api.updateBug(project.id, bugId, { status: 'Prod', postpones: false });
      await refreshProjects();
      toast(`${bugId} resolved ✓`, 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  return (
    <>
      <PageHeader
        title="Bug Tracker"
        subtitle={`${project.bugs.length} total · ${project.bugs.filter((b) => !isWorkflowComplete(b.status)).length} in pipeline`}
        actions={
          permissions.bug && (
            <button
              type="button"
              className="btn btn-red btn-sm ph-btn-compact fx g4"
              onClick={() => navigate('/create?type=bug', { state: { from: location.pathname } })}
            >
              <AppIcon icon={Icons.plus} size={14} />
              Report Bug
            </button>
          )
        }
      />

      <div className="g5 mb16">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--g600)' }} />
          <div className="stat-label">Total</div>
          <div className="stat-value">{tot}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Critical</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {crit}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">Open</div>
          <div className="stat-value">{open}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Prod</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {res}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Tasks Affected</div>
          <div className="stat-value">{affected}</div>
        </div>
      </div>

      <div className="fbar">
        <div className="si">
          <AppIcon icon={Icons.search} size={12} />
          <input
            type="text"
            placeholder="Search bugs…"
            value={bugSearch}
            onChange={(e) => setBugSearch(e.target.value)}
          />
        </div>
        {FILTERS.map(([f, label, Icon]) => (
          <button key={f} className={`fc${bugFil === f ? ' active' : ''}`} onClick={() => setBugFil(f)}>
            {Icon && <AppIcon icon={Icon} size={12} />}
            {label}
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>URL</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Message</th>
              <th>Reported</th>
              <th>Time today</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((b) => {
              const u = uById(users, b.assign);
              return (
                <tr key={b.id}>
                  <td>
                    <span className="iid">{b.id}</span>
                  </td>
                  <td>
                    <div className="t-cell-sm bug-title-cell">{b.title}</div>
                    {b.postpones && (
                      <span className="pbug-badge" style={{ marginTop: 3 }}>
                        ⚠ Tasks Postponed
                      </span>
                    )}
                  </td>
                  <td className="bug-desc-cell">
                    <span className="bug-desc-text" title={b.description || ''}>
                      {b.description || '—'}
                    </span>
                  </td>
                  <td>
                    {b.url ? (
                      <a
                        href={b.url}
                        className="bug-url-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </a>
                    ) : (
                      <span className="t-muted-xs">—</span>
                    )}
                  </td>
                  <td className="t-muted-xs bug-due-cell">{formatBugDue(b.dueTime)}</td>
                  <td>
                    <span className={`chip ${b.prio === 'Critical' ? 'chip-red' : b.prio === 'High' ? 'chip-amber' : b.prio === 'Medium' ? 'chip-blue' : 'chip-gray'}`}>
                      {b.prio}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`chip ${workflowStatusChip(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {u ? (
                      <span className="text-sm" style={{ fontWeight: 600, color: 'var(--heading)' }}>
                        {u.name}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="bug-msg-cell">
                    <span className="bug-msg-text" title={b.message || ''}>
                      {b.message || '—'}
                    </span>
                  </td>
                  <td className="t-muted-xs">{b.reported}</td>
                  <td>
                    {user?.id === b.assign && !isWorkflowComplete(b.status) ? (
                      <TimeTrackerButton
                        projectId={project.id}
                        targetType="bug"
                        targetId={b.id}
                        userId={user.id}
                        projects={[project]}
                        loggedMinutes={sumMinutesForTarget(project, user.id, b.id, todayISO())}
                        onChange={refreshProjects}
                        toast={toast}
                        compact
                      />
                    ) : (
                      <span className="t-muted-xs">—</span>
                    )}
                  </td>
                  <td>
                    <FinanceActionsMenu
                      actions={[
                        ...(!isWorkflowComplete(b.status) && (can(role, 'assign') || user?.id === b.assign)
                          ? [
                              {
                                id: `resolve-${b.id}`,
                                label: 'Resolve',
                                icon: Icons.checkCircle,
                                onClick: () => resolveBug(b.id),
                              },
                            ]
                          : []),
                        ...(can(role, 'assign') && !isWorkflowComplete(b.status)
                          ? [
                              {
                                id: `reassign-${b.id}`,
                                label: 'Reassign',
                                icon: Icons.arrowLeftRight,
                                onClick: () => toast('Bug reassigned', 'ok'),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

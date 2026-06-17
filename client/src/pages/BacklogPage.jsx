import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import {
  can,
  isWorkflowComplete,
  issueTypeChip,
  normalizeWorkflowStatus,
  prioChip,
  sChip,
  sortIssuesWithSubtasks,
  uById,
  WORKFLOW_STATUSES,
} from '../utils/helpers';
const FILTERS = [
  ['all', 'All', null],
  ...WORKFLOW_STATUSES.map((s) => [s, s, null]),
  ['bug', 'Bug', Icons.bug],
  ['critical', 'Critical', Icons.circleAlert],
];

export default function BacklogPage() {
  const { role, permissions, project, users, setModal, setAssignCtx } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [blFilter, setBlFilter] = useState('all');
  const [blSearch, setBlSearch] = useState('');

  if (!project) return null;

  let issues = project.issues;
  if (WORKFLOW_STATUSES.includes(blFilter)) {
    issues = issues.filter((i) => normalizeWorkflowStatus(i.status) === blFilter);
  } else if (blFilter === 'bug') issues = issues.filter((i) => i.type === 'Bug');
  else if (blFilter === 'critical') issues = issues.filter((i) => i.prio === 'Critical');
  if (blSearch) {
    const q = blSearch.toLowerCase();
    issues = issues.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }

  const openAssign = (issueId) => {
    setAssignCtx({ issueId, userId: null });
    setModal('assign');
  };

  const displayIssues = sortIssuesWithSubtasks(issues);

  return (
    <>
      <PageHeader
        title="Product Backlog"
        subtitle={`${project.issues.length} total · ${project.issues.filter((i) => !isWorkflowComplete(i.status)).length} open`}
        actions={
          permissions.createIssue && (
            <button
              type="button"
              className="btn btn-primary btn-sm ph-btn-compact fx g4"
              onClick={() => navigate('/create?type=feature', { state: { from: location.pathname } })}
            >
              <AppIcon icon={Icons.plus} size={14} />
              Create Feature
            </button>
          )
        }
      />

      <div className="fbar">
        <div className="si">
          <AppIcon icon={Icons.search} size={12} />
          <input
            type="text"
            placeholder="Search issues…"
            value={blSearch}
            onChange={(e) => setBlSearch(e.target.value)}
          />
        </div>
        {FILTERS.map(([f, label, Icon]) => (
          <button
            key={f}
            className={`fc${blFilter === f ? ' active' : ''}`}
            onClick={() => setBlFilter(f)}
          >
            {Icon && <AppIcon icon={Icon} size={12} />}
            {label}
          </button>
        ))}
        <span className="mla t-muted-sm">
          {issues.length} issues
        </span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Sprint</th>
              {can(role, 'assign') && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayIssues.map((i) => {
              const u = uById(users, i.assign);
              const isSubtask = !!i.parentId;
              return (
                <tr key={i.id} className={isSubtask ? 'tbl-subtask-row' : ''}>
                  <td>
                    <Link to={`/tasks/${i.id}`} className="iid task-link">
                      {i.id}
                    </Link>
                  </td>
                  <td>
                    <div className={`t-cell-sm backlog-title-cell${isSubtask ? ' is-subtask' : ''}`}>
                      {isSubtask && <span className="subtask-branch" aria-hidden="true" />}
                      <Link to={`/tasks/${i.id}`} className="task-link">
                        {i.title}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${issueTypeChip(i.type)}`}>
                      {i.type}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${prioChip(i.prio)}`}>{i.prio}</span>
                  </td>
                  <td>
                    <span className={`chip ${sChip(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td>
                    {u ? (
                      <div className="fx g5">
                        <div className={`av av-xs ${u.c}`}>{u.ini}</div>
                        <span className="text-sm">{u.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--g400)' }}>Unassigned</span>
                    )}
                  </td>
                  <td className="t-muted-xs">{i.sprint}</td>
                  {can(role, 'assign') && (
                    <td>
                      <IconButton icon={Icons.userPlus} label="Assign task" onClick={() => openAssign(i.id)} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

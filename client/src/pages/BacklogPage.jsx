import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { can, prioChip, sChip, uById } from '../utils/helpers';
const FILTERS = [
  ['all', 'All', null],
  ['todo', 'To Do', null],
  ['inprog', 'In Progress', null],
  ['done', 'Done', null],
  ['bug', 'Bug', Icons.bug],
  ['critical', 'Critical', Icons.circleAlert],
];

export default function BacklogPage() {
  const { role, project, users, setModal, setAssignCtx } = useApp();
  const [blFilter, setBlFilter] = useState('all');
  const [blSearch, setBlSearch] = useState('');

  if (!project) return null;

  let issues = project.issues;
  if (blFilter === 'todo') issues = issues.filter((i) => i.status === 'To Do');
  else if (blFilter === 'inprog') issues = issues.filter((i) => ['In Progress', 'Code Review', 'Testing'].includes(i.status));
  else if (blFilter === 'done') issues = issues.filter((i) => i.status === 'Done');
  else if (blFilter === 'bug') issues = issues.filter((i) => i.type === 'Bug');
  else if (blFilter === 'critical') issues = issues.filter((i) => i.prio === 'Critical');
  if (blSearch) {
    const q = blSearch.toLowerCase();
    issues = issues.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }

  const openAssign = (issueId) => {
    setAssignCtx({ issueId, userId: null });
    setModal('assign');
  };

  const typeChip = (type) =>
    type === 'Bug' ? 'chip-red' : type === 'Feature' ? 'chip-blue' : type === 'Epic' ? 'chip-purple' : 'chip-gray';

  return (
    <>
      <PageHeader
        title="Product Backlog"
        subtitle={`${project.issues.length} total · ${project.issues.filter((i) => i.status !== 'Done').length} open`}
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
            {issues.map((i) => {
              const u = uById(users, i.assign);
              return (
                <tr key={i.id}>
                  <td>
                    <span className="iid">{i.id}</span>
                  </td>
                  <td>
                    <div className="t-cell-sm" style={{ maxWidth: 220 }}>{i.title}</div>
                  </td>
                  <td>
                    <span className={`chip ${typeChip(i.type)}`}>
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

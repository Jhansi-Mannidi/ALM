import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import FinanceActionsMenu from '../workspace/pages/finance/FinanceActionsMenu';
import PageHeader from '../components/PageHeader';
import {
  buildMemberRows,
  buildProjectMemberRows,
  can,
  filterMemberRows,
  memberEmail,
  MEMBER_ROLE_OPTIONS,
  MEMBER_STATUS_OPTIONS,
  TRAINING_OPTIONS,
  normalizeTraining,
  roleChipClass,
  roleLabel,
  REPORTS_TO_ROLE_IDS,
} from '../utils/helpers';

function MemberEditModal({ open, user, projectIds, projects, users, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    role: 'developer',
    status: 'Active',
    projectIds: [],
    reportsTo: '',
    training: [],
    ontime: 100,
  });

  const managerOptions = (users ?? []).filter((u) => REPORTS_TO_ROLE_IDS.includes(u.role));

  useEffect(() => {
    if (!open || !user) return;
    setForm({
      name: user.name || '',
      role: user.role || 'developer',
      status: user.status || 'Active',
      projectIds: projectIds || [],
      reportsTo: user.reportsTo || '',
      training: normalizeTraining(user.training),
      ontime: user.ontime ?? 100,
    });
  }, [open, user, projectIds]);

  if (!open || !user) return null;

  const toggleProject = (projectId, checked) => {
    setForm((f) => ({
      ...f,
      projectIds: checked
        ? [...new Set([...f.projectIds, projectId])]
        : f.projectIds.filter((id) => id !== projectId),
    }));
  };

  const toggleTraining = (program, checked) => {
    setForm((f) => ({
      ...f,
      training: checked
        ? [...new Set([...f.training, program])]
        : f.training.filter((t) => t !== program),
    }));
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (!form.reportsTo) return;
    onSave(form);
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-hd">
          <span className="modal-title">Edit Team Member</span>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Name *</label>
            <input
              className="fi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="fl">
            <label>Email</label>
            <input className="fi fi-readonly" type="email" value={memberEmail(user)} readOnly tabIndex={-1} />
          </div>
          <div className="f2">
            <div className="fl">
              <label>Role</label>
              <select
                className="fs"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {MEMBER_ROLE_OPTIONS.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label>Status</label>
              <select
                className="fs"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {MEMBER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="fl">
            <label>Projects</label>
            <div className="member-project-picks">
              {(projects ?? []).map((p) => (
                <label key={p.id} className="member-project-pick">
                  <input
                    type="checkbox"
                    checked={form.projectIds.includes(p.id)}
                    onChange={(e) => toggleProject(p.id, e.target.checked)}
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
                    checked={form.training.includes(t)}
                    onChange={(e) => toggleTraining(t, e.target.checked)}
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
              value={form.reportsTo}
              required
              onChange={(e) => setForm({ ...form, reportsTo: e.target.value })}
            >
              <option value="" disabled>Select manager…</option>
              {managerOptions
                .filter((u) => u.id !== user.id)
                .map((u) => (
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
              value={form.ontime}
              onChange={(e) => setForm({ ...form, ontime: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary fx g4" onClick={save}>
            <AppIcon icon={Icons.check} size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const { role, project, projects = [], users, permissions, setModal, setAssignCtx, toast, refreshUsers, refreshProjects } =
    useApp();
  const location = useLocation();
  const [memberSearch, setMemberSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editProjectIds, setEditProjectIds] = useState([]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const isProjectScope = location.pathname === '/project-team';

  const memberRows = useMemo(() => {
    if (isProjectScope && project) return buildProjectMemberRows(project, users);
    return buildMemberRows(projects, users);
  }, [isProjectScope, project, projects, users]);

  const filteredRows = useMemo(
    () => filterMemberRows(memberRows, memberSearch, users),
    [memberRows, memberSearch, users],
  );

  const openAssign = (userId) => {
    if (!can(role, 'assign')) return;
    setAssignCtx({ issueId: null, userId: userId || null });
    setModal('assign');
  };

  const openEdit = (user, userProjects) => {
    setEditUser(user);
    setEditProjectIds((userProjects ?? []).map((p) => p.id));
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditProjectIds([]);
  };

  const saveMember = async (form) => {
    if (!editUser) return;
    if (!form.name.trim()) {
      toast('Name required', 'err');
      return;
    }
    if (!form.reportsTo) {
      toast('Reported By is required', 'err');
      return;
    }
    try {
      await api.updateUser(editUser.id, {
        name: form.name,
        role: form.role,
        status: form.status,
        reportsTo: form.reportsTo,
        training: form.training,
        ontime: form.ontime,
        projectIds: form.projectIds,
      });
      await Promise.all([refreshUsers(), refreshProjects()]);
      toast('Member updated', 'ok');
      closeEdit();
    } catch (e) {
      toast(e.message || 'Failed to update', 'err');
    }
  };

  const removeMember = async (user) => {
    const label = isProjectScope
      ? `Remove "${user.name}" from ${project.name}?`
      : `Remove "${user.name}" from all projects? This cannot be undone.`;
    if (!window.confirm(label)) return;

    try {
      if (isProjectScope) {
        await api.removeProjectMember(project.id, user.id);
      } else {
        await api.deleteUser(user.id);
      }
      await Promise.all([refreshUsers(), refreshProjects()]);
      toast(isProjectScope ? 'Member removed from project' : 'Member removed', 'ok');
    } catch (e) {
      toast(e.message || 'Failed to remove', 'err');
    }
  };

  if (!users.length) return null;

  if (isProjectScope && !project) {
    return (
      <PageHeader
        title="Project Team"
        subtitle="Select a project to view its team"
      />
    );
  }

  const colCount = isProjectScope ? 8 : 9;

  const subtitle = isProjectScope
    ? `${memberRows.length} member${memberRows.length !== 1 ? 's' : ''} on ${project.name}`
    : `${memberRows.length} team member${memberRows.length !== 1 ? 's' : ''}${projects.length > 0 ? ` across ${projects.length} projects` : ''}`;

  return (
    <>
      <PageHeader
        title={isProjectScope ? 'Project Team' : 'Team Members'}
        subtitle={subtitle}
        actions={
          permissions.addMem && (
            <button type="button" className="btn btn-primary btn-sm ph-btn-compact fx g4" onClick={() => setModal('addmem')}>
              <AppIcon icon={Icons.plus} size={14} />
              {isProjectScope ? 'Add Member' : 'Add Team Member'}
            </button>
          )
        }
      />

      <div className="fbar">
        <div className="si">
          <AppIcon icon={Icons.search} size={12} />
          <input
            type="search"
            placeholder={
              isProjectScope
                ? 'Search by name or role…'
                : 'Search by name, role, project, or manager…'
            }
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            aria-label="Search team members"
          />
          {memberSearch && (
            <button
              type="button"
              className="si-clear"
              aria-label="Clear search"
              onClick={() => setMemberSearch('')}
            >
              <AppIcon icon={Icons.x} size={12} />
            </button>
          )}
        </div>
        <span className="fbar-cnt">
          {filteredRows.length} member{filteredRows.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="tbl-wrap">
        <div className="card-hd" style={{ padding: '11px 14px' }}>
          <div className="card-title">Workload & Performance</div>
        </div>
        <table className="tbl members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Reported By</th>
              {!isProjectScope && <th>Projects</th>}
              <th>Assigned</th>
              <th>Bugs</th>
              <th>On-Time%</th>
              <th className="members-col-status">Status</th>
              <th className="members-col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ textAlign: 'center', padding: '24px', color: 'var(--g500)' }}>
                  No members match your search
                </td>
              </tr>
            )}
            {filteredRows.map(({ user: u, projects: userProjects, totalAssigned, totalBugs, reportedBy }) => (
              <tr key={u.id}>
                <td>
                  <div className="fx g8">
                    <div className={`av av-sm ${u.c}`}>{u.ini}</div>
                    <span style={{ fontWeight: 600, color: 'var(--heading)' }}>{u.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`chip ${roleChipClass(u.role)}`}>{roleLabel(u.role)}</span>
                </td>
                <td>
                  {reportedBy ? (
                    <div className="fx g8">
                      <div className={`av av-xs ${reportedBy.c}`}>{reportedBy.ini}</div>
                      <span style={{ fontWeight: 600, color: 'var(--heading)' }}>{reportedBy.name}</span>
                    </div>
                  ) : (
                    <span className="member-project-none">—</span>
                  )}
                </td>
                {!isProjectScope && (
                  <td>
                    <div className="member-projects">
                      {userProjects.length > 0 ? (
                        userProjects.map((pr) => (
                          <span
                            key={pr.id}
                            className="member-project-chip"
                            title={`${pr.name} · ${pr.assigned} open tasks · ${pr.bugs} open bugs`}
                          >
                            <span className="member-project-dot" style={{ background: pr.color }} />
                            {pr.name}
                          </span>
                        ))
                      ) : (
                        <span className="member-project-none">No project</span>
                      )}
                    </div>
                  </td>
                )}
                <td style={{ fontWeight: 700, color: 'var(--heading)' }}>{totalAssigned}</td>
                <td>
                  <span style={{ fontWeight: 700, color: totalBugs > 0 ? 'var(--red)' : 'var(--green)' }}>
                    {totalBugs}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 800,
                      color: u.ontime > 95 ? 'var(--green)' : u.ontime > 85 ? 'var(--amber)' : 'var(--red)',
                    }}
                  >
                    {u.ontime}%
                  </span>
                </td>
                <td className="members-col-status">
                  <span className="chip chip-green fx g4 members-status-chip">
                    <AppIcon icon={Icons.circle} size={6} className="status-dot-icon" />
                    {u.status || 'Active'}
                  </span>
                </td>
                <td className="members-col-action">
                  <FinanceActionsMenu
                    actions={[
                      ...(can(role, 'assign')
                        ? [{
                            id: `assign-${u.id}`,
                            label: 'Assign',
                            icon: Icons.userPlus,
                            onClick: () => openAssign(u.id),
                          }]
                        : []),
                      ...(permissions.addMem
                        ? [
                            {
                              id: `edit-${u.id}`,
                              label: 'Edit',
                              icon: Icons.pencil,
                              onClick: () => openEdit(u, userProjects),
                            },
                            {
                              id: `delete-${u.id}`,
                              label: isProjectScope ? 'Remove from project' : 'Delete',
                              icon: Icons.trash,
                              danger: true,
                              onClick: () => removeMember(u),
                            },
                          ]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <MemberEditModal
          key={editUser.id}
          open
          user={editUser}
          projectIds={editProjectIds}
          projects={projects}
          users={users}
          onClose={closeEdit}
          onSave={saveMember}
        />
      )}
    </>
  );
}

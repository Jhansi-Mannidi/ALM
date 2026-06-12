import { useMemo, useState } from 'react';
import { AppIcon, Icons } from '../../../components/icons';
import { useRbac } from '../../context/RbacContext';
import { scopeLabel, WORKSPACE_RBAC_USERS } from '../../data/rbacCatalog';
import AssignRoleModal from './AssignRoleModal';

export default function RbacUsersPage() {
  const { roles, assignments, assignUserRole } = useRbac();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const roleName = (roleId) => roles.find((r) => r.id === roleId)?.name ?? roleId;

  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => a.name.localeCompare(b.name)),
    [assignments],
  );

  const openAssign = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = (assignment) => {
    assignUserRole(assignment);
    closeModal();
  };

  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">User Assignments</h1>
          <p className="ws-rbac-page-sub">View users and their assigned workspace roles</p>
        </div>
        <button type="button" className="ws-rbac-btn-primary" onClick={openAssign}>
          <AppIcon icon={Icons.userPlus} size={14} />
          Assign Role
        </button>
      </header>

      <div className="ws-rbac-users-table-wrap card">
        <table className="ws-rbac-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Scope</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="ws-rbac-users-empty">
                  No users assigned yet. Click Assign Role to add one.
                </td>
              </tr>
            ) : (
              sortedAssignments.map((user) => {
                const role = roles.find((r) => r.id === user.roleId);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="ws-rbac-user-cell">
                        <div className="ws-rbac-user-avatar">{user.ini}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="ws-rbac-muted">{user.email}</td>
                    <td>
                      <span className="ws-rbac-role-tag" style={{ '--tag-color': role?.color }}>
                        {roleName(user.roleId)}
                      </span>
                    </td>
                    <td className="ws-rbac-muted">{scopeLabel(role?.scope)}</td>
                    <td>
                      <button
                        type="button"
                        className="ws-role-action-btn"
                        title="Edit assignment"
                        onClick={() => openEdit(user)}
                      >
                        <AppIcon icon={Icons.pencil} size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AssignRoleModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        roles={roles}
        users={WORKSPACE_RBAC_USERS}
        assignments={assignments}
        editingUser={editingUser}
      />
    </div>
  );
}

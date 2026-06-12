import { useEffect, useMemo, useState } from 'react';
import MotionModal from '../../../motion/MotionModal';
import { AppIcon, Icons } from '../../../components/icons';
import { WorkspaceIcon } from '../../components/WorkspaceIcons';
import { scopeLabel } from '../../data/rbacCatalog';

export default function AssignRoleModal({
  open,
  onClose,
  onSave,
  roles,
  users,
  assignments,
  editingUser = null,
}) {
  const isEdit = Boolean(editingUser);
  const [userId, setUserId] = useState(editingUser?.id ?? '');
  const [roleId, setRoleId] = useState(editingUser?.roleId ?? roles[0]?.id ?? '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setUserId(editingUser?.id ?? '');
    setRoleId(editingUser?.roleId ?? roles[0]?.id ?? '');
    setSearch('');
  }, [open, editingUser, roles]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.id)), [assignments]);

  const userOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (isEdit && u.id !== editingUser?.id) return false;
      if (!isEdit && assignedIds.has(u.id)) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, search, isEdit, editingUser?.id, assignedIds]);

  const selectedUser = users.find((u) => u.id === userId) ?? editingUser;
  const selectedRole = roles.find((r) => r.id === roleId);

  const handleSave = () => {
    if (!userId || !roleId || !selectedUser) return;
    onSave({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      ini: selectedUser.ini || selectedUser.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
      roleId,
    });
  };

  const canSave = Boolean(userId && roleId);

  return (
    <MotionModal open={open} onClose={onClose} modalClassName="ws-rbac-assign-modal">
      <div className="modal-hd ws-rbac-create-modal-hd">
        <div className="ws-rbac-create-modal-hd-text">
          <span className="ws-rbac-create-modal-kicker">User access</span>
          <span className="modal-title">{isEdit ? 'Edit Assignment' : 'Assign Role'}</span>
          <p className="ws-rbac-create-modal-sub">
            {isEdit
              ? 'Update the workspace role for this team member.'
              : 'Choose a user and role to grant workspace access.'}
          </p>
        </div>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
          <AppIcon icon={Icons.x} size={16} />
        </button>
      </div>

      <div className="modal-body ws-rbac-assign-modal-body">
        <div className="ws-rbac-create-layout ws-rbac-assign-layout">
          <div className="ws-rbac-create-form">
            <section className="ws-rbac-create-section">
              <h3 className="ws-rbac-create-section-title">Team member</h3>
              {isEdit ? (
                <div className="ws-rbac-assign-selected-user">
                  <div className="ws-rbac-user-avatar">{selectedUser?.ini}</div>
                  <div>
                    <div className="ws-rbac-assign-user-name">{selectedUser?.name}</div>
                    <div className="ws-rbac-muted">{selectedUser?.email}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ws-rbac-assign-search-wrap">
                    <AppIcon icon={Icons.search} size={15} className="ws-rbac-search-icon" />
                    <input
                      type="search"
                      className="ws-rbac-search ws-rbac-assign-search"
                      placeholder="Search by name or email…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="ws-rbac-assign-user-list">
                    {userOptions.length === 0 ? (
                      <p className="ws-rbac-assign-empty">No unassigned users match your search.</p>
                    ) : (
                      userOptions.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className={`ws-rbac-assign-user-option${userId === u.id ? ' active' : ''}`}
                          onClick={() => setUserId(u.id)}
                        >
                          <div className="ws-rbac-user-avatar">{u.ini}</div>
                          <div className="ws-rbac-assign-user-option-text">
                            <span className="ws-rbac-assign-user-name">{u.name}</span>
                            <span className="ws-rbac-muted">{u.email}</span>
                          </div>
                          {userId === u.id && (
                            <AppIcon icon={Icons.checkCircle} size={16} className="ws-rbac-assign-check" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="ws-rbac-create-section">
              <h3 className="ws-rbac-create-section-title">Workspace role</h3>
              <p className="ws-rbac-create-section-hint">Permissions and scope follow the selected role.</p>
              <div className="ws-rbac-assign-role-list">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`ws-rbac-assign-role-option${roleId === role.id ? ' active' : ''}`}
                    onClick={() => setRoleId(role.id)}
                  >
                    <div
                      className="ws-rbac-assign-role-icon"
                      style={{ background: `${role.color}18`, color: role.color }}
                    >
                      <WorkspaceIcon name={role.icon} size={18} />
                    </div>
                    <div className="ws-rbac-assign-role-text">
                      <span className="ws-rbac-assign-role-name">{role.name}</span>
                      <span className="ws-rbac-muted">{scopeLabel(role.scope)}</span>
                    </div>
                    <span className={`ws-rbac-badge${role.type === 'system' ? ' system' : ''}`}>
                      {role.type}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="ws-rbac-create-preview ws-rbac-assign-preview" aria-label="Assignment preview">
            <div className="ws-rbac-create-preview-label">Preview</div>
            {selectedUser && selectedRole ? (
              <>
                <div className="ws-rbac-assign-preview-card card">
                  <div className="ws-rbac-user-cell">
                    <div className="ws-rbac-user-avatar">{selectedUser.ini}</div>
                    <div>
                      <div className="ws-rbac-assign-user-name">{selectedUser.name}</div>
                      <div className="ws-rbac-muted">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="ws-rbac-assign-preview-divider" />
                  <div className="ws-rbac-assign-preview-row">
                    <span className="ws-rbac-assign-preview-label-sm">Role</span>
                    <span
                      className="ws-rbac-role-tag"
                      style={{ '--tag-color': selectedRole.color }}
                    >
                      {selectedRole.name}
                    </span>
                  </div>
                  <div className="ws-rbac-assign-preview-row">
                    <span className="ws-rbac-assign-preview-label-sm">Scope</span>
                    <span>{scopeLabel(selectedRole.scope)}</span>
                  </div>
                </div>
                <p className="ws-rbac-create-preview-note">
                  The user will inherit all permissions configured for this role.
                </p>
              </>
            ) : (
              <p className="ws-rbac-create-preview-note">Select a user and role to preview the assignment.</p>
            )}
          </aside>
        </div>
      </div>

      <div className="modal-foot ws-rbac-create-modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="ws-rbac-btn-primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          <AppIcon icon={Icons.userPlus} size={14} />
          {isEdit ? 'Save Changes' : 'Assign Role'}
        </button>
      </div>
    </MotionModal>
  );
}

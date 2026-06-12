import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import { WorkspaceIcon } from '../../components/WorkspaceIcons';
import { useRbac } from '../../context/RbacContext';
import { RBAC_SCOPES, scopeLabel } from '../../data/rbacCatalog';
import CreateRoleModal from './CreateRoleModal';

function RoleCard({ role, onDelete }) {
  const isSystem = role.type === 'system';

  return (
    <div className="ws-role-card">
      <div className="ws-role-card-icon" style={{ background: `${role.color}18`, color: role.color }}>
        <WorkspaceIcon name={role.icon} size={22} />
      </div>

      <div className="ws-role-card-body">
        <div className="ws-role-card-head">
          <h3 className="ws-role-card-name">{role.name}</h3>
          <span className={`ws-rbac-badge ${role.status}`}>{role.status}</span>
        </div>
        <p className="ws-role-card-desc">{role.description}</p>
        <div className="ws-role-card-meta">
          <span className="ws-role-card-meta-item">
            <AppIcon icon={Icons.users} size={13} />
            {role.users} users
          </span>
          <span className="ws-role-card-meta-item">
            Scope: {scopeLabel(role.scope)}
          </span>
        </div>
      </div>

      <div className="ws-role-card-actions">
        <Link
          to={`/workspace/admin/rbac/roles/${role.id}`}
          className="ws-role-action-btn"
          title="Edit permissions"
        >
          <AppIcon icon={Icons.pencil} size={15} />
        </Link>
        {isSystem ? (
          <span className="ws-role-action-btn locked" title="System role — cannot delete">
            <AppIcon icon={Icons.lock} size={15} />
          </span>
        ) : (
          <button
            type="button"
            className="ws-role-action-btn danger"
            title="Delete role"
            onClick={() => onDelete(role)}
          >
            <AppIcon icon={Icons.trash} size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function RolesPage() {
  const navigate = useNavigate();
  const { roles, deleteRole } = useRbac();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        scopeLabel(r.scope).toLowerCase().includes(q)
    );
  }, [roles, search]);

  const systemRoles = filtered.filter((r) => r.type === 'system');
  const customRoles = filtered.filter((r) => r.type === 'custom');

  const handleDelete = (role) => {
    if (window.confirm(`Delete role "${role.name}"? Users assigned to this role will lose access.`)) {
      deleteRole(role.id);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(roles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voltusworkspace-roles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">Role Management</h1>
          <p className="ws-rbac-page-sub">Manage system and custom roles</p>
        </div>
        <div className="ws-rbac-page-actions">
          <button type="button" className="ws-rbac-btn-outline" onClick={handleExport}>
            <AppIcon icon={Icons.download} size={14} />
            Export
          </button>
          <button type="button" className="ws-rbac-btn-outline">
            <AppIcon icon={Icons.upload} size={14} />
            Import
          </button>
          <button type="button" className="ws-rbac-btn-primary" onClick={() => setShowCreate(true)}>
            <AppIcon icon={Icons.plus} size={14} />
            Create Role
          </button>
        </div>
      </header>

      <div className="ws-rbac-search-wrap">
        <AppIcon icon={Icons.search} size={16} className="ws-rbac-search-icon" />
        <input
          type="search"
          className="ws-rbac-search"
          placeholder="Search roles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {systemRoles.length > 0 && (
        <section className="ws-role-section">
          <h2 className="ws-role-section-title">System Roles</h2>
          <div className="ws-role-list">
            {systemRoles.map((role) => (
              <RoleCard key={role.id} role={role} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {customRoles.length > 0 && (
        <section className="ws-role-section">
          <h2 className="ws-role-section-title">Custom Roles</h2>
          <div className="ws-role-list">
            {customRoles.map((role) => (
              <RoleCard key={role.id} role={role} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="ws-rbac-empty">
          <AppIcon icon={Icons.shieldCheck} size={32} />
          <p>No roles match your search.</p>
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={(roleId) => {
            setShowCreate(false);
            navigate(`/workspace/admin/rbac/roles/${roleId}`);
          }}
        />
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import { useRbac } from '../../context/RbacContext';
import { RBAC_MODULES, countEnabledPermissions, ALL_PERMISSION_IDS } from '../../data/rbacCatalog';

export default function RbacDashboardPage() {
  const { roles, currentRole } = useRbac();

  const systemRoles = roles.filter((r) => r.type === 'system').length;
  const customRoles = roles.filter((r) => r.type === 'custom').length;
  const totalUsers = roles.reduce((s, r) => s + (r.users || 0), 0);

  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">Access Control Dashboard</h1>
          <p className="ws-rbac-page-sub">Overview of roles, permissions, and workspace access</p>
        </div>
        <Link to="/workspace/admin/rbac/roles" className="ws-rbac-btn-primary">
          <AppIcon icon={Icons.shieldCheck} size={15} />
          Manage Roles
        </Link>
      </header>

      <div className="ws-rbac-stats">
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon purple">
            <AppIcon icon={Icons.shieldCheck} size={20} />
          </div>
          <div>
            <div className="ws-rbac-stat-value">{roles.length}</div>
            <div className="ws-rbac-stat-label">Total Roles</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon blue">
            <AppIcon icon={Icons.lock} size={20} />
          </div>
          <div>
            <div className="ws-rbac-stat-value">{systemRoles}</div>
            <div className="ws-rbac-stat-label">System Roles</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon green">
            <AppIcon icon={Icons.users} size={20} />
          </div>
          <div>
            <div className="ws-rbac-stat-value">{customRoles}</div>
            <div className="ws-rbac-stat-label">Custom Roles</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon teal">
            <AppIcon icon={Icons.users} size={20} />
          </div>
          <div>
            <div className="ws-rbac-stat-value">{totalUsers}</div>
            <div className="ws-rbac-stat-label">Assigned Users</div>
          </div>
        </div>
      </div>

      <div className="ws-rbac-dash-grid">
        <div className="card ws-rbac-dash-card">
          <div className="ws-rbac-dash-card-head">
            <h2 className="ws-rbac-section-title">Your Current Access</h2>
            <span className="ws-rbac-badge active">{currentRole?.name}</span>
          </div>
          <p className="ws-rbac-dash-desc">{currentRole?.description}</p>
          <div className="ws-rbac-module-pills">
            {RBAC_MODULES.map((mod) => {
              const enabled = mod.permissions.some((p) =>
                currentRole?.permissions?.includes('all') || currentRole?.permissions?.includes(p.id)
              );
              return (
                <span
                  key={mod.id}
                  className={`ws-rbac-module-pill${enabled ? ' on' : ''}`}
                  style={enabled ? { '--pill-color': mod.color } : undefined}
                >
                  {mod.name}
                </span>
              );
            })}
          </div>
          <div className="ws-rbac-dash-meta">
            {countEnabledPermissions(currentRole?.permissions)} / {ALL_PERMISSION_IDS.length} permissions enabled
          </div>
        </div>

        <div className="card ws-rbac-dash-card">
          <h2 className="ws-rbac-section-title">Solution Access Matrix</h2>
          <p className="ws-rbac-dash-desc">Modules and the apps they control</p>
          <div className="ws-rbac-matrix">
            {RBAC_MODULES.map((mod) => (
              <div key={mod.id} className="ws-rbac-matrix-row">
                <div className="ws-rbac-matrix-module">
                  <span className="ws-rbac-matrix-dot" style={{ background: mod.color }} />
                  {mod.name}
                </div>
                <div className="ws-rbac-matrix-apps">
                  {mod.appIds.map((id) => (
                    <span key={id} className="ws-rbac-matrix-app">{id.replace(/-/g, ' ')}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

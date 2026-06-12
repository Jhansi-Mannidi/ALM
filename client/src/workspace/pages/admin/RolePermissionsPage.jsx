import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import { WorkspaceIcon } from '../../components/WorkspaceIcons';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useRbac } from '../../context/RbacContext';
import {
  RBAC_MODULES,
  ALL_PERMISSION_IDS,
  expandPermissions,
  hasPermission,
  scopeLabel,
  countEnabledPermissions,
} from '../../data/rbacCatalog';

function moduleState(permissions, module) {
  const permIds = module.permissions.map((p) => p.id);
  const enabled = permIds.filter((id) => hasPermission(permissions, id)).length;
  if (enabled === 0) return { checked: false, indeterminate: false };
  if (enabled === permIds.length) return { checked: true, indeterminate: false };
  return { checked: false, indeterminate: true };
}

export default function RolePermissionsPage() {
  const { roleId } = useParams();
  const { roles, updateRolePermissions } = useRbac();
  const role = roles.find((r) => r.id === roleId);

  const permissions = role?.permissions ?? [];

  const togglePerm = (permId, enabled) => {
    if (!role) return;
    let next = expandPermissions(permissions);
    if (enabled) {
      if (!next.includes(permId)) next = [...next, permId];
    } else {
      next = next.filter((id) => id !== permId);
    }
    updateRolePermissions(role.id, next);
  };

  const toggleModule = (module, enabled) => {
    if (!role) return;
    const permIds = module.permissions.map((p) => p.id);
    let next = expandPermissions(permissions);
    if (enabled) {
      permIds.forEach((id) => {
        if (!next.includes(id)) next.push(id);
      });
    } else {
      next = next.filter((id) => !permIds.includes(id));
    }
    updateRolePermissions(role.id, next);
  };

  const enabledCount = useMemo(() => countEnabledPermissions(permissions), [permissions]);

  if (!role) {
    return (
      <div className="ws-rbac-page">
        <Link to="/workspace/admin/rbac/roles" className="ws-back-link">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to Roles
        </Link>
        <p>Role not found.</p>
      </div>
    );
  }

  const isSystem = role.type === 'system';

  return (
    <div className="ws-rbac-page">
      <Link to="/workspace/admin/rbac/roles" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Roles
      </Link>

      <header className="ws-rbac-perm-head">
        <div className="ws-rbac-perm-head-main">
          <div className="ws-rbac-perm-icon" style={{ background: `${role.color}18`, color: role.color }}>
            <WorkspaceIcon name={role.icon} size={28} />
          </div>
          <div>
            <div className="ws-rbac-perm-head-row">
              <h1 className="ws-rbac-page-title">{role.name}</h1>
              <span className={`ws-rbac-badge ${role.status}`}>{role.status}</span>
              {isSystem && (
                <span className="ws-rbac-badge system">
                  <AppIcon icon={Icons.lock} size={10} />
                  System
                </span>
              )}
            </div>
            <p className="ws-rbac-page-sub">{role.description}</p>
            <div className="ws-rbac-perm-meta">
              <span><AppIcon icon={Icons.users} size={13} /> {role.users} users</span>
              <span>Scope: {scopeLabel(role.scope)}</span>
            </div>
          </div>
        </div>
        <div className="ws-rbac-perm-summary">
          <div className="ws-rbac-perm-summary-value">{enabledCount}</div>
          <div className="ws-rbac-perm-summary-label">of {ALL_PERMISSION_IDS.length} permissions</div>
        </div>
      </header>

      <div className="ws-rbac-modules">
        {RBAC_MODULES.map((module) => {
          const { checked, indeterminate } = moduleState(permissions, module);
          const moduleEnabled = module.permissions.some((p) => hasPermission(permissions, p.id));

          return (
            <div key={module.id} className={`ws-rbac-module-card${moduleEnabled ? ' active' : ''}`}>
              <div className="ws-rbac-module-head">
                <div className="ws-rbac-module-info">
                  <div
                    className="ws-rbac-module-icon"
                    style={{ background: `${module.color}18`, color: module.color }}
                  >
                    <WorkspaceIcon name={module.icon} size={20} />
                  </div>
                  <div>
                    <div className="ws-rbac-module-name">{module.name}</div>
                    <div className="ws-rbac-module-desc">{module.description}</div>
                    <div className="ws-rbac-module-apps">
                      Controls: {module.appIds.map((id) => id.replace(/-/g, ' ')).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="ws-rbac-module-toggle">
                  <span className="ws-rbac-module-toggle-label">
                    {moduleEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <ToggleSwitch
                    checked={checked}
                    ariaLabel={`Toggle all ${module.name} permissions`}
                    onChange={(enabled) => toggleModule(module, enabled || indeterminate)}
                  />
                </div>
              </div>

              <div className="ws-rbac-module-perms">
                {module.permissions.map((perm) => {
                  const enabled = hasPermission(permissions, perm.id);
                  return (
                    <div key={perm.id} className={`ws-rbac-perm-row${enabled ? ' on' : ''}`}>
                      <div className="ws-rbac-perm-row-text">
                        <span className="ws-rbac-perm-row-label">{perm.label}</span>
                        <span className="ws-rbac-perm-row-desc">{perm.description}</span>
                      </div>
                      <ToggleSwitch
                        checked={enabled}
                        ariaLabel={`${perm.label} for ${role.name}`}
                        onChange={(next) => togglePerm(perm.id, next)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

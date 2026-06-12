import { Fragment } from 'react';
import { useRbac } from '../../context/RbacContext';
import { RBAC_MODULES, hasPermission } from '../../data/rbacCatalog';
import { WorkspaceIcon } from '../../components/WorkspaceIcons';

export default function PermissionsPage() {
  const { roles } = useRbac();
  const activeRoles = roles.filter((r) => r.status === 'active');

  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">Permission Matrix</h1>
          <p className="ws-rbac-page-sub">Cross-role view of module and feature access</p>
        </div>
      </header>

      <div className="ws-rbac-matrix-table-wrap">
        <table className="ws-rbac-matrix-table">
          <thead>
            <tr>
              <th className="ws-rbac-matrix-sticky">Permission</th>
              {activeRoles.map((role) => (
                <th key={role.id} className="ws-rbac-matrix-role-col">
                  <span className="ws-rbac-matrix-role-name">{role.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RBAC_MODULES.map((module) => (
              <Fragment key={module.id}>
                <tr className="ws-rbac-matrix-module-row">
                  <td colSpan={activeRoles.length + 1}>
                    <div className="ws-rbac-matrix-module-head">
                      <span className="ws-rbac-matrix-dot" style={{ background: module.color }} />
                      <WorkspaceIcon name={module.icon} size={14} />
                      {module.name}
                    </div>
                  </td>
                </tr>
                {module.permissions.map((perm) => (
                  <tr key={perm.id}>
                    <td className="ws-rbac-matrix-sticky ws-rbac-matrix-perm-cell">
                      <span className="ws-rbac-matrix-perm-label">{perm.label}</span>
                      <span className="ws-rbac-matrix-perm-id">{perm.id}</span>
                    </td>
                    {activeRoles.map((role) => {
                      const on = hasPermission(role.permissions, perm.id);
                      return (
                        <td key={role.id} className="ws-rbac-matrix-check-cell">
                          <span className={`ws-rbac-matrix-check${on ? ' on' : ''}`}>
                            {on ? '✓' : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

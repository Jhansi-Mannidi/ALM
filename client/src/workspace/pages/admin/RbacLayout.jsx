import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppIcon, resolveIcon } from '../../../components/icons';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import { useProfileSidebarCollapsed } from '../../hooks/useProfileSidebarCollapsed';
import { RBAC_NAV } from '../../data/rbacCatalog';

function NavBtn({ to, children, end = false, title }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={title}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      {children}
    </NavLink>
  );
}

export default function RbacLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();

  return (
    <div className={`ws-rbac-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`ws-rbac-sidebar sidebar${collapsed ? ' collapsed' : ''}`}>
        <ProfileSidebarBrand
          icon="shield"
          subtitle="Roles & Permissions"
          collapsed={collapsed}
          onToggleCollapsed={toggle}
        />

        <div className="sb-section">
          <div className="sb-slabel">Administration</div>
          {RBAC_NAV.map((item) => (
            <NavBtn key={item.id} to={item.path} end={item.end} title={item.label}>
              <AppIcon icon={resolveIcon(item.icon)} size={13} />
              <span className="ws-nav-label">{item.label}</span>
            </NavBtn>
          ))}
        </div>

        <Link to="/workspace" className="ws-hr-back" title="Back to Workspace">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          <span className="ws-nav-label">Back to Workspace</span>
        </Link>
      </aside>

      <div className="ws-rbac-content">
        <Outlet />
      </div>
    </div>
  );
}

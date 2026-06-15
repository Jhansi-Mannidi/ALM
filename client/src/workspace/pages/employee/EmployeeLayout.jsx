import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppIcon, resolveIcon } from '../../../components/icons';
import {
  EMPLOYEE_WORKSPACE_NAV,
  EMPLOYEE_PEOPLE_NAV,
  EMPLOYEE_REQUESTS_NAV,
  EMPLOYEE_EXIT_NAV,
} from '../../data/employeeCatalog';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import { useProfileSidebarCollapsed } from '../../hooks/useProfileSidebarCollapsed';

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

function NavSection({ label, items, endIds = [] }) {
  return (
    <div className="sb-section">
      <div className="sb-slabel">{label}</div>
      {items.map((item) => (
        <NavBtn key={item.id} to={item.path} end={endIds.includes(item.id)} title={item.label}>
          <AppIcon icon={resolveIcon(item.icon)} size={13} />
          <span className="ws-nav-label">{item.label}</span>
        </NavBtn>
      ))}
    </div>
  );
}

export default function EmployeeLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();

  return (
    <div className={`ws-hr-shell ws-emp-portal-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`ws-hr-sidebar sidebar${collapsed ? ' collapsed' : ''}`}>
        <ProfileSidebarBrand
          icon="users"
          subtitle="Employee Portal"
          collapsed={collapsed}
          onToggleCollapsed={toggle}
        />

        <NavSection label="Workspace" items={EMPLOYEE_WORKSPACE_NAV} endIds={['dashboard']} />

        <NavSection label="People" items={EMPLOYEE_PEOPLE_NAV} />

        <NavSection label="Requests" items={EMPLOYEE_REQUESTS_NAV} endIds={['raise-ticket']} />

        <NavSection label="Exit" items={EMPLOYEE_EXIT_NAV} />

        <Link to="/workspace/solutions/business-operations" className="ws-hr-back" title="Back to Workspace">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          <span className="ws-nav-label">Back to Workspace</span>
        </Link>
      </aside>

      <div className="ws-hr-content">
        <Outlet />
      </div>
    </div>
  );
}

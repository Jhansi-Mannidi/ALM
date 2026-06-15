import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppIcon, Icons, resolveIcon } from '../../../components/icons';
import { HR_WORKSPACE_NAV, HR_RECRUITMENT_NAV, HR_OPERATIONS_NAV } from '../../data/hrCatalog';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import ModuleMobileShell from '../../components/ModuleMobileShell';
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

export default function HrLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();

  return (
    <ModuleMobileShell
      moduleTitle="HR & People"
      sidebarCollapsed={collapsed}
      sidebar={(
        <>
          <ProfileSidebarBrand
            icon="users"
            subtitle="HR & People"
            collapsed={collapsed}
            onToggleCollapsed={toggle}
          />
          <NavSection label="Workspace" items={HR_WORKSPACE_NAV} endIds={['dashboard']} />
          <NavSection label="Recruitment" items={HR_RECRUITMENT_NAV} endIds={['recruitment']} />
          <NavSection label="Actions" items={HR_OPERATIONS_NAV} />
          <Link to="/workspace/solutions/business-operations" className="ws-hr-back" title="Back to Workspace">
            <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
            <span className="ws-nav-label">Back to Workspace</span>
          </Link>
        </>
      )}
    >
      <Outlet />
    </ModuleMobileShell>
  );
}

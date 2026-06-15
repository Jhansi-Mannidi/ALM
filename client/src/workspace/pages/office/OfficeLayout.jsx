import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import { OFFICE_NAV_SECTIONS } from '../../data/officeCatalog';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import { useProfileSidebarCollapsed } from '../../hooks/useProfileSidebarCollapsed';
import { OfficeDeleteConfirmProvider } from './OfficeDeleteConfirmContext';

const NAV_ICONS = {
  layoutDashboard: Icons.layoutGrid,
  package: Icons.package,
  inbox: Icons.inbox,
  truck: Icons.truck,
  utensils: Icons.utensils,
};

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
        <NavBtn key={item.id} to={item.path} end={endIds.includes(item.id) || item.end} title={item.label}>
          <AppIcon icon={NAV_ICONS[item.icon] || Icons.circle} size={13} />
          <span className="ws-nav-label">{item.label}</span>
        </NavBtn>
      ))}
    </div>
  );
}

export default function OfficeLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();

  return (
    <OfficeDeleteConfirmProvider>
      <div className={`ws-hr-shell ws-office-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
        <aside className={`ws-hr-sidebar sidebar ws-office-sidebar${collapsed ? ' collapsed' : ''}`}>
          <ProfileSidebarBrand
            icon="building"
            subtitle="Office Manager"
            collapsed={collapsed}
            onToggleCollapsed={toggle}
          />

          <div className="ws-office-nav-scroll">
            {OFFICE_NAV_SECTIONS.map((section) => (
              <NavSection
                key={section.id}
                label={section.label}
                items={section.items}
                endIds={['dashboard']}
              />
            ))}
          </div>

          <Link to="/workspace/solutions/business-operations" className="ws-hr-back" title="Back to Workspace">
            <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
            <span className="ws-nav-label">Back to Workspace</span>
          </Link>
        </aside>

        <div className="ws-hr-content ws-office-content">
          <Outlet />
        </div>
      </div>
    </OfficeDeleteConfirmProvider>
  );
}

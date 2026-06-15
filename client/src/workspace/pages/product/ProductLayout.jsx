import { NavLink, Outlet, Link } from 'react-router-dom';
import { AppIcon, resolveIcon } from '../../../components/icons';
import { PM_NAV_SECTIONS } from '../../data/productCatalog';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import { useProfileSidebarCollapsed } from '../../hooks/useProfileSidebarCollapsed';
import { PmDeleteConfirmProvider } from './PmDeleteConfirmContext';

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
          <AppIcon icon={resolveIcon(item.icon)} size={13} />
          <span className="ws-nav-label">{item.label}</span>
        </NavBtn>
      ))}
    </div>
  );
}

export default function ProductLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();

  return (
    <PmDeleteConfirmProvider>
    <div className={`ws-hr-shell ws-pm-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`ws-hr-sidebar sidebar ws-pm-sidebar${collapsed ? ' collapsed' : ''}`}>
        <ProfileSidebarBrand
          icon="layers"
          subtitle="Product Management"
          collapsed={collapsed}
          onToggleCollapsed={toggle}
        />

        <div className="ws-pm-nav-scroll">
          {PM_NAV_SECTIONS.map((section) => (
            <NavSection
              key={section.id}
              label={section.label}
              items={section.items}
              endIds={['dashboard']}
            />
          ))}
        </div>

        <Link to="/workspace/solutions/product-development" className="ws-hr-back" title="Back to Workspace">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          <span className="ws-nav-label">Back to Workspace</span>
        </Link>
      </aside>

      <div className="ws-hr-content ws-pm-content">
        <Outlet />
      </div>
    </div>
    </PmDeleteConfirmProvider>
  );
}

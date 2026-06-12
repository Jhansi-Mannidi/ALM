import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { FINANCE_NAV_SECTIONS } from '../../data/financeCatalog';
import ProfileSidebarBrand from '../../components/ProfileSidebarBrand';
import { useProfileSidebarCollapsed } from '../../hooks/useProfileSidebarCollapsed';
import { fiscalYearLabel } from './financeUtils';

const NAV_ICONS = {
  layoutDashboard: Icons.layoutGrid,
  folder: Icons.folder,
  users: Icons.users,
  fileText: Icons.fileText,
  cart: Icons.cart,
  fileSpreadsheet: Icons.fileSpreadsheet,
  refresh: Icons.refreshCw,
  clipboard: Icons.clipboardCheck,
  arrowLeftRight: Icons.arrowLeftRight,
  building: Icons.building,
  timer: Icons.timer,
  list: Icons.list,
  layers: Icons.layers,
  listChecks: Icons.listChecks,
  shieldCheck: Icons.shieldCheck,
  barChart: Icons.barChart3,
  trendingUp: Icons.trendingUp,
  sliders: Icons.sliders,
};

function NavBtn({ to, children, end = false, title, quickAdd, quickAddPath }) {
  return (
    <div className="ws-fin-nav-item-wrap">
      <NavLink
        to={to}
        end={end}
        title={title}
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        {children}
      </NavLink>
      {quickAdd && (
        <Link to={quickAddPath || to} className="ws-fin-nav-quick-add" title={`Add ${title}`}>
          <AppIcon icon={Icons.plus} size={12} />
        </Link>
      )}
    </div>
  );
}

function CollapsibleNavSection({ section, open, onToggle, collapsed, children }) {
  if (collapsed) {
    return <div className="sb-section ws-fin-collapsible-section">{children}</div>;
  }

  return (
    <div className="sb-section ws-fin-collapsible-section">
      <button
        type="button"
        className="ws-fin-section-toggle"
        onClick={onToggle}
        aria-expanded={open}
        title={section.label}
      >
        <span className="sb-slabel">{section.label}</span>
        <AppIcon
          icon={Icons.chevronRight}
          size={12}
          className={`ws-fin-section-chevron${open ? ' open' : ''}`}
        />
      </button>
      {open && children}
    </div>
  );
}

export default function FinanceLayout() {
  const { collapsed, toggle } = useProfileSidebarCollapsed();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(FINANCE_NAV_SECTIONS.map((s) => [s.id, s.id === 'home'])),
  );

  useEffect(() => {
    api.getFinanceSettings().then(setSettings).catch(() => {});
  }, []);

  const isNavItemActive = (item) => {
    const path = location.pathname;
    const itemPath = item.path;
    if (item.end) {
      return path === itemPath || path === `${itemPath}/`;
    }
    return path === itemPath || path.startsWith(`${itemPath}/`);
  };

  const isSectionActive = (section) => section.items.some(isNavItemActive);

  useEffect(() => {
    const activeSection = FINANCE_NAV_SECTIONS.find(isSectionActive);
    if (activeSection) {
      setExpanded((prev) => ({ ...prev, [activeSection.id]: true }));
    }
  }, [location.pathname]);

  const toggleSection = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`ws-hr-shell ws-fin-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`ws-hr-sidebar sidebar ws-fin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <ProfileSidebarBrand
          icon="dollar"
          subtitle="Finance & Operations"
          collapsed={collapsed}
          onToggleCollapsed={toggle}
        />

        <div className="ws-fin-nav-scroll">
          {FINANCE_NAV_SECTIONS.map((section) => {
            const open = collapsed || expanded[section.id] !== false;
            return (
              <CollapsibleNavSection
                key={section.id}
                section={section}
                open={open}
                collapsed={collapsed}
                onToggle={() => toggleSection(section.id)}
              >
                {section.items.map((item) => (
                  <NavBtn
                    key={item.id}
                    to={item.path}
                    end={item.end}
                    title={item.label}
                    quickAdd={item.quickAdd}
                    quickAddPath={
                      item.quickAddPath
                      || (item.moduleKey ? `/workspace/finance/m/${item.moduleKey}/new` : undefined)
                    }
                  >
                    <AppIcon icon={NAV_ICONS[item.icon] || Icons.circle} size={13} />
                    <span className="ws-nav-label">{item.label}</span>
                  </NavBtn>
                ))}
              </CollapsibleNavSection>
            );
          })}
        </div>

        <div className="ws-fin-sidebar-foot">
          {settings && !collapsed && (
            <div className="ws-fin-org-context" title="Organization context">
              <div className="ws-fin-org-name">{settings.companyName}</div>
              <div className="ws-fin-org-meta">
                {fiscalYearLabel(settings.fiscalYearStart)} · {settings.currency} · GST {settings.taxRate}%
              </div>
            </div>
          )}
          <Link to="/workspace/solutions/business-operations" className="ws-hr-back" title="Back to Workspace">
            <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
            <span className="ws-nav-label">Back to Workspace</span>
          </Link>
        </div>
      </aside>

      <div className="ws-hr-content ws-fin-content">
        <Outlet />
      </div>
    </div>
  );
}

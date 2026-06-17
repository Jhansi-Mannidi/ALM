import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AppIcon, Icons, resolveIcon } from '../../components/icons';
import { WorkspaceIcon } from './WorkspaceIcons';
import { useModuleNav } from '../context/ModuleNavContext';

const SECTION_DEFAULT_ICONS = {
  workspace: 'layoutDashboard',
  home: 'layoutDashboard',
  people: 'users',
  requests: 'inbox',
  exit: 'logOut',
  recruitment: 'briefcase',
  actions: 'listChecks',
  operations: 'briefcase',
  admin: 'shield',
  'data-input': 'sparkles',
  structure: 'layers',
  decision: 'barChart',
  output: 'map',
  sharing: 'globe',
  governance: 'sliders',
  items: 'folder',
  sales: 'cart',
  purchases: 'briefcase',
  time: 'timer',
  banking: 'landmark',
  accounting: 'fileSpreadsheet',
  reports: 'fileText',
  settings: 'settings',
  'vendors-food': 'truck',
};

function matchesNavQuery(text, query) {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function isItemActive(pathname, item) {
  const itemPath = item.path;
  if (item.end) {
    return pathname === itemPath || pathname === `${itemPath}/`;
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function getSectionIcon(section) {
  if (section.icon) return section.icon;
  if (SECTION_DEFAULT_ICONS[section.id]) return SECTION_DEFAULT_ICONS[section.id];
  return section.items?.[0]?.icon || 'folder';
}

function findActiveSection(sections, pathname) {
  let bestSection = null;
  let bestPathLen = -1;

  for (const section of sections) {
    for (const item of section.items) {
      if (!isItemActive(pathname, item)) continue;
      const pathLen = item.path.length;
      if (pathLen > bestPathLen) {
        bestPathLen = pathLen;
        bestSection = section;
      }
    }
  }

  return bestSection;
}

export default function ModuleAppShell({
  moduleTitle,
  moduleIcon = 'layers',
  backTo = '/workspace',
  backLabel = 'Back to Workspace',
  sections = [],
  panelFooter = null,
  children,
}) {
  const location = useLocation();
  const {
    registerModule,
    unregisterModule,
    mobileNavOpen,
    closeNav,
  } = useModuleNav();

  const [selectedSectionId, setSelectedSectionId] = useState(() => sections[0]?.id ?? null);
  const [navOpen, setNavOpen] = useState(true);
  const [search, setSearch] = useState('');

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null,
    [sections, selectedSectionId],
  );

  const filteredItems = useMemo(() => {
    if (!selectedSection) return [];
    const q = search.trim();
    if (!q) return selectedSection.items;
    return selectedSection.items.filter((item) => matchesNavQuery(item.label, q));
  }, [selectedSection, search]);

  useEffect(() => {
    registerModule(moduleTitle);
    return unregisterModule;
  }, [moduleTitle, registerModule, unregisterModule]);

  useEffect(() => {
    closeNav();
  }, [location.pathname, closeNav]);

  useEffect(() => {
    const activeSection = findActiveSection(sections, location.pathname);
    if (activeSection) {
      setSelectedSectionId(activeSection.id);
      setNavOpen(true);
    }
  }, [location.pathname, sections]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const selectSection = (sectionId) => {
    setSelectedSectionId(sectionId);
    setNavOpen(true);
    setSearch('');
  };

  const shellClass = [
    'ws-module-app-shell',
    navOpen && selectedSection ? 'nav-open' : '',
    mobileNavOpen ? 'mobile-nav-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderSubPanel = () => {
    if (!selectedSection) return null;

    return (
      <>
        <div className="sb-proj-sidepanel-label">{moduleTitle} navigation</div>
        <div className="ws-module-sidepanel-section">{selectedSection.label}</div>
        <div className="sb-proj-sidepanel-search">
          <AppIcon icon={Icons.search} size={13} />
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={`Search ${selectedSection.label}`}
          />
        </div>
        <div className="sb-proj-sidepanel-list ws-module-sidepanel-list">
          {filteredItems.length === 0 && (
            <div className="sb-proj-empty">No matches</div>
          )}
          {filteredItems.map((item) => (
            <div key={item.id} className="ws-module-nav-item-row">
              <NavLink
                to={item.path}
                end={Boolean(item.end)}
                title={item.label}
                className={({ isActive }) => `sb-proj-subitem${isActive ? ' active' : ''}`}
                onClick={closeNav}
              >
                <AppIcon icon={resolveIcon(item.icon)} size={12} />
                <span>{item.label}</span>
              </NavLink>
              {item.quickAdd && (
                <Link
                  to={
                    item.quickAddPath
                    || (item.moduleKey ? `/workspace/finance/m/${item.moduleKey}/new` : `${item.path}/new`)
                  }
                  className="ws-module-nav-quick-add"
                  title={`Add ${item.label}`}
                  onClick={closeNav}
                >
                  <AppIcon icon={Icons.plus} size={11} />
                </Link>
              )}
            </div>
          ))}
        </div>
        {panelFooter && <div className="ws-module-sidepanel-foot">{panelFooter}</div>}
        <Link to={backTo} className="ws-module-back-link" title={backLabel} onClick={closeNav}>
          <AppIcon icon={Icons.chevronRight} size={12} className="ws-back-chevron" />
          <span>{backLabel}</span>
        </Link>
      </>
    );
  };

  const renderRailSections = () => (
    <div className="sb-section ws-module-rail-sections">
      {sections.map((section) => {
        const isSelected = selectedSectionId === section.id;
        const hasActiveRoute = section.items.some((item) => isItemActive(location.pathname, item));
        const isExpanded = isSelected && navOpen;
        return (
          <div key={section.id} className="sb-proj-section ws-module-section-wrap">
            <div className="sb-proj-header">
              <button
                type="button"
                className={`sb-proj-toggle ws-module-section-toggle${hasActiveRoute || isExpanded ? ' active' : ''}`}
                onClick={() => {
                  if (isSelected && navOpen) {
                    setNavOpen(false);
                  } else {
                    selectSection(section.id);
                  }
                }}
                aria-expanded={isExpanded}
                aria-current={isSelected ? 'true' : undefined}
                title={section.label}
              >
                <AppIcon
                  icon={resolveIcon(getSectionIcon(section))}
                  size={13}
                  strokeWidth={2}
                  className="sb-proj-icon"
                />
                <span className="sb-proj-toggle-label">{section.label}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={shellClass}>
      {mobileNavOpen && (
        <button type="button" className="ws-module-overlay" aria-label="Close menu" onClick={closeNav} />
      )}

      <aside className={`sidebar ws-module-rail${mobileNavOpen ? ' open' : ''}`}>
        <button
          type="button"
          className="ws-module-drawer-close"
          aria-label="Close navigation menu"
          onClick={closeNav}
        >
          <AppIcon icon={Icons.x} size={18} />
        </button>

        <div className="sb-brand ws-module-rail-brand">
          <div className="sb-brand-main">
            <div className="sb-logo ws-module-rail-logo">
              <WorkspaceIcon name={moduleIcon} size={14} className="sb-logo-icon" />
            </div>
          </div>
        </div>

        {renderRailSections()}

        <div className="ws-module-rail-mobile-nav">
          {renderRailSections()}
          {navOpen && selectedSection && (
            <div className="ws-module-mobile-subpanel">{renderSubPanel()}</div>
          )}
        </div>
      </aside>

      {navOpen && selectedSection && (
        <div
          className="sb-proj-sidepanel ws-module-sidepanel"
          role="region"
          aria-label={`${selectedSection.label} navigation`}
        >
          {renderSubPanel()}
        </div>
      )}

      <div className="ws-module-main">{children}</div>
    </div>
  );
}

import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppIcon, Icons, resolveIcon } from '../../../components/icons';
import {
  FREIGHT_LEADS_NAV,
  FREIGHT_LOCATIONS,
  FREIGHT_MODULE_RAIL,
  leadFilterFromPath,
} from '../../data/freightCatalog';
import { useModuleNav } from '../../context/ModuleNavContext';

function RailBtn({ item, active, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      title={item.label}
      className={`ws-freight-rail-btn${active ? ' active' : ''}`}
      style={{ '--rail-color': item.color }}
      onClick={onNavigate}
    >
      <AppIcon icon={resolveIcon(item.icon)} size={20} />
    </NavLink>
  );
}

function SubNavBtn({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) => `ws-freight-subnav-item${isActive ? ' active' : ''}`}
      onClick={onNavigate}
    >
      <AppIcon icon={resolveIcon(item.icon)} size={15} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function FreightLayout() {
  const location = useLocation();
  const [navSearch, setNavSearch] = useState('');
  const [freightLocation, setFreightLocation] = useState(FREIGHT_LOCATIONS[0]);
  const { registerModule, unregisterModule, mobileNavOpen, closeNav } = useModuleNav();
  const isLeads = location.pathname.includes('/freight/leads');
  const activeRail = FREIGHT_MODULE_RAIL.find((m) => location.pathname.startsWith(m.path))?.id ?? 'leads';
  const navItems = FREIGHT_LEADS_NAV.filter((item) =>
    item.label.toLowerCase().includes(navSearch.trim().toLowerCase())
  );

  const closeMobileNav = () => closeNav();

  useEffect(() => {
    registerModule('Freight ERP');
    return unregisterModule;
  }, [registerModule, unregisterModule]);

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeNav]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className={`ws-freight-root${mobileNavOpen ? ' freight-mobile-nav-open' : ''}`}>
      {mobileNavOpen && (
        <button
          type="button"
          className="ws-freight-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={closeMobileNav}
        />
      )}

      <div className="ws-freight-shell">
        <div className="ws-freight-nav-drawer" aria-hidden={!mobileNavOpen}>
          <button
            type="button"
            className="ws-freight-drawer-close"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          >
            <AppIcon icon={Icons.x} size={18} />
          </button>

          <aside className="ws-freight-rail" aria-label="Freight modules">
            {FREIGHT_MODULE_RAIL.map((item) => (
              <RailBtn
                key={item.id}
                item={item}
                active={activeRail === item.id}
                onNavigate={closeMobileNav}
              />
            ))}
          </aside>

          {isLeads && (
            <aside className="ws-freight-subnav" aria-label="Leads navigation">
              <div className="ws-freight-subnav-search">
                <AppIcon icon={Icons.search} size={14} />
                <input
                  type="search"
                  placeholder="Search"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                />
              </div>
              <nav className="ws-freight-subnav-list">
                {navItems.map((item) => (
                  <SubNavBtn key={item.id} item={item} onNavigate={closeMobileNav} />
                ))}
              </nav>
            </aside>
          )}
        </div>

        <div className="ws-freight-main">
          <div className="ws-freight-context-bar">
            <select
              className="ws-freight-location"
              value={freightLocation}
              onChange={(e) => setFreightLocation(e.target.value)}
              aria-label="Location"
            >
              {FREIGHT_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="ws-freight-content">
            <Outlet context={{ leadFilter: leadFilterFromPath(location.pathname) }} />
          </div>
        </div>
      </div>
    </div>
  );
}

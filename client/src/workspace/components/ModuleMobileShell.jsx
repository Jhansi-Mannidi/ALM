import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppIcon, Icons } from '../../components/icons';
import { useModuleNav } from '../context/ModuleNavContext';

export default function ModuleMobileShell({
  shellClassName = 'ws-hr-shell',
  sidebarClassName = 'ws-hr-sidebar ws-module-sidebar',
  contentClassName = 'ws-hr-content',
  moduleTitle,
  sidebarCollapsed = false,
  sidebar,
  children,
}) {
  const location = useLocation();
  const {
    registerModule,
    unregisterModule,
    mobileNavOpen,
    openNav,
    closeNav,
  } = useModuleNav();

  useEffect(() => {
    registerModule(moduleTitle);
    return unregisterModule;
  }, [moduleTitle, registerModule, unregisterModule]);

  useEffect(() => {
    closeNav();
  }, [location.pathname, closeNav]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const shellClasses = [
    shellClassName,
    sidebarCollapsed ? 'sidebar-collapsed' : '',
    mobileNavOpen ? 'mobile-nav-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClasses}>
      <div className="ws-module-mobile-bar">
        <button
          type="button"
          className="ws-module-menu-btn"
          aria-label="Open navigation menu"
          aria-expanded={mobileNavOpen}
          onClick={openNav}
        >
          <AppIcon icon={Icons.menu} size={20} />
        </button>
        <span className="ws-module-mobile-title">{moduleTitle}</span>
      </div>

      {mobileNavOpen && (
        <button
          type="button"
          className="ws-module-overlay"
          aria-label="Close menu"
          onClick={closeNav}
        />
      )}

      <aside className={`${sidebarClassName}${sidebarCollapsed ? ' collapsed' : ''}`}>
        <button
          type="button"
          className="ws-module-drawer-close"
          aria-label="Close navigation menu"
          onClick={closeNav}
        >
          <AppIcon icon={Icons.x} size={18} />
        </button>
        {sidebar}
      </aside>

      <div className={contentClassName}>{children}</div>
    </div>
  );
}

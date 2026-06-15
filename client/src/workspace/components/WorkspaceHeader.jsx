import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ThemeToggle from '../../components/ThemeToggle';
import { AppIcon, Icons } from '../../components/icons';
import { useWorkspace } from '../context/WorkspaceContext';
import { useModuleNav } from '../context/ModuleNavContext';
import { WorkspaceIcon } from './WorkspaceIcons';
function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function WorkspaceHeader() {
  const { user, badges } = useApp();
  const { search, setSearch, viewMode, setViewMode, totalNotifications } = useWorkspace();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isModuleRoute, moduleTitle, mobileNavOpen, openNav } = useModuleNav() || {};

  return (
    <header className="ws-header">
      <div className="ws-header-inner">
        <div className="ws-header-brand">
          {isModuleRoute && (
            <button
              type="button"
              className="ws-header-menu-btn"
              aria-label="Open module navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => openNav?.()}
            >
              <AppIcon icon={Icons.menu} size={20} />
            </button>
          )}
          <Link to="/workspace" className="ws-brand-link">
            <div className="ws-brand-icon">
              <WorkspaceIcon name="sparkles" size={22} className="ws-brand-sparkle" />
            </div>
            <div className="ws-brand-text">
              <div className="ws-brand-name">{isModuleRoute ? moduleTitle : 'VoltusWave ALM'}</div>
              <div className="ws-brand-tag">
                {isModuleRoute ? 'VoltusWave ALM' : 'Business Operating System'}
              </div>
            </div>
          </Link>
        </div>

        <div className="ws-header-actions">
          <button
            type="button"
            className={`icon-btn ws-mobile-search-toggle${mobileSearchOpen ? ' active' : ''}`}
            aria-label="Search apps"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            <AppIcon icon={Icons.search} size={16} />
          </button>

          <div className="ws-search-wrap">
            <AppIcon icon={Icons.search} size={15} className="ws-search-icon" />
            <input
              type="search"
              className="ws-search"
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ws-view-toggle">
            <button
              type="button"
              className={`ws-view-btn${viewMode === 'grid' ? ' active' : ''}`}
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
            >
              <AppIcon icon={Icons.layoutGrid} size={15} />
            </button>
            <button
              type="button"
              className={`ws-view-btn${viewMode === 'list' ? ' active' : ''}`}
              aria-label="List view"
              onClick={() => setViewMode('list')}
            >
              <AppIcon icon={Icons.list} size={15} />
            </button>
          </div>

          <ThemeToggle />

          <button
            type="button"
            className="icon-btn notif-badge ws-notif-btn"
            data-count={badges.notif || totalNotifications}
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <AppIcon icon={Icons.bell} size={16} />
          </button>

          <div className="ws-avatar" title={user?.name}>
            {initials(user?.name || 'User')}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="ws-header-mobile-search">
          <AppIcon icon={Icons.search} size={15} className="ws-search-icon" />
          <input
            type="search"
            className="ws-search ws-search-mobile"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}

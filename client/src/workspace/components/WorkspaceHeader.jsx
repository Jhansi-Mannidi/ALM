import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ThemeToggle from '../../components/ThemeToggle';
import { AppIcon, Icons } from '../../components/icons';
import { useWorkspace } from '../context/WorkspaceContext';
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

  return (
    <header className="ws-header">
      <div className="ws-header-inner">
        <div className="ws-header-brand">
          <Link to="/workspace" className="ws-brand-link">
            <div className="ws-brand-icon">
              <WorkspaceIcon name="sparkles" size={22} className="ws-brand-sparkle" />
            </div>
            <div>
              <div className="ws-brand-name">VoltusWave ALM</div>
              <div className="ws-brand-tag">Business Operating System</div>
            </div>
          </Link>
        </div>

        <div className="ws-header-actions">
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
    </header>
  );
}

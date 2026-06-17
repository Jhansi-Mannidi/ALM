import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AppIcon, Icons } from '../../../components/icons';
import { FREIGHT_LOCATIONS } from '../../data/freightCatalog';

const AI_STORAGE_KEY = 'voltus-freight-ai-enabled';

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatBadgeCount(count) {
  if (count > 99) return '99+';
  return count > 0 ? String(count) : null;
}

function ChromeTool({ label, icon, onClick, badge, filled = false, className = '' }) {
  return (
    <div className={`ws-freight-tool-wrap${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`ws-freight-icon-btn${filled ? ' filled' : ''}`}
        aria-label={label}
        onClick={onClick}
      >
        <AppIcon icon={icon} size={18} strokeWidth={1.75} />
        {badge && <span className="ws-freight-tool-badge">{badge}</span>}
      </button>
      <span className="ws-freight-tool-tip" role="tooltip">{label}</span>
    </div>
  );
}

export default function FreightAppChrome({
  moduleLabel = 'Leads',
  moduleIcon = Icons.users,
  moduleColor = '#7C3AED',
  onMenuClick,
}) {
  const navigate = useNavigate();
  const { user, badges, logout, toast } = useApp();
  const { toggleTheme } = useTheme();
  const { setLauncherOpen } = useWorkspace();
  const [location, setLocation] = useState(FREIGHT_LOCATIONS[0]);
  const [aiOn, setAiOn] = useState(() => {
    try {
      return sessionStorage.getItem(AI_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  const taskCount = badges.tasks || 0;
  const notifCount = badges.notif || 0;
  const taskBadge = formatBadgeCount(taskCount) || '99+';

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  const toggleAi = () => {
    setAiOn((on) => {
      const next = !on;
      try {
        sessionStorage.setItem(AI_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      toast(next ? 'AI assistant enabled' : 'AI assistant disabled', next ? 'ok' : '');
      return next;
    });
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      toast('Fullscreen is not supported in this browser', '');
    }
  }, [toast]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="ws-freight-chrome">
      <div className="ws-freight-chrome-left">
        {onMenuClick && (
          <button
            type="button"
            className="ws-freight-menu-btn"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <AppIcon icon={Icons.menu} size={20} />
          </button>
        )}
        <Link to="/workspace" className="ws-freight-logo">VOLTUSWAVE</Link>
        <span className="ws-freight-module-badge" style={{ '--freight-accent': moduleColor }}>
          <AppIcon icon={moduleIcon} size={14} />
          {moduleLabel}
        </span>
      </div>

      <div className="ws-freight-chrome-center">
        <select
          className="ws-freight-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Location"
        >
          {FREIGHT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="ws-freight-chrome-right">
        <div className="ws-freight-ai-pill">
          <AppIcon icon={Icons.sparkles} size={14} className="ws-freight-ai-sparkle" />
          <span className="ws-freight-ai-label">Ai</span>
          <button
            type="button"
            role="switch"
            aria-checked={aiOn}
            aria-label="Toggle AI assistant"
            className={`ws-freight-switch${aiOn ? ' on' : ''}`}
            onClick={toggleAi}
          />
        </div>

        <ChromeTool
          label="Workflows"
          icon={Icons.workflow}
          onClick={() => toast('Workflow builder opens from here in production', 'ok')}
        />

        <ChromeTool
          label="My Tasks"
          icon={Icons.listTodo}
          badge={taskBadge}
          onClick={() => navigate('/my-tasks')}
        />

        <ChromeTool
          label="Theme"
          icon={Icons.palette}
          onClick={toggleTheme}
        />

        <ChromeTool
          label="Live Feed"
          icon={Icons.radio}
          onClick={() => {
            setFeedOpen((open) => {
              const next = !open;
              toast(next ? 'Live feed connected' : 'Live feed closed', 'ok');
              return next;
            });
          }}
        />

        <ChromeTool
          label="Notifications"
          icon={Icons.bell}
          badge={formatBadgeCount(notifCount)}
          onClick={() => navigate('/notifications')}
        />

        <ChromeTool
          label={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          icon={fullscreen ? Icons.minimize : Icons.maximize}
          filled
          className="ws-freight-fullscreen-wrap ws-freight-hide-mobile"
          onClick={toggleFullscreen}
        />

        <div className="ws-freight-profile-wrap">
          <button
            type="button"
            className="ws-freight-avatar ws-freight-avatar-btn"
            title={user?.name}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
          >
            {initials(user?.name || 'User')}
          </button>
          {profileOpen && (
            <>
              <button
                type="button"
                className="ws-freight-profile-backdrop"
                aria-label="Close account menu"
                onClick={() => setProfileOpen(false)}
              />
              <div className="ws-freight-profile-menu">
                <div className="ws-freight-profile-menu-head">
                  <div className="ws-freight-profile-menu-name">{user?.name}</div>
                  <div className="ws-freight-profile-menu-email">{user?.email}</div>
                </div>
                <button
                  type="button"
                  className="ws-freight-profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    setLauncherOpen(true);
                  }}
                >
                  Application Launcher
                </button>
                <button type="button" className="ws-freight-profile-menu-item danger" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

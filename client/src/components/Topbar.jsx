import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useWorkspace } from '../workspace/context/WorkspaceContext';
import { useModuleNavOptional } from '../workspace/context/ModuleNavContext';
import { api } from '../api/client';
import { slideDownVariants } from '../motion/presets';
import ThemeToggle from './ThemeToggle';
import { AppIcon, Icons, NOTIFICATION_ICONS } from './icons';

export default function Topbar() {
  const { badges, notifications = [], refreshNotifications, toast, setSidebarOpen, user } = useApp();
  const { launcherOpen, setLauncherOpen, launcherAnchorRef } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const moduleNav = useModuleNavOptional();
  const isWorkspace = location.pathname.startsWith('/workspace');
  const isFreight = location.pathname.startsWith('/workspace/freight');
  const showModuleMenu = isWorkspace && (Boolean(moduleNav?.isModuleRoute) || isFreight);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!notifOpen) return undefined;
    const onPointerDown = (event) => {
      if (!notifRef.current?.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [notifOpen]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* no-op: browser may block fullscreen */
    }
  };

  const clearNotifs = async () => {
    try {
      await api.clearNotifications();
      await refreshNotifications();
      toast('All read', 'ok');
    } catch (e) {
      toast(e.message || 'Unable to clear notifications', 'err');
    }
  };

  const handleMenuClick = () => {
    if (showModuleMenu) {
      moduleNav?.openNav?.();
      return;
    }
    setSidebarOpen(true);
  };

  return (
    <motion.div
      className="topbar"
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="tb-left">
        <button
          type="button"
          className={`icon-btn menu-btn${showModuleMenu ? ' menu-btn--module' : ''}${!showModuleMenu && isWorkspace ? ' menu-btn--hidden' : ''}`}
          aria-label="Open menu"
          onClick={handleMenuClick}
        >
          <AppIcon icon={Icons.menu} size={16} />
        </button>
        <button
          type="button"
          ref={launcherAnchorRef}
          className={`icon-btn tb-quick-btn tb-launcher-btn${launcherOpen ? ' active' : ''}`}
          aria-label="Open application launcher"
          aria-expanded={launcherOpen}
          aria-haspopup="dialog"
          onClick={() => setLauncherOpen((open) => !open)}
        >
          <AppIcon icon={Icons.layoutGrid} size={15} />
        </button>
        <div className="tb-brand" aria-label="Voltuswave">
          <AppIcon icon={Icons.logo} size={14} className="tb-brand-icon" />
          <span className="tb-brand-text">VOLTUSWAVE</span>
        </div>
      </div>

      <div className="tb-right">
       
        
        <button type="button" className="tb-chip-btn tb-chip-btn-ai" aria-label="AI tools">
          <AppIcon icon={Icons.sparkles} size={13} />
          <span>AI</span>
        </button>
        <ThemeToggle className="tb-quick-btn" />
        <button
          type="button"
          className="icon-btn tb-quick-btn notif-badge"
          data-count={badges.notif}
          aria-label="Notifications"
          onClick={() => setNotifOpen((open) => !open)}
        >
          <AppIcon icon={Icons.bell} size={14} />
        </button>
      
        <button
          type="button"
          className="icon-btn tb-quick-btn tb-hide-mobile"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={toggleFullscreen}
        >
          <AppIcon icon={isFullscreen ? Icons.fullscreenExit : Icons.fullscreen} size={14} />
        </button>
        <div className="tb-avatar" title={user?.name || user?.email || 'User'}>
          {initials}
        </div>
      </div>
      {notifOpen && (
        <div className="tb-notif-panel" ref={notifRef}>
          <div className="tb-notif-head">
            <div className="tb-notif-title">Notifications</div>
            <button type="button" className="tb-notif-mark" onClick={clearNotifs}>
              Mark all read
            </button>
          </div>
          <div className="tb-notif-list">
            {notifications.length === 0 && (
              <div className="tb-notif-empty">No notifications</div>
            )}
            {notifications.slice(0, 8).map((n) => (
              <div key={n.id} className={`tb-notif-item${n.read ? '' : ' unread'}`}>
                <div className="tb-notif-icon">
                  <AppIcon icon={NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default} size={14} />
                </div>
                <div className="tb-notif-content">
                  <div className="tb-notif-text" dangerouslySetInnerHTML={{ __html: n.text }} />
                  <div className="tb-notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="tb-notif-viewall"
            onClick={() => {
              setNotifOpen(false);
              navigate('/notifications');
            }}
          >
            View all
          </button>
        </div>
      )}
    </motion.div>
  );
}

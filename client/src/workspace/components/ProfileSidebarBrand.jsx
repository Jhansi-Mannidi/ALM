import { AppIcon, Icons } from '../../components/icons';
import { WorkspaceIcon } from './WorkspaceIcons';

export default function ProfileSidebarBrand({
  icon = 'users',
  title = 'VoltusWorkspace',
  subtitle,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <div className="sb-brand ws-profile-sb-brand">
      <div className="sb-brand-main">
        <div className="sb-logo ws-profile-sb-logo">
          <WorkspaceIcon name={icon} size={16} className="sb-logo-icon" />
        </div>
        <div className="ws-profile-sb-brand-text">
          <div className="sb-name">{title}</div>
          {subtitle && <div className="sb-tag">{subtitle}</div>}
        </div>
      </div>
      <button
        type="button"
        className="sb-collapse-btn ws-profile-sb-collapse"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleCollapsed}
      >
        <AppIcon icon={collapsed ? Icons.panelLeftOpen : Icons.panelLeftClose} size={18} />
      </button>
    </div>
  );
}

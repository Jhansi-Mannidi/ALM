import { Link } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';

/**
 * Consistent finance page header with optional breadcrumbs and actions.
 */
export default function FinancePageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  period,
  actions,
  children,
}) {
  return (
    <div className="ws-fin-page-header">
      {breadcrumbs.length > 0 && (
        <nav className="ws-fin-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path || crumb.label} className="ws-fin-breadcrumb-item">
              {i > 0 && <AppIcon icon={Icons.chevronRight} size={12} className="ws-fin-breadcrumb-sep" />}
              {crumb.path ? (
                <Link to={crumb.path}>{crumb.label}</Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="ws-admin-head">
        <div>
          <div className="ws-fin-title-row">
            <h1 className="ws-page-title">{title}</h1>
            {period && <span className="ws-fin-period-badge">{period}</span>}
          </div>
          {subtitle && <p className="ws-page-subtitle">{subtitle}</p>}
        </div>
        {(actions || children) && (
          <div className="fx g8 ws-fin-header-actions">
            {actions}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

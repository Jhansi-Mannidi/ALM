/**
 * Consistent finance page header with optional actions.
 */
export default function FinancePageHeader({
  title,
  subtitle,
  period,
  actions,
  children,
}) {
  return (
    <div className="ws-fin-page-header">
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

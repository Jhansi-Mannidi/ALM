export default function OfficePageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="ws-admin-head ws-office-page-head">
      <div>
        <h1 className="ws-page-title">{title}</h1>
        {subtitle && <p className="ws-page-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="ws-office-head-actions">{actions}</div>}
    </div>
  );
}

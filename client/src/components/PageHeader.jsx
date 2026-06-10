export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="ph">
      <div>
        <div className="ph-title">{title}</div>
        {subtitle != null && subtitle !== '' && <div className="ph-sub">{subtitle}</div>}
      </div>
      {actions ? <div className="ph-actions">{actions}</div> : null}
    </div>
  );
}

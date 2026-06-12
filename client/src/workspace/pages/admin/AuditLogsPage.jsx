import { AppIcon, Icons } from '../../../components/icons';

const AUDIT_LOGS = [
  { id: 1, action: 'Role updated', detail: 'HR Manager — hr.approvals enabled', user: 'Sasi Paul', time: '2 hours ago', type: 'role' },
  { id: 2, action: 'User assigned', detail: 'Michael Chen → Developer', user: 'Ram Reddy', time: '5 hours ago', type: 'user' },
  { id: 3, action: 'Role created', detail: 'Finance Analyst (custom)', user: 'Sasi Paul', time: '1 day ago', type: 'role' },
  { id: 4, action: 'Permission denied', detail: 'Attempted access to System Admin', user: 'Michael Chen', time: '1 day ago', type: 'security' },
  { id: 5, action: 'Role updated', detail: 'Developer — finance.access disabled', user: 'Sasi Paul', time: '2 days ago', type: 'role' },
  { id: 6, action: 'Export', detail: 'Roles exported to JSON', user: 'Ram Reddy', time: '3 days ago', type: 'system' },
];

const TYPE_ICONS = {
  role: Icons.shieldCheck,
  user: Icons.users,
  security: Icons.alertTriangle,
  system: Icons.clipboardCheck,
};

export default function AuditLogsPage() {
  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">Audit Logs</h1>
          <p className="ws-rbac-page-sub">Security events and role change history</p>
        </div>
        <button type="button" className="ws-rbac-btn-outline">
          <AppIcon icon={Icons.download} size={14} />
          Export Logs
        </button>
      </header>

      <div className="ws-rbac-audit-list">
        {AUDIT_LOGS.map((log) => (
          <div key={log.id} className={`ws-rbac-audit-item ws-rbac-audit-${log.type}`}>
            <div className={`ws-rbac-audit-icon ws-rbac-audit-icon-${log.type}`}>
              <AppIcon icon={TYPE_ICONS[log.type] || Icons.circle} size={16} />
            </div>
            <div className="ws-rbac-audit-body">
              <div className="ws-rbac-audit-action">{log.action}</div>
              <div className="ws-rbac-audit-detail">{log.detail}</div>
              <div className="ws-rbac-audit-meta">
                by {log.user} · {log.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

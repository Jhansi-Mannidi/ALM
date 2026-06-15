import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const ROLE_LABELS = { maker: 'Makers', contributor: 'Contributors', viewer: 'Viewers' };

export default function AdoptionReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getProductAdoption().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-rbac-page">
        <header className="ws-rbac-page-head">
          <h1 className="ws-rbac-page-title">Workspace Adoption</h1>
          <p className="ws-rbac-page-sub">Loading…</p>
        </header>
      </div>
    );
  }

  const { stats, members, byRole, activity } = data;
  const maxActivity = Math.max(...activity.map((a) => a.activeUsers), 1);

  return (
    <div className="ws-rbac-page">
      <header className="ws-rbac-page-head">
        <div>
          <h1 className="ws-rbac-page-title">Workspace Adoption</h1>
          <p className="ws-rbac-page-sub">Monitor team usage, seat allocation, and member activity</p>
        </div>
        <Link to="/workspace/admin/rbac/users" className="ws-rbac-btn-primary">
          <AppIcon icon={Icons.users} size={15} />
          Manage users
        </Link>
      </header>

      <div className="ws-rbac-stats">
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon blue"><AppIcon icon={Icons.users} size={20} /></div>
          <div>
            <div className="ws-rbac-stat-value">{stats.total}</div>
            <div className="ws-rbac-stat-label">Total members</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon green"><AppIcon icon={Icons.checkCircle} size={20} /></div>
          <div>
            <div className="ws-rbac-stat-value">{stats.active}</div>
            <div className="ws-rbac-stat-label">Active ({stats.activeRate}%)</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon purple"><AppIcon icon={Icons.clock} size={20} /></div>
          <div>
            <div className="ws-rbac-stat-value">{stats.pending}</div>
            <div className="ws-rbac-stat-label">Pending invites</div>
          </div>
        </div>
        <div className="ws-rbac-stat-card">
          <div className="ws-rbac-stat-icon teal"><AppIcon icon={Icons.shieldCheck} size={20} /></div>
          <div>
            <div className="ws-rbac-stat-value">{stats.makerSeatsLeft}</div>
            <div className="ws-rbac-stat-label">Maker seats left</div>
          </div>
        </div>
      </div>

      <div className="ws-hr-grid-2">
        <div className="card ws-rbac-dash-card">
          <h2 className="ws-rbac-section-title">Role breakdown</h2>
          <div className="ws-pm-adoption-roles">
            {byRole.map((r) => (
              <div key={r.role} className="ws-pm-report-row">
                <span>{ROLE_LABELS[r.role] || r.role}</span>
                <div className="ws-pm-report-bar-wrap">
                  <div className="ws-pm-report-bar" style={{ width: `${(r.count / Math.max(stats.total, 1)) * 100}%` }} />
                </div>
                <span className="ws-pm-report-val">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card ws-rbac-dash-card">
          <h2 className="ws-rbac-section-title">Daily active users</h2>
          <div className="ws-pm-activity-chart">
            {activity.map((a) => (
              <div key={a.date} className="ws-pm-activity-bar-wrap" title={`${a.date}: ${a.activeUsers} active`}>
                <div className="ws-pm-activity-bar" style={{ height: `${(a.activeUsers / maxActivity) * 100}%` }} />
                <span className="ws-pm-activity-label">{a.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card ws-rbac-dash-card ws-pm-adoption-members">
        <h2 className="ws-rbac-section-title">Members</h2>
        <div className="ws-pm-table-wrap">
          <table className="ws-pm-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th></tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="ws-pm-cell-title">{m.name}</td>
                  <td>{m.email}</td>
                  <td><span className="chip chip-xs chip-blue">{m.role}</span></td>
                  <td><span className={`chip chip-xs ${m.status === 'active' ? 'chip-green' : 'chip-amber'}`}>{m.status}</span></td>
                  <td className="ws-pm-cell-meta">{m.lastActive || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

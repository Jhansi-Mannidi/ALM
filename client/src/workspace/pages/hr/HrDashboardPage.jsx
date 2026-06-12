import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function activityIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('leave')) return Icons.calendarDays;
  if (t.includes('document') || t.includes('upload')) return Icons.fileText;
  if (t.includes('review') || t.includes('performance')) return Icons.clipboardCheck;
  if (t.includes('hire') || t.includes('onboard')) return Icons.userPlus;
  return Icons.checkCircle;
}

export default function HrDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getHrDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-hr-dash">
        <h1 className="ws-page-title">HR Dashboard</h1>
        <p className="ws-page-subtitle">Loading…</p>
      </div>
    );
  }

  const { stats, pendingActions, recentActivity, onLeaveToday, departmentHeadcount } = data;

  return (
    <div className="ws-hr-page ws-hr-dash">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">HR Dashboard</h1>
          <p className="ws-page-subtitle">Overview of your workforce and pending actions</p>
        </div>
      </div>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-stats">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.totalEmployees}</div>
            <div className="ws-hr-stat-label">Total Employees</div>
            <div className="ws-hr-stat-foot">
              <span className="chip chip-green">↑ 3.4% this month</span>
            </div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.onLeaveToday}</div>
            <div className="ws-hr-stat-label">On Leave Today</div>
            <div className="ws-hr-stat-foot">
              <span className="ws-hr-stat-meta">Sick: 3 · Casual: 5</span>
            </div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.newHiresThisMonth}</div>
            <div className="ws-hr-stat-label">New Hires (This Month)</div>
            <div className="ws-hr-stat-foot">
              <Link to="/workspace/hr/onboarding" className="ws-hr-stat-link">
                View Onboarding
                <AppIcon icon={Icons.arrowRight} size={12} />
              </Link>
            </div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.pendingApprovals}</div>
            <div className="ws-hr-stat-label">Pending Approvals</div>
            <div className="ws-hr-stat-foot">
              <Link to="/workspace/hr/approvals" className="ws-hr-stat-link">
                Review approvals
                <AppIcon icon={Icons.arrowRight} size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-grid-2">
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Pending Actions</h2>
              <Link to="/workspace/hr/approvals" className="btn btn-ghost btn-sm">
                View All
              </Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-action-list">
                {pendingActions.map((a) => (
                  <div key={a.id} className="ws-hr-action-item">
                    <div className="ws-hr-avatar sm">{a.ini}</div>
                    <div className="ws-hr-action-body">
                      <div className="ws-hr-action-name">{a.employee}</div>
                      <div className="ws-hr-action-desc">{a.action}</div>
                    </div>
                    <div className="ws-hr-action-meta">
                      {a.urgency && <span className="chip chip-red">{a.urgency}</span>}
                      <span className="ws-hr-action-due">{a.due}</span>
                      <Link
                        to="/workspace/hr/approvals"
                        className="btn btn-ghost btn-sm ws-hr-dash-review-btn"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Recent Activity</h2>
              <button type="button" className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-activity-list">
                {recentActivity.map((a) => (
                  <div key={a.id} className="ws-hr-activity-item">
                    <span className="ws-hr-activity-icon">
                      <AppIcon icon={activityIcon(a.text)} size={14} />
                    </span>
                    <span className="ws-hr-activity-text">{a.text}</span>
                    <span className="ws-hr-activity-time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-grid-3">
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">On Leave Today</h2>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-dash-list">
                {onLeaveToday.map((e) => (
                  <div key={e.id} className="ws-hr-leave-item">
                    <div className="ws-hr-avatar sm">{e.ini}</div>
                    <div>
                      <div className="ws-hr-action-name">{e.name}</div>
                      <div className="ws-hr-action-desc">{e.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Department Headcount</h2>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-dash-list">
                {departmentHeadcount.map((d) => (
                  <div key={d.name} className="ws-hr-dept-row">
                    <span className="ws-hr-dept-name">{d.name}</span>
                    <span className="ws-hr-dept-count">{d.count} ({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Quick Stats</h2>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-quick-stats">
                <div className="ws-hr-quick-stat">
                  <span>Open positions</span>
                  <Link to="/workspace/hr/recruitment">{stats.openPositions}</Link>
                </div>
                <div className="ws-hr-quick-stat">
                  <span>Avg time to hire</span>
                  <strong>{stats.avgTimeToHire} days</strong>
                </div>
                <div className="ws-hr-quick-stat">
                  <span>Employee satisfaction</span>
                  <strong>{stats.employeeSatisfaction}/10</strong>
                </div>
                <div className="ws-hr-quick-stat">
                  <span>Training hours (this month)</span>
                  <strong>{stats.trainingHours}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

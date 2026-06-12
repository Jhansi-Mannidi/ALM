import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { ASSET_TICKET_TYPE_LABELS, TICKET_STATUS_CHIPS } from '../../data/employeeCatalog';
import { EmployeeAvatar } from '../hr/EmployeeModals';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmployeeDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getEmployeePortal().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-emp-portal-page">
        <h1 className="ws-page-title">My Dashboard</h1>
        <p className="ws-page-subtitle">Loading…</p>
      </div>
    );
  }

  const { employee, stats, recentTickets } = data;

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">My Dashboard</h1>
          <p className="ws-page-subtitle">Your profile, assets, and open requests at a glance</p>
        </div>
        <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary">
          <AppIcon icon={Icons.plus} size={14} />
          Raise Asset Ticket
        </Link>
      </div>

      <div className="card ws-emp-profile-hero">
        <div className="ws-emp-profile-hero-inner">
          <EmployeeAvatar employee={employee} className="lg" />
          <div className="fx1">
            <h2 className="ws-page-title" style={{ fontSize: 'var(--text-xl)' }}>
              Welcome back, {employee.name.split(' ')[0]}
            </h2>
            <p className="ws-page-subtitle">{employee.role} · {employee.department}</p>
            <div className="ws-emp-detail-badges mt8">
              <span className="chip chip-gray">{employee.employeeId}</span>
              <span className="chip chip-gray">{employee.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-hr-stats">
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">{stats.documents ?? 0}</div>
          <div className="ws-hr-stat-label">My Documents</div>
          <div className="ws-hr-stat-foot">
            <Link to="/workspace/employee/documents" className="ws-hr-stat-link">
              Manage documents
              <AppIcon icon={Icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">{stats.assignedAssets}</div>
          <div className="ws-hr-stat-label">Assigned Assets</div>
          <div className="ws-hr-stat-foot">
            <Link to="/workspace/employee/assets" className="ws-hr-stat-link">
              View assets
              <AppIcon icon={Icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">{stats.aiSubscriptions ?? 0}</div>
          <div className="ws-hr-stat-label">AI Subscriptions</div>
          <div className="ws-hr-stat-foot">
            <Link to="/workspace/employee/ai-subscriptions" className="ws-hr-stat-link">
              {stats.pendingAiRequests ? `${stats.pendingAiRequests} pending` : 'View tools'}
              <AppIcon icon={Icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">{stats.openTickets}</div>
          <div className="ws-hr-stat-label">Open Tickets</div>
          <div className="ws-hr-stat-foot">
            <Link to="/workspace/employee/asset-tickets" className="ws-hr-stat-link">
              View tickets
              <AppIcon icon={Icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">
            {stats.exitRequest ? stats.exitRequest.ticketNo : '—'}
          </div>
          <div className="ws-hr-stat-label">Exit Request</div>
          <div className="ws-hr-stat-foot">
            <Link to="/workspace/employee/exit" className="ws-hr-stat-link">
              {stats.exitRequest ? 'View request' : 'Submit exit'}
              <AppIcon icon={Icons.arrowRight} size={12} />
            </Link>
          </div>
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Recent asset tickets</h2>
          <Link to="/workspace/employee/asset-tickets" className="btn btn-ghost btn-sm">
            View all
          </Link>
        </div>
        <div className="ws-hr-panel-body">
          {recentTickets.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.wrench} size={28} />
              <p>No asset tickets yet</p>
              <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary btn-sm">
                Raise your first ticket
              </Link>
            </div>
          ) : (
            <div className="ws-hr-ops-list">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="ws-hr-ops-row">
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{ticket.ticketNo}</span>
                      <span className="chip chip-gray">{ASSET_TICKET_TYPE_LABELS[ticket.type] || ticket.type}</span>
                      <span className={`chip ${TICKET_STATUS_CHIPS[ticket.status] || 'chip-gray'}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="ws-hr-action-desc">{ticket.subject}</div>
                    <div className="ws-hr-ops-meta">
                      <span>{ticket.category}</span>
                      <span>Created {formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

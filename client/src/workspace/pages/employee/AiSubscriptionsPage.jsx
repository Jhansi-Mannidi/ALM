import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { AI_REQUEST_STATUS_CHIPS, AI_SUBSCRIPTION_STATUS_CHIPS } from '../../data/employeeCatalog';

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AiSubscriptionsPage() {
  const [data, setData] = useState({ subscriptions: [], requests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEmployeeAiSubscriptions().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const monthlyTotal = data.subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthlyCostInr || 0), 0);

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">AI Subscriptions</h1>
          <p className="ws-page-subtitle">
            Your active AI tool licenses — Cursor, Claude, ChatGPT, Gemini, v0, and more
          </p>
        </div>
        <Link to="/workspace/employee/ai-subscriptions/new" className="ws-hr-btn-primary">
          <AppIcon icon={Icons.plus} size={14} />
          Request AI Tool
        </Link>
      </div>

      {data.subscriptions.length > 0 && (
        <div className="ws-fin-ledger-stats mb16">
          <div className="ws-fin-ledger-stat">
            <span className="ws-fin-ledger-stat-label">Active tools</span>
            <strong className="ws-fin-ledger-stat-value">{data.subscriptions.filter((s) => s.status === 'active').length}</strong>
          </div>
          <div className="ws-fin-ledger-stat">
            <span className="ws-fin-ledger-stat-label">Monthly cost (your licenses)</span>
            <strong className="ws-fin-ledger-stat-value">{formatINR(monthlyTotal)}</strong>
          </div>
          <div className="ws-fin-ledger-stat">
            <span className="ws-fin-ledger-stat-label">Pending requests</span>
            <strong className="ws-fin-ledger-stat-value">{data.requests.filter((r) => r.status === 'pending').length}</strong>
          </div>
        </div>
      )}

      <div className="card ws-hr-panel mb16">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">My active subscriptions</h2>
        </div>
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : data.subscriptions.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.sparkles} size={28} />
              <p>No AI subscriptions yet</p>
              <Link to="/workspace/employee/ai-subscriptions/new" className="ws-hr-btn-primary btn-sm">
                Request your first AI tool
              </Link>
            </div>
          ) : (
            <div className="ws-fin-vendors-grid">
              {data.subscriptions.map((sub) => (
                <article key={sub.id} className="card ws-emp-card ws-fin-vendor-card ws-ai-sub-card">
                  <div className="ws-emp-card-body">
                    <div className="ws-hr-ops-row-head mb8">
                      <span className="ws-hr-action-name">{sub.toolName}</span>
                      <span className={`chip ${AI_SUBSCRIPTION_STATUS_CHIPS[sub.status] || 'chip-gray'}`}>{sub.status}</span>
                    </div>
                    <div className="ws-ai-sub-meta">
                      <span className="chip chip-gray">{sub.vendor}</span>
                      <span className="chip chip-blue">{sub.plan}</span>
                    </div>
                    <div className="ws-emp-contact ws-fin-vendor-contact mt8">
                      <div className="ws-emp-contact-row">
                        <AppIcon icon={Icons.mail} size={14} />
                        <span>{sub.licenseEmail || '—'}</span>
                      </div>
                      <div className="ws-emp-contact-row">
                        <AppIcon icon={Icons.calendarDays} size={14} />
                        <span>Since {formatDate(sub.startDate)}</span>
                      </div>
                    </div>
                    <div className="ws-fin-vendor-outstanding mt12">
                      <span>Monthly cost</span>
                      <strong>{formatINR(sub.monthlyCostInr)}</strong>
                    </div>
                    {sub.notes && <p className="ws-page-subtitle mt8" style={{ fontSize: 'var(--text-sm)' }}>{sub.notes}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">My requests</h2>
        </div>
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : data.requests.length === 0 ? (
            <p className="ws-page-subtitle">No subscription requests yet.</p>
          ) : (
            <div className="ws-hr-ops-list">
              {data.requests.map((req) => (
                <div key={req.id} className="ws-hr-ops-row">
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{req.requestNo}</span>
                      <span className="chip chip-gray">{req.toolName} · {req.plan}</span>
                      <span className={`chip ${AI_REQUEST_STATUS_CHIPS[req.status] || 'chip-gray'}`}>{req.status}</span>
                    </div>
                    <div className="ws-hr-action-desc">{req.vendor} — {formatINR(req.monthlyCostInr)}/mo</div>
                    <div className="ws-hr-ops-details">{req.reason}</div>
                    <div className="ws-hr-ops-meta">
                      <span>Submitted {formatDate(req.createdAt)}</span>
                      {req.reviewedAt && <span>Reviewed {formatDate(req.reviewedAt)}</span>}
                    </div>
                    {req.status === 'approved' && (
                      <p className="ws-hr-ops-resolve-note">Approved — your subscription is now active.</p>
                    )}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <p className="ws-hr-ops-reject-note">Rejected: {req.rejectionReason}</p>
                    )}
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

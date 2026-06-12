import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { AI_REQUEST_STATUS_CHIPS, AI_SUBSCRIPTION_STATUS_CHIPS } from '../../data/employeeCatalog';

const TABS = [
  { id: 'requests', label: 'Requests' },
  { id: 'active', label: 'Active Subscriptions' },
  { id: 'overview', label: 'Cost Overview' },
];

const REQUEST_FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReviewModal({ request, mode, onClose, onSubmit, submitting }) {
  const [licenseEmail, setLicenseEmail] = useState('');
  const [hrNotes, setHrNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'approve') {
      onSubmit({ status: 'approved', licenseEmail: licenseEmail.trim(), hrNotes: hrNotes.trim() });
    } else {
      if (!rejectionReason.trim()) return;
      onSubmit({ status: 'rejected', rejectionReason: rejectionReason.trim(), hrNotes: hrNotes.trim() });
    }
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <h3 className="modal-title">
            {mode === 'approve' ? 'Approve' : 'Reject'} — {request.requestNo}
          </h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="ws-page-subtitle mb12">
            <strong>{request.employee}</strong> requested <strong>{request.toolName}</strong> ({request.plan}) — {formatINR(request.monthlyCostInr)}/mo
          </p>
          <p className="ws-hr-ops-details mb12">{request.reason}</p>
          {mode === 'approve' ? (
            <label className="fl">
              License email
              <input
                className="fi"
                type="email"
                placeholder="employee@company.com"
                value={licenseEmail}
                onChange={(e) => setLicenseEmail(e.target.value)}
              />
            </label>
          ) : (
            <label className="fl">
              Rejection reason *
              <textarea
                className="fi"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request cannot be approved…"
                required
              />
            </label>
          )}
          <label className="fl">
            HR notes (optional)
            <textarea className="fi" rows={2} value={hrNotes} onChange={(e) => setHrNotes(e.target.value)} />
          </label>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={mode === 'approve' ? 'ws-hr-btn-primary' : 'btn btn-ghost'}
              style={mode === 'reject' ? { color: 'var(--red)' } : undefined}
              disabled={submitting || (mode === 'reject' && !rejectionReason.trim())}
            >
              {mode === 'approve' ? 'Approve & provision' : 'Reject request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HrAiSubscriptionsPage() {
  const [tab, setTab] = useState('requests');
  const [requestFilter, setRequestFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [active, setActive] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewMode, setReviewMode] = useState('approve');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getHrAiSubscriptionRequests({ status: requestFilter }),
      api.getHrAiActiveSubscriptions(),
      api.getHrAiSubscriptionsOverview(),
    ])
      .then(([reqs, subs, ov]) => {
        setRequests(reqs);
        setActive(subs);
        setOverview(ov);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [requestFilter]);

  const q = search.trim().toLowerCase();
  const filteredRequests = useMemo(
    () => requests.filter((r) => !q || r.employee.toLowerCase().includes(q) || r.toolName.toLowerCase().includes(q) || r.requestNo.toLowerCase().includes(q)),
    [requests, q],
  );
  const filteredActive = useMemo(
    () => active.filter((s) => !q || s.employee.toLowerCase().includes(q) || s.toolName.toLowerCase().includes(q) || s.vendor.toLowerCase().includes(q)),
    [active, q],
  );

  const handleReview = async (id, data) => {
    setActingId(id);
    try {
      await api.updateHrAiSubscriptionRequest(id, data);
      setReviewTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setActingId(null);
    }
  };

  const handleCancelSub = async (sub) => {
    if (!window.confirm(`Cancel ${sub.toolName} for ${sub.employee}?`)) return;
    setActingId(sub.id);
    try {
      await api.updateHrAiActiveSubscription(sub.id, { status: 'cancelled' });
      load();
    } catch { /* ignore */ } finally {
      setActingId(null);
    }
  };

  return (
    <div className="ws-hr-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">AI Subscriptions</h1>
          <p className="ws-page-subtitle">
            Review employee requests and track who uses which AI tools and monthly cost
          </p>
        </div>
      </div>

      {overview && (
        <div className="ws-hr-stats ws-hr-ops-stats mb16">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{formatINR(overview.totalMonthlyCostInr)}</div>
            <div className="ws-hr-stat-label">Total monthly cost</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{overview.activeSubscriptionCount}</div>
            <div className="ws-hr-stat-label">Active licenses</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{overview.pendingRequestCount}</div>
            <div className="ws-hr-stat-label">Pending requests</div>
          </div>
        </div>
      )}

      <div className="ws-hr-ops-filters mb16">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ws-hr-ops-filter${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'overview' && (
        <div className="ws-emp-filters card mb16">
          <div className="ws-emp-filters-row">
            <div className="ws-emp-search-wrap">
              <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
              <input
                type="search"
                className="ws-emp-search"
                placeholder={tab === 'requests' ? 'Search employee or tool…' : 'Search employee, tool, or vendor…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <>
          <div className="ws-hr-ops-filters mb16">
            {REQUEST_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`ws-hr-ops-filter${requestFilter === f.id ? ' active' : ''}`}
                onClick={() => setRequestFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-body">
              {loading ? (
                <p className="ws-page-subtitle">Loading requests…</p>
              ) : filteredRequests.length === 0 ? (
                <div className="ws-hr-ops-empty">
                  <AppIcon icon={Icons.sparkles} size={28} />
                  <p>No requests match your filters</p>
                </div>
              ) : (
                <div className="ws-hr-ops-list">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="ws-hr-ops-row">
                      <div className="ws-hr-avatar sm">{req.ini}</div>
                      <div className="ws-hr-ops-row-main">
                        <div className="ws-hr-ops-row-head">
                          <span className="ws-hr-action-name">{req.requestNo}</span>
                          <span className="chip chip-gray">{req.employee}</span>
                          <span className="chip chip-blue">{req.toolName} · {req.plan}</span>
                          <span className={`chip ${AI_REQUEST_STATUS_CHIPS[req.status] || 'chip-gray'}`}>{req.status}</span>
                        </div>
                        <div className="ws-hr-action-desc">{req.vendor} — {formatINR(req.monthlyCostInr)}/month</div>
                        <div className="ws-hr-ops-details">{req.reason}</div>
                        <div className="ws-hr-ops-meta">
                          <span>{req.department}</span>
                          <span>Submitted {formatDate(req.createdAt)}</span>
                          {req.reviewedAt && <span>Reviewed {formatDate(req.reviewedAt)} by {req.reviewedBy}</span>}
                        </div>
                        {req.rejectionReason && (
                          <p className="ws-hr-ops-reject-note">Rejected: {req.rejectionReason}</p>
                        )}
                      </div>
                      <div className="ws-hr-ops-row-actions ws-hr-ticket-actions">
                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="ws-hr-btn-primary btn-sm"
                              disabled={actingId === req.id}
                              onClick={() => { setReviewTarget(req); setReviewMode('approve'); }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={actingId === req.id}
                              onClick={() => { setReviewTarget(req); setReviewMode('reject'); }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <Link to={`/workspace/hr/employees/${req.employeeId}`} className="btn btn-ghost btn-sm">
                          Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'active' && (
        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
            {loading ? (
              <p className="ws-page-subtitle">Loading subscriptions…</p>
            ) : filteredActive.length === 0 ? (
              <p className="ws-page-subtitle">No active subscriptions found.</p>
            ) : (
              <table className="ws-hr-table ws-fin-ledger-table">
                <thead>
                  <tr>
                    <th className="ws-fin-col-text">Employee</th>
                    <th className="ws-fin-col-text">Department</th>
                    <th className="ws-fin-col-text">AI Tool</th>
                    <th className="ws-fin-col-text">Vendor</th>
                    <th className="ws-fin-col-status">Plan</th>
                    <th className="ws-fin-col-num">Monthly Cost</th>
                    <th className="ws-fin-col-date">Since</th>
                    <th className="ws-fin-col-status">Status</th>
                    <th className="ws-fin-col-action" />
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.map((sub) => (
                    <tr key={sub.id}>
                      <td className="ws-fin-col-text">
                        <Link to={`/workspace/hr/employees/${sub.employeeId}`} className="ws-fin-report-link">
                          {sub.employee}
                        </Link>
                      </td>
                      <td className="ws-fin-col-text">{sub.department}</td>
                      <td className="ws-fin-col-text"><strong>{sub.toolName}</strong></td>
                      <td className="ws-fin-col-text">{sub.vendor}</td>
                      <td className="ws-fin-col-status"><span className="chip chip-blue">{sub.plan}</span></td>
                      <td className="ws-fin-col-num">{formatINR(sub.monthlyCostInr)}</td>
                      <td className="ws-fin-col-date">{formatDate(sub.startDate)}</td>
                      <td className="ws-fin-col-status">
                        <span className={`chip ${AI_SUBSCRIPTION_STATUS_CHIPS[sub.status] || 'chip-gray'}`}>{sub.status}</span>
                      </td>
                      <td className="ws-fin-col-action">
                        {sub.status === 'active' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={actingId === sub.id}
                            onClick={() => handleCancelSub(sub)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'overview' && overview && (
        <div className="ws-fin-dash-grid">
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Cost by AI tool</h2>
            </div>
            <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Vendor</th>
                    <th>Employees</th>
                    <th className="ws-fin-col-num">Monthly cost</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.byTool.map((row) => (
                    <tr key={row.toolId}>
                      <td><strong>{row.toolName}</strong></td>
                      <td>{row.vendor}</td>
                      <td>{row.employeeCount}</td>
                      <td className="ws-fin-col-num">{formatINR(row.monthlyCostInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Cost by employee</h2>
            </div>
            <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>AI tools</th>
                    <th className="ws-fin-col-num">Monthly cost</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.byEmployee.map((row) => (
                    <tr key={row.employeeId}>
                      <td>
                        <Link to={`/workspace/hr/employees/${row.employeeId}`} className="ws-fin-report-link">
                          {row.employee}
                        </Link>
                      </td>
                      <td>{row.department}</td>
                      <td>
                        {row.tools.map((t) => (
                          <span key={`${row.employeeId}-${t.toolId}`} className="chip chip-gray" style={{ marginRight: 4, marginBottom: 4 }}>
                            {t.toolName}
                          </span>
                        ))}
                      </td>
                      <td className="ws-fin-col-num">{formatINR(row.totalMonthlyCostInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          request={reviewTarget}
          mode={reviewMode}
          submitting={actingId === reviewTarget.id}
          onClose={() => setReviewTarget(null)}
          onSubmit={(data) => handleReview(reviewTarget.id, data)}
        />
      )}
    </div>
  );
}

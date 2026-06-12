import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'in-review', label: 'In review' },
  { id: 'approved', label: 'Approved' },
  { id: 'asset-pending', label: 'Awaiting assets' },
  { id: 'completed', label: 'Completed' },
];

const STATUS_CHIPS = {
  submitted: 'chip-amber',
  'in-review': 'chip-blue',
  approved: 'chip-green',
  completed: 'chip-gray',
  withdrawn: 'chip-red',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HrExitPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .getHrExitRequests({ status: filter })
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleUpdate = async (id, data) => {
    setActingId(id);
    try {
      await api.updateHrExitRequest(id, data);
      load();
    } catch {
      /* ignore */
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = requests.filter((r) => ['submitted', 'in-review'].includes(r.status)).length;
  const assetsPending = requests.filter(
    (r) => r.status === 'approved' && !r.assetsSubmitted,
  ).length;

  return (
    <div className="ws-hr-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Exit &amp; offboarding</h1>
          <p className="ws-page-subtitle">
            Track resignations, last working days, and asset return status
          </p>
        </div>
      </div>

      {filter === 'all' && requests.length > 0 && (
        <div className="ws-hr-stats ws-hr-ops-stats">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{requests.length}</div>
            <div className="ws-hr-stat-label">Total exit requests</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{pendingCount}</div>
            <div className="ws-hr-stat-label">Pending review</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{assetsPending}</div>
            <div className="ws-hr-stat-label">Assets not returned</div>
          </div>
        </div>
      )}

      <div className="ws-hr-ops-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ws-hr-ops-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading exit requests…</p>
          ) : requests.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.logOut} size={28} />
              <p>No exit requests found</p>
            </div>
          ) : (
            <div className="ws-hr-ops-list">
              {requests.map((req) => (
                <div key={req.id} className="ws-hr-ops-row">
                  <div className="ws-hr-avatar sm">{req.ini}</div>
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{req.employee}</span>
                      <span className="chip chip-gray">{req.ticketNo}</span>
                      <span className={`chip ${STATUS_CHIPS[req.status] || 'chip-gray'}`}>
                        {req.status.replace('-', ' ')}
                      </span>
                      {req.status === 'approved' && !req.assetsSubmitted && (
                        <span className="chip chip-amber">Awaiting employee assets</span>
                      )}
                      {req.assetsSubmitted && (
                        <span className="chip chip-green">Assets submitted</span>
                      )}
                      {req.status !== 'approved' && req.status !== 'completed' && !req.assetsSubmitted && (
                        <span className="chip chip-gray">Assets after approval</span>
                      )}
                    </div>
                    <div className="ws-hr-action-desc">{req.role} · {req.department}</div>
                    <div className="ws-hr-ops-details">{req.reason}</div>
                    <div className="ws-hr-ops-meta">
                      <span>Last day {formatDate(req.lastWorkingDay)}</span>
                      <span>Submitted {formatDate(req.submittedAt)}</span>
                      <span>
                        Assets: {req.assetsReturnedCount}/{req.assignedAssetsCount} returned
                      </span>
                      {req.approvedAt && <span>Approved {formatDate(req.approvedAt)}</span>}
                      {req.assetsSubmittedAt && (
                        <span>Assets submitted {formatDate(req.assetsSubmittedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="ws-hr-ops-row-actions">
                    {req.status === 'submitted' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={actingId === req.id}
                        onClick={() => handleUpdate(req.id, { status: 'in-review' })}
                      >
                        Start review
                      </button>
                    )}
                    {['submitted', 'in-review'].includes(req.status) && (
                      <button
                        type="button"
                        className="ws-hr-btn-primary btn-sm"
                        disabled={actingId === req.id}
                        onClick={() => handleUpdate(req.id, { status: 'approved', clearedBy: 'HR' })}
                      >
                        Approve
                      </button>
                    )}
                    {req.status === 'approved' && !req.assetsSubmitted && (
                      <span className="ws-hr-exit-waiting">Waiting for employee asset submission</span>
                    )}
                    {req.status === 'approved' && req.assetsSubmitted && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={actingId === req.id}
                          onClick={() =>
                            handleUpdate(req.id, {
                              assetsReturnedCount: req.assignedAssetsCount,
                            })
                          }
                        >
                          Verify assets received
                        </button>
                        <button
                          type="button"
                          className="ws-hr-btn-primary btn-sm"
                          disabled={actingId === req.id}
                          onClick={() =>
                            handleUpdate(req.id, {
                              status: 'completed',
                              assetsReturnedCount: req.assignedAssetsCount,
                            })
                          }
                        >
                          Complete offboarding
                        </button>
                      </>
                    )}
                    <Link
                      to={`/workspace/hr/employees/${req.employeeId}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Profile
                    </Link>
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

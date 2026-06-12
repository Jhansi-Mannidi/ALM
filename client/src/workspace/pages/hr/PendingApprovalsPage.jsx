import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const TYPE_LABELS = {
  leave: 'Leave',
  document: 'Document',
  review: 'Review',
  expense: 'Expense',
};

const TYPE_ICONS = {
  leave: Icons.calendarDays,
  document: Icons.fileText,
  review: Icons.clipboardCheck,
  expense: Icons.fileSpreadsheet,
};

const STATUS_FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PendingApprovalsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getHrApprovals({ status: filter })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleAction = async (id, status) => {
    setActingId(id);
    try {
      await api.updateHrApproval(id, { status });
      load();
    } catch {
      /* ignore */
    } finally {
      setActingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingCount = items.filter((i) => i.status === 'pending').length;
    if (!pendingCount) return;
    if (!window.confirm(`Approve all ${pendingCount} pending requests at once?`)) return;

    setApprovingAll(true);
    try {
      await api.approveAllHrApprovals();
      load();
    } catch {
      /* ignore */
    } finally {
      setApprovingAll(false);
    }
  };

  return (
    <div className="ws-hr-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Pending actions &amp; approvals</h1>
          <p className="ws-page-subtitle">
            Review leave requests, documents, performance sign-offs, and reimbursements
          </p>
        </div>
      </div>

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

      {filter === 'pending' && items.length > 0 && (
        <div className="ws-hr-ops-summary ws-hr-ops-summary--actions">
          <div className="ws-hr-ops-summary-text">
            <AppIcon icon={Icons.listChecks} size={14} />
            <span>
              <strong>{items.length}</strong> items awaiting your review
            </span>
          </div>
          <button
            type="button"
            className="ws-hr-btn-primary btn-sm"
            disabled={approvingAll || actingId != null}
            onClick={handleApproveAll}
          >
            <AppIcon icon={Icons.checkCheck} size={14} />
            {approvingAll ? 'Approving…' : 'Approve all'}
          </button>
        </div>
      )}

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading approvals…</p>
          ) : items.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.checkCircle} size={28} />
              <p>No {filter === 'all' ? '' : filter} approvals found</p>
            </div>
          ) : (
            <div className="ws-hr-ops-list">
              {items.map((item) => {
                const typeIcon = TYPE_ICONS[item.type] || Icons.clipboardCheck;
                const isPending = item.status === 'pending';
                return (
                  <div key={item.id} className="ws-hr-ops-row">
                    <div className="ws-hr-avatar sm">{item.ini}</div>
                    <div className="ws-hr-ops-row-main">
                      <div className="ws-hr-ops-row-head">
                        <span className="ws-hr-action-name">{item.employee}</span>
                        <span className="chip chip-gray">{item.department}</span>
                        <span className="ws-hr-ops-type">
                          <AppIcon icon={typeIcon} size={12} />
                          {TYPE_LABELS[item.type] || item.type}
                        </span>
                      </div>
                      <div className="ws-hr-action-desc">{item.action}</div>
                      <div className="ws-hr-ops-details">{item.details}</div>
                      <div className="ws-hr-ops-meta">
                        <span>Submitted {formatDate(item.submittedAt)}</span>
                        {item.due && <span>Due: {item.due}</span>}
                        {item.resolvedAt && <span>Resolved {formatDate(item.resolvedAt)}</span>}
                      </div>
                    </div>
                    <div className="ws-hr-ops-row-actions">
                      {item.urgency === 'urgent' && <span className="chip chip-red">Urgent</span>}
                      {!isPending && (
                        <span className={`chip ${item.status === 'approved' ? 'chip-green' : 'chip-red'}`}>
                          {item.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={actingId === item.id || approvingAll}
                            onClick={() => handleAction(item.id, 'rejected')}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="ws-hr-btn-primary btn-sm"
                            disabled={actingId === item.id || approvingAll}
                            onClick={() => handleAction(item.id, 'approved')}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {item.employeeId && (
                        <Link
                          to={`/workspace/hr/employees/${item.employeeId}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Profile
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

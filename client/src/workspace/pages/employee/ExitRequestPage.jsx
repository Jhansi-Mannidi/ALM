import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { EXIT_STATUS_CHIPS } from '../../data/employeeCatalog';

const EXIT_STEPS = [
  { id: 1, label: 'Submit resignation' },
  { id: 2, label: 'HR approval' },
  { id: 3, label: 'Return assets' },
  { id: 4, label: 'Offboarding complete' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function resolveExitProgress(status, assetsSubmitted) {
  if (status === 'completed') return { current: 4, completed: true };
  if (status === 'approved') {
    return assetsSubmitted
      ? { current: 4, completed: false }
      : { current: 3, completed: false };
  }
  if (status === 'in-review' || status === 'submitted') {
    return { current: 2, completed: false };
  }
  return { current: 1, completed: false };
}

function ExitStepTracker({ status, assetsSubmitted }) {
  const { current, completed } = resolveExitProgress(status, assetsSubmitted);

  return (
    <div className="ws-hike-steps ws-exit-steps">
      {EXIT_STEPS.map((step) => {
        const done = completed || step.id < current;
        const active = !completed && step.id === current;
        return (
          <div
            key={step.id}
            className={`ws-hike-step${done ? ' done' : ''}${active ? ' active' : ''}${!done && !active ? ' ws-hike-step-locked' : ''}`}
          >
            <span className="ws-hike-step-num">{done ? '✓' : step.id}</span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ExitRequestPage() {
  const [requests, setRequests] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markingAssets, setMarkingAssets] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    reason: '',
    lastWorkingDay: '',
    noticePeriodDays: '30',
    notes: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getEmployeeExitRequests(),
      api.getEmployeePortal(),
      api.getEmployeeAssets(),
    ])
      .then(([reqs, portal, assetList]) => {
        setRequests(reqs);
        setReasons(portal.exitReasons || []);
        setAssets(assetList);
        if (portal.exitReasons?.length && !form.reason) {
          setForm((f) => ({ ...f, reason: portal.exitReasons[0] }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activeRequest = requests.find(
    (r) => !['completed', 'withdrawn'].includes(r.status),
  );

  const canSubmitAssets = activeRequest?.status === 'approved' && !activeRequest?.assetsSubmitted;
  const awaitingHrApproval = ['submitted', 'in-review'].includes(activeRequest?.status);
  const assetsSubmittedAwaitingHr =
    activeRequest?.status === 'approved' && activeRequest?.assetsSubmitted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason || !form.lastWorkingDay) {
      setError('Reason and last working day are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createEmployeeExitRequest(form);
      load();
    } catch (err) {
      setError(err.message || 'Failed to submit exit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAssetsReturned = async () => {
    if (!activeRequest || !canSubmitAssets) return;
    setMarkingAssets(true);
    setError('');
    try {
      await api.updateEmployeeExitRequest(activeRequest.id, {
        assetsSubmitted: true,
        assetsReturnedCount: assets.length,
      });
      load();
    } catch (err) {
      setError(err.message || 'Failed to submit asset return');
    } finally {
      setMarkingAssets(false);
    }
  };

  if (loading) {
    return (
      <div className="ws-hr-page ws-emp-portal-page">
        <p className="ws-page-subtitle">Loading…</p>
      </div>
    );
  }

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Exit &amp; resignation</h1>
          <p className="ws-page-subtitle">
            Submit your resignation request and complete asset return after HR approval
          </p>
        </div>
      </div>

      {activeRequest ? (
        <>
          <ExitStepTracker
            status={activeRequest.status}
            assetsSubmitted={activeRequest.assetsSubmitted}
          />

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Your exit request — {activeRequest.ticketNo}</h2>
              <span className={`chip ${EXIT_STATUS_CHIPS[activeRequest.status] || 'chip-gray'}`}>
                {activeRequest.status.replace('-', ' ')}
              </span>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-grid-2">
                <div>
                  <Detail label="Reason" value={activeRequest.reason} />
                  <Detail label="Last working day" value={formatDate(activeRequest.lastWorkingDay)} />
                  <Detail label="Notice period" value={`${activeRequest.noticePeriodDays} days`} />
                  <Detail label="Submitted" value={formatDate(activeRequest.submittedAt)} />
                </div>
                <div>
                  <Detail label="Assigned assets" value={String(activeRequest.assignedAssetsCount)} />
                  <Detail
                    label="Assets returned"
                    value={
                      activeRequest.assetsSubmitted
                        ? `Submitted — ${activeRequest.assetsReturnedCount} of ${activeRequest.assignedAssetsCount}`
                        : activeRequest.status === 'approved'
                          ? 'Pending your submission'
                          : 'After HR approval'
                    }
                  />
                  {activeRequest.approvedAt && (
                    <Detail label="Approved on" value={formatDate(activeRequest.approvedAt)} />
                  )}
                </div>
              </div>

              {activeRequest.notes && (
                <p className="ws-hr-ops-reason-text mt12">{activeRequest.notes}</p>
              )}

              {awaitingHrApproval && (
                <div className="ws-hr-ops-summary mt16">
                  <AppIcon icon={Icons.clock} size={14} />
                  <span>
                    Your resignation is under HR review. Once approved, you can proceed with
                    returning company assets.
                  </span>
                </div>
              )}

              {canSubmitAssets && (
                <div className="card ws-exit-asset-card mt16">
                  <div className="ws-exit-asset-card-head">
                    <AppIcon icon={Icons.monitor} size={18} />
                    <div>
                      <h3 className="ws-exit-asset-card-title">Step 3 — Return company assets</h3>
                      <p className="ws-page-subtitle">
                        Your resignation has been accepted. Please return all assigned assets before
                        your last working day ({formatDate(activeRequest.lastWorkingDay)}).
                      </p>
                    </div>
                  </div>

                  {assets.length > 0 ? (
                    <ul className="ws-exit-asset-list">
                      {assets.map((asset) => (
                        <li key={asset.id} className="ws-exit-asset-item">
                          <AppIcon icon={Icons.monitor} size={14} />
                          <span className="ws-exit-asset-name">{asset.name}</span>
                          <span className="chip chip-gray">{asset.category || asset.type}</span>
                          {asset.serial && (
                            <span className="ws-exit-asset-serial">S/N {asset.serial}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ws-page-subtitle">No assigned assets on record.</p>
                  )}

                  <div className="ws-exit-asset-card-actions">
                    <Link to="/workspace/employee/assets" className="btn btn-ghost btn-sm">
                      View asset details
                    </Link>
                    <button
                      type="button"
                      className="ws-hr-btn-primary"
                      disabled={markingAssets}
                      onClick={handleMarkAssetsReturned}
                    >
                      {markingAssets ? 'Submitting…' : 'Submit asset return'}
                    </button>
                  </div>
                </div>
              )}

              {assetsSubmittedAwaitingHr && (
                <div
                  className="ws-hr-ops-summary mt16"
                  style={{ background: 'var(--green-l, #ecfdf5)', borderColor: 'var(--green)' }}
                >
                  <AppIcon icon={Icons.checkCircle} size={14} />
                  <span>
                    Asset return submitted on {formatDate(activeRequest.assetsSubmittedAt)}. HR will
                    verify and complete your offboarding.
                  </span>
                </div>
              )}

              {activeRequest.status === 'completed' && (
                <div className="ws-hr-ops-summary mt16">
                  <AppIcon icon={Icons.checkCircle} size={14} />
                  <span>Your offboarding is complete. Thank you for your contributions.</span>
                </div>
              )}

              {error && <div className="ws-emp-form-error mt12">{error}</div>}
            </div>
          </div>
        </>
      ) : (
        <div className="card ws-hr-panel ws-emp-ticket-form-card">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Raise exit request</h2>
          </div>
          <form onSubmit={handleSubmit} className="ws-hr-panel-body">
            <p className="ws-page-subtitle mb12">
              Your request will be sent to HR for review. After approval, you will return company
              assets as the next step before offboarding is completed.
            </p>
            <div className="ws-emp-form-grid">
              <div className="fl">
                <label>Reason for leaving *</label>
                <select
                  className="fi"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="fl">
                <label>Last working day *</label>
                <input
                  className="fi"
                  type="date"
                  value={form.lastWorkingDay}
                  onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })}
                  required
                />
              </div>
              <div className="fl">
                <label>Notice period (days)</label>
                <input
                  className="fi"
                  type="number"
                  min="0"
                  value={form.noticePeriodDays}
                  onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
                />
              </div>
              <div className="fl ws-emp-form-field full">
                <label>Additional notes</label>
                <textarea
                  className="fi"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional message for HR"
                />
              </div>
            </div>
            {error && <div className="ws-emp-form-error mt12">{error}</div>}
            <button type="submit" className="ws-hr-btn-primary mt16" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit exit request'}
            </button>
          </form>
        </div>
      )}

      {requests.length > 1 && (
        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Previous requests</h2>
          </div>
          <div className="ws-hr-panel-body ws-hr-ops-list">
            {requests
              .filter((r) => r.id !== activeRequest?.id)
              .map((r) => (
                <div key={r.id} className="ws-hr-ops-row">
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{r.ticketNo}</span>
                      <span className={`chip ${EXIT_STATUS_CHIPS[r.status] || 'chip-gray'}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="ws-hr-action-desc">{r.reason}</div>
                    <div className="ws-hr-ops-meta">
                      <span>Last day {formatDate(r.lastWorkingDay)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="ws-cand-detail-row">
      <span className="ws-cand-detail-label">{label}</span>
      <span className="ws-cand-detail-value">{value}</span>
    </div>
  );
}

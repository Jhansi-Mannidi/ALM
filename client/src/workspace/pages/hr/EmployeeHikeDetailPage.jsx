import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { EmployeeAvatar } from './EmployeeModals';

function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function computeProposed(currentSalary, hikePercent) {
  const pct = Number(hikePercent);
  if (Number.isNaN(pct)) return 0;
  return Math.round(currentSalary * (1 + pct / 100));
}

const STEPS = [
  { id: 1, label: 'Performance review' },
  { id: 2, label: 'Notify managers' },
  { id: 3, label: 'Assign hike %' },
];

export default function EmployeeHikeDetailPage() {
  const { employeeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingHike, setSavingHike] = useState(false);
  const [actingHike, setActingHike] = useState(false);
  const [hikePercent, setHikePercent] = useState('10');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [sendMessage, setSendMessage] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getHrHikeReview(employeeId)
      .then((review) => {
        setData(review);
        if (review.hike) {
          setHikePercent(String(review.hike.hikePercent));
          setReason(review.hike.reason || '');
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [employeeId]);

  const stage = data?.workflow?.stage || 'not-started';
  const performanceSent = Boolean(data?.workflow?.performanceSentAt);
  const hasHike = Boolean(data?.hike);
  const currentStep = hasHike ? 3 : performanceSent ? 3 : 1;

  const proposedSalary = useMemo(
    () => computeProposed(data?.finance?.annualSalary, hikePercent),
    [data?.finance?.annualSalary, hikePercent],
  );

  const handleSendPerformance = async () => {
    setSending(true);
    setError('');
    setSendMessage('');
    try {
      const res = await api.sendHrHikePerformance(employeeId);
      setSendMessage(res.message);
      load();
    } catch (err) {
      setError(err.message || 'Failed to send performance review');
    } finally {
      setSending(false);
    }
  };

  const handleAssignHike = async (e) => {
    e.preventDefault();
    const pct = Number(hikePercent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setError('Enter a valid hike percentage between 0 and 100');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    setSavingHike(true);
    setError('');
    try {
      if (data.hike) {
        await api.updateHrHike(data.hike.id, { hikePercent: pct, reason: reason.trim() });
      } else {
        await api.createHrHike({ employeeId, hikePercent: pct, reason: reason.trim() });
      }
      load();
    } catch (err) {
      setError(err.message || 'Failed to save hike');
    } finally {
      setSavingHike(false);
    }
  };

  const handleHikeAction = async (status) => {
    if (!data?.hike) return;
    setActingHike(true);
    try {
      await api.updateHrHike(data.hike.id, { status });
      load();
    } catch {
      /* ignore */
    } finally {
      setActingHike(false);
    }
  };

  if (loading) {
    return (
      <div className="ws-hr-page">
        <p className="ws-page-subtitle">Loading hike review…</p>
      </div>
    );
  }

  if (!data?.employee) {
    return (
      <div className="ws-hr-page">
        <Link to="/workspace/hr/hikes" className="ws-back-link">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to employee hike
        </Link>
        <p>Employee not found.</p>
      </div>
    );
  }

  const { employee, performance, managers, workflow, hike } = data;
  const perf = performance;

  return (
    <div className="ws-hr-page ws-hike-detail-page">
      <Link to="/workspace/hr/hikes" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to employee hike
      </Link>

      <div className="card ws-emp-profile-hero">
        <div className="ws-emp-profile-hero-inner">
          <EmployeeAvatar employee={employee} className="lg" />
          <div className="fx1">
            <h1 className="ws-page-title">{employee.name}</h1>
            <p className="ws-page-subtitle">{employee.role} · {employee.department}</p>
            <div className="ws-emp-detail-badges mt8">
              <span className="chip chip-gray">{employee.employeeId}</span>
              <span className="chip chip-gray">Current CTC {formatINR(data.finance?.annualSalary)}</span>
              <span className="chip chip-gray">{workflow.cycle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-hike-steps">
        {STEPS.map((step) => {
          const done =
            step.id < currentStep ||
            (step.id === 1) ||
            (step.id === 2 && performanceSent) ||
            (step.id === 3 && hasHike);
          const active = step.id === currentStep && !hasHike ? true : step.id === 3 && hasHike && hike?.status === 'pending';
          return (
            <div
              key={step.id}
              className={`ws-hike-step${done ? ' done' : ''}${active ? ' active' : ''}`}
            >
              <span className="ws-hike-step-num">
                {done && step.id < currentStep ? (
                  <AppIcon icon={Icons.check} size={12} />
                ) : (
                  step.id
                )}
              </span>
              <span className="ws-hike-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Performance */}
      <section className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Step 1 — Performance review</h2>
        </div>
        <div className="ws-hr-panel-body ws-emp-profile-content">
          {perf && (
            <>
              <div className="ws-hr-grid-2">
                <div className="ws-perf-rating-summary">
                  <div className="ws-perf-rating-main">
                    <span className="ws-perf-rating-value">{perf.overallRating}</span>
                    <span className="ws-perf-rating-of">/ 5</span>
                  </div>
                  <span className="chip chip-blue">{perf.ratingLabel}</span>
                </div>
                <div className="ws-hr-ops-meta" style={{ alignSelf: 'center' }}>
                  <span>Reviewer: {perf.reviewer}</span>
                  <span>Last review {formatDate(perf.lastReviewDate)}</span>
                </div>
              </div>

              <div className="ws-hr-table-wrap mt16">
                <table className="ws-hr-table ws-perf-kpi-table">
                  <thead>
                    <tr>
                      <th>KPI</th>
                      <th>Score</th>
                      <th>Target</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perf.kpis?.map((kpi) => (
                      <tr key={kpi.id}>
                        <td>{kpi.label}</td>
                        <td>{kpi.score}</td>
                        <td>{kpi.target}</td>
                        <td>
                          <span className={`chip ${kpi.score >= kpi.target ? 'chip-green' : 'chip-gray'}`}>
                            {kpi.score >= kpi.target ? 'Above target' : 'In progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ws-perf-goals-list mt16">
                {perf.goals?.map((goal) => (
                  <div key={goal.id} className="ws-perf-goal-row">
                    <div className="ws-perf-goal-row-head">
                      <span className="ws-perf-goal-row-title">{goal.title}</span>
                      <span className={`chip ${goal.status === 'Completed' ? 'chip-green' : 'chip-blue'}`}>
                        {goal.status}
                      </span>
                    </div>
                    <div className="ws-perf-goal-progress">
                      <div className="ws-hr-progress-bar">
                        <div
                          className={`ws-hr-progress-fill${goal.status === 'Completed' ? ' complete' : ''}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="ws-perf-goal-pct">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ws-perf-reviews-list mt16">
                {perf.reviews?.map((review) => (
                  <article key={review.id} className="ws-perf-review-entry">
                    <div className="ws-perf-review-entry-head">
                      <div>
                        <div className="ws-perf-review-period">{review.period}</div>
                        <div className="ws-perf-review-meta">
                          {formatDate(review.date)} · {review.reviewer}
                        </div>
                      </div>
                      <span className="ws-perf-review-score">{review.rating} / 5</span>
                    </div>
                    <p className="ws-perf-review-summary">{review.summary}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Step 2: Send to managers */}
      <section className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Step 2 — Send to managers</h2>
        </div>
        <div className="ws-hr-panel-body">
          <p className="ws-page-subtitle mb12">
            Share this performance summary with the employee&apos;s reporting manager and higher manager for hike consideration.
          </p>

          <div className="ws-hike-manager-grid">
            <div className="ws-hike-manager-card">
              <span className="ws-hike-edit-label">Reporting manager</span>
              {managers.manager ? (
                <>
                  <div className="ws-hr-action-name">{managers.manager.name}</div>
                  <div className="ws-hr-action-desc">{managers.manager.role}</div>
                  <div className="ws-hr-action-desc">{managers.manager.email}</div>
                </>
              ) : (
                <p className="ws-hr-action-desc">No manager assigned</p>
              )}
            </div>
            <div className="ws-hike-manager-card">
              <span className="ws-hike-edit-label">Higher manager</span>
              {managers.higherManager ? (
                <>
                  <div className="ws-hr-action-name">{managers.higherManager.name}</div>
                  <div className="ws-hr-action-desc">{managers.higherManager.role}</div>
                  <div className="ws-hr-action-desc">{managers.higherManager.email}</div>
                </>
              ) : (
                <p className="ws-hr-action-desc">No higher manager in hierarchy</p>
              )}
            </div>
          </div>

          {performanceSent ? (
            <div className="ws-hr-ops-summary mt16" style={{ background: 'var(--green-l, #ecfdf5)', borderColor: 'var(--green, #059669)' }}>
              <AppIcon icon={Icons.checkCircle} size={14} />
              <span>
                Performance sent on {formatDate(workflow.performanceSentAt)} to{' '}
                {workflow.sentTo?.manager?.name}
                {workflow.sentTo?.higherManager ? ` and ${workflow.sentTo.higherManager.name}` : ''}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="ws-hr-btn-primary mt16"
              disabled={sending || !managers.manager}
              onClick={handleSendPerformance}
            >
              <AppIcon icon={Icons.send} size={14} />
              {sending ? 'Sending…' : 'Send performance to managers'}
            </button>
          )}

          {sendMessage && !performanceSent && (
            <p className="ws-emp-field-hint mt8">{sendMessage}</p>
          )}
        </div>
      </section>

      {/* Step 3: Assign hike */}
      <section className={`card ws-hr-panel${!performanceSent && !hasHike ? ' ws-hike-step-locked' : ''}`}>
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Step 3 — Assign hike percentage</h2>
          {!performanceSent && !hasHike && (
            <span className="chip chip-gray">Complete step 2 first</span>
          )}
        </div>
        <div className="ws-hr-panel-body">
          {!performanceSent && !hasHike ? (
            <p className="ws-page-subtitle">
              Send the performance review to managers before you can assign a hike percentage.
            </p>
          ) : (
            <form onSubmit={handleAssignHike}>
              <div className="ws-hike-edit-summary">
                <div>
                  <span className="ws-hike-edit-label">Current CTC</span>
                  <span className="ws-hike-edit-value">{formatINR(data.finance?.annualSalary)}</span>
                </div>
                <div>
                  <span className="ws-hike-edit-label">Proposed CTC</span>
                  <span className="ws-hike-edit-value ws-hr-hike-proposed">{formatINR(proposedSalary)}</span>
                </div>
                <div>
                  <span className="ws-hike-edit-label">Increase</span>
                  <span className="ws-hike-edit-value">
                    {formatINR(proposedSalary - (data.finance?.annualSalary || 0))}
                  </span>
                </div>
              </div>

              <div className="ws-emp-form-grid mt16">
                <div className="fl">
                  <label>Hike percentage *</label>
                  <div className="ws-hike-percent-input">
                    <input
                      className="fi"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={hikePercent}
                      onChange={(e) => setHikePercent(e.target.value)}
                      required
                      disabled={hike?.status === 'approved'}
                    />
                    <span className="ws-hike-percent-suffix">%</span>
                  </div>
                </div>
                <div className="fl ws-emp-form-field full">
                  <label>Reason *</label>
                  <textarea
                    className="fi"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Justification for the proposed hike"
                    required
                    disabled={hike?.status === 'approved'}
                  />
                </div>
              </div>

              {error && <div className="ws-emp-form-error mt12">{error}</div>}

              <div className="ws-hike-detail-actions mt16">
                {hike?.status !== 'approved' && (
                  <button type="submit" className="ws-hr-btn-primary" disabled={savingHike}>
                    {savingHike ? 'Saving…' : hike ? 'Update hike proposal' : 'Propose hike'}
                  </button>
                )}
                {hike?.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={actingHike}
                      onClick={() => handleHikeAction('rejected')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="ws-hr-btn-primary"
                      disabled={actingHike}
                      onClick={() => handleHikeAction('approved')}
                    >
                      Approve hike
                    </button>
                  </>
                )}
                {hike?.status === 'approved' && (
                  <span className="chip chip-green">Hike approved</span>
                )}
                {hike?.status === 'rejected' && (
                  <span className="chip chip-red">Hike rejected</span>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

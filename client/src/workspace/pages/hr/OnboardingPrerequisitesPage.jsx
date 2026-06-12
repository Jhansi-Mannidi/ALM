import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const STATUS_CHIP = {
  ready: 'chip-green',
  'in-progress': 'chip-amber',
  pending: 'chip-gray',
};

export default function OnboardingPrerequisitesPage() {
  const { hireId } = useParams();
  const navigate = useNavigate();
  const [hire, setHire] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHire = () =>
    api.getHrOnboardingHire(hireId).then(setHire).catch(() => setHire(null));

  useEffect(() => {
    setLoading(true);
    loadHire().finally(() => setLoading(false));
  }, [hireId]);

  useEffect(() => {
    if (hire?.status === 'in-progress') {
      navigate(`/workspace/hr/onboarding/${hireId}/checklist`, { replace: true });
    }
  }, [hire, hireId, navigate]);

  const toggleTask = async (taskId, done) => {
    try {
      const updated = await api.updateHrOnboardingHire(hireId, { taskId, done });
      setHire(updated);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="ws-hr-page">
        <p className="ws-page-subtitle">Loading pre-requisites…</p>
      </div>
    );
  }

  if (!hire) {
    return (
      <div className="ws-hr-page">
        <Link to="/workspace/hr/onboarding" className="ws-back-link mb16">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to Onboarding
        </Link>
        <p>Onboarding record not found.</p>
      </div>
    );
  }

  const prereq = hire.prerequisites;
  const tasks = hire.tasks || [];
  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  return (
    <div className="ws-hr-page ws-onb-prereq-page">
      <Link to="/workspace/hr/onboarding" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Onboarding
      </Link>

      <header className="card ws-onb-prereq-header">
        <div className="ws-onb-prereq-header-row">
          <div className="ws-hr-avatar lg">{hire.ini}</div>
          <div className="ws-onb-prereq-header-copy">
            <p className="ws-onb-prereq-kicker">HR Pre-requisites · Before joining</p>
            <h1 className="ws-onb-prereq-name">{hire.name}</h1>
            <p className="ws-onb-prereq-meta">
              {hire.role} · Joins {formatDate(hire.joiningDate)}
            </p>
          </div>
          <div className="ws-onb-prereq-header-status">
            <span className={`chip ${STATUS_CHIP[prereq?.status] || 'chip-gray'}`}>
              {prereq?.label || 'Pending'}
            </span>
            <span className="ws-onb-prereq-header-count">
              {prereq?.completed ?? 0} of {prereq?.total ?? tasks.length} complete
            </span>
          </div>
        </div>
        {prereq?.ready ? (
          <p className="ws-onb-prereq-note ready">
            <AppIcon icon={Icons.checkCircle} size={14} />
            Ready to join on {formatDate(hire.joiningDate)} — all HR tasks are complete.
          </p>
        ) : (
          <p className="ws-onb-prereq-note">
            {pending.length} task{pending.length !== 1 ? 's' : ''} remaining before join date.
          </p>
        )}
      </header>

      <div className="ws-onb-prereq-details-grid">
        <section className="card ws-emp-detail-section ws-onb-detail-card">
          <h2 className="ws-emp-detail-section-title">Joining Details</h2>
          <div className="ws-onb-detail-rows">
            <DetailRow icon={Icons.calendarDays} label="Joining Date" value={formatDate(hire.joiningDate)} />
            <DetailRow icon={Icons.mapPin} label="Location" value={hire.location || '—'} />
            <DetailRow label="Department" value={hire.department} />
            <DetailRow label="Reporting To" value={hire.reportingTo || '—'} />
          </div>
        </section>
        <section className="card ws-emp-detail-section ws-onb-detail-card">
          <h2 className="ws-emp-detail-section-title">HR Summary</h2>
          <div className="ws-onb-detail-rows">
            <DetailRow label="Completed" value={`${completed.length} tasks`} />
            <DetailRow label="Pending" value={`${pending.length} tasks`} />
            <DetailRow icon={Icons.mail} label="Email" value={hire.email || '—'} />
            <DetailRow icon={Icons.phone} label="Phone" value={hire.phone || '—'} />
          </div>
        </section>
      </div>

      <section className="card ws-emp-detail-section ws-onb-prereq-checklist-card">
        <div className="ws-onb-prereq-checklist-head">
          <div>
            <h2 className="ws-emp-detail-section-title">HR Pre-requisite Checklist</h2>
            <p className="ws-emp-field-hint">
              Mark each item when completed by HR. All tasks must be done before the employee joins.
            </p>
          </div>
        </div>
        <ul className="ws-onb-prereq-checklist">
          {tasks.map((task) => (
            <li key={task.id} className={`ws-onb-prereq-checklist-item${task.done ? ' done' : ''}`}>
              <label className="ws-onb-prereq-checklist-label">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={(e) => toggleTask(task.id, e.target.checked)}
                />
                <span className="ws-onb-prereq-checklist-check">
                  <AppIcon icon={task.done ? Icons.checkCircle : Icons.circle} size={16} />
                </span>
                <span className="ws-onb-prereq-checklist-body">
                  <span className="ws-onb-prereq-checklist-title">
                    {task.label}
                    <span className="chip chip-gray">{task.owner || 'HR'}</span>
                  </span>
                  {task.description && (
                    <span className="ws-onb-prereq-checklist-desc">{task.description}</span>
                  )}
                </span>
              </label>
              <span className={`chip ws-onb-checklist-status ${task.done ? 'chip-green' : 'chip-amber'}`}>
                {task.done ? 'Done' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {hire.notes && (
        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">HR Notes</h2>
          <p className="ws-emp-detail-bio">{hire.notes}</p>
        </section>
      )}

      <div className="ws-onb-page-actions">
        <Link to={`/workspace/hr/onboarding/${hireId}`} className="btn btn-ghost">View Full Profile</Link>
        <Link to="/workspace/hr/onboarding" className="ws-hr-btn-primary">Back to Onboarding</Link>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="ws-emp-detail-row ws-onb-detail-row">
      <span className="ws-emp-detail-label">
        <span className="ws-onb-detail-icon-slot" aria-hidden={!icon}>
          {icon ? <AppIcon icon={icon} size={14} /> : null}
        </span>
        <span>{label}</span>
      </span>
      <span className="ws-emp-detail-value">{value}</span>
    </div>
  );
}

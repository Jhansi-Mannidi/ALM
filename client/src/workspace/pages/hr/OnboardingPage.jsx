import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PREREQ_CHIP = {
  ready: 'chip-green',
  'in-progress': 'chip-amber',
  pending: 'chip-gray',
};

function PrerequisiteSummary({ hire }) {
  const tasks = hire.tasks || [];
  const prereq = hire.prerequisites;
  const pending = tasks.filter((t) => !t.done);

  if (prereq?.ready) {
    return (
      <div className="ws-onb-prereq-status ready">
        <AppIcon icon={Icons.checkCircle} size={14} />
        <span>All HR pre-requisites complete — ready to join</span>
      </div>
    );
  }

  return (
    <div className="ws-onb-prereq-status">
      <div className="ws-onb-prereq-status-head">
        <span className="ws-onb-prereq-status-label">Pending before join</span>
        <span className="ws-onb-prereq-status-count">
          {prereq?.completed}/{prereq?.total} complete
        </span>
      </div>
      {pending.length > 0 && (
        <ul className="ws-onb-prereq-pending">
          {pending.slice(0, 3).map((task) => (
            <li key={task.id}>{task.label}</li>
          ))}
          {pending.length > 3 && (
            <li className="ws-onb-prereq-more">+{pending.length - 3} more tasks</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [hires, setHires] = useState([]);

  useEffect(() => {
    api.getHrOnboarding().then(setHires).catch(() => {});
  }, []);

  const upcoming = hires.filter((h) => h.status === 'upcoming');
  const inProgress = hires.filter((h) => h.status === 'in-progress');
  const readyCount = upcoming.filter((h) => h.prerequisites?.ready).length;

  return (
    <div className="ws-hr-page ws-onb-list-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Onboarding</h1>
          <p className="ws-page-subtitle">Manage new hire onboarding process</p>
        </div>
        <button type="button" className="ws-hr-btn-primary" onClick={() => navigate('/workspace/hr/onboarding/new')}>
          <AppIcon icon={Icons.plus} size={14} />
          Add New Hire
        </button>
      </div>

      {upcoming.length > 0 && (
        <div className="ws-onb-overview-bar">
          <span><strong>{upcoming.length}</strong> upcoming joiners</span>
          <span className="ws-onb-overview-sep">·</span>
          <span><strong>{readyCount}</strong> ready to join</span>
          <span className="ws-onb-overview-sep">·</span>
          <span><strong>{upcoming.length - readyCount}</strong> with pending HR tasks</span>
        </div>
      )}

      <section className="ws-hr-section">
        <h2 className="ws-hr-section-title">Upcoming Joiners</h2>
        <div className="ws-hr-onboard-grid">
          {upcoming.map((h) => (
            <div key={h.id} className="card ws-hr-onboard-card">
              <div className="ws-hr-onboard-head">
                <div className="ws-hr-avatar lg">{h.ini}</div>
                <div className="fx1 min0">
                  <h3 className="ws-hr-onboard-name">{h.name}</h3>
                  <p className="ws-hr-onboard-role">{h.role}</p>
                </div>
                <span className={`chip ${PREREQ_CHIP[h.prerequisites?.status] || 'chip-gray'}`}>
                  {h.prerequisites?.ready ? 'Ready' : h.prerequisites?.label}
                </span>
              </div>

              <div className="ws-hr-onboard-details ws-hr-onboard-details-3">
                <div className="ws-hr-detail">
                  <span className="ws-hr-detail-label">Joining Date</span>
                  <span>{formatDate(h.joiningDate)}</span>
                </div>
                <div className="ws-hr-detail">
                  <span className="ws-hr-detail-label">Department</span>
                  <span>{h.department}</span>
                </div>
                <div className="ws-hr-detail">
                  <span className="ws-hr-detail-label">Reporting To</span>
                  <span>{h.reportingTo}</span>
                </div>
              </div>

              <PrerequisiteSummary hire={h} />

              <div className="ws-hr-onboard-actions">
                <button
                  type="button"
                  className="ws-hr-btn-primary"
                  onClick={() => navigate(`/workspace/hr/onboarding/${h.id}/prerequisites`)}
                >
                  Manage Pre-requisites
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/workspace/hr/onboarding/${h.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ws-hr-section">
        <h2 className="ws-hr-section-title">In Onboarding</h2>
        {inProgress.map((h) => (
          <div key={h.id} className="card ws-hr-onboard-card full">
            <div className="ws-hr-onboard-head">
              <div className="ws-hr-avatar lg">{h.ini}</div>
              <div className="fx1 min0">
                <h3 className="ws-hr-onboard-name">{h.name}</h3>
                <p className="ws-hr-onboard-role">{h.role}</p>
              </div>
              <span className="chip chip-purple">In Progress</span>
            </div>
            <div className="ws-hr-onboard-details row">
              <div className="ws-hr-detail">
                <span className="ws-hr-detail-label">Joined Date</span>
                <span>{formatDate(h.joinedDate)}</span>
              </div>
              <div className="ws-hr-detail">
                <span className="ws-hr-detail-label">Probation Remaining</span>
                <span>{h.probationDaysRemaining} days</span>
              </div>
              <div className="ws-hr-detail">
                <span className="ws-hr-detail-label">Onboarding Buddy</span>
                <span>{h.onboardingBuddy}</span>
              </div>
              <div className="ws-hr-detail">
                <span className="ws-hr-detail-label">Onboarding Progress</span>
                <span>{h.progress}% complete</span>
              </div>
            </div>
            <div className="ws-hr-onboard-actions">
              <button type="button" className="ws-hr-btn-primary" onClick={() => navigate(`/workspace/hr/onboarding/${h.id}/checklist`)}>
                View Checklist
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/workspace/hr/onboarding/${h.id}/checklist`)}>
                Send Feedback
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

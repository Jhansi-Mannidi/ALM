import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OnboardingChecklistPage() {
  const { hireId } = useParams();
  const [hire, setHire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const loadHire = () =>
    api.getHrOnboardingHire(hireId).then(setHire).catch(() => setHire(null));

  useEffect(() => {
    setLoading(true);
    loadHire().finally(() => setLoading(false));
  }, [hireId]);

  const toggleItem = async (checklistId, done) => {
    try {
      const updated = await api.updateHrOnboardingHire(hireId, { checklistId, done });
      setHire(updated);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="ws-hr-page">
        <p className="ws-page-subtitle">Loading checklist…</p>
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

  const checklist = hire.checklist || [];
  const completed = checklist.filter((c) => c.done).length;
  const progress = hire.progress ?? Math.round((completed / Math.max(checklist.length, 1)) * 100);

  return (
    <div className="ws-hr-page ws-onb-page">
      <Link to="/workspace/hr/onboarding" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Onboarding
      </Link>

      <div className="card ws-onb-detail-hero">
        <div className="ws-onb-detail-hero-inner">
          <div className="ws-hr-avatar xl">{hire.ini}</div>
          <div className="fx1">
            <h1 className="ws-page-title">{hire.name}</h1>
            <p className="ws-page-subtitle">{hire.role}</p>
            <div className="ws-emp-detail-badges mt8">
              <span className="chip chip-purple">In Progress</span>
              <span className="chip chip-gray">{hire.department}</span>
            </div>
          </div>
          <div className="ws-onb-detail-stat">
            <span className="ws-onb-detail-stat-label">Progress</span>
            <span className="ws-onb-detail-stat-value">{progress}%</span>
          </div>
        </div>
        <div className="ws-onb-progress-compact">
          <div className="ws-hr-progress-bar">
            <div className="ws-hr-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="ws-onb-progress-text">{completed} of {checklist.length} tasks completed</span>
        </div>
      </div>

      <div className="ws-hr-grid-2 mt16">
        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Employment</h2>
          <DetailRow label="Joined Date" value={formatDate(hire.joinedDate)} />
          <DetailRow label="Probation Remaining" value={hire.probationDaysRemaining != null ? `${hire.probationDaysRemaining} days` : '—'} />
          <DetailRow label="Reporting To" value={hire.reportingTo || '—'} />
        </section>
        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Support</h2>
          <DetailRow label="Onboarding Buddy" value={hire.onboardingBuddy || '—'} />
          <DetailRow icon={Icons.mail} label="Email" value={hire.email || '—'} />
          <DetailRow icon={Icons.phone} label="Phone" value={hire.phone || '—'} />
        </section>
      </div>

      <section className="card ws-emp-detail-section mt16">
        <h2 className="ws-emp-detail-section-title">Onboarding Checklist</h2>
        <ul className="ws-onb-checklist">
          {checklist.map((item) => (
            <li key={item.id} className={`ws-onb-checklist-item${item.done ? ' done' : ''}`}>
              <label className="ws-onb-check-label">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => toggleItem(item.id, e.target.checked)}
                />
                <span>{item.label}</span>
              </label>
              {item.done && <span className="chip chip-green">Done</span>}
            </li>
          ))}
        </ul>
      </section>

      {hire.notes && (
        <section className="card ws-emp-detail-section mt16">
          <h2 className="ws-emp-detail-section-title">Notes</h2>
          <p className="ws-emp-detail-bio">{hire.notes}</p>
        </section>
      )}

      <div className="ws-onb-page-actions">
        <button
          type="button"
          className="ws-hr-btn-primary"
          onClick={() => {
            setFeedbackSent(true);
            setTimeout(() => setFeedbackSent(false), 3000);
          }}
        >
          <AppIcon icon={Icons.send} size={14} />
          {feedbackSent ? 'Feedback Request Sent' : 'Send Feedback'}
        </button>
        <Link to="/workspace/hr/onboarding" className="btn btn-ghost">Back to Onboarding</Link>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="ws-emp-detail-row">
      <span className="ws-emp-detail-label">
        {icon && <AppIcon icon={icon} size={14} />}
        {label}
      </span>
      <span className="ws-emp-detail-value">{value}</span>
    </div>
  );
}

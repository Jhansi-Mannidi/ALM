import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OnboardingDetailPage() {
  const { hireId } = useParams();
  const navigate = useNavigate();
  const [hire, setHire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

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

  if (loading) {
    return (
      <div className="ws-hr-page">
        <p className="ws-page-subtitle">Loading hire details…</p>
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
              <span className="ws-emp-status ws-emp-status-active">Upcoming Joiner</span>
              <span className="chip chip-gray">{hire.department}</span>
            </div>
          </div>
          <div className="ws-onb-detail-stat">
            <span className="ws-onb-detail-stat-label">HR Pre-requisites</span>
            <span className="ws-onb-detail-stat-value">{prereq?.completed ?? 0}/{prereq?.total ?? tasks.length}</span>
          </div>
        </div>
      </div>

      <div className="ws-hr-grid-2 mt16">
        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Joining Information</h2>
          <DetailRow icon={Icons.calendarDays} label="Joining Date" value={formatDate(hire.joiningDate)} />
          <DetailRow icon={Icons.mapPin} label="Location" value={hire.location || '—'} />
          <DetailRow label="Department" value={hire.department} />
          <DetailRow label="Reporting To" value={hire.reportingTo || '—'} />
          {hire.onboardingBuddy && (
            <DetailRow label="Onboarding Buddy" value={hire.onboardingBuddy} />
          )}
        </section>

        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Contact</h2>
          <DetailRow icon={Icons.mail} label="Email" value={hire.email || '—'} />
          <DetailRow icon={Icons.phone} label="Phone" value={hire.phone || '—'} />
        </section>
      </div>

      {hire.notes && (
        <section className="card ws-emp-detail-section mt16">
          <h2 className="ws-emp-detail-section-title">Notes</h2>
          <p className="ws-emp-detail-bio">{hire.notes}</p>
        </section>
      )}

      <section className="card ws-emp-detail-section mt16">
        <div className="ws-onb-prereq-preview-head mb12">
          <h2 className="ws-emp-detail-section-title" style={{ margin: 0 }}>HR Pre-requisites</h2>
          <span className={`chip ${prereq?.ready ? 'chip-green' : prereq?.status === 'in-progress' ? 'chip-amber' : 'chip-gray'}`}>
            {prereq?.label || 'Pending'}
          </span>
        </div>
        <p className="ws-emp-field-hint mb12">
          {prereq?.ready
            ? 'All HR tasks are complete. This employee is ready to join.'
            : `${prereq?.pendingTasks?.length ?? 0} task(s) still pending before join date.`}
        </p>
        <Link to={`/workspace/hr/onboarding/${hireId}/prerequisites`} className="ws-hr-btn-primary">
          Manage Pre-requisites
        </Link>
      </section>

      <div className="ws-onb-page-actions">
        <button
          type="button"
          className="ws-hr-btn-primary"
          onClick={() => {
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 3000);
          }}
        >
          <AppIcon icon={Icons.mail} size={14} />
          {emailSent ? 'Welcome Email Sent' : 'Send Welcome Email'}
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

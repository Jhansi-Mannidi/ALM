import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="ws-cand-detail-row">
      {icon && (
        <span className="ws-cand-detail-icon">
          <AppIcon icon={icon} size={14} />
        </span>
      )}
      <span className="ws-cand-detail-label">{label}</span>
      <span className="ws-cand-detail-value">{value}</span>
    </div>
  );
}

export default function MyDatesPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getEmployeeDates().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-emp-portal-page">
        <p className="ws-page-subtitle">Loading…</p>
      </div>
    );
  }

  const probStatus =
    data.probation?.status === 'active'
      ? 'On probation'
      : data.probation?.status === 'completed'
        ? 'Completed'
        : '—';

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Employment dates</h1>
          <p className="ws-page-subtitle">Your joining, tenure, and review-related dates</p>
        </div>
      </div>

      <div className="ws-hr-grid-2">
        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Employment</h2>
          </div>
          <div className="ws-hr-panel-body">
            <DetailRow icon={Icons.calendarDays} label="Date of joining" value={formatDate(data.joinedAt)} />
            <DetailRow label="Tenure" value={data.tenure || '—'} />
            <DetailRow label="Employment type" value={data.employmentType || '—'} />
          </div>
        </div>

        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Probation</h2>
          </div>
          <div className="ws-hr-panel-body">
            <DetailRow label="Status" value={probStatus} />
            <DetailRow label="Duration" value={data.probation?.durationMonths ? `${data.probation.durationMonths} months` : '—'} />
            <DetailRow label="Until" value={formatDate(data.probation?.until)} />
          </div>
        </div>

        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Performance reviews</h2>
          </div>
          <div className="ws-hr-panel-body">
            <DetailRow label="Last review" value={formatDate(data.lastReviewDate)} />
            <DetailRow label="Next review" value={formatDate(data.nextReviewDate)} />
          </div>
        </div>

        {data.bond?.applicable && (
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Bond / commitment</h2>
            </div>
            <div className="ws-hr-panel-body">
              <DetailRow label="Duration" value={`${data.bond.durationMonths} months`} />
              <DetailRow label="Until" value={formatDate(data.bond.until)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const STAGE_LABELS = {
  'not-started': { label: 'Review pending', chip: 'chip-gray' },
  'ready-for-hike': { label: 'Managers notified', chip: 'chip-blue' },
  'hike-proposed': { label: 'Hike proposed', chip: 'chip-amber' },
};

function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function EmployeeHikePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api
      .getHrHikeCandidates()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const candidates = data?.candidates || [];
  const stats = data?.stats;
  const filtered =
    filter === 'all' ? candidates : candidates.filter((c) => c.workflowStage === filter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'not-started', label: 'Review pending' },
    { id: 'ready-for-hike', label: 'Ready for hike' },
    { id: 'hike-proposed', label: 'Hike proposed' },
  ];

  return (
    <div className="ws-hr-page ws-hr-ops-page ws-hike-list-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Employee hike</h1>
          <p className="ws-page-subtitle">
            Select an employee to review performance, notify managers, then assign hike percentage
          </p>
        </div>
      </div>

      {stats && (
        <div className="ws-hr-stats ws-hr-ops-stats">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.total}</div>
            <div className="ws-hr-stat-label">Eligible employees</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.notStarted}</div>
            <div className="ws-hr-stat-label">Awaiting review</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.readyForHike}</div>
            <div className="ws-hr-stat-label">Ready for hike %</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.hikeProposed}</div>
            <div className="ws-hr-stat-label">Hike proposed</div>
          </div>
        </div>
      )}

      <div className="ws-hr-ops-filters">
        {filters.map((f) => (
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
            <p className="ws-page-subtitle">Loading employees…</p>
          ) : filtered.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.users} size={28} />
              <p>No employees match this filter</p>
            </div>
          ) : (
            <div className="ws-hike-candidate-list">
              {filtered.map((emp) => {
                const stage = STAGE_LABELS[emp.workflowStage] || STAGE_LABELS['not-started'];
                return (
                  <Link
                    key={emp.id}
                    to={`/workspace/hr/hikes/${emp.id}`}
                    className="ws-hike-candidate-row"
                  >
                    <div className="ws-hr-avatar sm">{emp.ini}</div>
                    <div className="ws-hike-candidate-main">
                      <div className="ws-hike-candidate-head">
                        <span className="ws-hr-action-name">{emp.name}</span>
                        <span className="chip chip-gray">{emp.department}</span>
                        <span className={`chip ${stage.chip}`}>{stage.label}</span>
                        {emp.hike?.status === 'approved' && (
                          <span className="chip chip-green">Approved</span>
                        )}
                      </div>
                      <div className="ws-hr-action-desc">
                        {emp.role} · {emp.location}
                      </div>
                      <div className="ws-hr-ops-meta">
                        <span>Current CTC {formatINR(emp.currentSalary)}</span>
                        {emp.manager && <span>Manager: {emp.manager.name}</span>}
                        {emp.hike && (
                          <span>Proposed +{emp.hike.hikePercent}%</span>
                        )}
                      </div>
                    </div>
                    <AppIcon icon={Icons.chevronRight} size={16} className="ws-hike-candidate-chevron" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

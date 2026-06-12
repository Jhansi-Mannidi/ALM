import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { STAGE_COLORS } from '../../data/hrCatalog';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const STATUS_CHIP = {
  open: 'chip-green',
  draft: 'chip-amber',
  closed: 'chip-gray',
};

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    Promise.all([api.getHrJob(jobId), api.getHrStages()])
      .then(([j, s]) => {
        setJob(j);
        setStages(s);
      })
      .catch(() => setJob(null));
  }, [jobId]);

  const stageLabel = (id) => stages.find((s) => s.id === id)?.label || id;

  if (!job) {
    return (
      <div className="ws-hr-page">
        <Link to="/workspace/hr/recruitment" className="ws-back-link mb16">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to Recruitment
        </Link>
        <p>Loading job opening…</p>
      </div>
    );
  }

  const activeCandidates = (job.candidates || []).filter((c) => c.stage !== 'rejected');

  return (
    <div className="ws-hr-page">
      <Link to="/workspace/hr/recruitment" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Recruitment
      </Link>

      <div className="card ws-job-detail-hero">
        <div className="ws-job-detail-hero-top">
          <div className="fx1">
            <p className="ws-job-detail-eyebrow">Job Opening</p>
            <h1 className="ws-page-title">{job.title}</h1>
            <div className="ws-hr-job-tags mt8">
              <span className="chip chip-gray">{job.department}</span>
              <span className="chip chip-blue">{job.type}</span>
              <span className="chip chip-gray">{job.location}</span>
              {job.experienceLevel && <span className="chip chip-purple">{job.experienceLevel}</span>}
              <span className={`chip ${STATUS_CHIP[job.status] || 'chip-gray'}`}>
                {job.status === 'open' ? 'Open' : job.status === 'draft' ? 'Draft' : 'Closed'}
              </span>
            </div>
          </div>
          <div className="ws-job-detail-actions">
            <button
              type="button"
              className="ws-hr-btn-primary"
              onClick={() => navigate(`/workspace/hr/recruitment/candidates?jobId=${job.id}`)}
            >
              View Candidates
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/workspace/hr/recruitment/candidates/new?jobId=${job.id}`)}
            >
              <AppIcon icon={Icons.plus} size={14} />
              Add Candidate
            </button>
          </div>
        </div>

        <div className="ws-hr-job-stats ws-job-detail-stats">
          <div className="ws-hr-job-stat">
            <span className="ws-hr-job-stat-label">Posted</span>
            <span>{formatDate(job.postedAt)}</span>
          </div>
          <div className="ws-hr-job-stat">
            <span className="ws-hr-job-stat-label">Applications</span>
            <span className="ws-hr-job-stat-value">{job.applications}</span>
          </div>
          <div className="ws-hr-job-stat">
            <span className="ws-hr-job-stat-label">Shortlisted</span>
            <span className="ws-hr-job-stat-value">{job.shortlisted}</span>
          </div>
          <div className="ws-hr-job-stat">
            <span className="ws-hr-job-stat-label">Interviews</span>
            <span className="ws-hr-job-stat-value">{job.interviews}</span>
          </div>
        </div>
      </div>

      <div className="ws-hr-grid-2 mt16">
        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Role Description</h2>
          {job.description ? (
            <p className="ws-emp-detail-bio">{job.description}</p>
          ) : (
            <p className="ws-hr-empty">No description provided.</p>
          )}
          {job.requirements && (
            <>
              <h3 className="ws-job-detail-subtitle">Requirements</h3>
              <p className="ws-emp-detail-bio">{job.requirements}</p>
            </>
          )}
        </section>

        <section className="card ws-emp-detail-section">
          <h2 className="ws-emp-detail-section-title">Posting Details</h2>
          <DetailRow label="Salary Range" value={job.salary || '—'} />
          <DetailRow label="Experience Level" value={job.experienceLevel || '—'} />
          <DetailRow label="Employment Type" value={job.type} />
          <DetailRow label="Location" value={job.location} />
          <DetailRow label="Department" value={job.department} />
          {job.hiringManager && (
            <div className="ws-job-hiring-manager mt12">
              <span className="ws-emp-detail-label">Hiring Manager</span>
              <div className="ws-hr-interviewer-item">
                <div className="ws-hr-avatar sm">{job.hiringManager.ini}</div>
                <div>
                  <div className="ws-hr-action-name">{job.hiringManager.name}</div>
                  <div className="ws-hr-action-desc">{job.hiringManager.role} · {job.hiringManager.department}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="card ws-emp-detail-section mt16">
        <div className="ws-cand-panel-head">
          <h2 className="ws-emp-detail-section-title" style={{ margin: 0 }}>Candidates ({activeCandidates.length})</h2>
          <Link to={`/workspace/hr/recruitment/candidates?jobId=${job.id}`} className="btn btn-ghost btn-sm">
            View all
          </Link>
        </div>
        {activeCandidates.length ? (
          <div className="ws-job-candidate-list">
            {activeCandidates.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/workspace/hr/recruitment/candidates/${c.id}`} className="ws-job-candidate-row">
                <div className="ws-hr-avatar sm">{c.ini}</div>
                <div className="fx1 min0">
                  <div className="ws-hr-candidate-name">{c.name}</div>
                  <div className="ws-hr-candidate-role">{c.currentRole}</div>
                </div>
                <span className={`chip ${STAGE_COLORS[c.stage] || 'chip-gray'}`}>{stageLabel(c.stage)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ws-job-empty-candidates">
            <p className="ws-hr-empty">No candidates yet for this opening.</p>
            <button
              type="button"
              className="ws-hr-btn-primary"
              onClick={() => navigate(`/workspace/hr/recruitment/candidates/new?jobId=${job.id}`)}
            >
              <AppIcon icon={Icons.plus} size={14} />
              Add First Candidate
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="ws-emp-detail-row">
      <span className="ws-emp-detail-label">{label}</span>
      <span className="ws-emp-detail-value">{value}</span>
    </div>
  );
}

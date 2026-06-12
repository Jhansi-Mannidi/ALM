import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { STAGE_COLORS } from '../../data/hrCatalog';
import { AppIcon, Icons } from '../../../components/icons';

const PIPELINE_STAGES = ['applied', 'screening', 'technical', 'culture', 'offer', 'hired'];

function formatInterviewWhen(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function CandidateCard({ candidate, stageLabel }) {
  const next = candidate.nextInterview;

  return (
    <Link to={`/workspace/hr/recruitment/candidates/${candidate.id}`} className="ws-hr-candidate-card">
      <div className="ws-hr-candidate-card-head">
        <div className="ws-hr-avatar sm">{candidate.ini}</div>
        <div className="fx1 min0">
          <div className="ws-hr-candidate-name">{candidate.name}</div>
          <div className="ws-hr-candidate-role">{candidate.currentRole}</div>
        </div>
      </div>

      <div className="ws-hr-candidate-tags">
        <span className="chip chip-gray">{candidate.experience}</span>
        <span className="chip chip-blue">{candidate.source}</span>
        {candidate.reference && (
          <span className="chip chip-purple ws-cand-ref-chip">
            <AppIcon icon={Icons.userPlus} size={11} />
            Ref: {candidate.reference}
          </span>
        )}
      </div>

      {next ? (
        <div className="ws-cand-interview-block">
          <div className="ws-cand-interview-block-head">
            <AppIcon icon={Icons.calendarDays} size={13} />
            <span className={`chip ${STAGE_COLORS[next.stage] || 'chip-gray'}`}>
              {stageLabel(next.stage)}
            </span>
          </div>
          <div className="ws-cand-interview-when">{formatInterviewWhen(next.scheduledAt)}</div>
          <div className="ws-hr-candidate-interviewers">
            <AppIcon icon={Icons.users} size={12} />
            {next.interviewers?.map((i) => i.name).join(', ')}
          </div>
          {next.location && <div className="ws-cand-interview-loc">{next.location}</div>}
        </div>
      ) : candidate.interviewers?.length > 0 ? (
        <div className="ws-hr-candidate-interviewers">
          <AppIcon icon={Icons.users} size={12} />
          {candidate.interviewers.map((i) => i.name).join(', ')}
        </div>
      ) : null}

      <div className="ws-hr-resume-link">
        <AppIcon icon={Icons.fileText} size={12} />
        {candidate.resume?.fileName}
      </div>
    </Link>
  );
}

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState([]);
  const [stages, setStages] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('pipeline');

  useEffect(() => {
    Promise.all([
      api.getHrCandidates(jobId ? { jobId } : {}),
      api.getHrStages(),
      api.getHrJobs(),
    ]).then(([c, s, j]) => {
      setCandidates(c);
      setStages(s);
      setJobs(j);
    }).catch(() => {});
  }, [jobId]);

  const stageLabel = (id) => stages.find((s) => s.id === id)?.label || id;
  const activeJob = jobs.find((j) => j.id === jobId);

  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {});

  const rejected = candidates.filter((c) => c.stage === 'rejected');
  const scheduledCount = candidates.filter((c) => c.nextInterview).length;

  return (
    <div className="ws-hr-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Candidates</h1>
          <p className="ws-page-subtitle">
            {activeJob ? `${activeJob.title} — interview pipeline` : 'All candidates across open positions'}
          </p>
        </div>
        <div className="fx g8">
          <div className="ws-filters" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`ws-filter-btn ws-filter-btn-icon${view === 'pipeline' ? ' active' : ''}`}
              aria-label="Pipeline view"
              title="Pipeline view"
              onClick={() => setView('pipeline')}
            >
              <AppIcon icon={Icons.kanban} size={14} />
            </button>
            <button
              type="button"
              className={`ws-filter-btn ws-filter-btn-icon${view === 'list' ? ' active' : ''}`}
              aria-label="List view"
              title="List view"
              onClick={() => setView('list')}
            >
              <AppIcon icon={Icons.list} size={14} />
            </button>
          </div>
          <button
            type="button"
            className="ws-hr-btn-primary"
            onClick={() => navigate(jobId ? `/workspace/hr/recruitment/candidates/new?jobId=${jobId}` : '/workspace/hr/recruitment/candidates/new')}
          >
            <AppIcon icon={Icons.plus} size={14} />
            Add Candidate
          </button>
        </div>
      </div>

      {candidates.length > 0 && (
        <div className="card ws-cand-summary-bar mb16">
          <div className="ws-cand-summary-stat">
            <span className="ws-cand-summary-val">{candidates.filter((c) => c.stage !== 'rejected').length}</span>
            <span className="ws-cand-summary-lbl">Active candidates</span>
          </div>
          <div className="ws-cand-summary-stat">
            <span className="ws-cand-summary-val">{scheduledCount}</span>
            <span className="ws-cand-summary-lbl">Interviews scheduled</span>
          </div>
          <div className="ws-cand-summary-stat">
            <span className="ws-cand-summary-val">{candidates.filter((c) => c.reference).length}</span>
            <span className="ws-cand-summary-lbl">With reference</span>
          </div>
        </div>
      )}

      {jobId && (
        <div className="ws-hr-filter-bar mb16">
          <span>Filtered by job:</span>
          <span className="chip chip-blue">{activeJob?.title}</span>
          <Link to="/workspace/hr/recruitment/candidates" className="btn btn-ghost btn-sm">Clear filter</Link>
        </div>
      )}

      {view === 'pipeline' ? (
        <div className="ws-hr-pipeline">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage} className="ws-hr-pipeline-col">
              <div className="ws-hr-pipeline-col-head">
                <span className={`chip ${STAGE_COLORS[stage] || 'chip-gray'}`}>{stageLabel(stage)}</span>
                <span className="ws-hr-pipeline-count">{byStage[stage]?.length || 0}</span>
              </div>
              <div className="ws-hr-pipeline-cards">
                {(byStage[stage] || []).map((c) => (
                  <CandidateCard key={c.id} candidate={c} stageLabel={stageLabel} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card ws-hr-table-wrap">
          <table className="ws-hr-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Stage</th>
                <th>Reference</th>
                <th>Next Interview</th>
                <th>Interviewers</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="fx g8" style={{ alignItems: 'center' }}>
                      <div className="ws-hr-avatar sm">{c.ini}</div>
                      <div>
                        <div className="ws-hr-candidate-name">{c.name}</div>
                        <div className="ws-hr-candidate-role">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.job?.title}</td>
                  <td>
                    <span className={`chip ${STAGE_COLORS[c.stage] || 'chip-gray'}`}>
                      {stageLabel(c.stage)}
                    </span>
                  </td>
                  <td>{c.reference || '—'}</td>
                  <td>
                    {c.nextInterview ? (
                      <div className="ws-cand-list-interview">
                        <span>{formatInterviewWhen(c.nextInterview.scheduledAt)}</span>
                        <span className="ws-cand-list-interview-stage">{stageLabel(c.nextInterview.stage)}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    {c.nextInterview?.interviewers?.length
                      ? c.nextInterview.interviewers.map((i) => i.name).join(', ')
                      : c.interviewers?.length
                        ? c.interviewers.map((i) => i.name).join(', ')
                        : '—'}
                  </td>
                  <td>{c.appliedAt}</td>
                  <td>
                    <Link to={`/workspace/hr/recruitment/candidates/${c.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejected.length > 0 && view === 'pipeline' && (
        <section className="ws-hr-section mt20">
          <h2 className="ws-hr-section-title">Rejected ({rejected.length})</h2>
          <div className="ws-hr-rejected-row">
            {rejected.map((c) => (
              <Link key={c.id} to={`/workspace/hr/recruitment/candidates/${c.id}`} className="ws-hr-candidate-card sm">
                <div className="ws-hr-avatar sm">{c.ini}</div>
                <span>{c.name}</span>
                <span className="chip chip-red">Rejected</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

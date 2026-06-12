import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { STAGE_COLORS, RECOMMENDATION_OPTIONS, RATING_CRITERIA } from '../../data/hrCatalog';
import { AppIcon, Icons } from '../../../components/icons';

const INTERVIEW_TYPES = ['Video Call', 'In Person', 'Phone'];
const DURATIONS = ['30 min', '45 min', '60 min', '90 min'];

function formatInterviewWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_INTERVIEW = {
  stage: 'screening',
  scheduledAt: '',
  duration: '60 min',
  type: 'Video Call',
  location: 'Google Meet',
  interviewerIds: [],
};

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [stages, setStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(EMPTY_INTERVIEW);
  const [scheduling, setScheduling] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    interviewerId: 'he2',
    stage: '',
    recommendation: 'Hire',
    comments: '',
    strengths: '',
    weaknesses: '',
    ratings: {},
  });

  const load = () => {
    Promise.all([api.getHrCandidate(candidateId), api.getHrStages(), api.getHrEmployees()])
      .then(([c, s, e]) => {
        setCandidate(c);
        setStages(s);
        setEmployees(e);
        setFeedbackForm((f) => ({ ...f, stage: c.stage }));
        setScheduleForm((sf) => ({ ...sf, stage: c.stage === 'applied' ? 'screening' : c.stage }));
      })
      .catch(() => {});
  };

  useEffect(load, [candidateId]);

  const stageLabel = (id) => stages.find((s) => s.id === id)?.label || id;

  const handleStageChange = async (stage) => {
    await api.updateCandidateStage(candidateId, { stage });
    load();
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    await api.submitHrFeedback({
      candidateId,
      interviewerId: feedbackForm.interviewerId,
      stage: feedbackForm.stage,
      recommendation: feedbackForm.recommendation,
      comments: feedbackForm.comments,
      strengths: feedbackForm.strengths,
      weaknesses: feedbackForm.weaknesses,
      ratings: feedbackForm.ratings,
    });
    setShowFeedbackForm(false);
    load();
  };

  const toggleScheduleInterviewer = (id) => {
    setScheduleForm((f) => ({
      ...f,
      interviewerIds: f.interviewerIds.includes(id)
        ? f.interviewerIds.filter((x) => x !== id)
        : [...f.interviewerIds, id],
    }));
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await api.createHrInterview({
        candidateId,
        stage: scheduleForm.stage,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        duration: scheduleForm.duration,
        type: scheduleForm.type,
        location: scheduleForm.location,
        interviewerIds: scheduleForm.interviewerIds,
      });
      setShowScheduleForm(false);
      setScheduleForm(EMPTY_INTERVIEW);
      load();
    } catch {
      /* ignore */
    } finally {
      setScheduling(false);
    }
  };

  const markInterviewComplete = async (interviewId) => {
    await api.updateHrInterview(interviewId, { status: 'completed' });
    load();
  };

  const criteria = RATING_CRITERIA[feedbackForm.stage] || RATING_CRITERIA.default;

  if (!candidate) {
    return (
      <div className="ws-hr-page">
        <p>Loading candidate…</p>
      </div>
    );
  }

  return (
    <div className="ws-hr-page ws-cand-detail-page">
      <Link to="/workspace/hr/recruitment/candidates" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Candidates
      </Link>

      <header className="card ws-cand-detail-header">
        <div className="ws-cand-detail-header-row">
          <div className="ws-hr-avatar xl">{candidate.ini}</div>
          <div className="ws-cand-detail-header-copy">
            <h1 className="ws-page-title">{candidate.name}</h1>
            <p className="ws-page-subtitle">{candidate.currentRole}</p>
            <div className="ws-hr-job-tags mt8">
              <span className={`chip ${STAGE_COLORS[candidate.stage]}`}>{stageLabel(candidate.stage)}</span>
              <span className="chip chip-gray">{candidate.job?.title}</span>
              <span className="chip chip-gray">{candidate.experience}</span>
              <span className="chip chip-blue">{candidate.source}</span>
              {candidate.reference && (
                <span className="chip chip-purple">
                  <AppIcon icon={Icons.userPlus} size={11} />
                  Ref: {candidate.reference}
                </span>
              )}
            </div>
          </div>
          <button type="button" className="ws-hr-btn-primary" onClick={() => setShowFeedbackForm(true)}>
            Submit Feedback
          </button>
        </div>
      </header>

      {candidate.nextInterview && (
        <div className="card ws-cand-next-interview-banner">
          <AppIcon icon={Icons.calendarDays} size={18} />
          <div>
            <strong>Upcoming interview — {stageLabel(candidate.nextInterview.stage)}</strong>
            <p>
              {formatInterviewWhen(candidate.nextInterview.scheduledAt)}
              {' · '}
              {candidate.nextInterview.interviewers?.map((i) => i.name).join(', ')}
              {candidate.nextInterview.location && ` · ${candidate.nextInterview.location}`}
            </p>
          </div>
        </div>
      )}

      <div className="ws-cand-detail-grid">
        <section className="card ws-emp-detail-section ws-cand-detail-card">
          <h2 className="ws-emp-detail-section-title">Contact &amp; Resume</h2>
          <div className="ws-cand-detail-card-body">
            <div className="ws-cand-detail-rows">
              <DetailRow icon={Icons.mail} label="Email" value={candidate.email} />
              <DetailRow icon={Icons.phone} label="Phone" value={candidate.phone || '—'} />
              <DetailRow icon={Icons.calendarDays} label="Applied" value={candidate.appliedAt} />
              <DetailRow label="Source" value={candidate.source} />
              <DetailRow label="Reference" value={candidate.reference || '—'} />
              <DetailRow
                icon={Icons.fileText}
                label="Resume"
                value={
                  <a href={candidate.resume?.url} className="ws-hr-resume-link">
                    {candidate.resume?.fileName}
                  </a>
                }
              />
            </div>
            {candidate.notes && (
              <div className="ws-cand-detail-notes">
                <span className="ws-cand-detail-notes-label">Notes</span>
                <p>{candidate.notes}</p>
              </div>
            )}
          </div>
        </section>

        <section className="card ws-emp-detail-section ws-cand-detail-card">
          <h2 className="ws-emp-detail-section-title">Interview Stage</h2>
          <div className="ws-cand-detail-card-body">
            <div className="ws-hr-stage-stepper">
              {['applied', 'screening', 'technical', 'culture', 'offer', 'hired'].map((s, i, arr) => {
                const idx = arr.indexOf(candidate.stage);
                const current = arr.indexOf(s);
                const done = current < idx || candidate.stage === 'hired';
                const active = s === candidate.stage;
                return (
                  <div key={s} className={`ws-hr-stage-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
                    <div className="ws-hr-stage-dot" />
                    <span>{stageLabel(s)}</span>
                  </div>
                );
              })}
            </div>
            <div className="ws-cand-stage-actions">
              <label className="fl">Move to stage</label>
              <select
                className="fi"
                value={candidate.stage}
                onChange={(e) => handleStageChange(e.target.value)}
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      <div className="ws-cand-detail-grid">
        <section className="card ws-emp-detail-section ws-cand-detail-card">
          <h2 className="ws-emp-detail-section-title">Assigned Interviewers</h2>
          <div className="ws-cand-detail-card-body">
            {candidate.interviewers?.length ? (
              <div className="ws-cand-interviewer-list">
                {candidate.interviewers.map((i) => (
                  <div key={i.id} className="ws-hr-interviewer-item">
                    <div className="ws-hr-avatar sm">{i.ini}</div>
                    <div>
                      <div className="ws-hr-action-name">{i.name}</div>
                      <div className="ws-hr-action-desc">{i.role} · {i.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ws-hr-empty">No interviewers assigned yet.</p>
            )}
          </div>
        </section>

        <section className="card ws-emp-detail-section ws-cand-detail-card">
          <div className="ws-cand-section-head">
            <h2 className="ws-emp-detail-section-title">Scheduled Interviews</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowScheduleForm(true)}>
              <AppIcon icon={Icons.plus} size={12} />
              Schedule
            </button>
          </div>
          <div className="ws-cand-detail-card-body">
            {candidate.interviews?.length ? (
              <div className="ws-cand-interview-list">
                {candidate.interviews.map((int) => (
                  <div key={int.id} className="ws-cand-interview-entry">
                    <div className="ws-cand-interview-entry-head">
                      <span className={`chip ${STAGE_COLORS[int.stage]}`}>{stageLabel(int.stage)}</span>
                      <span className={`chip ${int.status === 'completed' ? 'chip-green' : 'chip-blue'}`}>
                        {int.status}
                      </span>
                    </div>
                    <div className="ws-cand-interview-when-lg">
                      <AppIcon icon={Icons.calendarDays} size={14} />
                      {formatInterviewWhen(int.scheduledAt)}
                    </div>
                    <p className="ws-cand-interview-meta">{int.duration} · {int.type} · {int.location}</p>
                    <p className="ws-cand-interview-meta">
                      <AppIcon icon={Icons.users} size={12} />
                      {int.interviewers?.map((i) => i.name).join(', ')}
                    </p>
                    {int.status === 'scheduled' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm ws-cand-mark-done"
                        onClick={() => markInterviewComplete(int.id)}
                      >
                        Mark as Conducted
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="ws-hr-empty">No interviews scheduled.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card ws-emp-detail-section ws-cand-detail-full">
        <h2 className="ws-emp-detail-section-title">Stage History</h2>
        <div className="ws-hr-timeline">
          {(candidate.stageHistory || []).map((h, i) => (
            <div key={i} className="ws-hr-timeline-item">
              <span className={`chip ${STAGE_COLORS[h.stage]}`}>{stageLabel(h.stage)}</span>
              <span>{h.at}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card ws-emp-detail-section ws-cand-detail-full">
        <h2 className="ws-emp-detail-section-title">Feedback ({candidate.feedback?.length || 0})</h2>
        {candidate.feedback?.length ? (
          <div className="ws-cand-feedback-list">
            {candidate.feedback.map((fb) => (
              <div key={fb.id} className="ws-hr-feedback-card">
                <div className="ws-hr-feedback-head">
                  <div className="fx g8" style={{ alignItems: 'center' }}>
                    <div className="ws-hr-avatar sm">{fb.interviewer?.ini}</div>
                    <div>
                      <div className="ws-hr-action-name">{fb.interviewer?.name}</div>
                      <div className="ws-hr-action-desc">
                        {stageLabel(fb.stage)} · {new Date(fb.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="chip chip-green">{fb.recommendation}</span>
                </div>
                <p className="ws-hr-feedback-comments">{fb.comments}</p>
                {fb.ratings && Object.keys(fb.ratings).length > 0 && (
                  <div className="ws-hr-ratings">
                    {Object.entries(fb.ratings).map(([k, v]) => (
                      <div key={k} className="ws-hr-rating">
                        <span>{k}</span>
                        <span>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="ws-hr-empty">No feedback submitted yet.</p>
        )}
      </section>

      {showScheduleForm && (
        <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && setShowScheduleForm(false)}>
          <div className="modal ws-cand-schedule-modal">
            <div className="modal-hd">
              <h3 className="modal-title">Schedule Interview — {candidate.name}</h3>
              <button type="button" className="modal-x" onClick={() => setShowScheduleForm(false)}>×</button>
            </div>
            <form onSubmit={handleScheduleInterview} className="modal-body">
              <label className="fl">Interview Stage</label>
              <select
                className="fi mb12"
                value={scheduleForm.stage}
                onChange={(e) => setScheduleForm({ ...scheduleForm, stage: e.target.value })}
              >
                {stages.filter((s) => !['hired', 'rejected', 'applied'].includes(s.id)).map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              <label className="fl">Date &amp; Time *</label>
              <input
                className="fi mb12"
                type="datetime-local"
                required
                value={scheduleForm.scheduledAt}
                min={formatDatetimeLocal(new Date())}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
              />

              <div className="ws-emp-form-grid mb12">
                <div className="ws-emp-form-field">
                  <label className="fl">Duration</label>
                  <select className="fi" value={scheduleForm.duration} onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="ws-emp-form-field">
                  <label className="fl">Type</label>
                  <select className="fi" value={scheduleForm.type} onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}>
                    {INTERVIEW_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="fl">Location / Link</label>
              <input
                className="fi mb12"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              />

              <label className="fl">Interviewers *</label>
              <div className="ws-cand-interviewer-picks mb12">
                {employees.map((emp) => (
                  <label key={emp.id} className={`ws-cand-interviewer-pick${scheduleForm.interviewerIds.includes(emp.id) ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={scheduleForm.interviewerIds.includes(emp.id)}
                      onChange={() => toggleScheduleInterviewer(emp.id)}
                    />
                    <span className="ws-hr-avatar sm">{emp.ini}</span>
                    <span>
                      <span className="ws-cand-interviewer-name">{emp.name}</span>
                      <span className="ws-cand-interviewer-role">{emp.role}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowScheduleForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={scheduling || !scheduleForm.interviewerIds.length}>
                  {scheduling ? 'Scheduling…' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackForm && (
        <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && setShowFeedbackForm(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h3 className="modal-title">Interview Feedback — {candidate.name}</h3>
              <button type="button" className="modal-x" onClick={() => setShowFeedbackForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitFeedback} className="modal-body">
              <label className="fl">Stage</label>
              <select
                className="fi mb12"
                value={feedbackForm.stage}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, stage: e.target.value })}
              >
                {stages.filter((s) => !['hired', 'rejected'].includes(s.id)).map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              <label className="fl">Recommendation</label>
              <select
                className="fi mb12"
                value={feedbackForm.recommendation}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
              >
                {RECOMMENDATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              {criteria.map((c) => (
                <div key={c} className="mb12">
                  <label className="fl">{c}</label>
                  <select
                    className="fi"
                    value={feedbackForm.ratings[c] || 3}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        ratings: { ...feedbackForm.ratings, [c]: Number(e.target.value) },
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} — {'★'.repeat(n)}</option>
                    ))}
                  </select>
                </div>
              ))}

              <label className="fl">Comments</label>
              <textarea
                className="fi mb12"
                rows={3}
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
              />

              <label className="fl">Strengths</label>
              <input
                className="fi mb12"
                value={feedbackForm.strengths}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
              />

              <label className="fl">Areas for Improvement</label>
              <input
                className="fi mb12"
                value={feedbackForm.weaknesses}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, weaknesses: e.target.value })}
              />

              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowFeedbackForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="ws-emp-detail-row ws-cand-detail-row">
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

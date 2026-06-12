import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { STAGE_COLORS } from '../../data/hrCatalog';

export default function FeedbackListPage() {
  const [feedback, setFeedback] = useState([]);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    Promise.all([api.getHrFeedback(), api.getHrStages()])
      .then(([f, s]) => {
        setFeedback(f);
        setStages(s);
      })
      .catch(() => {});
  }, []);

  const stageLabel = (id) => stages.find((s) => s.id === id)?.label || id;

  return (
    <div className="ws-hr-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Feedback Forms</h1>
          <p className="ws-page-subtitle">All interviewer evaluations across the hiring pipeline</p>
        </div>
      </div>

      <div className="ws-hr-feedback-list">
        {feedback.map((fb) => (
          <div key={fb.id} className="card ws-hr-feedback-list-card">
            <div className="ws-hr-feedback-head">
              <div className="fx g12" style={{ alignItems: 'center' }}>
                <div className="ws-hr-avatar">{fb.interviewer?.ini}</div>
                <div>
                  <div className="ws-hr-action-name">{fb.interviewer?.name}</div>
                  <div className="ws-hr-action-desc">
                    Interviewed{' '}
                    <Link to={`/workspace/hr/recruitment/candidates/${fb.candidateId}`}>
                      {fb.candidate?.name}
                    </Link>
                    {' '}for {fb.candidate?.job?.title}
                  </div>
                </div>
              </div>
              <div className="fx g8" style={{ alignItems: 'center' }}>
                <span className={`chip ${STAGE_COLORS[fb.stage]}`}>{stageLabel(fb.stage)}</span>
                <span className="chip chip-green">{fb.recommendation}</span>
                <span className="ws-hr-activity-time">
                  {new Date(fb.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p className="ws-hr-feedback-comments">{fb.comments}</p>

            <div className="ws-hr-feedback-footer">
              {fb.strengths && (
                <div className="ws-hr-feedback-tag">
                  <strong>Strengths:</strong> {fb.strengths}
                </div>
              )}
              {fb.weaknesses && (
                <div className="ws-hr-feedback-tag">
                  <strong>Improve:</strong> {fb.weaknesses}
                </div>
              )}
              {fb.ratings && (
                <div className="ws-hr-ratings inline">
                  {Object.entries(fb.ratings).map(([k, v]) => (
                    <span key={k} className="chip chip-gray">{k}: {v}/5</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

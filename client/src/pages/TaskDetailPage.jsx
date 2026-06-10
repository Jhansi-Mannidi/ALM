import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import {
  findIssueInProjects,
  formatSheetDate,
  issueTypeChip,
  prioChip,
  sChip,
  uById,
} from '../utils/helpers';

function DetailRow({ label, children }) {
  if (children == null || children === '' || children === '—') return null;
  return (
    <div className="task-detail-row">
      <div className="task-detail-label">{label}</div>
      <div className="task-detail-value">{children}</div>
    </div>
  );
}

function UserCell({ user }) {
  if (!user) return <span className="t-muted-xs">—</span>;
  return (
    <div className="fx g5">
      <div className={`av av-xs ${user.c}`}>{user.ini}</div>
      <span className="text-sm">{user.name}</span>
    </div>
  );
}

export default function TaskDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { projects, users, switchProject } = useApp();

  const found = useMemo(() => findIssueInProjects(projects, issueId), [projects, issueId]);

  useEffect(() => {
    if (found?.project?.id) switchProject(found.project.id);
  }, [found?.project?.id, switchProject]);

  if (!found) {
    return (
      <>
        <PageHeader title="Task not found" subtitle={`No issue matching ${issueId || 'this ID'}`} />
        <div className="card" style={{ padding: 20 }}>
          <p className="t-body-sm" style={{ marginBottom: 14 }}>
            The task may have been removed or the link is invalid.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/my-tasks')}>
            Back to My Tasks
          </button>
        </div>
      </>
    );
  }

  const { project, issue } = found;
  const assignee = uById(users, issue.assign);
  const reporter = uById(users, issue.reporter);
  const linkedBug = issue.linked
    ? (project.bugs ?? []).find((b) => b.id === issue.linked || b.linked === issue.id)
    : null;
  const hasDescription = issue.description && issue.description.replace(/<[^>]+>/g, '').trim();

  return (
    <>
      <div className="task-detail-back">
        <button type="button" className="btn btn-ghost btn-sm fx g4" onClick={() => navigate('/my-tasks')}>
          <AppIcon icon={Icons.arrowRight} size={14} style={{ transform: 'rotate(180deg)' }} />
          Back to My Tasks
        </button>
      </div>

      <PageHeader
        title={issue.title}
        subtitle={`${issue.id} · ${project.name}`}
        actions={
          <div className="fx g4">
            <span className={`chip ${issueTypeChip(issue.type)}`}>{issue.type}</span>
            <span className={`chip ${prioChip(issue.prio)}`}>{issue.prio}</span>
            <span className={`chip ${sChip(issue.status)}`}>{issue.status}</span>
          </div>
        }
      />

      <div className="g2 task-detail-grid">
        <div className="card task-detail-main">
          <div className="card-hd">
            <div className="card-title">Description</div>
          </div>
          <div className="card-body">
            {hasDescription ? (
              <div className="task-detail-desc rte-preview" dangerouslySetInnerHTML={{ __html: issue.description }} />
            ) : (
              <p className="task-detail-desc-empty">
                No description provided. Summary: <strong>{issue.title}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="card task-detail-side">
          <div className="card-hd">
            <div className="card-title">Details</div>
          </div>
          <div className="card-body task-detail-fields">
            <DetailRow label="Issue ID">
              <span className="iid">{issue.id}</span>
            </DetailRow>
            <DetailRow label="Project">
              <Link to="/dashboard" className="task-link">
                {project.name} ({project.code})
              </Link>
            </DetailRow>
            <DetailRow label="Status">
              <span className={`chip ${sChip(issue.status)}`}>{issue.status}</span>
            </DetailRow>
            <DetailRow label="Priority">
              <span className={`chip ${prioChip(issue.prio)}`}>{issue.prio}</span>
            </DetailRow>
            <DetailRow label="Type">
              <span className={`chip ${issueTypeChip(issue.type)}`}>{issue.type}</span>
            </DetailRow>
            <DetailRow label="Assignee">
              <UserCell user={assignee} />
            </DetailRow>
            <DetailRow label="Reporter">
              <UserCell user={reporter} />
            </DetailRow>
            <DetailRow label="Sprint">{issue.sprint}</DetailRow>
            <DetailRow label="Due Date">{issue.due ? formatSheetDate(issue.due) : null}</DetailRow>
            <DetailRow label="Story Points">{issue.storyPoints}</DetailRow>
            <DetailRow label="Epic Link">{issue.epicLink}</DetailRow>
            <DetailRow label="Labels">{issue.labels}</DetailRow>
            <DetailRow label="Components">{issue.components}</DetailRow>
            <DetailRow label="Fix Version">{issue.fixVersion}</DetailRow>
            <DetailRow label="Environment">{issue.environment}</DetailRow>
            <DetailRow label="Affects Version">{issue.affectsVersion}</DetailRow>
            {issue.postponed && (
              <>
                <DetailRow label="Postpone Reason">
                  <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{issue.postponeReason || 'Postponed'}</span>
                </DetailRow>
                <DetailRow label="Original Due">{formatSheetDate(issue.originalDue)}</DetailRow>
                <DetailRow label="Postponed Until">{formatSheetDate(issue.due)}</DetailRow>
              </>
            )}
            {issue.linked && (
              <DetailRow label="Linked">
                <span className="iid">{issue.linked}</span>
              </DetailRow>
            )}
          </div>
        </div>
      </div>

      {linkedBug && (
        <div className="card task-detail-linked">
          <div className="card-hd">
            <div className="card-title">Related Bug</div>
          </div>
          <div className="card-body">
            <div className="fx g8" style={{ alignItems: 'flex-start' }}>
              <AppIcon icon={Icons.bug} size={16} className="task-detail-bug-icon" />
              <div>
                <div className="t-cell-sm" style={{ fontWeight: 700 }}>
                  {linkedBug.id} — {linkedBug.title}
                </div>
                <div className="t-muted-xs" style={{ marginTop: 4 }}>
                  {linkedBug.sev} severity · {linkedBug.status}
                </div>
                {linkedBug.description && (
                  <p className="t-body-sm" style={{ marginTop: 8, lineHeight: 1.5 }}>
                    {linkedBug.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

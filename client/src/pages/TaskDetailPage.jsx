import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import WorkItemDetailView from '../components/WorkItemDetailView';
import { findIssueInProjects, getParentIssue, getSubtasks } from '../utils/helpers';

export default function TaskDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { projects, users, user, switchProject, refreshProjects, toast } = useApp();

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
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/backlog')}>
            Back to Backlog
          </button>
        </div>
      </>
    );
  }

  const { project, issue } = found;
  const parentIssue = getParentIssue(project, issue);
  const childSubtasks = getSubtasks(project, issue.id);
  const linkedTestCases = (project.testCases || []).filter((tc) => tc.linked === issue.id);
  const linkedBug = issue.linked
    ? (project.bugs ?? []).find((b) => b.id === issue.linked || b.linked === issue.id)
    : null;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/backlog');
  };

  return (
    <WorkItemDetailView
      project={project}
      projects={projects}
      issue={issue}
      users={users}
      user={user}
      onRefresh={refreshProjects}
      toast={toast}
      subtasks={childSubtasks}
      parentIssue={parentIssue}
      linkedTestCases={linkedTestCases}
      linkedBug={linkedBug}
      onBack={handleBack}
      backLabel="Back to Backlog"
    />
  );
}

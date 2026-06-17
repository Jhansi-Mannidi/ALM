import { Link } from 'react-router-dom';
import { AppIcon, Icons } from './icons';
import WorkItemSectionChat from './WorkItemSectionChat';
import WorkItemWorkLog from './WorkItemWorkLog';
import {
  formatSheetDate,
  issueTypeChip,
  prioChip,
  roleLabel,
  sChip,
  uById,
} from '../utils/helpers';

const TYPE_ICONS = {
  Story: Icons.fileText,
  Task: Icons.check,
  Bug: Icons.bug,
  Epic: Icons.flag,
  Feature: Icons.layers,
  'Sub-task': Icons.check,
};

const TITLE_LABEL_BY_TYPE = {
  Story: 'Story name',
  Task: 'Task name',
  Bug: 'Bug name',
  Epic: 'Epic name',
  Feature: 'Feature name',
  'Sub-task': 'Sub-task name',
};

function ViewField({ label, required, hint, children, empty = '—' }) {
  const hasValue = children != null && children !== '';
  return (
    <div className="fl">
      <label>
        {label}
        {required && <span className="cw-required"> *</span>}
      </label>
      <div className={`wi-view-value${hasValue ? '' : ' wi-view-empty'}`}>{hasValue ? children : empty}</div>
      {hint && <div className="cw-field-hint">{hint}</div>}
    </div>
  );
}

function UserReadonly({ user }) {
  if (!user) return 'Unassigned';
  return (
    <span className="fx g5" style={{ display: 'inline-flex' }}>
      <span className={`av av-xs ${user.c}`}>{user.ini}</span>
      <span>{user.name}</span>
      <span className="t-muted-xs">({roleLabel(user.role)})</span>
    </span>
  );
}

function SubtaskReadonlyCard({ subtask, index, users }) {
  const assignee = uById(users, subtask.assign);
  return (
    <div className="cw-subtask-card wi-subtask-readonly">
      <div className="cw-subtask-card-hd">
        <span className="cw-subtask-num">{index + 1}</span>
        <span className="cw-subtask-card-label">Sub-task {index + 1}</span>
        <Link to={`/tasks/${subtask.id}`} className="iid task-link wi-subtask-id">
          {subtask.id}
        </Link>
        <span className={`chip ${sChip(subtask.status)}`}>{subtask.status}</span>
      </div>
      <div className="cw-subtask-row wi-subtask-row-readonly">
        <div className="wi-view-value">{subtask.title}</div>
        <div className="wi-view-value wi-view-compact">
          <UserReadonly user={assignee} />
        </div>
        <div className="wi-view-value wi-view-compact">
          <span className={`chip ${prioChip(subtask.prio)}`}>{subtask.prio}</span>
        </div>
      </div>
      <div className="cw-subtask-fields">
        <ViewField label="Description">{subtask.description}</ViewField>
        <ViewField label="URL">
          {subtask.url ? (
            <a href={subtask.url} target="_blank" rel="noopener noreferrer" className="task-link">
              {subtask.url}
            </a>
          ) : null}
        </ViewField>
        <ViewField label="Due date">{subtask.due ? formatSheetDate(subtask.due) : null}</ViewField>
        <ViewField label="Message" hint="Internal note for the assignee — shown on the sub-task detail.">
          {subtask.message}
        </ViewField>
      </div>
    </div>
  );
}

function TestCaseTable({ testCases, users }) {
  if (!testCases.length) return null;
  const resultChip = (result) => {
    if (result === 'Pass') return 'chip-green';
    if (result === 'Fail') return 'chip-red';
    if (result === 'Skip') return 'chip-navy';
    return 'chip-amber';
  };
  return (
    <div className="cw-section">
      <div className="cw-section-title">Testing & QA</div>
      <p className="cw-field-hint" style={{ marginTop: 0, marginBottom: 10 }}>
        Test cases linked to this work item — execution results from QA.
      </p>
      <div className="tbl-wrap">
        <table className="tbl wi-testcase-tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Suite</th>
              <th>Scenario</th>
              <th>Type</th>
              <th>Result</th>
              <th>Assignee</th>
              <th>Executed</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => {
              const tester = uById(users, tc.assign);
              return (
                <tr key={tc.id}>
                  <td>
                    <span className="iid">{tc.id}</span>
                  </td>
                  <td className="t-muted-xs">{tc.suite}</td>
                  <td className="t-cell-sm">{tc.scene}</td>
                  <td>
                    <span className="chip chip-navy">{tc.type}</span>
                  </td>
                  <td>
                    <span className={`chip ${resultChip(tc.result)}`}>{tc.result}</span>
                  </td>
                  <td>
                    {tester ? (
                      <span className="fx g5">
                        <span className={`av av-xs ${tester.c}`}>{tester.ini}</span>
                        <span className="text-sm">{tester.name.split(' ')[0]}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="t-muted-xs">{tc.exec}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WorkItemDetailView({
  project,
  projects,
  issue,
  users,
  user,
  onRefresh,
  toast,
  subtasks = [],
  parentIssue,
  linkedTestCases = [],
  linkedBug,
  onBack,
  backLabel = 'Back',
}) {
  const assignee = uById(users, issue.assign);
  const reporter = uById(users, issue.reporter);
  const titleLabel = TITLE_LABEL_BY_TYPE[issue.type] || 'Summary';
  const isFeature = issue.type === 'Feature';
  const isSubtask = issue.type === 'Sub-task';
  const isHierarchy = ['Story', 'Task', 'Feature'].includes(issue.type);
  const hasDescription = issue.description && issue.description.replace(/<[^>]+>/g, '').trim();
  const comments = Array.isArray(issue.comments) ? issue.comments : [];

  return (
    <div className="create-work-item-page">
      <div className="create-work-item-back">
        <button type="button" className="btn btn-ghost btn-sm fx g4" onClick={onBack}>
          <AppIcon icon={Icons.arrowRight} size={14} style={{ transform: 'rotate(180deg)' }} />
          {backLabel}
        </button>
      </div>

      <div className="card create-work-item-card">
        <div className="create-work-item-tabs cw-tabs-type">
          <div className="cw-tab cw-tab-type active wi-detail-type-tab">
            <span className={`chip ${issueTypeChip(issue.type)} cw-tab-type-chip`}>{issue.type}</span>
            <AppIcon icon={TYPE_ICONS[issue.type] || Icons.fileText} size={14} className="cw-tab-type-icon" />
            <span className="wi-detail-issue-id">{issue.id}</span>
          </div>
          <div className="wi-detail-chips fx g4 mla">
            <span className={`chip ${prioChip(issue.prio)}`}>{issue.prio}</span>
            <span className={`chip ${sChip(issue.status)}`}>{issue.status}</span>
          </div>
        </div>

        <div className="create-work-item-body cw-body wi-detail-body">
          <div className="wi-detail-page-title">{issue.title}</div>
          <div className="cw-intro">
            {project.name} ({project.code}) · Created work item — all fields as entered at creation.
          </div>

          <div className="cw-section">
            <div className="cw-section-title">Required</div>
            <ViewField label={titleLabel} required>
              {issue.title}
            </ViewField>
            <div className="fl">
              <label>Description</label>
              {hasDescription ? (
                <div
                  className="wi-view-value wi-desc-preview rte-preview"
                  dangerouslySetInnerHTML={{ __html: issue.description }}
                />
              ) : (
                <div className="wi-view-value wi-view-empty">—</div>
              )}
              <div className="cw-field-hint">
                Rich text — bold, lists, checklists, code blocks, tables, links, @mentions, emoji, colors, alignment.
              </div>
            </div>
          </div>

          <div className="cw-section">
            <div className="cw-section-title">Details</div>
            <div className="f2">
              <ViewField label="Project">{`${project.name} (${project.code})`}</ViewField>
              <ViewField label="Issue Type">{issue.type}</ViewField>
            </div>
            <div className="f2">
              <ViewField label="Status">
                <span className={`chip ${sChip(issue.status)}`}>{issue.status}</span>
              </ViewField>
              <ViewField label="Priority">
                <span className={`chip ${prioChip(issue.prio)}`}>{issue.prio}</span>
              </ViewField>
            </div>
            <div className="f2">
              <ViewField label="Assignee">
                <UserReadonly user={assignee} />
              </ViewField>
              <ViewField label="Reporter" hint="Who reported this item.">
                <UserReadonly user={reporter} />
              </ViewField>
            </div>
            <div className="f2">
              <ViewField label="Sprint">{issue.sprint}</ViewField>
              <ViewField label="Due Date">{issue.due ? formatSheetDate(issue.due) : null}</ViewField>
            </div>
            {parentIssue && (
              <ViewField label="Parent feature">
                <Link to={`/tasks/${parentIssue.id}`} className="task-link">
                  {parentIssue.id} — {parentIssue.title}
                </Link>
              </ViewField>
            )}
          </div>

          {user && (
            <WorkItemWorkLog
              project={project}
              targetType="issue"
              targetId={issue.id}
              users={users}
              user={user}
              onRefresh={onRefresh}
              toast={toast}
            />
          )}

          {isSubtask && (
            <div className="cw-section">
              <div className="cw-section-title">Sub-task fields</div>
              <ViewField label="URL">
                {issue.url ? (
                  <a href={issue.url} target="_blank" rel="noopener noreferrer" className="task-link">
                    {issue.url}
                  </a>
                ) : null}
              </ViewField>
              <ViewField label="Message" hint="Internal note for the assignee — shown on the sub-task detail.">
                {issue.message}
              </ViewField>
            </div>
          )}

          {isHierarchy && (
            <div className="cw-section">
              <div className="cw-section-title">
                {issue.type === 'Story' ? 'Story fields' : issue.type === 'Task' ? 'Task fields' : 'Feature fields'}
              </div>
              <div className="f2">
                {issue.type === 'Story' && <ViewField label="Story Points">{issue.storyPoints}</ViewField>}
                <ViewField label="Epic Link" hint="Parent epic on the roadmap.">
                  {issue.epicLink}
                </ViewField>
              </div>
              <div className="f2">
                <ViewField label="Labels">{issue.labels}</ViewField>
                <ViewField label="Components">{issue.components}</ViewField>
              </div>
              <ViewField label="Fix Version">{issue.fixVersion}</ViewField>

              {isFeature && subtasks.length > 0 && (
                <div className="cw-subtasks wi-subtasks-readonly">
                  <div className="cw-subtasks-hd">
                    <span className="cw-subtasks-title">Sub-tasks</span>
                    <span className="cw-subtasks-hint">
                      {subtasks.length} sub-task{subtasks.length === 1 ? '' : 's'} with assignee, description, URL, due
                      date, and message.
                    </span>
                  </div>
                  <div className="cw-subtasks-list">
                    {subtasks.map((st, idx) => (
                      <SubtaskReadonlyCard key={st.id} subtask={st} index={idx} users={users} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {issue.type === 'Bug' && (
            <div className="cw-section">
              <div className="cw-section-title">Bug fields</div>
              <div className="f2">
                <ViewField label="Severity">{issue.sev}</ViewField>
                <ViewField label="Environment">{issue.environment}</ViewField>
              </div>
              <ViewField label="Affects Version">{issue.affectsVersion}</ViewField>
              <ViewField label="URL">
                {issue.url ? (
                  <a href={issue.url} target="_blank" rel="noopener noreferrer" className="task-link">
                    {issue.url}
                  </a>
                ) : null}
              </ViewField>
              <ViewField label="Message">{issue.message}</ViewField>
            </div>
          )}

          <TestCaseTable testCases={linkedTestCases} users={users} />

          {linkedBug && (
            <div className="cw-section">
              <div className="cw-section-title">Related Bug</div>
              <div className="wi-linked-bug">
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
          )}

          <div className="cw-section">
            <WorkItemSectionChat title={`${issue.type} chat`} messages={comments} readOnly />
            {comments.length === 0 && (
              <p className="cw-field-hint" style={{ marginTop: 8 }}>
                No comments were added when this item was created.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

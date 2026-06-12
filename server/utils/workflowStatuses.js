export const WORKFLOW_STATUSES = [
  'Dev Progress',
  'Dev Completed',
  'QA',
  'UAT',
  'Prod',
];

const LEGACY_WORKFLOW_STATUS_MAP = {
  'To Do': 'Dev Progress',
  Open: 'Dev Progress',
  'In Progress': 'Dev Progress',
  Blocked: 'Dev Progress',
  'On Hold': 'Dev Progress',
  'In Review': 'Dev Completed',
  'Code Review': 'Dev Completed',
  Testing: 'QA',
  Done: 'Prod',
  Resolved: 'Prod',
};

export function migrateWorkflowStatus(status) {
  if (!status) return 'Dev Progress';
  if (WORKFLOW_STATUSES.includes(status)) return status;
  return LEGACY_WORKFLOW_STATUS_MAP[status] || 'Dev Progress';
}

export function migrateProjectWorkflowStatuses(project) {
  for (const issue of project.issues || []) {
    if (issue.status) issue.status = migrateWorkflowStatus(issue.status);
  }
  for (const bug of project.bugs || []) {
    if (bug.status) bug.status = migrateWorkflowStatus(bug.status);
  }
  for (const ticket of project.tickets || []) {
    if (ticket.status) ticket.status = migrateWorkflowStatus(ticket.status);
  }
}

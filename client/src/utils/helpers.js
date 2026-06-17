export function memberEmail(user) {
  if (user?.email) return user.email;
  const parts = String(user?.name || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length < 2) return parts[0] ? `${parts[0]}@almsphere.io` : '—';
  const first = parts[0];
  const last = parts[parts.length - 1].replace(/\./g, '');
  return `${first}.${last}@almsphere.io`;
}

export const PROJECT_PHASES = [
  ['mock', 'Mock'],
  ['ba', 'BA'],
  ['development', 'Development'],
  ['completed', 'Completed'],
];

export function phaseLabel(phase) {
  const found = PROJECT_PHASES.find(([value]) => value === phase);
  return found ? found[1] : 'Development';
}

export function phaseChipClass(phase) {
  if (phase === 'mock') return 'chip-gray';
  if (phase === 'ba') return 'chip-purple';
  if (phase === 'completed') return 'chip-green';
  return 'chip-blue';
}

export function formatSheetDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatScopeAudit(meta) {
  if (!meta) return null;
  if (meta.updatedByName) {
    return `Updated by ${meta.updatedByName}${meta.updatedAt ? ` · ${formatSheetDate(meta.updatedAt)}` : ''}`;
  }
  if (meta.addedByName) {
    return `Added by ${meta.addedByName}${meta.addedAt ? ` · ${formatSheetDate(meta.addedAt)}` : ''}`;
  }
  return null;
}

export function downloadScopeSheet(project, sheet, sectionLabel) {
  const kind = sheet.contentType || (sheet.name ? 'file' : 'text');
  const body = [
    kind === 'text' ? 'Scope Text Export' : kind === 'recording' ? 'Scope Recording Export' : 'Scope Document Export',
    '',
    `Project: ${project.name}`,
    `Section: ${sectionLabel}`,
    `Title: ${sheet.title}`,
    sheet.description ? `Description: ${sheet.description}` : '',
    `Date: ${formatSheetDate(sheet.date)}`,
    sheet.addedByName ? `Added by: ${sheet.addedByName}` : '',
    sheet.name ? `File: ${sheet.name}` : 'File: (none — text or notes only)',
    '',
    '---',
    '',
    sheet.description && kind === 'text'
      ? sheet.description
      : 'Placeholder export from VoltusWave ALM. Re-upload the original file from your records.',
  ]
    .filter(Boolean)
    .join('\n');
  const ext =
    kind === 'text'
      ? '.txt'
      : sheet.name?.match(/\.(pdf|xlsx|xls|mp3|wav|m4a|webm|ogg|aac)$/i)?.[0] || '.txt';
  const downloadName =
    kind === 'text'
      ? `${sheet.title.replace(/[^\w\s-]/g, '').trim() || 'scope-note'}.txt`
      : sheet.name?.match(/\.(xlsx|xls|pdf|mp3|wav|m4a|webm|ogg|aac)$/i)
        ? sheet.name
        : `${sheet.name || sheet.title}.txt`;
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName.includes('.') ? downloadName : `${downloadName}${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadScopeDoc(project, doc) {
  const body =
    doc.content ||
    [
      'Scope Requirement Document',
      '',
      `Project: ${project.name}`,
      `Document: ${doc.name}`,
      `Added: ${doc.added || '—'}`,
      '',
      '---',
      '',
      'Exported from VoltusWave ALM portfolio. Replace with the signed-off scope file from project intake.',
    ].join('\n');
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.name.includes('.') ? doc.name : `${doc.name}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const MEMBER_WORK_PERMS = {
  createProj: false,
  addMem: false,
  createTask: true,
  createBug: true,
  createFeature: false,
  createEpic: false,
  assign: false,
  addClientReq: true,
  addDevReq: false,
  editTechStack: false,
  addTesterScope: false,
  deploy: false,
  credentials: false,
};

export const APP_ROLES = [
  { id: 'admin', label: 'Admin', title: 'Admin' },
  { id: 'manager', label: 'Project Manager', title: 'Project Manager' },
  { id: 'teamlead', label: 'Team Lead', title: 'Team Lead' },
  { id: 'developer', label: 'Developer', title: 'Developer' },
  { id: 'tester', label: 'Tester', title: 'Tester' },
  { id: 'ba', label: 'BA', title: 'Business Analyst' },
  { id: 'scrummaster', label: 'Scrum Master', title: 'Scrum Master' },
];

export const ROLE_LOGIN_USERS = {
  admin: { name: 'Sasi Paul', ini: 'SP', c: 'c1' },
  manager: { name: 'Ram Reddy', ini: 'RR', c: 'c1' },
  teamlead: { name: 'Anil Kumar', ini: 'AK', c: 'c2' },
  developer: { name: 'Jhansi Mannidi', ini: 'JM', c: 'c3' },
  tester: { name: 'Tejaswi', ini: 'TE', c: 'c1' },
  ba: { name: 'Vineesha Reddy', ini: 'VR', c: 'c4' },
  scrummaster: { name: 'Sai', ini: 'SA', c: 'c3' },
};

export const PERMS = {
  admin: {
    createProj: true,
    addMem: true,
    createTask: true,
    createBug: true,
    createFeature: true,
    createEpic: true,
    assign: true,
    addClientReq: true,
    addDevReq: true,
    editTechStack: true,
    addTesterScope: true,
    deploy: true,
    credentials: true,
  },
  manager: {
    createProj: false,
    addMem: true,
    createTask: true,
    createBug: true,
    createFeature: true,
    createEpic: true,
    assign: true,
    addClientReq: true,
    addDevReq: true,
    editTechStack: true,
    addTesterScope: true,
    deploy: false,
    credentials: true,
  },
  teamlead: {
    createProj: false,
    addMem: false,
    createTask: true,
    createBug: true,
    createFeature: true,
    createEpic: true,
    assign: true,
    addClientReq: true,
    addDevReq: true,
    editTechStack: true,
    addTesterScope: false,
    deploy: false,
    credentials: true,
  },
  developer: { ...MEMBER_WORK_PERMS },
  tester: { ...MEMBER_WORK_PERMS },
  ba: {
    createProj: false,
    addMem: false,
    createTask: true,
    createBug: false,
    createFeature: true,
    createEpic: true,
    assign: false,
    addClientReq: true,
    addDevReq: false,
    editTechStack: false,
    addTesterScope: false,
    deploy: false,
    credentials: false,
  },
  scrummaster: {
    createProj: false,
    addMem: false,
    createTask: true,
    createBug: true,
    createFeature: false,
    createEpic: false,
    assign: true,
    addClientReq: false,
    addDevReq: false,
    editTechStack: false,
    addTesterScope: false,
    deploy: false,
    credentials: false,
  },
};

export function resolvePermissionRole(role) {
  const aliases = {
    analyst: 'ba',
    'business analyst': 'ba',
    devops: 'scrummaster',
    designer: 'developer',
    pm: 'manager',
    'project manager': 'manager',
  };
  const key = String(role || 'developer').toLowerCase().trim();
  return aliases[key] || key.replace(/\s+/g, '');
}

export const can = (role, action) => PERMS[resolvePermissionRole(role)]?.[action] || false;

export function canManageCeremonies(role) {
  return ['admin', 'manager', 'teamlead', 'scrummaster'].includes(resolvePermissionRole(role));
}

export const CEREMONY_ICON_OPTIONS = [
  { id: 'planning', label: 'Planning' },
  { id: 'standup', label: 'Standup' },
  { id: 'review', label: 'Review' },
  { id: 'retro', label: 'Retro' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'stakeholder', label: 'Stakeholder' },
];

export const CEREMONY_STATUS_CHIPS = [
  { id: 'chip-green', label: 'Completed' },
  { id: 'chip-blue', label: 'Active / Today' },
  { id: 'chip-amber', label: 'Upcoming' },
  { id: 'chip-gray', label: 'Recurring' },
];

export function canCreateAnyWorkItem(role) {
  return (
    can(role, 'createTask') ||
    can(role, 'createBug') ||
    can(role, 'createFeature') ||
    can(role, 'createEpic')
  );
}

/** Issue types for the Create work item flow */
export const WORK_ITEM_TYPES = [
  { id: 'story', label: 'Story', type: 'Story', perm: 'createTask', chip: 'chip-teal' },
  { id: 'task', label: 'Task', type: 'Task', perm: 'createTask', chip: 'chip-gray' },
  { id: 'bug', label: 'Bug', type: 'Bug', perm: 'createBug', chip: 'chip-red' },
  { id: 'epic', label: 'Epic', type: 'Epic', perm: 'createEpic', chip: 'chip-purple' },
  { id: 'feature', label: 'Feature', type: 'Feature', perm: 'createFeature', chip: 'chip-blue' },
];

export function getVisibleIssueTypes(permissions) {
  return WORK_ITEM_TYPES.filter((t) => permissions?.[t.perm]);
}

export const CREDENTIAL_TEMPLATES = {
  database: {
    label: 'Database',
    fields: [
      { label: 'Host', value: '', secret: false },
      { label: 'Port', value: '', secret: false },
      { label: 'Database', value: '', secret: false },
      { label: 'Username', value: '', secret: false },
      { label: 'Password', value: '', secret: true },
    ],
  },
  lucidchart: {
    label: 'Lucid Chart',
    fields: [
      { label: 'URL', value: '', secret: false },
      { label: 'Email', value: '', secret: false },
      { label: 'Password', value: '', secret: true },
    ],
  },
  loom: {
    label: 'Loom',
    fields: [
      { label: 'URL', value: '', secret: false },
      { label: 'Email', value: '', secret: false },
      { label: 'Password', value: '', secret: true },
    ],
  },
  custom: {
    label: 'Custom',
    fields: [
      { label: 'Label', value: '', secret: false },
      { label: 'Value', value: '', secret: false },
    ],
  },
};

export const prioChip = (prio) =>
  ({
    Critical: 'chip-red',
    High: 'chip-amber',
    Medium: 'chip-blue',
    Low: 'chip-gray',
  })[prio] || 'chip-gray';

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

export function normalizeWorkflowStatus(status) {
  if (!status) return 'Dev Progress';
  if (WORKFLOW_STATUSES.includes(status)) return status;
  return LEGACY_WORKFLOW_STATUS_MAP[status] || 'Dev Progress';
}

export function workflowStatusChip(status) {
  const s = normalizeWorkflowStatus(status);
  return (
    {
      'Dev Progress': 'chip-blue',
      'Dev Completed': 'chip-teal',
      QA: 'chip-amber',
      UAT: 'chip-purple',
      Prod: 'chip-green',
    }[s] || 'chip-gray'
  );
}

export function isWorkflowComplete(status) {
  return normalizeWorkflowStatus(status) === 'Prod';
}

export function isWorkflowInDevProgress(status) {
  return normalizeWorkflowStatus(status) === 'Dev Progress';
}

export function workflowStatusLabel(status) {
  const s = normalizeWorkflowStatus(status);
  return (
    {
      'Dev Progress': 'In Progress',
      'Dev Completed': 'Completed',
      QA: 'QA',
      UAT: 'UAT',
      Prod: 'Completed',
    }[s] || 'In Progress'
  );
}

export function isMyTasksActiveStatus(status) {
  return normalizeWorkflowStatus(status) === 'Dev Progress';
}

export const WORKFLOW_COL_COLORS = {
  'Dev Progress': 'var(--blue)',
  'Dev Completed': 'var(--teal)',
  QA: 'var(--amber)',
  UAT: 'var(--purple)',
  Prod: 'var(--green)',
};

export const sChip = (s) => workflowStatusChip(s);

export const TRAINING_OPTIONS = [
  'AWS Tasks',
  'AI Agents',
  'Testing',
  'Platform KT',
];

export function normalizeTraining(training) {
  if (Array.isArray(training)) return training.filter(Boolean);
  if (typeof training === 'string' && training.trim()) return [training.trim()];
  return [];
}

export const MEMBER_ROLE_OPTIONS = APP_ROLES.filter((r) => r.id !== 'admin').map((r) => [r.id, r.label]);

export function roleLabel(role) {
  const found = APP_ROLES.find((r) => r.id === resolvePermissionRole(role));
  if (found) return found.label;
  return String(role || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

export function roleTitle(role) {
  const found = APP_ROLES.find((r) => r.id === resolvePermissionRole(role));
  return found?.title || roleLabel(role);
}

export function roleChipClass(role) {
  const id = resolvePermissionRole(role);
  if (id === 'teamlead') return 'chip-purple';
  if (id === 'manager') return 'chip-blue';
  if (id === 'tester') return 'chip-amber';
  if (id === 'ba') return 'chip-teal';
  if (id === 'scrummaster') return 'chip-gray';
  if (id === 'admin') return 'chip-blue';
  return 'chip-teal';
}

export const REPORTS_TO_ROLE_IDS = ['admin', 'manager', 'teamlead', 'scrummaster'];

export const MEMBER_STATUS_OPTIONS = ['Active', 'On Leave', 'Inactive'];

export const uById = (users, id) => (id ? users.find((u) => u.id === id) : null);

export function resolveReportedBy(users, reportsToId) {
  return uById(users, reportsToId);
}

export function findIssueInProjects(projects, issueId) {
  for (const project of projects ?? []) {
    const issue = (project.issues ?? []).find((i) => i.id === issueId);
    if (issue) return { project, issue };
  }
  return null;
}

export function getSubtasks(project, parentId) {
  if (!project || !parentId) return [];
  return (project.issues ?? []).filter((i) => i.parentId === parentId);
}

export function getParentIssue(project, issue) {
  if (!issue?.parentId || !project) return null;
  return (project.issues ?? []).find((i) => i.id === issue.parentId) || null;
}

export function sortIssuesWithSubtasks(issues) {
  const list = issues ?? [];
  const parents = list.filter((i) => !i.parentId);
  const rows = [];
  for (const parent of parents) {
    rows.push(parent);
    list.filter((i) => i.parentId === parent.id).forEach((child) => rows.push(child));
  }
  list
    .filter((i) => i.parentId && !parents.some((p) => p.id === i.parentId))
    .forEach((orphan) => rows.push(orphan));
  return rows;
}

export const issueTypeChip = (type) =>
  ({
    Bug: 'chip-red',
    Feature: 'chip-blue',
    Epic: 'chip-purple',
    Story: 'chip-teal',
    Task: 'chip-gray',
    'Sub-task': 'chip-navy',
  })[type] || 'chip-gray';

export function issuesForSprint(project, sprintNum) {
  if (!project) return [];
  const label = `Sprint ${sprintNum}`;
  return (project.issues ?? []).filter(
    (i) => i.sprint === label || (i.sprint === 'Current Sprint' && sprintNum === project.curSprint)
  );
}

export function sprintCompletion(project, sprintNum) {
  const issues = issuesForSprint(project, sprintNum);
  const done = issues.filter((i) => isWorkflowComplete(i.status)).length;
  const total = issues.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function buildMemberRows(projects, users) {
  const map = new Map();
  const roster = (users ?? []).filter((u) => u.role !== 'admin');

  for (const user of roster) {
    map.set(user.id, { user, projects: [] });
  }

  for (const p of projects ?? []) {
    for (const uid of p.members ?? []) {
      if (!map.has(uid)) {
        const user = uById(users, uid);
        if (!user || user.role === 'admin') continue;
        map.set(uid, { user, projects: [] });
      }

      const assigned = (p.issues ?? []).filter((i) => i.assign === uid && !isWorkflowComplete(i.status)).length;
      const bugs = (p.bugs ?? []).filter((b) => b.assign === uid && !isWorkflowComplete(b.status)).length;

      map.get(uid).projects.push({
        id: p.id,
        name: p.name,
        color: p.color,
        code: p.code,
        assigned,
        bugs,
      });
    }
  }

  return Array.from(map.values())
    .map(({ user, projects: userProjects }) => {
      const totalAssigned = userProjects.reduce((s, pr) => s + pr.assigned, 0);
      const totalBugs = userProjects.reduce((s, pr) => s + pr.bugs, 0);
      const reportedBy = resolveReportedBy(users, user.reportsTo);
      return { user, projects: userProjects, totalAssigned, totalBugs, reportedBy };
    })
    .sort((a, b) => a.user.name.localeCompare(b.user.name));
}

export function buildProjectMemberRows(project, users) {
  if (!project) return [];

  return (project.members ?? [])
    .map((uid) => {
      const user = uById(users, uid);
      if (!user) return null;
      const assigned = (project.issues ?? []).filter((i) => i.assign === uid && !isWorkflowComplete(i.status)).length;
      const bugs = (project.bugs ?? []).filter((b) => b.assign === uid && !isWorkflowComplete(b.status)).length;
      return {
        user,
        projects: [{
          id: project.id,
          name: project.name,
          color: project.color,
          code: project.code,
          assigned,
          bugs,
        }],
        totalAssigned: assigned,
        totalBugs: bugs,
        reportedBy: resolveReportedBy(users, user.reportsTo),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.user.name.localeCompare(b.user.name));
}

export function filterMemberRows(rows, query, users) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(({ user, projects: userProjects }) => {
    if (user.name.toLowerCase().includes(q)) return true;
    if (user.role?.toLowerCase().includes(q)) return true;
    if (user.ini?.toLowerCase().includes(q)) return true;
    const manager = uById(users, user.reportsTo);
    if (manager?.name.toLowerCase().includes(q)) return true;
    return userProjects.some(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  });
}

export const PAGE_TITLES = {
  portfolio: 'Portfolio Overview',
  'my-tasks': 'My Tasks',
  notifications: 'Notifications',
  dashboard: 'Dashboard',
  members: 'Team Members',
  'team-members': 'Team Members',
  'time-tracking': 'Time Tracking',
  'project-team': 'Project Team',
  backlog: 'Product Backlog',
  sprint: 'Sprint Board',
  scrum: 'Scrum & Ceremonies',
  scope: 'Scope & Requirements',
  bugs: 'Bug Tracker',
  deploy: 'Deployment',
  maint: 'Maintenance',
  calendar: 'Calendar',
  reports: 'Reports',
  credentials: 'Project Credentials',
  time: 'Time Spent',
};

export const PROJ_PAGES = [
  'dashboard', 'project-team', 'backlog', 'sprint', 'scrum', 'scope',
  'bugs', 'time', 'deploy', 'credentials', 'maint', 'calendar', 'reports',
];

export const WORKSPACE_PAGES = ['portfolio', 'my-tasks', 'notifications', 'team-members', 'time-tracking'];

export const SIDEBAR_PROJECT_NAV = [
  { path: 'dashboard', label: 'Dashboard' },
  { path: 'project-team', label: 'Project Team' },
  { path: 'backlog', label: 'Backlog', badgeKey: 'backlog' },
  { path: 'sprint', label: 'Sprint Board' },
  { path: 'scrum', label: 'Scrum & Ceremonies' },
  { path: 'scope', label: 'Scope & Reqs' },
  { path: 'bugs', label: 'Bug Tracker', badgeKey: 'bugs', badgeRed: true },
  { path: 'time', label: 'Time Spent' },
  { path: 'deploy', label: 'Deployment' },
  { path: 'credentials', label: 'Credentials' },
  { path: 'maint', label: 'Maintenance' },
  { path: 'calendar', label: 'Calendar' },
  { path: 'reports', label: 'Reports' },
];

export const PROJECT_SECTIONS = [
  { path: 'dashboard', label: 'Overview' },
  { path: 'project-team', label: 'Project Team' },
  { path: 'backlog', label: 'Backlog', badgeKey: 'backlog' },
  { path: 'sprint', label: 'Sprint Board' },
  { path: 'scrum', label: 'Scrum Board' },
  { path: 'scope', label: 'Scope & Requirements' },
  { path: 'bugs', label: 'Defects', badgeKey: 'bugs', badgeRed: true },
  { path: 'time', label: 'Timesheets' },
  { path: 'deploy', label: 'Deployments' },
  { path: 'credentials', label: 'Credentials' },
  { path: 'maint', label: 'Maintenance' },
  { path: 'calendar', label: 'Calendar' },
  { path: 'reports', label: 'Analytics & Reports' },
];

import { Router } from 'express';
import {
  users,
  roleUsers,
  projects,
  notifications,
  findProject,
  findUser,
  interviewStages,
  hrEmployees,
  jobOpenings,
  candidates,
  interviews,
  feedbackForms,
  onboardingNewHires,
  hrDashboardStats,
  pendingApprovals,
  employeeHikes,
  assetTickets,
  aiTools,
  aiSubscriptionRequests,
  aiActiveSubscriptions,
  hikeWorkflows,
  HIKE_REVIEW_CYCLE,
  exitRequests,
  financeSettings,
  chartOfAccounts,
  journalEntries,
  financeInvoices,
  financeExpenses,
  financePayments,
  financeVendors,
  financeBudgets,
  financeDashboard,
  financeCustomers,
  financeQuotes,
  financeSalesOrders,
  financeRecurringInvoices,
  financeDeliveryChallans,
  financePaymentsReceived,
  financeCreditNotes,
  financeEwayBills,
  financeRecurringExpenses,
  financePurchaseOrders,
  financeBills,
  financeRecurringBills,
  financeVendorCredits,
  financeBankAccounts,
  financeBankTransactions,
  financeItems,
  financeTimeEntries,
  financeDocuments,
  financeCurrencyAdjustments,
  financeTransactionLocks,
  financeBulkUpdates,
  financeReportCatalog,
  findJob,
  findCandidate,
  findHrEmployee,
  findInterview,
  findOnboardingHire,
} from '../store.js';
import {
  getEmployeeFinance,
  getEmployeeAssets,
  getEmployeeEmploymentTerms,
  getEmployeePerformance,
  DEFAULT_PORTAL_EMPLOYEE_ID,
  ASSET_TICKET_TYPES,
  ASSET_TICKET_CATEGORIES,
  AI_TOOLS,
  findAiTool,
  EXIT_REASONS,
  formatPayPeriodLabel,
} from '../data/hrSeed.js';
import {
  buildLedgerLines,
  EXPENSE_CATEGORIES,
  expenseCategoryLabel,
  normalizeExpenseCategory,
  nextEntryNo,
  nextInvoiceNo,
} from '../data/financeSeed.js';
import { buildFullFinanceReports, buildFinanceDashboard } from '../data/financeReports.js';

const router = Router();

function parseMemberName(name) {
  const fullName = String(name || '').trim();
  if (!fullName) return null;
  const parts = fullName.split(/\s+/);
  const first = parts[0];
  const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
  const ini = last
    ? `${first[0]}${last[0]}`.toUpperCase()
    : first.slice(0, 2).toUpperCase().padEnd(2, first[0].toUpperCase());
  return { fullName, first, last, ini };
}

function buildMemberEmail(firstName, lastName) {
  const first = String(firstName || '').trim().toLowerCase();
  const last = String(lastName || '').trim().toLowerCase().replace(/\./g, '');
  if (!first) return '';
  if (!last) return `${first}@almsphere.io`;
  return `${first}.${last}@almsphere.io`;
}

function normalizeRole(role) {
  const key = String(role || 'developer').toLowerCase().trim();
  const map = {
    admin: 'admin',
    manager: 'manager',
    'project manager': 'manager',
    pm: 'manager',
    teamlead: 'teamlead',
    'team lead': 'teamlead',
    developer: 'developer',
    tester: 'tester',
    qa: 'tester',
    'qa engineer': 'tester',
    ba: 'ba',
    'business analyst': 'ba',
    analyst: 'ba',
    scrummaster: 'scrummaster',
    'scrum master': 'scrummaster',
    devops: 'scrummaster',
    'devops engineer': 'scrummaster',
    designer: 'developer',
  };
  return map[key] || key.replace(/\s+/g, '');
}

function normalizeTraining(training) {
  if (Array.isArray(training)) return [...new Set(training.filter(Boolean))];
  if (typeof training === 'string' && training.trim()) return [training.trim()];
  return [];
}

function createTeamMember(body) {
  const { name, firstName, lastName, role, projectIds, reportsTo, training, status, ontime } = body;
  const parsed =
    name !== undefined
      ? parseMemberName(name)
      : firstName?.trim() && lastName?.trim()
        ? parseMemberName(`${firstName.trim()} ${lastName.trim()}`)
        : null;
  if (!parsed) return null;

  const u = {
    id: 'u' + Date.now(),
    name: parsed.fullName,
    ini: parsed.ini,
    role: normalizeRole(role),
    email: buildMemberEmail(parsed.first, parsed.last),
    c: 'c' + ((users.length % 8) + 1),
    tasks: 0,
    bugs: 0,
    ontime: Number.isFinite(Number(ontime)) ? Math.min(100, Math.max(0, Number(ontime))) : 100,
    status: status || 'Active',
    reportsTo,
    training: normalizeTraining(training),
  };
  users.push(u);

  const ids = Array.isArray(projectIds) ? [...new Set(projectIds.filter(Boolean))] : [];
  for (const pid of ids) {
    const p = findProject(pid);
    if (p) {
      if (!p.members) p.members = [];
      if (!p.members.includes(u.id)) p.members.push(u.id);
    }
  }

  return u;
}

function syncUserProjects(userId, projectIds) {
  projects.forEach((p) => {
    p.members = (p.members ?? []).filter((id) => id !== userId);
  });
  for (const pid of projectIds ?? []) {
    const p = findProject(pid);
    if (p) {
      if (!p.members) p.members = [];
      if (!p.members.includes(userId)) p.members.push(userId);
    }
  }
}

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/users', (_req, res) => {
  const admin = roleUsers.admin;
  const list =
    admin && !users.some((u) => u.id === admin.id) ? [admin, ...users] : users;
  res.json(list);
});

router.patch('/users/:userId', (req, res) => {
  const u = findUser(req.params.userId);
  if (!u) return res.status(404).json({ error: 'User not found' });
  const { name, firstName, lastName, role, status, reportsTo, training, ontime, projectIds } = req.body;
  if (name !== undefined) {
    const parsed = parseMemberName(name);
    if (!parsed) return res.status(400).json({ error: 'Name required' });
    u.name = parsed.fullName;
    u.ini = parsed.ini;
    u.email = buildMemberEmail(parsed.first, parsed.last);
  } else if (firstName !== undefined && lastName !== undefined) {
    const fn = String(firstName).trim();
    const ln = String(lastName).trim();
    if (!fn || !ln) return res.status(400).json({ error: 'Name required' });
    u.name = `${fn} ${ln}`;
    u.ini = `${fn[0]}${ln[0]}`.toUpperCase();
    u.email = buildMemberEmail(fn, ln);
  }
  if (role !== undefined) u.role = normalizeRole(role);
  if (status !== undefined) u.status = String(status).trim();
  if (reportsTo !== undefined) {
    if (!reportsTo) return res.status(400).json({ error: 'Reported By required' });
    u.reportsTo = reportsTo;
  }
  if (training !== undefined) u.training = normalizeTraining(training);
  if (ontime !== undefined) {
    u.ontime = Math.min(100, Math.max(0, Number(ontime) || 0));
  }
  if (projectIds !== undefined) syncUserProjects(u.id, projectIds);
  res.json(u);
});

router.delete('/users/:userId', (req, res) => {
  const idx = users.findIndex((u) => u.id === req.params.userId);
  if (idx < 0) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  projects.forEach((p) => {
    p.members = (p.members ?? []).filter((id) => id !== req.params.userId);
  });
  res.json({ ok: true });
});

router.post('/users', (req, res) => {
  if (!req.body.reportsTo) return res.status(400).json({ error: 'Reported By required' });
  const u = createTeamMember(req.body);
  if (!u) return res.status(400).json({ error: 'Name required' });
  res.status(201).json(u);
});

router.post('/auth/login', (req, res) => {
  const { role } = req.body;
  if (!roleUsers[role]) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  res.json({ role, user: roleUsers[role] });
});

router.get('/projects', (_req, res) => res.json(projects));

router.get('/projects/:id', (req, res) => {
  const project = findProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/projects', (req, res) => {
  const { name, clientName, desc, start, end, spDur, method, pmId, phase, teamLeadId, scopeDocs } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const validPhases = ['mock', 'ba', 'development', 'completed'];
  const projectPhase = validPhases.includes(phase) ? phase : 'mock';
  const docs = Array.isArray(scopeDocs)
    ? scopeDocs
        .filter((d) => d?.name)
        .map((d) => ({
          name: String(d.name).trim(),
          size: d.size || 0,
          added: d.added || new Date().toISOString().slice(0, 10),
        }))
    : [];
  if (!docs.length) return res.status(400).json({ error: 'At least one scope document required' });
  const code = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  const colors = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];
  const pm = findUser(pmId);
  const teamLead = findUser(teamLeadId);
  const memberIds = new Set(users.map((u) => u.id));
  if (pmId) memberIds.add(pmId);
  if (teamLeadId) memberIds.add(teamLeadId);
  const np = {
    id: 'p' + Date.now(),
    name: name.trim(),
    clientName: clientName?.trim() || '',
    code,
    color: colors[projects.length % colors.length],
    status: 'ontrack',
    phase: projectPhase,
    progress: 0,
    health: 100,
    desc: desc || 'New project',
    start: start || '',
    end: end || '',
    spDur: spDur || '2 weeks',
    curSprint: 1,
    totalSprints: 10,
    method: method || 'Scrum',
    pm: pm?.name || '—',
    teamLead: teamLead?.name || '—',
    teamLeadId: teamLeadId || '',
    scopeDocs: docs,
    members: [...memberIds],
    spGoal: 'Define sprint goal',
    sprints: [{ num: 1, name: 'Sprint 1', start: 'TBD', end: 'TBD', status: 'planned' }],
    issues: [],
    bugs: [],
    testCases: [],
    testScenarios: [],
    developerScope: { mockUrl: '', uiUxUrl: '', techStack: [] },
    scopeSheets: { client: [], tester: [], developer: [] },
    customScopeSections: [],
    hiddenScopeSections: [],
    requirements: { fr: [], nfr: [] },
    tickets: [],
    techDebt: [],
    releases: [],
    credentials: [],
    epics: [],
  };
  projects.push(np);
  res.status(201).json(np);
});

router.post('/projects/:id/issues', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const {
    title,
    type,
    description,
    prio,
    assign,
    sprint,
    due,
    status,
    reporter,
    labels,
    components,
    fixVersion,
    affectsVersion,
    storyPoints,
    epicLink,
    environment,
    linked,
    comments,
    parentId,
    url,
    message,
  } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  if (parentId) {
    const parent = p.issues.find((i) => i.id === parentId);
    if (!parent) return res.status(400).json({ error: 'Parent issue not found' });
    if (type && type !== 'Sub-task') {
      return res.status(400).json({ error: 'Child issues must be Sub-task type' });
    }
  }
  const issue = {
    id: `${p.code}-${300 + p.issues.length}`,
    title: title.trim(),
    type: parentId ? 'Sub-task' : type || 'Task',
    description: description || '',
    prio: prio || 'Medium',
    status: status || 'Dev Progress',
    assign: assign || '',
    reporter: reporter || '',
    sprint: sprint || 'Current Sprint',
    due: due || '',
    labels: labels || '',
    components: components || '',
    fixVersion: fixVersion || '',
    affectsVersion: affectsVersion || '',
    storyPoints: storyPoints || '',
    epicLink: epicLink || '',
    environment: environment || '',
    linked: linked || '',
    parentId: parentId || '',
    url: url?.trim() || '',
    message: message?.trim() || '',
    comments: Array.isArray(comments) ? comments : [],
  };
  p.issues.push(issue);
  res.status(201).json(issue);
});

router.post('/projects/:id/epics', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const {
    epicName,
    title,
    description,
    prio,
    assign,
    status,
    start,
    due,
    color,
    reporter,
    labels,
    comments,
  } = req.body;
  if (!epicName?.trim()) return res.status(400).json({ error: 'Epic name required' });
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  if (!p.epics) p.epics = [];
  const lastEnd = p.epics.reduce((max, e) => Math.max(max, (e.start || 0) + (e.width || 20)), 0);
  const roadmapEpic = {
    name: epicName.trim(),
    stories: 0,
    start: Math.min(lastEnd, 75),
    width: 22,
    status: 'planned',
    color: color || '#2563EB',
  };
  p.epics.push(roadmapEpic);
  const issue = {
    id: `${p.code}-${300 + p.issues.length}`,
    title: title.trim(),
    type: 'Epic',
    epicName: epicName.trim(),
    description: description || '',
    prio: prio || 'Medium',
    status: status || 'Dev Progress',
    assign: assign || '',
    reporter: reporter || '',
    sprint: 'Backlog',
    due: due || '',
    startDate: start || '',
    labels: labels || '',
    epicColor: color || '#2563EB',
    comments: Array.isArray(comments) ? comments : [],
  };
  p.issues.push(issue);
  res.status(201).json({ issue, epic: roadmapEpic });
});

router.patch('/projects/:id/issues/:issueId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const issue = p.issues.find((i) => i.id === req.params.issueId);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  Object.assign(issue, req.body);
  res.json(issue);
});

router.post('/projects/:id/assign', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { issueId, assignId, prio } = req.body;
  if (!assignId) return res.status(400).json({ error: 'Assignee required' });
  if (issueId) {
    const issue = p.issues.find((i) => i.id === issueId);
    if (issue) {
      issue.assign = assignId;
      if (prio) issue.prio = prio;
    }
  }
  const u = findUser(assignId);
  res.json({ ok: true, assignee: u });
});

router.post('/projects/:id/bugs', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const {
    title,
    description,
    url,
    dueTime,
    message,
    sev,
    prio,
    assign,
    linked,
    postpones,
    environment,
    affectsVersion,
    reporter,
    comments,
  } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const bug = {
    id: `BUG-${String(Math.floor(Math.random() * 900) + 100)}`,
    title: title.trim(),
    description: description?.trim() || '',
    url: url?.trim() || '',
    dueTime: dueTime || '',
    message: message?.trim() || '',
    sev: sev || 'Medium',
    prio: prio || 'Medium',
    status: 'Dev Progress',
    assign: assign || '',
    reporter: reporter || '',
    environment: environment || '',
    affectsVersion: affectsVersion || '',
    reported: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    linked: linked || '',
    postpones: !!postpones,
    comments: Array.isArray(comments) ? comments : [],
  };
  p.bugs.push(bug);
  res.status(201).json(bug);
});

router.patch('/projects/:id/bugs/:bugId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const bug = p.bugs.find((b) => b.id === req.params.bugId);
  if (!bug) return res.status(404).json({ error: 'Bug not found' });
  Object.assign(bug, req.body);
  res.json(bug);
});

router.post('/projects/:id/members', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  if (!req.body.reportsTo) return res.status(400).json({ error: 'Reported By required' });
  const projectIds = [
    ...(Array.isArray(req.body.projectIds) ? req.body.projectIds : []),
    req.params.id,
  ];
  const u = createTeamMember({ ...req.body, projectIds });
  if (!u) return res.status(400).json({ error: 'Name required' });
  res.status(201).json(u);
});

router.delete('/projects/:id/members/:userId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const before = (p.members ?? []).length;
  p.members = (p.members ?? []).filter((id) => id !== req.params.userId);
  if (p.members.length === before) {
    return res.status(404).json({ error: 'Member not on this project' });
  }
  res.json({ ok: true });
});

const SCOPE_SHEET_SECTIONS = ['client', 'tester', 'developer'];

const BUILTIN_SCOPE_SECTION_IDS = ['client', 'developer', 'tester'];

const BUILTIN_SCOPE_TITLES = {
  client: 'Client Requirements',
  developer: 'Developer feature list',
  tester: 'Testers Scope',
};

function ensureScopeData(p) {
  if (!p.scopeSheets) p.scopeSheets = { client: [], tester: [], developer: [] };
  if (!p.customScopeSections) p.customScopeSections = [];
  if (!p.hiddenScopeSections) p.hiddenScopeSections = [];
  return p;
}

function customSectionKey(sectionId) {
  return `custom-${sectionId}`;
}

function isValidScopeSection(p, section) {
  ensureScopeData(p);
  if (SCOPE_SHEET_SECTIONS.includes(section)) return true;
  if (section.startsWith('custom-')) {
    const sectionId = section.slice('custom-'.length);
    return p.customScopeSections.some((s) => s.id === sectionId);
  }
  return false;
}

function scopeSheetList(p, section) {
  ensureScopeData(p);
  if (!p.scopeSheets[section]) p.scopeSheets[section] = [];
  return p.scopeSheets[section];
}

router.post('/projects/:id/scope-sections', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { title, description, addedBy, addedByName } = req.body;
  if (!String(title || '').trim()) return res.status(400).json({ error: 'Section title required' });
  ensureScopeData(p);
  const section = {
    id: `scope-${Date.now()}`,
    title: String(title).trim(),
    description: String(description || '').trim(),
    addedBy: addedBy || '',
    addedByName: addedByName || '',
    addedAt: new Date().toISOString().slice(0, 10),
  };
  p.customScopeSections.push(section);
  p.scopeSheets[customSectionKey(section.id)] = [];
  res.status(201).json(section);
});

router.delete('/projects/:id/scope-sections/:sectionId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  ensureScopeData(p);
  const sectionId = req.params.sectionId;

  if (BUILTIN_SCOPE_SECTION_IDS.includes(sectionId)) {
    if (!p.hiddenScopeSections.includes(sectionId)) {
      p.hiddenScopeSections.push(sectionId);
    }
    p.scopeSheets[sectionId] = [];
    if (sectionId === 'developer') {
      p.developerScope = { mockUrl: '', uiUxUrl: '', techStack: [] };
    }
    return res.json({
      ok: true,
      removed: { id: sectionId, title: BUILTIN_SCOPE_TITLES[sectionId] },
    });
  }

  const idx = p.customScopeSections.findIndex((s) => s.id === sectionId);
  if (idx < 0) return res.status(404).json({ error: 'Section not found' });
  const [removed] = p.customScopeSections.splice(idx, 1);
  delete p.scopeSheets[customSectionKey(sectionId)];
  res.json({ ok: true, removed });
});

router.post('/projects/:id/scope-sheets/:section', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const section = req.params.section;
  if (!isValidScopeSection(p, section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  const { title, date, name, size, description, contentType, addedBy, addedByName } = req.body;
  if (!String(title || '').trim()) return res.status(400).json({ error: 'Title required' });
  const desc = String(description || '').trim();
  const fileName = String(name || '').trim();
  if (!fileName && !desc) {
    return res.status(400).json({ error: 'Description or file required' });
  }
  const kind = ['file', 'text', 'recording'].includes(contentType) ? contentType : fileName ? 'file' : 'text';
  const sheet = {
    id: 'scs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: String(title || fileName).trim(),
    date: date || new Date().toISOString().slice(0, 10),
    name: fileName || (kind === 'text' ? '' : kind === 'recording' ? '' : ''),
    size: size || 0,
    description: desc,
    contentType: kind,
    addedBy: addedBy || '',
    addedByName: addedByName || '',
  };
  scopeSheetList(p, section).push(sheet);
  res.status(201).json(sheet);
});

router.patch('/projects/:id/scope-sheets/:section/:sheetId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const section = req.params.section;
  if (!isValidScopeSection(p, section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  const list = scopeSheetList(p, section);
  const sheet = list.find((s) => s.id === req.params.sheetId);
  if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
  const { title, date, description, updatedBy, updatedByName } = req.body;
  if (title !== undefined) sheet.title = String(title).trim() || sheet.title;
  if (date !== undefined) sheet.date = date;
  if (description !== undefined) sheet.description = String(description).trim();
  if (updatedByName) {
    sheet.updatedBy = updatedBy || '';
    sheet.updatedByName = updatedByName;
    sheet.updatedAt = new Date().toISOString().slice(0, 10);
  }
  res.json(sheet);
});

router.delete('/projects/:id/scope-sheets/:section/:sheetId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const section = req.params.section;
  if (!isValidScopeSection(p, section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  const list = scopeSheetList(p, section);
  const idx = list.findIndex((s) => s.id === req.params.sheetId);
  if (idx < 0) return res.status(404).json({ error: 'Sheet not found' });
  list.splice(idx, 1);
  res.json({ ok: true });
});

router.patch('/projects/:id/developer-scope', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  if (!p.developerScope) {
    p.developerScope = { mockUrl: '', uiUxUrl: '', techStack: [] };
  }
  const { mockUrl, uiUxUrl, techStack, updatedBy, updatedByName } = req.body;
  const stamp = new Date().toISOString().slice(0, 10);
  const audit = {
    updatedBy: updatedBy || '',
    updatedByName: updatedByName || '',
    updatedAt: stamp,
  };
  if (mockUrl !== undefined || uiUxUrl !== undefined) {
    if (mockUrl !== undefined) p.developerScope.mockUrl = String(mockUrl).trim();
    if (uiUxUrl !== undefined) p.developerScope.uiUxUrl = String(uiUxUrl).trim();
    p.developerScope.linksMeta = { ...audit };
  }
  if (techStack !== undefined) {
    p.developerScope.techStack = Array.isArray(techStack)
      ? techStack.map((t) => String(t).trim()).filter(Boolean)
      : [];
    p.developerScope.techStackMeta = { ...audit };
  }
  res.json(p.developerScope);
});

router.post('/projects/:id/requirements', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { title, type, prio } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const arr = type === 'FR' ? p.requirements.fr : p.requirements.nfr;
  const reqItem = {
    id: `${type}-${String(arr.length + 1).padStart(3, '0')}`,
    title: title.trim(),
    prio: prio || 'Must Have',
    status: 'Planned',
  };
  arr.push(reqItem);
  res.status(201).json(reqItem);
});

router.post('/projects/:id/test-cases', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { title, suite, type, assign, linked } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const tc = {
    id: `TC-${p.code}-${String(p.testCases.length + 1100)}`,
    suite: suite || 'General',
    scene: title.trim(),
    type: type || 'Automated',
    result: 'Skip',
    assign: assign || '',
    exec: 'Pending',
    linked: linked || '',
  };
  p.testCases.push(tc);
  res.status(201).json(tc);
});

router.patch('/projects/:id/test-cases/:tcId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const tc = p.testCases.find((t) => t.id === req.params.tcId);
  if (!tc) return res.status(404).json({ error: 'Test case not found' });
  Object.assign(tc, req.body);
  res.json(tc);
});

router.post('/projects/:id/credentials', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { type, name, fields, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  if (!Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: 'At least one field required' });
  }
  const cred = {
    id: 'cred-' + Date.now(),
    type: type || 'custom',
    name: name.trim(),
    notes: notes?.trim() || '',
    updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fields: fields.map((f) => ({
      label: String(f.label || '').trim() || 'Field',
      value: String(f.value ?? ''),
      secret: !!f.secret,
    })),
  };
  if (!p.credentials) p.credentials = [];
  p.credentials.push(cred);
  res.status(201).json(cred);
});

router.patch('/projects/:id/credentials/:credId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const cred = (p.credentials ?? []).find((c) => c.id === req.params.credId);
  if (!cred) return res.status(404).json({ error: 'Credential not found' });
  const { type, name, fields, notes } = req.body;
  if (name !== undefined) cred.name = String(name).trim();
  if (type !== undefined) cred.type = type;
  if (notes !== undefined) cred.notes = String(notes).trim();
  if (fields !== undefined) {
    cred.fields = fields.map((f) => ({
      label: String(f.label || '').trim() || 'Field',
      value: String(f.value ?? ''),
      secret: !!f.secret,
    }));
  }
  cred.updated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  res.json(cred);
});

router.delete('/projects/:id/credentials/:credId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const idx = (p.credentials ?? []).findIndex((c) => c.id === req.params.credId);
  if (idx < 0) return res.status(404).json({ error: 'Credential not found' });
  p.credentials.splice(idx, 1);
  res.json({ ok: true });
});

function findRelease(p, releaseId) {
  return (p.releases ?? []).find((r) => r.id === releaseId || r.ver === releaseId);
}

router.patch('/projects/:id/releases/:releaseId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const release = findRelease(p, req.params.releaseId);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  const { ver, date, type, changes, status, environment, testCasePct, by } = req.body;
  if (ver !== undefined) release.ver = String(ver).trim();
  if (date !== undefined) release.date = String(date).trim();
  if (type !== undefined) release.type = String(type).trim();
  if (changes !== undefined) release.changes = String(changes).trim();
  if (environment !== undefined) release.environment = String(environment).trim().toLowerCase();
  else if (status !== undefined) {
    const envMap = { Stable: 'prod', Beta: 'qa', Deprecated: 'prod', 'Rolling Out': 'uat' };
    release.environment = envMap[String(status).trim()] || 'prod';
  }
  if (testCasePct !== undefined) {
    const pct = Number(testCasePct);
    release.testCasePct = Number.isFinite(pct) ? Math.min(100, Math.max(0, Math.round(pct))) : 0;
  }
  if (by !== undefined) release.by = String(by).trim();
  if (release.status) delete release.status;
  if (!release.id) release.id = 'rel-' + Date.now();
  res.json(release);
});

router.delete('/projects/:id/releases/:releaseId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const idx = (p.releases ?? []).findIndex(
    (r) => r.id === req.params.releaseId || r.ver === req.params.releaseId
  );
  if (idx < 0) return res.status(404).json({ error: 'Release not found' });
  p.releases.splice(idx, 1);
  res.json({ ok: true });
});

router.post('/projects/:id/tickets', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { title, description, prio, assign } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const ticket = {
    id: `SUP-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    description: description?.trim() || '',
    prio: (prio || 'P3').split(' ')[0],
    status: 'Dev Progress',
    age: 'Just now',
    assign: assign || '',
  };
  if (!p.tickets) p.tickets = [];
  p.tickets.push(ticket);
  res.status(201).json(ticket);
});

router.patch('/projects/:id/tickets/:ticketId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const ticket = (p.tickets || []).find((t) => t.id === req.params.ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { title, description, prio, status, assign } = req.body;
  if (title !== undefined) ticket.title = String(title).trim();
  if (description !== undefined) ticket.description = String(description).trim();
  if (prio !== undefined) ticket.prio = String(prio).split(' ')[0];
  if (status !== undefined) ticket.status = status;
  if (assign !== undefined) ticket.assign = assign;
  res.json(ticket);
});

router.get('/notifications', (_req, res) => res.json(notifications));

router.post('/notifications', (req, res) => {
  const n = {
    id: 'n' + Date.now(),
    text: req.body.text,
    time: req.body.time || 'Just now',
    read: false,
    type: req.body.type || 'task',
  };
  notifications.unshift(n);
  res.status(201).json(n);
});

router.patch('/notifications/read-all', (_req, res) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ ok: true });
});

function ensureTimeLogs(project) {
  if (!project.timeLogs) project.timeLogs = [];
  return project.timeLogs;
}

function logLocalDate(iso = new Date().toISOString()) {
  return String(iso).slice(0, 10);
}

function parseLocalDateTime(dateStr, timeStr) {
  const [hours, minutes] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function findActiveTimeLog(userId) {
  for (const p of projects) {
    const active = (p.timeLogs || []).find((l) => l.userId === userId && !l.endedAt);
    if (active) return { project: p, log: active };
  }
  return null;
}

router.post('/projects/:id/time-logs', (req, res) => {
  const project = findProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { userId, targetType, targetId, date, startTime, endTime } = req.body;
  if (!userId || !targetType || !targetId || !date || !startTime || !endTime) {
    return res.status(400).json({
      error: 'userId, targetType, targetId, date, startTime, and endTime are required',
    });
  }
  if (!['issue', 'bug'].includes(targetType)) {
    return res.status(400).json({ error: 'targetType must be issue or bug' });
  }
  const user = findUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (targetType === 'issue' && !(project.issues || []).some((i) => i.id === targetId)) {
    return res.status(404).json({ error: 'Issue not found in project' });
  }
  if (targetType === 'bug' && !(project.bugs || []).some((b) => b.id === targetId)) {
    return res.status(404).json({ error: 'Bug not found in project' });
  }
  const start = parseLocalDateTime(String(date).slice(0, 10), startTime);
  const end = parseLocalDateTime(String(date).slice(0, 10), endTime);
  if (!start || !end) return res.status(400).json({ error: 'Invalid start or end time' });
  if (end <= start) return res.status(400).json({ error: 'End time must be after start time' });
  const durationMinutes = Math.max(1, Math.round((end - start) / 60000));
  const log = {
    id: `tl-${Date.now()}`,
    userId,
    targetType,
    targetId,
    startedAt: start.toISOString(),
    endedAt: end.toISOString(),
    date: String(date).slice(0, 10),
    durationMinutes,
  };
  ensureTimeLogs(project).push(log);
  res.status(201).json(log);
});

router.post('/projects/:id/time-logs/start', (req, res) => {
  const project = findProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { userId, targetType, targetId } = req.body;
  if (!userId || !targetType || !targetId) {
    return res.status(400).json({ error: 'userId, targetType, and targetId are required' });
  }
  if (!['issue', 'bug'].includes(targetType)) {
    return res.status(400).json({ error: 'targetType must be issue or bug' });
  }
  const user = findUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const existing = findActiveTimeLog(userId);
  if (existing) {
    return res.status(400).json({
      error: `Timer already running on ${existing.log.targetId}. Stop it before starting another.`,
    });
  }
  if (targetType === 'issue' && !(project.issues || []).some((i) => i.id === targetId)) {
    return res.status(404).json({ error: 'Issue not found in project' });
  }
  if (targetType === 'bug' && !(project.bugs || []).some((b) => b.id === targetId)) {
    return res.status(404).json({ error: 'Bug not found in project' });
  }
  const startedAt = new Date().toISOString();
  const log = {
    id: `tl-${Date.now()}`,
    userId,
    targetType,
    targetId,
    startedAt,
    endedAt: null,
    date: logLocalDate(startedAt),
    durationMinutes: 0,
  };
  ensureTimeLogs(project).push(log);
  res.status(201).json(log);
});

router.post('/projects/:id/time-logs/stop', (req, res) => {
  const project = findProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const active = (project.timeLogs || []).find((l) => l.userId === userId && !l.endedAt);
  if (!active) return res.status(404).json({ error: 'No active timer for this user in this project' });
  active.endedAt = new Date().toISOString();
  const ms = new Date(active.endedAt) - new Date(active.startedAt);
  active.durationMinutes = Math.max(1, Math.round(ms / 60000));
  res.json(active);
});

function ceremonyList(project) {
  if (!project.ceremonies) project.ceremonies = [];
  return project.ceremonies;
}

router.post('/projects/:id/ceremonies', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { title, description, icon, startDate, endDate, dailyTime, duration, statusLabel, statusChip } =
    req.body;
  if (!String(title || '').trim()) return res.status(400).json({ error: 'Title required' });
  if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end date required' });
  const ceremony = {
    id: `cer-${Date.now()}`,
    icon: icon || 'planning',
    title: String(title).trim(),
    description: String(description || '').trim(),
    startDate: String(startDate).slice(0, 10),
    endDate: String(endDate).slice(0, 10),
    dailyTime: dailyTime ? String(dailyTime) : '',
    duration: String(duration || '').trim(),
    statusLabel: String(statusLabel || 'Scheduled').trim(),
    statusChip: statusChip || 'chip-blue',
  };
  ceremonyList(p).push(ceremony);
  res.status(201).json(ceremony);
});

router.patch('/projects/:id/ceremonies/:ceremonyId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const ceremony = ceremonyList(p).find((c) => c.id === req.params.ceremonyId);
  if (!ceremony) return res.status(404).json({ error: 'Ceremony not found' });
  const fields = [
    'title',
    'description',
    'icon',
    'startDate',
    'endDate',
    'dailyTime',
    'duration',
    'statusLabel',
    'statusChip',
  ];
  for (const key of fields) {
    if (req.body[key] !== undefined) {
      ceremony[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
    }
  }
  if (!ceremony.title) return res.status(400).json({ error: 'Title required' });
  res.json(ceremony);
});

router.delete('/projects/:id/ceremonies/:ceremonyId', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const list = ceremonyList(p);
  const idx = list.findIndex((c) => c.id === req.params.ceremonyId);
  if (idx < 0) return res.status(404).json({ error: 'Ceremony not found' });
  const [removed] = list.splice(idx, 1);
  res.json({ ok: true, removed });
});

// ——— HR & People ———

function toDashboardPendingAction(item) {
  return {
    id: item.id,
    employee: item.employee,
    ini: item.ini,
    action: item.action,
    urgency: item.urgency === 'urgent' ? 'Urgent' : '',
    due: item.due,
  };
}

router.get('/hr/dashboard', (_req, res) => {
  const pending = pendingApprovals
    .filter((a) => a.status === 'pending')
    .slice(0, 5)
    .map(toDashboardPendingAction);
  res.json({
    stats: {
      ...hrDashboardStats,
      pendingApprovals: pendingApprovals.filter((a) => a.status === 'pending').length,
    },
    employees: hrEmployees,
    pendingActions: pending,
    recentActivity: [
      { id: 'ra1', text: "John's leave request approved", time: '2 hours ago' },
      { id: 'ra2', text: 'Document uploaded: Updated employee handbook', time: 'Yesterday' },
      { id: 'ra3', text: 'Performance review: Q4 reviews initiated', time: '2 days ago' },
    ],
    onLeaveToday: [
      { id: 'ol1', name: 'Alice Brown', ini: 'AB', type: 'Casual Leave' },
      { id: 'ol2', name: 'Bob Wilson', ini: 'BW', type: 'Sick Leave' },
      { id: 'ol3', name: 'Carol Martinez', ini: 'CM', type: 'Earned Leave' },
    ],
    departmentHeadcount: [
      { name: 'Engineering', count: 45, pct: 30 },
      { name: 'Sales', count: 30, pct: 20 },
      { name: 'Marketing', count: 20, pct: 13 },
      { name: 'Operations', count: 25, pct: 17 },
      { name: 'HR & Admin', count: 15, pct: 10 },
      { name: 'Finance', count: 15, pct: 10 },
    ],
  });
});

router.get('/hr/approvals', (req, res) => {
  const { status } = req.query;
  let list = [...pendingApprovals];
  if (status && status !== 'all') {
    list = list.filter((a) => a.status === status);
  }
  res.json(list);
});

router.post('/hr/approvals/approve-all', (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const approved = [];
  for (const item of pendingApprovals) {
    if (item.status === 'pending') {
      item.status = 'approved';
      item.resolvedAt = today;
      approved.push(item);
    }
  }
  res.json({ count: approved.length, items: approved });
});

router.patch('/hr/approvals/:id', (req, res) => {
  const item = pendingApprovals.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Approval not found' });
  const { status, note } = req.body || {};
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  item.status = status;
  if (status !== 'pending') {
    item.resolvedAt = new Date().toISOString().slice(0, 10);
    if (note) item.note = note;
  }
  res.json(item);
});

function managerSummary(emp) {
  if (!emp) return null;
  return { id: emp.id, name: emp.name, ini: emp.ini, role: emp.role, email: emp.email };
}

function getManagerChain(emp) {
  const manager = emp.reportsToId ? findHrEmployee(emp.reportsToId) : null;
  const higherManager = manager?.reportsToId ? findHrEmployee(manager.reportsToId) : null;
  return {
    manager: managerSummary(manager),
    higherManager: managerSummary(higherManager),
  };
}

function findHikeWorkflow(employeeId, cycle = HIKE_REVIEW_CYCLE) {
  return hikeWorkflows.find((w) => w.employeeId === employeeId && w.cycle === cycle);
}

function getOrCreateHikeWorkflow(employeeId, cycle = HIKE_REVIEW_CYCLE) {
  let workflow = findHikeWorkflow(employeeId, cycle);
  if (!workflow) {
    workflow = {
      id: `hw-${employeeId}-${cycle}`,
      employeeId,
      cycle,
      performanceSentAt: null,
      sentTo: { manager: null, higherManager: null },
      hikeId: null,
    };
    hikeWorkflows.push(workflow);
  }
  return workflow;
}

function getHikeWorkflowStage(employeeId, cycle = HIKE_REVIEW_CYCLE) {
  const workflow = findHikeWorkflow(employeeId, cycle);
  const hike = employeeHikes.find((h) => h.employeeId === employeeId && h.cycle === cycle);
  if (hike) return { stage: 'hike-proposed', workflow, hike };
  if (workflow?.performanceSentAt) return { stage: 'ready-for-hike', workflow, hike: null };
  return { stage: 'not-started', workflow: workflow || null, hike: null };
}

function enrichHikeCandidate(emp) {
  const chain = getManagerChain(emp);
  const { stage, workflow, hike } = getHikeWorkflowStage(emp.id);
  const finance = getEmployeeFinance(emp);
  return {
    id: emp.id,
    employeeId: emp.employeeId,
    name: emp.name,
    ini: emp.ini,
    role: emp.role,
    department: emp.department,
    location: emp.location,
    status: emp.status,
    currentSalary: finance.annualSalary,
    manager: chain.manager,
    higherManager: chain.higherManager,
    workflowStage: stage,
    performanceSentAt: workflow?.performanceSentAt || null,
    hike: hike
      ? {
          id: hike.id,
          hikePercent: hike.hikePercent,
          status: hike.status,
          proposedSalary: hike.proposedSalary,
        }
      : null,
  };
}

router.get('/hr/hikes/candidates', (_req, res) => {
  const active = hrEmployees.filter((e) => e.status === 'active');
  const candidates = active.map(enrichHikeCandidate);
  const stats = {
    total: candidates.length,
    notStarted: candidates.filter((c) => c.workflowStage === 'not-started').length,
    readyForHike: candidates.filter((c) => c.workflowStage === 'ready-for-hike').length,
    hikeProposed: candidates.filter((c) => c.workflowStage === 'hike-proposed').length,
    cycle: HIKE_REVIEW_CYCLE,
  };
  res.json({ stats, candidates });
});

router.get('/hr/hikes/review/:employeeId', (req, res) => {
  const emp = findHrEmployee(req.params.employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const chain = getManagerChain(emp);
  const { stage, workflow, hike } = getHikeWorkflowStage(emp.id);
  const performance = getEmployeePerformance(emp);
  const finance = getEmployeeFinance(emp);

  res.json({
    employee: enrichEmployee(emp, true),
    performance,
    finance: { annualSalary: finance.annualSalary, currency: finance.currency || 'INR' },
    managers: chain,
    workflow: {
      cycle: HIKE_REVIEW_CYCLE,
      stage,
      performanceSentAt: workflow?.performanceSentAt || null,
      sentTo: workflow?.sentTo || { manager: null, higherManager: null },
    },
    hike: hike || null,
  });
});

router.post('/hr/hikes/review/:employeeId/send-performance', (req, res) => {
  const emp = findHrEmployee(req.params.employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const chain = getManagerChain(emp);
  if (!chain.manager) {
    return res.status(400).json({ error: 'No reporting manager found for this employee' });
  }

  const workflow = getOrCreateHikeWorkflow(emp.id);
  const today = new Date().toISOString().slice(0, 10);
  workflow.performanceSentAt = today;
  workflow.sentTo = {
    manager: chain.manager,
    higherManager: chain.higherManager,
  };

  res.json({
    workflow: {
      cycle: workflow.cycle,
      stage: 'ready-for-hike',
      performanceSentAt: workflow.performanceSentAt,
      sentTo: workflow.sentTo,
    },
    message: chain.higherManager
      ? `Performance review sent to ${chain.manager.name} and ${chain.higherManager.name}`
      : `Performance review sent to ${chain.manager.name}`,
  });
});

router.get('/hr/hikes', (req, res) => {
  const { status } = req.query;
  let list = [...employeeHikes];
  if (status && status !== 'all') {
    list = list.filter((h) => h.status === status);
  }
  res.json(list);
});

router.post('/hr/hikes', (req, res) => {
  const { employeeId, hikePercent, reason, cycle, effectiveDate, submittedBy } = req.body || {};
  const emp = findHrEmployee(employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const reviewCycle = cycle?.trim() || HIKE_REVIEW_CYCLE;
  const workflow = findHikeWorkflow(emp.id, reviewCycle);
  if (!workflow?.performanceSentAt) {
    return res.status(400).json({
      error: 'Send performance review to managers before assigning a hike percentage',
    });
  }

  const pct = Number(hikePercent);
  if (Number.isNaN(pct) || pct < 0 || pct > 100) {
    return res.status(400).json({ error: 'Hike percent must be between 0 and 100' });
  }
  if (!reason?.trim()) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  const existingPending = employeeHikes.find(
    (h) => h.employeeId === emp.id && h.status === 'pending',
  );
  if (existingPending) {
    return res.status(400).json({
      error: `${emp.name} already has a pending hike request. Edit the existing request instead.`,
    });
  }

  const finance = getEmployeeFinance(emp);
  const currentSalary = finance.annualSalary;
  const proposedSalary = Math.round(currentSalary * (1 + pct / 100));
  const today = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();

  const hike = {
    id: `hk-${Date.now()}`,
    employeeId: emp.id,
    employee: emp.name,
    ini: emp.ini,
    department: emp.department,
    role: emp.role,
    currentSalary,
    proposedSalary,
    hikePercent: pct,
    effectiveDate: effectiveDate?.trim() || `${year}-07-01`,
    reason: reason.trim(),
    cycle: reviewCycle,
    status: 'pending',
    submittedAt: today,
    submittedBy: submittedBy?.trim() || 'HR',
  };

  employeeHikes.unshift(hike);
  workflow.hikeId = hike.id;
  res.status(201).json(hike);
});

router.patch('/hr/hikes/:id', (req, res) => {
  const hike = employeeHikes.find((h) => h.id === req.params.id);
  if (!hike) return res.status(404).json({ error: 'Hike request not found' });
  const { status, rejectionNote, hikePercent, reason } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);

  if (hikePercent != null && hikePercent !== '') {
    const pct = Number(hikePercent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ error: 'Hike percent must be between 0 and 100' });
    }
    hike.hikePercent = pct;
    hike.proposedSalary = Math.round(hike.currentSalary * (1 + pct / 100));
  }

  if (reason != null) {
    hike.reason = String(reason).trim();
  }

  if (status) {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    hike.status = status;
    if (status !== 'pending') {
      hike.resolvedAt = today;
      if (rejectionNote) hike.rejectionNote = rejectionNote;
    }
  }

  if (hikePercent != null || reason != null) {
    hike.updatedAt = today;
  }

  res.json(hike);
});

function resolvePortalEmployeeId(req) {
  return req.query.employeeId || req.body?.employeeId || DEFAULT_PORTAL_EMPLOYEE_ID;
}

function nextAssetTicketNo() {
  const nums = assetTickets.map((t) => parseInt(String(t.ticketNo || '').replace('AST-', ''), 10) || 0);
  return `AST-${Math.max(1000, ...nums) + 1}`;
}

function nextAiRequestNo() {
  const nums = aiSubscriptionRequests.map((r) => parseInt(String(r.requestNo || '').replace('AI-', ''), 10) || 0);
  return `AI-${Math.max(1000, ...nums) + 1}`;
}

function buildAiSubscriptionOverview() {
  const active = aiActiveSubscriptions.filter((s) => s.status === 'active');
  const totalMonthlyCostInr = active.reduce((sum, s) => sum + (s.monthlyCostInr || 0), 0);
  const pendingRequests = aiSubscriptionRequests.filter((r) => r.status === 'pending').length;

  const byToolMap = new Map();
  for (const sub of active) {
    const key = sub.toolId;
    if (!byToolMap.has(key)) {
      byToolMap.set(key, {
        toolId: sub.toolId,
        toolName: sub.toolName,
        vendor: sub.vendor,
        employeeCount: 0,
        monthlyCostInr: 0,
      });
    }
    const row = byToolMap.get(key);
    row.employeeCount += 1;
    row.monthlyCostInr += sub.monthlyCostInr || 0;
  }

  const byEmployeeMap = new Map();
  for (const sub of active) {
    if (!byEmployeeMap.has(sub.employeeId)) {
      byEmployeeMap.set(sub.employeeId, {
        employeeId: sub.employeeId,
        employee: sub.employee,
        department: sub.department,
        tools: [],
        totalMonthlyCostInr: 0,
      });
    }
    const row = byEmployeeMap.get(sub.employeeId);
    row.tools.push({
      toolId: sub.toolId,
      toolName: sub.toolName,
      vendor: sub.vendor,
      plan: sub.plan,
      monthlyCostInr: sub.monthlyCostInr,
    });
    row.totalMonthlyCostInr += sub.monthlyCostInr || 0;
  }

  return {
    totalMonthlyCostInr,
    activeSubscriptionCount: active.length,
    pendingRequestCount: pendingRequests,
    byTool: [...byToolMap.values()].sort((a, b) => b.monthlyCostInr - a.monthlyCostInr),
    byEmployee: [...byEmployeeMap.values()].sort((a, b) => b.totalMonthlyCostInr - a.totalMonthlyCostInr),
  };
}

router.get('/employee/portal', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const myTickets = assetTickets.filter((t) => t.employeeId === emp.id);
  const openTickets = myTickets.filter((t) => t.status === 'open' || t.status === 'in-progress');
  const myAiSubs = aiActiveSubscriptions.filter((s) => s.employeeId === emp.id && s.status === 'active');
  const myAiRequests = aiSubscriptionRequests.filter((r) => r.employeeId === emp.id);
  const assets = getEmployeeAssets(emp);
  res.json({
    employee: enrichEmployee(emp, true),
    stats: {
      assignedAssets: assets.length,
      openTickets: openTickets.length,
      resolvedTickets: myTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
      aiSubscriptions: myAiSubs.length,
      pendingAiRequests: myAiRequests.filter((r) => r.status === 'pending').length,
      documents: (emp.documents || []).length,
      exitRequest: exitRequests.find(
        (r) => r.employeeId === emp.id && !['completed', 'withdrawn'].includes(r.status),
      ) || null,
    },
    recentTickets: myTickets.slice(0, 5),
    ticketMeta: { types: ASSET_TICKET_TYPES, categories: ASSET_TICKET_CATEGORIES },
    aiTools: AI_TOOLS,
    exitReasons: EXIT_REASONS,
  });
});

router.patch('/employee/profile', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { phone, location, bio, skills } = req.body || {};
  if (phone != null) emp.phone = String(phone).trim();
  if (location != null) emp.location = String(location).trim();
  if (bio != null) emp.bio = String(bio).trim();
  if (skills != null) {
    emp.skills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : String(skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  }

  res.json(enrichEmployee(emp, true));
});

router.get('/employee/colleagues', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const colleagues = hrEmployees
    .filter((e) => e.id !== emp.id && e.status === 'active')
    .map((e) => ({
      id: e.id,
      name: e.name,
      ini: e.ini,
      role: e.role,
      department: e.department,
      location: e.location,
      joinedAt: e.joinedAt,
      employmentType: e.employmentType,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json(colleagues);
});

router.get('/employee/payslips', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const finance = getEmployeeFinance(emp);
  res.json(finance.payslips || []);
});

router.get('/employee/dates', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const enriched = enrichEmployee(emp, true);
  const terms = enriched.employmentTerms;
  res.json({
    employeeId: emp.id,
    name: emp.name,
    joinedAt: emp.joinedAt,
    tenure: enriched.tenure,
    employmentType: emp.employmentType,
    probation: terms?.probation,
    bond: terms?.bond,
    lastReviewDate: enriched.performance?.lastReviewDate,
    nextReviewDate: enriched.performance?.nextReviewDate,
  });
});

router.get('/employee/documents', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp.documents || []);
});

router.post('/employee/documents', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const incoming = normalizeEmployeeDocuments(req.body.documents);
  if (!incoming.length) {
    return res.status(400).json({ error: 'At least one document is required' });
  }
  if (!Array.isArray(emp.documents)) emp.documents = [];
  emp.documents.push(...incoming);
  res.status(201).json(emp.documents);
});

function nextExitTicketNo() {
  const nums = exitRequests.map((r) => parseInt(String(r.ticketNo || '').replace('EXT-', ''), 10) || 0);
  return `EXT-${Math.max(1000, ...nums) + 1}`;
}

router.get('/employee/exit-requests', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const list = exitRequests
    .filter((r) => r.employeeId === emp.id)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json(list);
});

router.post('/employee/exit-requests', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const open = exitRequests.find(
    (r) => r.employeeId === emp.id && !['completed', 'withdrawn'].includes(r.status),
  );
  if (open) {
    return res.status(400).json({ error: 'You already have an active exit request' });
  }

  const { reason, lastWorkingDay, noticePeriodDays, notes } = req.body || {};
  if (!reason?.trim() || !lastWorkingDay?.trim()) {
    return res.status(400).json({ error: 'Reason and last working day are required' });
  }

  const assets = getEmployeeAssets(emp);
  const today = new Date().toISOString().slice(0, 10);
  const request = {
    id: `ex-${Date.now()}`,
    ticketNo: nextExitTicketNo(),
    employeeId: emp.id,
    employee: emp.name,
    ini: emp.ini,
    department: emp.department,
    role: emp.role,
    email: emp.email,
    reason: reason.trim(),
    notes: notes?.trim() || '',
    lastWorkingDay: lastWorkingDay.trim(),
    noticePeriodDays: Number(noticePeriodDays) || 30,
    status: 'submitted',
    submittedAt: today,
    assignedAssetsCount: assets.length,
    assetsSubmitted: false,
    assetsSubmittedAt: null,
    assetsReturnedCount: 0,
    hrNotes: '',
    clearedBy: '',
  };

  exitRequests.unshift(request);
  res.status(201).json(request);
});

router.patch('/employee/exit-requests/:id', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const request = exitRequests.find((r) => r.id === req.params.id && r.employeeId === emp.id);
  if (!request) return res.status(404).json({ error: 'Exit request not found' });

  const { assetsSubmitted, assetsReturnedCount } = req.body || {};
  if (assetsSubmitted) {
    if (request.status !== 'approved') {
      return res.status(400).json({
        error: 'Asset return is available only after HR approves your resignation',
      });
    }
    request.assetsSubmitted = true;
    request.assetsSubmittedAt = new Date().toISOString().slice(0, 10);
    request.assetsReturnedCount = Number(assetsReturnedCount) || request.assignedAssetsCount;
  }

  res.json(request);
});

router.get('/hr/exit-requests', (req, res) => {
  const { status } = req.query;
  let list = [...exitRequests];
  if (status === 'asset-pending') {
    list = list.filter((r) => r.status === 'approved' && !r.assetsSubmitted);
  } else if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }
  list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json(list);
});

router.patch('/hr/exit-requests/:id', (req, res) => {
  const request = exitRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Exit request not found' });

  const { status, assetsSubmitted, assetsReturnedCount, hrNotes, clearedBy } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);

  if (status && ['submitted', 'in-review', 'approved', 'completed', 'withdrawn'].includes(status)) {
    request.status = status;
    if (status === 'approved') {
      request.approvedAt = request.approvedAt || today;
    }
    if (status === 'completed') {
      const emp = findHrEmployee(request.employeeId);
      if (emp) emp.status = 'inactive';
    }
  }
  if (assetsSubmitted != null) {
    request.assetsSubmitted = Boolean(assetsSubmitted);
    if (request.assetsSubmitted) {
      request.assetsSubmittedAt = request.assetsSubmittedAt || today;
    }
  }
  if (assetsReturnedCount != null) {
    request.assetsReturnedCount = Number(assetsReturnedCount) || 0;
  }
  if (hrNotes != null) request.hrNotes = String(hrNotes).trim();
  if (clearedBy) request.clearedBy = clearedBy;

  res.json(request);
});

router.get('/hr/asset-tickets', (req, res) => {
  const { status } = req.query;
  let list = [...assetTickets];
  if (status && status !== 'all') {
    list = list.filter((t) => t.status === status);
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.patch('/hr/asset-tickets/:id', (req, res) => {
  const ticket = assetTickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { status, assignedTo, resolution, hrNotes, priority } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];

  if (status != null) {
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    ticket.status = status;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = ticket.resolvedAt || today;
    }
    if (status === 'open' || status === 'in-progress') {
      ticket.resolvedAt = '';
    }
  }

  if (assignedTo != null) ticket.assignedTo = String(assignedTo).trim();
  if (resolution != null) ticket.resolution = String(resolution).trim();
  if (hrNotes != null) ticket.hrNotes = String(hrNotes).trim();
  if (priority != null && ['low', 'medium', 'high'].includes(priority)) {
    ticket.priority = priority;
  }

  if (ticket.status === 'in-progress' && !ticket.assignedTo) {
    ticket.assignedTo = 'IT Support';
  }

  ticket.updatedAt = today;
  res.json(ticket);
});

router.get('/employee/assets', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(getEmployeeAssets(emp));
});

router.get('/employee/asset-tickets', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const { status } = req.query;
  let list = assetTickets.filter((t) => t.employeeId === emp.id);
  if (status && status !== 'all') {
    list = list.filter((t) => t.status === status);
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.post('/employee/asset-tickets', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { type, category, subject, description, priority, relatedAssetId, relatedAssetName } = req.body || {};
  if (!type?.trim() || !category?.trim() || !subject?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Type, category, subject, and description are required' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const ticket = {
    id: `at-${Date.now()}`,
    ticketNo: nextAssetTicketNo(),
    employeeId: emp.id,
    employee: emp.name,
    ini: emp.ini,
    type: String(type).trim(),
    category: String(category).trim(),
    subject: String(subject).trim(),
    description: String(description).trim(),
    priority: priority || 'medium',
    status: 'open',
    relatedAssetId: relatedAssetId || '',
    relatedAssetName: relatedAssetName || '',
    createdAt: today,
    updatedAt: today,
    assignedTo: '',
  };

  assetTickets.unshift(ticket);
  res.status(201).json(ticket);
});

router.get('/employee/ai-tools', (_req, res) => {
  res.json([...aiTools]);
});

router.get('/employee/ai-subscriptions', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const subscriptions = aiActiveSubscriptions
    .filter((s) => s.employeeId === emp.id)
    .sort((a, b) => a.toolName.localeCompare(b.toolName));
  const requests = aiSubscriptionRequests
    .filter((r) => r.employeeId === emp.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ subscriptions, requests, tools: AI_TOOLS });
});

router.post('/employee/ai-subscriptions/requests', (req, res) => {
  const emp = findHrEmployee(resolvePortalEmployeeId(req));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { toolId, reason, plan } = req.body || {};
  if (!toolId?.trim() || !reason?.trim()) {
    return res.status(400).json({ error: 'AI tool and business justification are required' });
  }

  const tool = findAiTool(toolId);
  if (!tool) return res.status(400).json({ error: 'Unknown AI tool' });

  const hasActive = aiActiveSubscriptions.some(
    (s) => s.employeeId === emp.id && s.toolId === toolId && s.status === 'active',
  );
  if (hasActive) {
    return res.status(400).json({ error: 'You already have an active subscription for this tool' });
  }

  const hasPending = aiSubscriptionRequests.some(
    (r) => r.employeeId === emp.id && r.toolId === toolId && r.status === 'pending',
  );
  if (hasPending) {
    return res.status(400).json({ error: 'You already have a pending request for this tool' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const selectedPlan = plan?.trim() || tool.plan;
  const request = {
    id: `air-${Date.now()}`,
    requestNo: nextAiRequestNo(),
    employeeId: emp.id,
    employee: emp.name,
    ini: emp.ini,
    department: emp.department || '',
    toolId: tool.id,
    toolName: tool.name,
    vendor: tool.vendor,
    plan: selectedPlan,
    monthlyCostInr: tool.monthlyCostInr,
    billingCycle: tool.billingCycle,
    reason: String(reason).trim(),
    status: 'pending',
    createdAt: today,
    updatedAt: today,
    reviewedAt: '',
    reviewedBy: '',
    hrNotes: '',
    rejectionReason: '',
    subscriptionId: '',
  };

  aiSubscriptionRequests.unshift(request);
  res.status(201).json(request);
});

router.get('/hr/ai-subscriptions/overview', (_req, res) => {
  res.json(buildAiSubscriptionOverview());
});

router.get('/hr/ai-subscriptions/active', (req, res) => {
  const { employeeId, toolId } = req.query;
  let list = [...aiActiveSubscriptions];
  if (employeeId) list = list.filter((s) => s.employeeId === employeeId);
  if (toolId) list = list.filter((s) => s.toolId === toolId);
  list.sort((a, b) => a.employee.localeCompare(b.employee) || a.toolName.localeCompare(b.toolName));
  res.json(list);
});

router.get('/hr/ai-subscriptions/requests', (req, res) => {
  const { status } = req.query;
  let list = [...aiSubscriptionRequests];
  if (status && status !== 'all') list = list.filter((r) => r.status === status);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.patch('/hr/ai-subscriptions/requests/:id', (req, res) => {
  const request = aiSubscriptionRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const { status, hrNotes, rejectionReason, licenseEmail, reviewedBy } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (status != null) {
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    if (status === 'approved' && request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be approved' });
    }
    if (status === 'rejected' && request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be rejected' });
    }
    if (status === 'rejected' && !String(rejectionReason || '').trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    request.status = status;
    request.reviewedAt = today;
    request.reviewedBy = reviewedBy || 'HR Admin';
    request.updatedAt = today;

    if (status === 'approved') {
      const emp = findHrEmployee(request.employeeId);
      const subscription = {
        id: `ais-${Date.now()}`,
        employeeId: request.employeeId,
        employee: request.employee,
        ini: request.ini,
        department: request.department || emp?.department || '',
        toolId: request.toolId,
        toolName: request.toolName,
        vendor: request.vendor,
        plan: request.plan,
        monthlyCostInr: request.monthlyCostInr,
        billingCycle: request.billingCycle,
        status: 'active',
        startDate: today,
        endDate: '',
        requestId: request.id,
        licenseEmail: String(licenseEmail || emp?.email || '').trim(),
        notes: String(hrNotes || '').trim(),
      };
      aiActiveSubscriptions.unshift(subscription);
      request.subscriptionId = subscription.id;
      if (hrNotes != null) request.hrNotes = String(hrNotes).trim();
    }

    if (status === 'rejected') {
      request.rejectionReason = String(rejectionReason).trim();
      if (hrNotes != null) request.hrNotes = String(hrNotes).trim();
    }
  } else {
    if (hrNotes != null) request.hrNotes = String(hrNotes).trim();
    request.updatedAt = today;
  }

  res.json(request);
});

router.patch('/hr/ai-subscriptions/active/:id', (req, res) => {
  const sub = aiActiveSubscriptions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const { status, monthlyCostInr, notes, licenseEmail, endDate } = req.body || {};
  const validStatuses = ['active', 'suspended', 'cancelled'];

  if (status != null) {
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    sub.status = status;
    if (status === 'cancelled' && !sub.endDate) {
      sub.endDate = new Date().toISOString().slice(0, 10);
    }
  }
  if (monthlyCostInr != null) sub.monthlyCostInr = Number(monthlyCostInr) || 0;
  if (notes != null) sub.notes = String(notes).trim();
  if (licenseEmail != null) sub.licenseEmail = String(licenseEmail).trim();
  if (endDate != null) sub.endDate = String(endDate).trim();

  res.json(sub);
});

router.get('/hr/onboarding', (_req, res) => {
  res.json(onboardingNewHires.map(enrichOnboardingHire));
});

router.get('/hr/onboarding/:id', (req, res) => {
  const hire = findOnboardingHire(req.params.id);
  if (!hire) return res.status(404).json({ error: 'Onboarding record not found' });
  res.json(enrichOnboardingHire(hire));
});

router.post('/hr/onboarding', (req, res) => {
  const {
    name,
    role,
    department,
    email,
    phone,
    location,
    joiningDate,
    reportingToId,
    notes,
    onboardingBuddyId,
  } = req.body;

  if (!name?.trim() || !role?.trim() || !department?.trim() || !joiningDate) {
    return res.status(400).json({ error: 'Name, role, department, and joining date are required' });
  }

  const parsed = parseEmployeeName(name);
  const tasks = defaultPreJoiningTasks();
  const hire = {
    id: `onb-${Date.now()}`,
    name: parsed.fullName,
    ini: parsed.ini,
    role: String(role).trim(),
    department: String(department).trim(),
    email: email?.trim() || '',
    phone: phone?.trim() || '',
    location: location?.trim() || 'Hyderabad',
    joiningDate,
    reportingToId: reportingToId || '',
    onboardingBuddyId: onboardingBuddyId || '',
    status: 'upcoming',
    notes: notes?.trim() || '',
    tasks,
    preJoiningTasks: {
      completed: tasks.filter((t) => t.done).length,
      total: tasks.length,
    },
  };

  onboardingNewHires.push(hire);
  res.status(201).json(enrichOnboardingHire(hire));
});

router.patch('/hr/onboarding/:id', (req, res) => {
  const hire = findOnboardingHire(req.params.id);
  if (!hire) return res.status(404).json({ error: 'Onboarding record not found' });

  const { taskId, checklistId, done } = req.body;

  if (taskId && Array.isArray(hire.tasks)) {
    const task = hire.tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.done = Boolean(done);
    hire.preJoiningTasks = {
      completed: hire.tasks.filter((t) => t.done).length,
      total: hire.tasks.length,
    };
  }

  if (checklistId && Array.isArray(hire.checklist)) {
    const item = hire.checklist.find((c) => c.id === checklistId);
    if (!item) return res.status(404).json({ error: 'Checklist item not found' });
    item.done = Boolean(done);
    hire.progress = Math.round(
      (hire.checklist.filter((c) => c.done).length / hire.checklist.length) * 100,
    );
  }

  res.json(enrichOnboardingHire(hire));
});

function enrichOnboardingHire(h) {
  const prerequisites = getPrerequisitesSummary(h);
  return {
    ...h,
    reportingTo: findHrEmployee(h.reportingToId)?.name || '—',
    onboardingBuddy: h.onboardingBuddyId ? findHrEmployee(h.onboardingBuddyId)?.name : null,
    prerequisites,
  };
}

function getPrerequisitesSummary(hire) {
  if (hire.status !== 'upcoming' || !Array.isArray(hire.tasks) || !hire.tasks.length) {
    return null;
  }
  const completed = hire.tasks.filter((t) => t.done).length;
  const total = hire.tasks.length;
  const pendingTasks = hire.tasks.filter((t) => !t.done);
  const ready = completed === total;
  let status = 'in-progress';
  let label = 'In Progress';
  if (ready) {
    status = 'ready';
    label = 'Ready to Join';
  } else if (completed === 0) {
    status = 'pending';
    label = 'Not Started';
  }
  return {
    status,
    label,
    completed,
    total,
    ready,
    percent: Math.round((completed / total) * 100),
    pendingTasks,
  };
}

function defaultPreJoiningTasks() {
  const ts = Date.now();
  return [
    { id: `t-${ts}-1`, label: 'Send offer letter', done: false, owner: 'HR', description: 'Signed offer letter shared with the candidate' },
    { id: `t-${ts}-2`, label: 'Collect documents', done: false, owner: 'HR', description: 'ID proof, address proof, and education certificates' },
    { id: `t-${ts}-3`, label: 'IT equipment request', done: false, owner: 'HR', description: 'Laptop and access credentials requested from IT' },
    { id: `t-${ts}-4`, label: 'Background verification', done: false, owner: 'HR', description: 'BGV initiated and report pending from vendor' },
    { id: `t-${ts}-5`, label: 'Welcome kit preparation', done: false, owner: 'HR', description: 'ID card, welcome kit, and desk allocation' },
  ];
}

router.get('/hr/stages', (_req, res) => {
  res.json(interviewStages);
});

router.get('/hr/employees', (_req, res) => {
  res.json(hrEmployees.map(enrichEmployee));
});

router.get('/hr/employees/:id', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(enrichEmployee(emp, true));
});

router.delete('/hr/employees/:id', (req, res) => {
  const index = hrEmployees.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });

  if (req.params.id === DEFAULT_PORTAL_EMPLOYEE_ID) {
    return res.status(400).json({ error: 'Cannot delete the default employee portal account' });
  }

  const hasDirectReports = hrEmployees.some((e) => e.reportsToId === req.params.id);
  if (hasDirectReports) {
    return res.status(400).json({
      error: 'Cannot delete an employee who has direct reports. Reassign their team first.',
    });
  }

  const [removed] = hrEmployees.splice(index, 1);

  for (let i = exitRequests.length - 1; i >= 0; i -= 1) {
    if (exitRequests[i].employeeId === removed.id) exitRequests.splice(i, 1);
  }
  for (let i = assetTickets.length - 1; i >= 0; i -= 1) {
    if (assetTickets[i].employeeId === removed.id) assetTickets.splice(i, 1);
  }

  res.json({ ok: true, id: removed.id });
});

router.post('/hr/employees', (req, res) => {
  const {
    name,
    role,
    department,
    email,
    phone,
    location,
    employmentType,
    status,
    joinedAt,
    bio,
    reportsToId,
    photo,
    documents,
    employmentTerms,
  } = req.body;
  if (!name?.trim() || !role?.trim() || !department?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Name, role, department, and email are required' });
  }
  const parsed = parseEmployeeName(name);
  const emp = {
    id: `he-${Date.now()}`,
    employeeId: nextEmployeeId(),
    name: parsed.fullName,
    ini: parsed.ini,
    role: String(role).trim(),
    department: String(department).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone?.trim() || '',
    location: location?.trim() || 'Hyderabad',
    status: status || 'active',
    employmentType: employmentType || 'Full-time',
    joinedAt: joinedAt || new Date().toISOString().slice(0, 10),
    bio: bio?.trim() || '',
    reportsToId: reportsToId || '',
    skills: [],
    photo: normalizeEmployeePhoto(photo),
    documents: normalizeEmployeeDocuments(documents),
    employmentTerms: normalizeEmploymentTerms(employmentTerms, joinedAt),
  };
  hrEmployees.push(emp);
  res.status(201).json(enrichEmployee(emp, true));
});

router.post('/hr/employees/:id/assets', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { name, category, serial, assetTag, assignedAt, value, image } = req.body;
  if (!name?.trim() || !category?.trim()) {
    return res.status(400).json({ error: 'Asset name and category are required' });
  }

  if (!Array.isArray(emp.assets)) {
    emp.assets = getEmployeeAssets(emp);
  }

  const tagSuffix = emp.employeeId?.replace('EMP-', '') || String(emp.assets.length + 1);
  const asset = {
    id: `ast-${emp.id}-${Date.now()}`,
    name: String(name).trim(),
    category: String(category).trim(),
    serial: serial?.trim() || `SN-${tagSuffix}-${Date.now().toString(36).slice(-4)}`,
    assetTag: assetTag?.trim() || `VW-${category.slice(0, 2).toUpperCase()}-${tagSuffix}`,
    assignedAt: assignedAt || new Date().toISOString().slice(0, 10),
    status: 'Assigned',
    value: Number(value) || 0,
    image: normalizeAssetImage(image),
  };

  emp.assets.push(asset);
  res.status(201).json(enrichEmployee(emp, true));
});

router.post('/hr/employees/:id/payslips', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { fileName, size } = req.body || {};
  if (!fileName?.trim()) {
    return res.status(400).json({ error: 'Payslip file is required' });
  }

  if (!Array.isArray(emp.payslips)) emp.payslips = [];

  const uploadedAt = new Date().toISOString().slice(0, 10);
  const period = uploadedAt.slice(0, 7);

  const payslip = {
    id: `ps-${Date.now()}`,
    month: period,
    periodLabel: formatPayPeriodLabel(period),
    fileName: String(fileName).trim(),
    size: Number(size) || 0,
    uploadedAt,
    uploadedBy: 'HR',
  };

  emp.payslips.unshift(payslip);
  res.status(201).json(enrichEmployee(emp, true));
});

router.delete('/hr/employees/:id/payslips/:payslipId', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  if (!Array.isArray(emp.payslips)) emp.payslips = [];

  const index = emp.payslips.findIndex((p) => p.id === req.params.payslipId);
  if (index === -1) return res.status(404).json({ error: 'Payslip not found' });

  emp.payslips.splice(index, 1);
  res.json(enrichEmployee(emp, true));
});

router.post('/hr/employees/:id/documents', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const incoming = normalizeEmployeeDocuments(req.body.documents);
  if (!incoming.length) {
    return res.status(400).json({ error: 'At least one document is required' });
  }

  if (!Array.isArray(emp.documents)) emp.documents = [];
  emp.documents.push(...incoming);
  res.status(201).json(enrichEmployee(emp, true));
});

router.patch('/hr/employees/:id/assets/:assetId', (req, res) => {
  const emp = findHrEmployee(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  if (!Array.isArray(emp.assets)) {
    emp.assets = getEmployeeAssets(emp);
  }

  const asset = emp.assets.find((a) => a.id === req.params.assetId);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  if (req.body.image !== undefined) {
    asset.image = normalizeAssetImage(req.body.image);
  }

  res.json(enrichEmployee(emp, true));
});

router.get('/hr/jobs', (_req, res) => {
  res.json(jobOpenings.map(enrichJob));
});

router.post('/hr/jobs', (req, res) => {
  const {
    title,
    department,
    type,
    location,
    hiringManagerId,
    description,
    requirements,
    experienceLevel,
    salary,
    postedAt,
    status,
  } = req.body;

  if (!title?.trim() || !department || !location) {
    return res.status(400).json({ error: 'Title, department, and location are required' });
  }

  const job = {
    id: `job-${Date.now()}`,
    title: title.trim(),
    department,
    type: type || 'Full-time',
    location,
    status: status || 'open',
    postedAt: postedAt || new Date().toISOString().slice(0, 10),
    hiringManagerId: hiringManagerId || 'he1',
    description: description?.trim() || '',
    requirements: requirements?.trim() || '',
    experienceLevel: experienceLevel?.trim() || '',
    salary: salary?.trim() || '',
    applications: 0,
    shortlisted: 0,
    interviews: 0,
  };

  jobOpenings.push(job);
  res.status(201).json(enrichJob(job));
});

router.get('/hr/jobs/:id', (req, res) => {
  const job = findJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const jobCandidates = candidates.filter((c) => c.jobId === job.id);
  res.json({
    ...enrichJob(job),
    candidates: jobCandidates.map(enrichCandidate),
  });
});

router.get('/hr/candidates', (req, res) => {
  let list = candidates;
  if (req.query.jobId) list = list.filter((c) => c.jobId === req.query.jobId);
  if (req.query.stage) list = list.filter((c) => c.stage === req.query.stage);
  res.json(list.map(enrichCandidate));
});

router.post('/hr/candidates', (req, res) => {
  const {
    name,
    email,
    phone,
    jobId,
    source,
    reference,
    experience,
    currentRole,
    notes,
    resumeFileName,
    resume,
    stage,
    assignedInterviewers,
    interview,
  } = req.body;

  if (!name?.trim() || !email?.trim() || !jobId) {
    return res.status(400).json({ error: 'Name, email, and position are required' });
  }
  if (!findJob(jobId)) return res.status(400).json({ error: 'Invalid job opening' });

  const { ini } = parseEmployeeName(name);
  const today = new Date().toISOString().slice(0, 10);
  const initialStage = stage || 'applied';

  const cand = {
    id: `cand-${Date.now()}`,
    jobId,
    name: name.trim(),
    ini,
    email: email.trim(),
    phone: phone?.trim() || '',
    source: source || 'Other',
    reference: reference?.trim() || '',
    appliedAt: today,
    stage: initialStage,
    resume: normalizeCandidateResume(resume, resumeFileName, today),
    experience: experience?.trim() || '',
    currentRole: currentRole?.trim() || '',
    assignedInterviewers: Array.isArray(assignedInterviewers) ? assignedInterviewers : [],
    notes: notes?.trim() || '',
    stageHistory: [{ stage: initialStage, at: today, by: 'he3' }],
  };

  candidates.push(cand);

  if (interview?.scheduledAt && Array.isArray(interview.interviewerIds) && interview.interviewerIds.length) {
    const interviewerIds = interview.interviewerIds;
    cand.assignedInterviewers = [...new Set([...(cand.assignedInterviewers || []), ...interviewerIds])];
    interviews.push({
      id: `int-${Date.now()}`,
      candidateId: cand.id,
      jobId: cand.jobId,
      stage: interview.stage || initialStage,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration || '60 min',
      type: interview.type || 'Video Call',
      interviewerIds,
      status: 'scheduled',
      location: interview.location?.trim() || '',
    });
  }

  res.status(201).json(enrichCandidate(cand));
});

router.get('/hr/candidates/:id', (req, res) => {
  const cand = findCandidate(req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  const candInterviews = interviews.filter((i) => i.candidateId === cand.id);
  const candFeedback = feedbackForms.filter((f) => f.candidateId === cand.id);
  res.json({
    ...enrichCandidate(cand),
    job: findJob(cand.jobId),
    interviews: candInterviews.map(enrichInterview),
    feedback: candFeedback.map(enrichFeedback),
  });
});

router.patch('/hr/candidates/:id/stage', (req, res) => {
  const cand = findCandidate(req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  const { stage, by } = req.body;
  if (!stage) return res.status(400).json({ error: 'Stage required' });
  cand.stage = stage;
  if (!cand.stageHistory) cand.stageHistory = [];
  cand.stageHistory.push({ stage, at: new Date().toISOString().slice(0, 10), by: by || 'he3' });
  res.json(enrichCandidate(cand));
});

router.get('/hr/interviews', (req, res) => {
  let list = interviews;
  if (req.query.candidateId) list = list.filter((i) => i.candidateId === req.query.candidateId);
  res.json(list.map(enrichInterview));
});

router.post('/hr/interviews', (req, res) => {
  const { candidateId, stage, scheduledAt, duration, type, location, interviewerIds } = req.body;
  const cand = findCandidate(candidateId);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  if (!scheduledAt) return res.status(400).json({ error: 'Interview date and time are required' });
  if (!Array.isArray(interviewerIds) || !interviewerIds.length) {
    return res.status(400).json({ error: 'At least one interviewer is required' });
  }

  cand.assignedInterviewers = [...new Set([...(cand.assignedInterviewers || []), ...interviewerIds])];

  const interview = {
    id: `int-${Date.now()}`,
    candidateId,
    jobId: cand.jobId,
    stage: stage || cand.stage,
    scheduledAt,
    duration: duration || '60 min',
    type: type || 'Video Call',
    interviewerIds,
    status: 'scheduled',
    location: location?.trim() || '',
  };
  interviews.push(interview);
  res.status(201).json(enrichInterview(interview));
});

router.patch('/hr/interviews/:id', (req, res) => {
  const interview = interviews.find((i) => i.id === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });
  if (req.body.status) interview.status = req.body.status;
  if (req.body.scheduledAt) interview.scheduledAt = req.body.scheduledAt;
  if (req.body.location !== undefined) interview.location = req.body.location;
  res.json(enrichInterview(interview));
});

router.get('/hr/feedback', (req, res) => {
  let list = feedbackForms;
  if (req.query.candidateId) list = list.filter((f) => f.candidateId === req.query.candidateId);
  res.json(list.map(enrichFeedback));
});

router.post('/hr/feedback', (req, res) => {
  const { candidateId, interviewId, interviewerId, stage, ratings, recommendation, comments, strengths, weaknesses } =
    req.body;
  if (!candidateId || !interviewerId) return res.status(400).json({ error: 'candidateId and interviewerId required' });
  const fb = {
    id: `fb-${Date.now()}`,
    interviewId: interviewId || null,
    candidateId,
    interviewerId,
    stage: stage || findCandidate(candidateId)?.stage || 'screening',
    ratings: ratings || {},
    recommendation: recommendation || '',
    comments: comments || '',
    strengths: strengths || '',
    weaknesses: weaknesses || '',
    submittedAt: new Date().toISOString(),
  };
  feedbackForms.push(fb);
  res.status(201).json(enrichFeedback(fb));
});

function normalizeCandidateResume(resume, resumeFileName, uploadedAt) {
  if (resume && typeof resume === 'object') {
    return {
      fileName: resume.fileName?.trim() || resumeFileName?.trim() || 'Resume.pdf',
      url: resume.url || '#',
      size: resume.size || null,
      uploadedAt: resume.uploadedAt || uploadedAt,
    };
  }
  return {
    fileName: resumeFileName?.trim() || 'Resume.pdf',
    url: '#',
    uploadedAt,
  };
}

function enrichJob(job) {
  const jobCandidates = candidates.filter((c) => c.jobId === job.id);
  const activeCandidates = jobCandidates.filter((c) => c.stage !== 'rejected');
  const shortlisted = activeCandidates.filter((c) => c.stage !== 'applied').length;
  const interviewCount = interviews.filter((i) => i.jobId === job.id).length;
  return {
    ...job,
    hiringManager: findHrEmployee(job.hiringManagerId),
    applications: activeCandidates.length,
    shortlisted,
    interviews: interviewCount,
  };
}

function enrichCandidate(c) {
  const candInterviews = interviews
    .filter((i) => i.candidateId === c.id)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const nextInterview = candInterviews.find((i) => i.status === 'scheduled') || null;
  return {
    ...c,
    job: findJob(c.jobId),
    interviewers: (c.assignedInterviewers || []).map((id) => findHrEmployee(id)).filter(Boolean),
    nextInterview: nextInterview ? enrichInterview(nextInterview) : null,
  };
}

function enrichInterview(i) {
  return {
    ...i,
    interviewers: (i.interviewerIds || []).map((id) => findHrEmployee(id)).filter(Boolean),
    candidate: findCandidate(i.candidateId),
  };
}

function enrichFeedback(f) {
  return {
    ...f,
    interviewer: findHrEmployee(f.interviewerId),
    candidate: findCandidate(f.candidateId),
  };
}

function parseEmployeeName(name) {
  const fullName = String(name || '').trim();
  if (!fullName) return { fullName: '', ini: '??' };
  const parts = fullName.split(/\s+/);
  const first = parts[0];
  const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
  const ini = last
    ? `${first[0]}${last[0]}`.toUpperCase()
    : first.slice(0, 2).toUpperCase().padEnd(2, first[0]?.toUpperCase() || '?');
  return { fullName, ini };
}

function nextEmployeeId() {
  const nums = hrEmployees.map((e) => parseInt(String(e.employeeId || '').replace('EMP-', ''), 10) || 0);
  return `EMP-${Math.max(1000, ...nums) + 1}`;
}

function computeTenure(joinedAt) {
  if (!joinedAt) return null;
  const start = new Date(joinedAt);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years > 0 && months > 0) return `${years} yr ${months} mo`;
  if (years > 0) return `${years} yr`;
  return `${Math.max(months, 1)} mo`;
}

function enrichEmployee(emp, detailed = false) {
  const base = {
    ...emp,
    reportsTo: emp.reportsToId ? findHrEmployee(emp.reportsToId) : null,
    tenure: computeTenure(emp.joinedAt),
    documents: emp.documents || [],
    photo: emp.photo || null,
  };
  if (!detailed) return base;
  const directReports = hrEmployees.filter((e) => e.reportsToId === emp.id);
  return {
    ...base,
    directReports: directReports.map((e) => ({ id: e.id, name: e.name, ini: e.ini, role: e.role })),
    bio:
      emp.bio ||
      `${emp.name} is a ${emp.role} in the ${emp.department} team based in ${emp.location || 'the organization'}.`,
    skills: emp.skills?.length ? emp.skills : defaultSkillsForRole(emp.role),
    finance: getEmployeeFinance(emp),
    assets: getEmployeeAssets(emp),
    employmentTerms: getEmployeeEmploymentTerms(emp),
    performance: getEmployeePerformance(emp),
  };
}

function normalizeEmploymentTerms(terms, joinedAt) {
  const join = joinedAt || new Date().toISOString().slice(0, 10);
  const probationMonths = Number(terms?.probation?.durationMonths) || 6;
  const probationUntil =
    terms?.probation?.until?.trim() ||
    addMonthsToDate(join, probationMonths);
  const bondApplicable = Boolean(terms?.bond?.applicable);
  const bondMonths = bondApplicable ? Number(terms?.bond?.durationMonths) || 24 : 0;
  const bondUntil =
    bondApplicable
      ? terms?.bond?.until?.trim() || addMonthsToDate(join, bondMonths)
      : '';

  return {
    probation: {
      durationMonths: probationMonths,
      until: probationUntil,
      status: probationStatus(probationUntil),
    },
    bond: {
      applicable: bondApplicable,
      durationMonths: bondMonths,
      until: bondUntil,
      amount: bondApplicable ? Number(terms?.bond?.amount) || 0 : 0,
    },
    noticePeriod: {
      duringProbationDays: Number(terms?.noticePeriod?.duringProbationDays) || 15,
      afterProbationDays: Number(terms?.noticePeriod?.afterProbationDays) || 60,
    },
  };
}

function addMonthsToDate(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function probationStatus(until) {
  if (!until) return 'none';
  return new Date(until) < new Date() ? 'completed' : 'active';
}

function normalizeAssetImage(image) {
  if (!image?.url) return null;
  return {
    fileName: image.fileName || 'asset.jpg',
    url: image.url,
    uploadedAt: image.uploadedAt || new Date().toISOString(),
  };
}

function normalizeEmployeePhoto(photo) {
  if (!photo?.url) return null;
  return {
    fileName: photo.fileName || 'photo.jpg',
    url: photo.url,
    uploadedAt: photo.uploadedAt || new Date().toISOString(),
  };
}

function normalizeEmployeeDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  return documents
    .filter((d) => d?.fileName)
    .map((d, i) => ({
      id: d.id || `doc-${Date.now()}-${i}`,
      type: d.type || 'other',
      fileName: String(d.fileName),
      size: d.size || 0,
      uploadedAt: d.uploadedAt || new Date().toISOString(),
    }));
}

// ——— Finance & Operations ———

router.get('/finance/dashboard', (_req, res) => {
  res.json(buildFinanceDashboard({
    chartOfAccounts,
    journalEntries,
    financeInvoices,
    financeExpenses,
    financePayments,
    financeBankAccounts,
    financeBudgets,
    financeDashboard,
    financeSettings,
    financeBills,
    EXPENSE_CATEGORIES,
  }));
});

router.get('/finance/settings', (_req, res) => {
  res.json(financeSettings);
});

router.patch('/finance/settings', (req, res) => {
  const { companyName, currency, fiscalYearStart, taxRate } = req.body || {};
  if (companyName != null) financeSettings.companyName = String(companyName).trim();
  if (currency != null) financeSettings.currency = String(currency).trim();
  if (fiscalYearStart != null) financeSettings.fiscalYearStart = String(fiscalYearStart).trim();
  if (taxRate != null) financeSettings.taxRate = Number(taxRate);
  res.json(financeSettings);
});

router.get('/finance/accounts', (_req, res) => {
  res.json(chartOfAccounts);
});

router.get('/finance/accounts/:id', (req, res) => {
  const account = chartOfAccounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
});

router.post('/finance/accounts', (req, res) => {
  const { code, name, type, parentId } = req.body || {};
  if (!code?.trim() || !name?.trim() || !type?.trim()) {
    return res.status(400).json({ error: 'Code, name, and type are required' });
  }
  if (chartOfAccounts.some((a) => a.code === code.trim())) {
    return res.status(400).json({ error: 'Account code already exists' });
  }
  const account = {
    id: `acc-${Date.now()}`,
    code: String(code).trim(),
    name: String(name).trim(),
    type: String(type).trim(),
    balance: 0,
    parentId: parentId || '',
  };
  chartOfAccounts.push(account);
  res.status(201).json(account);
});

router.patch('/finance/accounts/:id', (req, res) => {
  const account = chartOfAccounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  const { code, name, type } = req.body || {};
  if (code != null) {
    const trimmed = String(code).trim();
    if (!trimmed) return res.status(400).json({ error: 'Account code is required' });
    if (chartOfAccounts.some((a) => a.code === trimmed && a.id !== account.id)) {
      return res.status(400).json({ error: 'Account code already exists' });
    }
    account.code = trimmed;
  }
  if (name != null) account.name = String(name).trim();
  if (type != null) account.type = String(type).trim();
  res.json(account);
});

router.delete('/finance/accounts/:id', (req, res) => {
  const idx = chartOfAccounts.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Account not found' });
  const account = chartOfAccounts[idx];
  if (account.balance !== 0) {
    return res.status(400).json({ error: 'Cannot delete account with a non-zero balance' });
  }
  const used = journalEntries.some((e) => e.lines?.some((l) => l.accountId === account.id));
  if (used) return res.status(400).json({ error: 'Cannot delete account used in journal entries' });
  chartOfAccounts.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/finance/journal-entries', (_req, res) => {
  const list = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list);
});

router.get('/finance/journal-entries/:id', (req, res) => {
  const entry = journalEntries.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  res.json(entry);
});

router.get('/finance/ledger', (req, res) => {
  const { accountId } = req.query;
  const lines = buildLedgerLines(journalEntries, accountId || '');
  const account = accountId ? chartOfAccounts.find((a) => a.id === accountId) : null;
  res.json({ account, lines });
});

router.post('/finance/journal-entries', (req, res) => {
  const { date, description, reference, lines, post } = req.body || {};
  if (!date?.trim() || !description?.trim() || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: 'Date, description, and at least two lines are required' });
  }

  const normalized = lines.map((line) => {
    const account = chartOfAccounts.find((a) => a.id === line.accountId);
    return {
      accountId: line.accountId,
      accountCode: account?.code || line.accountCode || '',
      accountName: account?.name || line.accountName || '',
      debit: Number(line.debit) || 0,
      credit: Number(line.credit) || 0,
    };
  });

  const totalDebit = normalized.reduce((s, l) => s + l.debit, 0);
  const totalCredit = normalized.reduce((s, l) => s + l.credit, 0);
  if (totalDebit !== totalCredit || totalDebit === 0) {
    return res.status(400).json({ error: 'Debits and credits must balance' });
  }

  const entry = {
    id: `je-${Date.now()}`,
    entryNo: nextEntryNo(journalEntries),
    date: String(date).trim(),
    description: String(description).trim(),
    reference: reference?.trim() || '',
    status: post ? 'posted' : 'draft',
    createdBy: 'Finance Team',
    lines: normalized,
  };

  if (post) applyJournalToAccounts(normalized);
  journalEntries.unshift(entry);
  res.status(201).json(entry);
});

router.patch('/finance/journal-entries/:id', (req, res) => {
  const entry = journalEntries.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  if (entry.status === 'posted') {
    return res.status(400).json({ error: 'Posted entries cannot be modified' });
  }

  const { post, date, description, reference, lines } = req.body || {};
  if (date != null) entry.date = String(date).trim();
  if (description != null) entry.description = String(description).trim();
  if (reference != null) entry.reference = String(reference).trim();

  if (Array.isArray(lines) && lines.length >= 2) {
    const normalized = lines.map((line) => {
      const account = chartOfAccounts.find((a) => a.id === line.accountId);
      return {
        accountId: line.accountId,
        accountCode: account?.code || line.accountCode || '',
        accountName: account?.name || line.accountName || '',
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
      };
    });
    const totalDebit = normalized.reduce((s, l) => s + l.debit, 0);
    const totalCredit = normalized.reduce((s, l) => s + l.credit, 0);
    if (totalDebit !== totalCredit || totalDebit === 0) {
      return res.status(400).json({ error: 'Debits and credits must balance' });
    }
    entry.lines = normalized;
  }

  if (post) {
    const totalDebit = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = entry.lines.reduce((s, l) => s + (l.credit || 0), 0);
    if (totalDebit !== totalCredit) {
      return res.status(400).json({ error: 'Debits and credits must balance' });
    }
    entry.status = 'posted';
    applyJournalToAccounts(entry.lines);
  }
  res.json(entry);
});

router.delete('/finance/journal-entries/:id', (req, res) => {
  const idx = journalEntries.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Journal entry not found' });
  if (journalEntries[idx].status === 'posted') {
    return res.status(400).json({ error: 'Posted entries cannot be deleted' });
  }
  journalEntries.splice(idx, 1);
  res.json({ ok: true });
});

function applyJournalToAccounts(lines) {
  for (const line of lines) {
    const account = chartOfAccounts.find((a) => a.id === line.accountId);
    if (!account) continue;
    const isDebitNormal = ['asset', 'expense'].includes(account.type);
    const net = (line.debit || 0) - (line.credit || 0);
    account.balance += isDebitNormal ? net : -net;
  }
}

router.get('/finance/invoices', (_req, res) => {
  res.json([...financeInvoices].sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate)));
});

router.get('/finance/invoices/:id', (req, res) => {
  const invoice = financeInvoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

router.post('/finance/invoices', (req, res) => {
  const { client, clientId, amount, tax, dueDate, issuedDate } = req.body || {};
  if (!client?.trim() || amount == null) {
    return res.status(400).json({ error: 'Client and amount are required' });
  }
  const amt = Number(amount);
  const taxAmt = Number(tax) || Math.round(amt * (financeSettings.taxRate / 100));
  const invoice = {
    id: `inv-${Date.now()}`,
    invoiceNo: nextInvoiceNo(financeInvoices),
    client: String(client).trim(),
    clientId: clientId || '',
    amount: amt,
    tax: taxAmt,
    total: amt + taxAmt,
    status: 'draft',
    dueDate: dueDate || new Date().toISOString().slice(0, 10),
    issuedDate: issuedDate || new Date().toISOString().slice(0, 10),
    daysOverdue: 0,
  };
  financeInvoices.unshift(invoice);
  res.status(201).json(invoice);
});

router.patch('/finance/invoices/:id', (req, res) => {
  const invoice = financeInvoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  const { status, client, clientId, amount, tax, dueDate, issuedDate } = req.body || {};
  if (client != null) invoice.client = String(client).trim();
  if (clientId != null) invoice.clientId = String(clientId).trim();
  if (dueDate != null) invoice.dueDate = String(dueDate).trim();
  if (issuedDate != null) invoice.issuedDate = String(issuedDate).trim();
  if (amount != null) invoice.amount = Number(amount);
  if (tax != null) invoice.tax = Number(tax);
  if (amount != null || tax != null) {
    invoice.total = (invoice.amount || 0) + (invoice.tax || 0);
  }
  if (status && ['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
    invoice.status = status;
  }
  res.json(invoice);
});

router.delete('/finance/invoices/:id', (req, res) => {
  const idx = financeInvoices.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });
  if (financeInvoices[idx].status !== 'draft') {
    return res.status(400).json({ error: 'Only draft invoices can be deleted' });
  }
  financeInvoices.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/finance/expense-categories', (_req, res) => {
  res.json(EXPENSE_CATEGORIES);
});

router.get('/finance/expenses/summary', (_req, res) => {
  const totals = {};
  for (const cat of EXPENSE_CATEGORIES) totals[cat.id] = { category: cat.id, label: cat.label, count: 0, amount: 0 };
  let grandTotal = 0;
  for (const exp of financeExpenses) {
    const cat = normalizeExpenseCategory(exp.category);
    if (!totals[cat]) totals[cat] = { category: cat, label: expenseCategoryLabel(cat), count: 0, amount: 0 };
    totals[cat].count += 1;
    totals[cat].amount += exp.amount || 0;
    grandTotal += exp.amount || 0;
  }
  const breakdown = Object.values(totals)
    .filter((t) => t.count > 0)
    .map((t) => ({
      ...t,
      pct: grandTotal ? Math.round((t.amount / grandTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  res.json({ grandTotal, breakdown });
});

function normalizeExpenseBills(bills) {
  if (!Array.isArray(bills)) return [];
  return bills
    .filter((b) => b?.fileName)
    .map((b, i) => ({
      id: b.id || `bill-${Date.now()}-${i}`,
      fileName: String(b.fileName),
      size: Number(b.size) || 0,
      mimeType: b.mimeType || 'application/octet-stream',
      uploadedAt: b.uploadedAt || new Date().toISOString(),
    }));
}

router.get('/finance/expenses', (req, res) => {
  const { category, status } = req.query;
  let list = [...financeExpenses];
  if (category && category !== 'all') {
    const cat = normalizeExpenseCategory(category);
    list = list.filter((e) => normalizeExpenseCategory(e.category) === cat);
  }
  if (status && status !== 'all') {
    list = list.filter((e) => e.status === status);
  }
  res.json(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

router.get('/finance/expenses/:id', (req, res) => {
  const expense = financeExpenses.find((e) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

router.post('/finance/expenses', (req, res) => {
  const { title, description, category, vendor, amount, date, submittedBy, bills } = req.body || {};
  const trimmedTitle = title?.trim() || description?.trim();
  if (!trimmedTitle || amount == null) {
    return res.status(400).json({ error: 'Title and amount are required' });
  }
  const expense = {
    id: `exp-${Date.now()}`,
    title: String(trimmedTitle),
    description: String(description || '').trim(),
    category: normalizeExpenseCategory(category),
    vendor: vendor?.trim() || '',
    amount: Number(amount),
    date: date || new Date().toISOString().slice(0, 10),
    status: 'pending',
    submittedBy: submittedBy?.trim() || 'Finance Team',
    bills: normalizeExpenseBills(bills),
  };
  financeExpenses.unshift(expense);
  res.status(201).json(expense);
});

router.patch('/finance/expenses/:id', (req, res) => {
  const expense = financeExpenses.find((e) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  const { status, title, description, category, vendor, amount, date, submittedBy, bills } = req.body || {};
  if (title != null) expense.title = String(title).trim();
  if (description != null) expense.description = String(description).trim();
  if (category != null) expense.category = normalizeExpenseCategory(category);
  if (vendor != null) expense.vendor = String(vendor).trim();
  if (amount != null) expense.amount = Number(amount);
  if (date != null) expense.date = String(date).trim();
  if (submittedBy != null) expense.submittedBy = String(submittedBy).trim();
  if (bills != null) expense.bills = normalizeExpenseBills(bills);
  if (status && ['pending', 'approved', 'rejected', 'paid'].includes(status)) {
    expense.status = status;
  }
  res.json(expense);
});

router.delete('/finance/expenses/:id', (req, res) => {
  const idx = financeExpenses.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Expense not found' });
  financeExpenses.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/finance/payments', (_req, res) => {
  res.json([...financePayments].sort((a, b) => new Date(b.date) - new Date(a.date)));
});

router.get('/finance/payments/:id', (req, res) => {
  const payment = financePayments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

router.post('/finance/payments', (req, res) => {
  const { payee, type, amount, date, method, reference } = req.body || {};
  if (!payee?.trim() || amount == null || !type) {
    return res.status(400).json({ error: 'Payee, type, and amount are required' });
  }
  const payment = {
    id: `pay-${Date.now()}`,
    paymentNo: `PAY-2025-${String(financePayments.length + 93).padStart(3, '0')}`,
    payee: String(payee).trim(),
    type: type === 'incoming' ? 'incoming' : 'outgoing',
    amount: Number(amount),
    date: date || new Date().toISOString().slice(0, 10),
    method: method?.trim() || 'Bank Transfer',
    status: 'pending',
    reference: reference?.trim() || '',
  };
  financePayments.unshift(payment);
  res.status(201).json(payment);
});

router.patch('/finance/payments/:id', (req, res) => {
  const payment = financePayments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const { status, payee, type, amount, date, method, reference } = req.body || {};
  if (payee != null) payment.payee = String(payee).trim();
  if (type != null) payment.type = type === 'incoming' ? 'incoming' : 'outgoing';
  if (amount != null) payment.amount = Number(amount);
  if (date != null) payment.date = String(date).trim();
  if (method != null) payment.method = String(method).trim();
  if (reference != null) payment.reference = String(reference).trim();
  if (status && ['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
    payment.status = status;
  }
  res.json(payment);
});

router.delete('/finance/payments/:id', (req, res) => {
  const idx = financePayments.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Payment not found' });
  if (financePayments[idx].status === 'completed') {
    return res.status(400).json({ error: 'Completed payments cannot be deleted' });
  }
  financePayments.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/finance/vendors', (req, res) => {
  const { type } = req.query;
  let list = [...financeVendors];
  if (type && type !== 'all') list = list.filter((v) => v.type === type);
  res.json(list);
});

router.get('/finance/vendors/:id', (req, res) => {
  const vendor = financeVendors.find((v) => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  res.json(vendor);
});

router.get('/finance/budgets', (_req, res) => {
  res.json(financeBudgets);
});

router.get('/finance/budgets/:id', (req, res) => {
  const budget = financeBudgets.find((b) => b.id === req.params.id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.json(budget);
});

router.post('/finance/budgets', (req, res) => {
  const { category, allocated, spent, period } = req.body || {};
  if (!category?.trim() || allocated == null) {
    return res.status(400).json({ error: 'Category and allocated amount are required' });
  }
  const budget = {
    id: `bud-${Date.now()}`,
    category: String(category).trim(),
    allocated: Number(allocated),
    spent: Number(spent) || 0,
    period: period?.trim() || 'Jun 2025',
  };
  financeBudgets.push(budget);
  res.status(201).json(budget);
});

router.patch('/finance/budgets/:id', (req, res) => {
  const budget = financeBudgets.find((b) => b.id === req.params.id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  const { category, allocated, spent, period } = req.body || {};
  if (category != null) budget.category = String(category).trim();
  if (allocated != null) budget.allocated = Number(allocated);
  if (spent != null) budget.spent = Number(spent);
  if (period != null) budget.period = String(period).trim();
  res.json(budget);
});

router.delete('/finance/budgets/:id', (req, res) => {
  const idx = financeBudgets.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  financeBudgets.splice(idx, 1);
  res.json({ ok: true });
});

router.post('/finance/vendors', (req, res) => {
  const { name, type, email, phone, outstanding, status } = req.body || {};
  if (!name?.trim() || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }
  const vendor = {
    id: `ven-${Date.now()}`,
    name: String(name).trim(),
    type: type === 'client' ? 'client' : 'vendor',
    email: email?.trim() || '',
    phone: phone?.trim() || '',
    outstanding: Number(outstanding) || 0,
    status: status?.trim() || 'active',
  };
  financeVendors.push(vendor);
  res.status(201).json(vendor);
});

router.patch('/finance/vendors/:id', (req, res) => {
  const vendor = financeVendors.find((v) => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  const { name, type, email, phone, outstanding, status } = req.body || {};
  if (name != null) vendor.name = String(name).trim();
  if (type != null) vendor.type = type === 'client' ? 'client' : 'vendor';
  if (email != null) vendor.email = String(email).trim();
  if (phone != null) vendor.phone = String(phone).trim();
  if (outstanding != null) vendor.outstanding = Number(outstanding);
  if (status != null) vendor.status = String(status).trim();
  res.json(vendor);
});

router.delete('/finance/vendors/:id', (req, res) => {
  const idx = financeVendors.findIndex((v) => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  financeVendors.splice(idx, 1);
  res.json({ ok: true });
});

const FINANCE_MODULE_MAP = {
  customers: financeCustomers,
  quotes: financeQuotes,
  'sales-orders': financeSalesOrders,
  'recurring-invoices': financeRecurringInvoices,
  'delivery-challans': financeDeliveryChallans,
  'payments-received': financePaymentsReceived,
  'credit-notes': financeCreditNotes,
  'eway-bills': financeEwayBills,
  'recurring-expenses': financeRecurringExpenses,
  'purchase-orders': financePurchaseOrders,
  bills: financeBills,
  'recurring-bills': financeRecurringBills,
  'vendor-credits': financeVendorCredits,
  'bank-accounts': financeBankAccounts,
  'bank-transactions': financeBankTransactions,
  items: financeItems,
  'time-entries': financeTimeEntries,
  documents: financeDocuments,
  'currency-adjustments': financeCurrencyAdjustments,
  'transaction-locks': financeTransactionLocks,
  'bulk-updates': financeBulkUpdates,
};

function getFinanceModuleList(key) {
  return FINANCE_MODULE_MAP[key];
}

function enrichFinanceRecord(moduleKey, body, list) {
  const record = { id: `${moduleKey}-${Date.now()}`, ...body };
  const amt = Number(record.amount);
  const tax = Number(record.tax) || 0;
  if (!Number.isNaN(amt) && record.total == null) record.total = amt + tax;
  if (moduleKey === 'customers' && !record.customerNo) {
    record.customerNo = `CUS-${String(list.length + 1).padStart(3, '0')}`;
    record.createdAt = record.createdAt || new Date().toISOString().slice(0, 10);
  }
  if (moduleKey === 'quotes' && !record.quoteNo) record.quoteNo = `QT-2025-${String(list.length + 12).padStart(3, '0')}`;
  if (moduleKey === 'sales-orders' && !record.orderNo) record.orderNo = `SO-2025-${String(list.length + 8).padStart(3, '0')}`;
  if (moduleKey === 'delivery-challans' && !record.challanNo) record.challanNo = `DC-2025-${String(list.length + 4).padStart(3, '0')}`;
  if (moduleKey === 'payments-received' && !record.paymentNo) record.paymentNo = `PR-2025-${String(list.length + 40).padStart(3, '0')}`;
  if (moduleKey === 'credit-notes' && !record.creditNo) record.creditNo = `CN-2025-${String(list.length + 3).padStart(3, '0')}`;
  if (moduleKey === 'eway-bills' && !record.ewayNo) record.ewayNo = `EWB-2025-${String(list.length + 18).padStart(3, '0')}`;
  if (moduleKey === 'purchase-orders' && !record.poNo) record.poNo = `PO-2025-${String(list.length + 15).padStart(3, '0')}`;
  if (moduleKey === 'bills' && !record.billNo) record.billNo = `BILL-2025-${String(list.length + 31).padStart(3, '0')}`;
  if (moduleKey === 'vendor-credits' && !record.creditNo) record.creditNo = `VC-2025-${String(list.length + 2).padStart(3, '0')}`;
  if (moduleKey === 'time-entries' && record.billable === 'true') record.billable = true;
  if (moduleKey === 'time-entries' && record.billable === 'false') record.billable = false;
  if (moduleKey === 'time-entries' && record.hours && record.rate) {
    record.amount = record.billable ? Number(record.hours) * Number(record.rate) : 0;
  }
  if (moduleKey === 'documents' && !record.uploadedAt) record.uploadedAt = new Date().toISOString().slice(0, 10);
  if (moduleKey === 'bulk-updates' && !record.date) record.date = new Date().toISOString().slice(0, 10);
  if (moduleKey === 'recurring-invoices' && !record.profileName && record.customer) {
    record.profileName = `${record.customer} — Recurring`;
  }
  if (moduleKey === 'recurring-bills' && !record.description && record.vendor) {
    record.description = `${record.vendor} — Recurring`;
  }
  if (moduleKey === 'bank-accounts') {
    if (record.uncategorizedCount == null) record.uncategorizedCount = 0;
    if (!record.status) record.status = 'active';
    if (record.balance != null) record.balance = Number(record.balance);
  }
  if (moduleKey === 'bank-transactions') {
    if (record.reconciled === 'true') record.reconciled = true;
    if (record.reconciled === 'false') record.reconciled = false;
    const amt = Number(record.amount);
    if (!Number.isNaN(amt)) {
      record.amount = record.type === 'debit' ? -Math.abs(amt) : Math.abs(amt);
    }
  }
  return record;
}

router.get('/finance/modules/:moduleKey', (req, res) => {
  const list = getFinanceModuleList(req.params.moduleKey);
  if (!list) return res.status(404).json({ error: 'Unknown finance module' });
  res.json([...list]);
});

router.get('/finance/modules/:moduleKey/:id', (req, res) => {
  const list = getFinanceModuleList(req.params.moduleKey);
  if (!list) return res.status(404).json({ error: 'Unknown finance module' });
  const record = list.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

router.post('/finance/modules/:moduleKey', (req, res) => {
  const list = getFinanceModuleList(req.params.moduleKey);
  if (!list) return res.status(404).json({ error: 'Unknown finance module' });
  const record = enrichFinanceRecord(req.params.moduleKey, req.body || {}, list);
  list.unshift(record);
  res.status(201).json(record);
});

router.patch('/finance/modules/:moduleKey/:id', (req, res) => {
  const list = getFinanceModuleList(req.params.moduleKey);
  if (!list) return res.status(404).json({ error: 'Unknown finance module' });
  const record = list.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  Object.assign(record, req.body || {});
  if (req.body?.amount != null || req.body?.tax != null) {
    const amt = Number(record.amount) || 0;
    const tax = Number(record.tax) || 0;
    record.total = amt + tax;
  }
  if (req.params.moduleKey === 'bank-transactions') {
    if (req.body?.reconciled === 'true') record.reconciled = true;
    if (req.body?.reconciled === 'false') record.reconciled = false;
    if (req.body?.amount != null) {
      const amt = Number(record.amount);
      if (!Number.isNaN(amt)) {
        record.amount = record.type === 'debit' ? -Math.abs(amt) : Math.abs(amt);
      }
    }
  }
  res.json(record);
});

router.delete('/finance/modules/:moduleKey/:id', (req, res) => {
  const list = getFinanceModuleList(req.params.moduleKey);
  if (!list) return res.status(404).json({ error: 'Unknown finance module' });
  const idx = list.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  list.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/finance/report-catalog', (req, res) => {
  const { category } = req.query;
  let list = [...financeReportCatalog];
  if (category && category !== 'all') list = list.filter((r) => r.category === category);
  res.json(list);
});

router.patch('/finance/report-catalog/:id', (req, res) => {
  const report = financeReportCatalog.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const { favorite } = req.body || {};
  if (favorite != null) report.favorite = Boolean(favorite);
  report.lastVisited = new Date().toISOString();
  res.json(report);
});

router.get('/finance/banking', (_req, res) => {
  const accounts = financeBankAccounts;
  const transactions = financeBankTransactions;
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const uncategorized = accounts.reduce((s, a) => s + (a.uncategorizedCount || 0), 0);
  res.json({ accounts, transactions, totalBalance, uncategorized });
});

router.get('/finance/reports', (_req, res) => {
  res.json(buildFullFinanceReports({
    chartOfAccounts,
    journalEntries,
    financeInvoices,
    financeBills,
    financeExpenses,
    financePayments,
    financeBankAccounts,
    financeBudgets,
    financeDashboard,
    financeSettings,
    EXPENSE_CATEGORIES,
  }));
});

function defaultSkillsForRole(role = '') {
  const r = role.toLowerCase();
  if (r.includes('engineer') || r.includes('developer')) return ['JavaScript', 'Node.js', 'System Design', 'Agile'];
  if (r.includes('product')) return ['Roadmapping', 'Stakeholder Management', 'Analytics', 'User Research'];
  if (r.includes('hr')) return ['People Operations', 'Policy', 'Recruitment', 'Compliance'];
  if (r.includes('design')) return ['Figma', 'UX Research', 'Prototyping', 'Design Systems'];
  if (r.includes('sales')) return ['Negotiation', 'CRM', 'Pipeline Management', 'Client Relations'];
  if (r.includes('finance')) return ['Financial Modeling', 'Excel', 'Reporting', 'Budgeting'];
  if (r.includes('marketing')) return ['Campaign Strategy', 'Content', 'SEO', 'Brand'];
  return ['Communication', 'Collaboration', 'Problem Solving'];
}

export default router;

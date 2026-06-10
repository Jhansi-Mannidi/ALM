import { Router } from 'express';
import {
  users,
  roleUsers,
  projects,
  notifications,
  findProject,
  findUser,
} from '../store.js';

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
  } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const issue = {
    id: `${p.code}-${300 + p.issues.length}`,
    title: title.trim(),
    type: type || 'Task',
    description: description || '',
    prio: prio || 'Medium',
    status: status || 'To Do',
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
    status: status || 'To Do',
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
    status: 'Open',
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

function scopeSheetList(p, section) {
  if (!p.scopeSheets) p.scopeSheets = { client: [], tester: [], developer: [] };
  if (!p.scopeSheets[section]) p.scopeSheets[section] = [];
  return p.scopeSheets[section];
}

router.post('/projects/:id/scope-sheets/:section', (req, res) => {
  const p = findProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const section = req.params.section;
  if (!SCOPE_SHEET_SECTIONS.includes(section)) {
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
  if (!SCOPE_SHEET_SECTIONS.includes(section)) {
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
  if (!SCOPE_SHEET_SECTIONS.includes(section)) {
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
  const { ver, date, type, changes, status, by } = req.body;
  if (ver !== undefined) release.ver = String(ver).trim();
  if (date !== undefined) release.date = String(date).trim();
  if (type !== undefined) release.type = String(type).trim();
  if (changes !== undefined) release.changes = String(changes).trim();
  if (status !== undefined) release.status = String(status).trim();
  if (by !== undefined) release.by = String(by).trim();
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
  const { title, prio } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const ticket = {
    id: `SUP-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    prio: (prio || 'P3').split(' ')[0],
    status: 'Open',
    age: 'Just now',
  };
  p.tickets.push(ticket);
  res.status(201).json(ticket);
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

export default router;

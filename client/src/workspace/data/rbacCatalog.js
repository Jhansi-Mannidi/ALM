import { ALL_APPS, SOLUTIONS } from './workspaceCatalog';

export const RBAC_STORAGE_KEY = 'voltusworkspace-rbac-roles';
export const RBAC_ASSIGNMENTS_STORAGE_KEY = 'voltusworkspace-rbac-assignments';

export const DEFAULT_RBAC_USER_ASSIGNMENTS = [
  { id: 'u1', name: 'Sasi Paul', email: 'sasi.paul@almsphere.io', roleId: 'super-admin', ini: 'SP' },
  { id: 'u2', name: 'Ram Reddy', email: 'ram.reddy@almsphere.io', roleId: 'workspace-admin', ini: 'RR' },
  { id: 'u3', name: 'Anil Kumar', email: 'anil.kumar@almsphere.io', roleId: 'project-manager', ini: 'AK' },
  { id: 'u4', name: 'Alice Brown', email: 'alice.brown@voltuswave.io', roleId: 'hr-manager', ini: 'AB' },
  { id: 'u5', name: 'Michael Chen', email: 'michael.chen@voltuswave.io', roleId: 'developer', ini: 'MC' },
  { id: 'u6', name: 'Priya Sharma', email: 'priya.sharma@voltuswave.io', roleId: 'office-admin', ini: 'PS' },
];

/** Users eligible for role assignment (includes unassigned pool). */
export const WORKSPACE_RBAC_USERS = [
  ...DEFAULT_RBAC_USER_ASSIGNMENTS.map(({ id, name, email, ini }) => ({ id, name, email, ini })),
  { id: 'u7', name: 'Jhansi Mannidi', email: 'jhansi.mannidi@voltuswave.io', ini: 'JM' },
  { id: 'u8', name: 'Lakshman Sai', email: 'lakshman.sai@voltuswave.io', ini: 'LS' },
  { id: 'u9', name: 'Rohit Singh', email: 'rohit.singh@voltuswave.io', ini: 'RS' },
  { id: 'u10', name: 'Nithish Varma', email: 'nithish.varma@voltuswave.io', ini: 'NV' },
];

export const RBAC_MODULES = [
  {
    id: 'projects',
    name: 'Projects & Tasks',
    description: 'Project management, sprints, work items & agile delivery',
    icon: 'listChecks',
    color: '#2563EB',
    appIds: ['tasks-projects', 'scrum-master'],
    permissions: [
      { id: 'projects.access', label: 'Access Projects & Tasks', description: 'View and open project workspace' },
      { id: 'projects.manage', label: 'Manage Projects', description: 'Create, edit, and configure projects' },
      { id: 'tasks.assign', label: 'Assign Work Items', description: 'Assign tasks, bugs, and stories to team members' },
      { id: 'sprints.manage', label: 'Manage Sprints', description: 'Plan sprints, backlog, and scrum ceremonies' },
    ],
  },
  {
    id: 'hr',
    name: 'HR & People',
    description: 'Employee lifecycle, recruitment, onboarding & approvals',
    icon: 'users',
    color: '#EC4899',
    appIds: ['hr-people'],
    permissions: [
      { id: 'hr.access', label: 'Access HR Module', description: 'Open HR & People workspace' },
      { id: 'hr.employees', label: 'Manage Employees', description: 'Add, edit, and view employee records' },
      { id: 'hr.recruitment', label: 'Manage Recruitment', description: 'Jobs, candidates, and hiring pipeline' },
      { id: 'hr.approvals', label: 'Approve Requests', description: 'Leave, hike, exit, and subscription approvals' },
    ],
  },
  {
    id: 'employee',
    name: 'Employee Portal',
    description: 'Self-service profile, assets, documents & support tickets',
    icon: 'users',
    color: '#0891B2',
    appIds: ['employee-portal'],
    permissions: [
      { id: 'employee.access', label: 'Access Employee Portal', description: 'Open self-service employee portal' },
      { id: 'employee.profile', label: 'Manage Profile', description: 'Update personal and contact information' },
      { id: 'employee.assets', label: 'Asset Requests', description: 'View assigned assets and raise support tickets' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Operations',
    description: 'Accounting, invoices, expenses, budgets & financial reporting',
    icon: 'dollar',
    color: '#059669',
    appIds: ['finance-operations'],
    permissions: [
      { id: 'finance.access', label: 'Access Finance Module', description: 'Open finance & operations workspace' },
      { id: 'finance.transactions', label: 'Manage Transactions', description: 'Invoices, payments, ledger, and journal entries' },
      { id: 'finance.reports', label: 'View Financial Reports', description: 'P&L, balance sheet, and analytics dashboards' },
      { id: 'finance.settings', label: 'Finance Settings', description: 'Configure chart of accounts and tax settings' },
    ],
  },
  {
    id: 'product',
    name: 'Product Management',
    description: 'Insights, prioritization, roadmaps, releases & stakeholder portals',
    icon: 'layers',
    color: '#2563EB',
    appIds: ['product-management'],
    permissions: [
      { id: 'product.access', label: 'Access Product Module', description: 'Open product management workspace' },
      { id: 'product.insights', label: 'Manage Insights', description: 'Capture and triage customer feedback' },
      { id: 'product.roadmap', label: 'Manage Roadmap', description: 'Edit roadmap, initiatives, and OKRs' },
      { id: 'product.portals', label: 'Manage Portals', description: 'Publish stakeholder views and product briefs' },
    ],
  },
  {
    id: 'office',
    name: 'Office Manager',
    description: 'Inventory, vendor management & office service requests',
    icon: 'building',
    color: '#7C3AED',
    appIds: ['office-manager'],
    permissions: [
      { id: 'office.access', label: 'Access Office Manager', description: 'Open office management application' },
      { id: 'office.inventory', label: 'Manage Inventory', description: 'Track stock, supplies, and procurement' },
      { id: 'office.requests', label: 'Handle Requests', description: 'Approve office, food, and vendor requests' },
    ],
  },
  {
    id: 'system',
    name: 'System Administration',
    description: 'Roles, permissions, org hierarchy, users & audit logs',
    icon: 'shield',
    color: '#6366F1',
    appIds: ['roles-permissions', 'org-hierarchy'],
    permissions: [
      { id: 'system.access', label: 'Access System Admin', description: 'Open system administration workspace' },
      { id: 'system.roles', label: 'Manage Roles', description: 'Create and edit roles & permission assignments' },
      { id: 'system.users', label: 'Manage Users', description: 'Assign roles and manage user accounts' },
      { id: 'system.audit', label: 'View Audit Logs', description: 'Access security and activity audit trails' },
    ],
  },
];

export const ALL_PERMISSION_IDS = RBAC_MODULES.flatMap((m) => m.permissions.map((p) => p.id));

export const ALL_APP_IDS = ALL_APPS.map((a) => a.id);

export const RBAC_SCOPES = [
  { id: 'all-workspaces', label: 'All Workspaces' },
  { id: 'product-development', label: 'Product Development' },
  { id: 'business-operations', label: 'Business Operations' },
  { id: 'system-administration', label: 'System Administration' },
  { id: 'employee-self-service', label: 'Employee Self-Service' },
];

export const DEFAULT_RBAC_ROLES = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full system access across all workspaces and solutions',
    type: 'system',
    status: 'active',
    users: 2,
    scope: 'all-workspaces',
    icon: 'shield',
    color: '#6366F1',
    permissions: ['all'],
  },
  {
    id: 'workspace-admin',
    name: 'Workspace Admin',
    description: 'Manage workspace settings, assign roles, and configure solutions',
    type: 'system',
    status: 'active',
    users: 5,
    scope: 'all-workspaces',
    icon: 'building',
    color: '#2563EB',
    permissions: [
      'projects.access',
      'projects.manage',
      'hr.access',
      'hr.employees',
      'employee.access',
      'finance.access',
      'product.access',
      'product.insights',
      'product.roadmap',
      'product.portals',
      'office.access',
      'system.access',
      'system.roles',
      'system.users',
    ],
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Manage projects, assign tasks, and view reports',
    type: 'custom',
    status: 'active',
    users: 23,
    scope: 'product-development',
    icon: 'briefcase',
    color: '#059669',
    permissions: [
      'projects.access',
      'projects.manage',
      'tasks.assign',
      'sprints.manage',
      'product.access',
      'product.insights',
      'product.roadmap',
      'employee.access',
    ],
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    description: 'Manage employees, approve leaves, and handle recruitment',
    type: 'custom',
    status: 'active',
    users: 8,
    scope: 'business-operations',
    icon: 'users',
    color: '#EC4899',
    permissions: [
      'hr.access',
      'hr.employees',
      'hr.recruitment',
      'hr.approvals',
      'employee.access',
    ],
  },
  {
    id: 'office-admin',
    name: 'Office Admin',
    description: 'Manage inventory, approve requests, and handle vendors',
    type: 'custom',
    status: 'active',
    users: 4,
    scope: 'business-operations',
    icon: 'building',
    color: '#7C3AED',
    permissions: ['office.access', 'office.inventory', 'office.requests'],
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Work on tasks, update sprint items, and collaborate with team',
    type: 'custom',
    status: 'active',
    users: 45,
    scope: 'product-development',
    icon: 'code',
    color: '#0891B2',
    permissions: ['projects.access', 'tasks.assign', 'employee.access'],
  },
];

/** Maps ALM login role → default workspace RBAC role */
export const ALM_ROLE_TO_RBAC = {
  admin: 'super-admin',
  manager: 'project-manager',
  teamlead: 'project-manager',
  developer: 'developer',
  tester: 'developer',
  ba: 'project-manager',
  scrummaster: 'project-manager',
};

export const RBAC_NAV = [
  { id: 'dashboard', label: 'Dashboard', path: '/workspace/admin/rbac', icon: 'layoutGrid', end: true },
  { id: 'roles', label: 'Roles', path: '/workspace/admin/rbac/roles', icon: 'shieldCheck' },
  { id: 'permissions', label: 'Permissions', path: '/workspace/admin/rbac/permissions', icon: 'sliders' },
  { id: 'users', label: 'Users', path: '/workspace/admin/rbac/users', icon: 'users' },
  { id: 'audit', label: 'Audit Logs', path: '/workspace/admin/rbac/audit', icon: 'clipboardCheck' },
];

export function expandPermissions(permissions) {
  if (!permissions) return [];
  if (permissions.includes('all')) return [...ALL_PERMISSION_IDS];
  return permissions.filter((id) => ALL_PERMISSION_IDS.includes(id));
}

export function hasPermission(permissions, permId) {
  if (!permissions) return false;
  return permissions.includes('all') || permissions.includes(permId);
}

export function hasModuleAccess(permissions, moduleId) {
  if (hasPermission(permissions, 'all')) return true;
  const mod = RBAC_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  return mod.permissions.some((p) => permissions.includes(p.id));
}

export function getAccessibleAppIds(permissions) {
  if (hasPermission(permissions, 'all')) return [...ALL_APP_IDS];
  const apps = new Set();
  RBAC_MODULES.forEach((mod) => {
    if (mod.permissions.some((p) => permissions.includes(p.id))) {
      mod.appIds.forEach((id) => apps.add(id));
    }
  });
  return [...apps];
}

export function getAccessibleSolutionIds(permissions) {
  const appIds = new Set(getAccessibleAppIds(permissions));
  return SOLUTIONS.filter((s) => s.apps.some((a) => appIds.has(a.id))).map((s) => s.id);
}

export function scopeLabel(scopeId) {
  return RBAC_SCOPES.find((s) => s.id === scopeId)?.label ?? scopeId;
}

export function countEnabledPermissions(permissions) {
  return expandPermissions(permissions).length;
}

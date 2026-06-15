export const STANDALONE_APPS = [
  {
    id: 'tasks-projects',
    name: 'Projects & Tasks',
    description: 'Personal & team task management',
    icon: 'listChecks',
    notificationCount: 5,
    highlights: ['12 open tasks', '3 due this week', '2 team members active'],
    externalRoute: '/portfolio',
    externalLabel: 'Open VoltusWave ALM',
  },
  {
    id: 'scrum-master',
    name: 'Scrum Master',
    description: 'Agile sprint management with full Scrum support',
    icon: 'gitBranch',
    notificationCount: 8,
    isNew: true,
    highlights: ['Sprint 4 in progress', '8 story points remaining', 'Daily standup at 10 AM'],
    externalRoute: '/portfolio',
    externalLabel: 'Open in VoltusWave ALM',
  },
];

export const SOLUTIONS = [
  {
    id: 'business-operations',
    name: 'Business Operations',
    description: 'Run your business efficiently',
    icon: 'briefcase',
    color: '#2563EB',
    notificationCount: 18,
    stats: [
      { label: 'Total Employees', value: '150' },
      { label: 'Monthly Revenue', value: '$2.5M' },
      { label: 'Budget Adherence', value: '95%' },
      { label: 'Pending Requests', value: '5' },
    ],
    apps: [
      {
        id: 'office-manager',
        name: 'Office Manager',
        description: 'Inventory, requests & food management',
        icon: 'building',
        solutionId: 'business-operations',
        notificationCount: 13,
        highlights: ['5 pending requests', '12 low stock items', '3 vendor payments due'],
        route: '/workspace/office',
      },
      {
        id: 'hr-people',
        name: 'HR & People',
        description: 'Employee lifecycle management',
        icon: 'users',
        solutionId: 'business-operations',
        notificationCount: 3,
        isNew: true,
        highlights: ['150 total employees', '5 leave requests pending', '2 new hires onboarding'],
        route: '/workspace/hr',
      },
      {
        id: 'employee-portal',
        name: 'Employee Portal',
        description: 'Self-service profile, assets & support tickets',
        icon: 'users',
        solutionId: 'business-operations',
        notificationCount: 2,
        isNew: true,
        highlights: ['3 assigned assets', '2 open asset tickets', 'Raise IT requests'],
        route: '/workspace/employee',
      },
      {
        id: 'finance-operations',
        name: 'Finance & Operations',
        description: 'Financial management & reporting',
        icon: 'dollar',
        solutionId: 'business-operations',
        notificationCount: 2,
        isNew: true,
        highlights: ['$2.5M monthly revenue', '8 invoices pending', '95% budget adherence'],
        route: '/workspace/finance',
      },
    ],
  },
  {
    id: 'product-development',
    name: 'Product Development',
    description: 'Discovery, prioritization, roadmaps & stakeholder portals',
    icon: 'layers',
    color: '#2563EB',
    notificationCount: 6,
    stats: [
      { label: 'Products', value: '2' },
      { label: 'Features', value: '6' },
      { label: 'Unprocessed Insights', value: '2' },
      { label: 'Published Portals', value: '2' },
    ],
    apps: [
      {
        id: 'product-management',
        name: 'Product Management',
        description: 'Insights, hierarchy, prioritization, roadmaps & portals',
        icon: 'layers',
        solutionId: 'product-development',
        notificationCount: 6,
        isNew: true,
        highlights: ['2 unprocessed insights', 'Roadmap now/next/later', 'Stakeholder portals live'],
        route: '/workspace/product',
      },
    ],
  },
  {
    id: 'system-administration',
    name: 'System Administration',
    description: 'Manage users, roles, permissions & system settings',
    icon: 'shield',
    color: '#7C3AED',
    notificationCount: 0,
    stats: [
      { label: 'Active Roles', value: '6' },
      { label: 'Permissions', value: '42' },
      { label: 'Org Units', value: '24' },
      { label: 'System Users', value: '150' },
    ],
    apps: [
      {
        id: 'roles-permissions',
        name: 'Roles & Permissions',
        description: 'Manage user roles, permissions & access control',
        icon: 'shield',
        solutionId: 'system-administration',
        isNew: true,
        route: '/workspace/admin/rbac/roles',
      },
      {
        id: 'org-hierarchy',
        name: 'Org Unit Hierarchy',
        description: 'Configure organizational structure & data access',
        icon: 'network',
        solutionId: 'system-administration',
        isNew: true,
        route: '/workspace/org-units/hierarchy',
      },
    ],
  },
];

export const ALL_APPS = [...STANDALONE_APPS, ...SOLUTIONS.flatMap((s) => s.apps)];

export function getSolution(id) {
  return SOLUTIONS.find((s) => s.id === id);
}

export function getApp(solutionId, appId) {
  const solution = getSolution(solutionId);
  return solution?.apps.find((a) => a.id === appId);
}

export function getAppById(appId) {
  return ALL_APPS.find((a) => a.id === appId);
}

export function getSolutionForApp(appId) {
  return SOLUTIONS.find((s) => s.apps.some((a) => a.id === appId));
}

export const ORG_TEMPLATES = [
  {
    id: 'enterprise',
    name: 'Enterprise Global',
    levels: ['HQ', 'Region', 'Country', 'Company', 'Branch', 'Department', 'Team'],
  },
  {
    id: 'regional',
    name: 'Regional Office',
    levels: ['Company', 'Branch', 'Department', 'Work Location'],
  },
  {
    id: 'standard',
    name: 'Standard Corporate',
    levels: ['Company', 'Branch', 'Department'],
  },
  {
    id: 'project',
    name: 'Project-Based',
    levels: ['Organization', 'Division', 'Project', 'Workstream'],
  },
];

export const DEFAULT_ORG_TREE = {
  name: 'ACME Corporation',
  children: [
    {
      name: 'North America',
      children: [
        { name: 'USA', children: [{ name: 'New York HQ' }, { name: 'San Francisco' }] },
        { name: 'Canada', children: [{ name: 'Toronto' }] },
      ],
    },
    {
      name: 'EMEA',
      children: [
        { name: 'UAE', children: [{ name: 'Dubai Office' }] },
        { name: 'UK', children: [{ name: 'London Office' }] },
      ],
    },
  ],
};

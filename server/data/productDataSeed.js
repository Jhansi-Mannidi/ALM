/** Product Management — data model, docs, adoption analytics */

export const PM_DRIVERS = [
  { id: 'drv-impact', name: 'Impact', key: 'impact', description: 'Business value if shipped', weight: 1, scaleMin: 1, scaleMax: 10 },
  { id: 'drv-effort', name: 'Effort', key: 'effort', description: 'Engineering cost (lower is better)', weight: 1, scaleMin: 1, scaleMax: 10, inverse: true },
  { id: 'drv-demand', name: 'Customer Demand', key: 'customerDemand', description: 'Weighted customer requests', weight: 1, scaleMin: 0, scaleMax: 100 },
  { id: 'drv-reach', name: 'Reach', key: 'reach', description: 'Users or accounts affected', weight: 1, scaleMin: 1, scaleMax: 10 },
];

export const PM_FORMULA = {
  id: 'default',
  name: 'Priority Score',
  expression: '(impact * customerDemand) / effort',
  description: 'Higher impact and demand with lower effort yields a higher priority score.',
};

export const PM_SEGMENTS = [
  { id: 'seg-enterprise', name: 'Enterprise', description: '1000+ employees, strategic accounts' },
  { id: 'seg-mid', name: 'Mid-market', description: '100–999 employees' },
  { id: 'seg-smb', name: 'SMB', description: 'Under 100 employees' },
  { id: 'seg-startup', name: 'Startup', description: 'Early-stage high-growth' },
];

export const PM_TAGS = [
  { id: 'tag-security', name: 'security', color: '#DC2626' },
  { id: 'tag-mobile', name: 'mobile', color: '#7C3AED' },
  { id: 'tag-platform', name: 'platform', color: '#2563EB' },
  { id: 'tag-ux', name: 'ux', color: '#D97706' },
];

export const PM_CUSTOM_FIELDS = [
  { id: 'cf-story', entity: 'feature', name: 'Story points', fieldKey: 'storyPoints', type: 'number', required: false },
  { id: 'cf-arr', entity: 'customer', name: 'ARR', fieldKey: 'arr', type: 'currency', required: false },
  { id: 'cf-region', entity: 'customer', name: 'Region', fieldKey: 'region', type: 'text', required: false },
];

export const PM_DOCS = [
  {
    id: 'doc-getting-started',
    productId: 'prod-phoenix',
    title: 'Getting Started',
    content: '<p>Welcome to VoltusWave Product Management. Use Insights to capture feedback, Prioritization to score features, and Portals to share your roadmap externally.</p>',
    status: 'published',
    createdBy: 'Jhansi Mannidi',
    ownerId: 'u1',
    sharedWith: ['team'],
    featureId: null,
    updatedAt: '2026-06-01',
  },
  {
    id: 'doc-1',
    productId: 'prod-phoenix',
    title: 'Phoenix Platform — Product Brief Q3',
    content: '<p>Strategic focus on enterprise readiness: SSO, RBAC, and API scale. Target 3 net-new enterprise logos.</p>',
    status: 'published',
    createdBy: 'Jhansi Mannidi',
    ownerId: 'u1',
    sharedWith: ['team', 'executives'],
    featureId: null,
    updatedAt: '2026-06-01',
  },
  {
    id: 'doc-2',
    productId: 'prod-nexus',
    title: 'Nexus Mobile MVP scope',
    content: '<p>MVP includes push notifications and limited offline queue. Full sync deferred to v1.1.</p>',
    status: 'draft',
    createdBy: 'Jhansi Mannidi',
    ownerId: 'u1',
    sharedWith: [],
    featureId: 'feat-offline',
    updatedAt: '2026-05-20',
  },
  {
    id: 'doc-3',
    productId: 'prod-phoenix',
    title: 'SSO PRD — Enterprise SAML/OIDC',
    content: '<p>Requirements for Okta and Azure AD integration. Must support JIT provisioning and SCIM.</p>',
    status: 'published',
    createdBy: 'Arjun Patel',
    ownerId: 'u2',
    sharedWith: ['u1'],
    featureId: 'feat-sso',
    updatedAt: '2026-06-08',
  },
];

export const PM_WORKSPACE_MEMBERS = [
  { id: 'wm-1', name: 'Jhansi Mannidi', email: 'jhansi@voltuswave.io', role: 'maker', status: 'active', lastActive: '2026-06-13', invitedAt: '2026-06-01' },
  { id: 'wm-2', name: 'Priya Sharma', email: 'priya.sharma@voltuswave.io', role: 'maker', status: 'pending', lastActive: null, invitedAt: '2026-06-10' },
  { id: 'wm-3', name: 'Arjun Patel', email: 'arjun@voltuswave.io', role: 'maker', status: 'pending', lastActive: null, invitedAt: '2026-06-11' },
  { id: 'wm-4', name: 'Meera Joshi', email: 'meera@voltuswave.io', role: 'contributor', status: 'pending', lastActive: null, invitedAt: '2026-06-12' },
];

export const PM_ADOPTION_ACTIVITY = [
  { date: '2026-06-05', activeUsers: 0 },
  { date: '2026-06-06', activeUsers: 0 },
  { date: '2026-06-07', activeUsers: 0 },
  { date: '2026-06-08', activeUsers: 1 },
  { date: '2026-06-09', activeUsers: 1 },
  { date: '2026-06-10', activeUsers: 1 },
  { date: '2026-06-11', activeUsers: 1 },
  { date: '2026-06-12', activeUsers: 1 },
  { date: '2026-06-13', activeUsers: 1 },
];

export const PM_PORTAL_COLUMNS = [
  { id: 'consideration', label: 'Under Consideration', statuses: ['discovery'] },
  { id: 'planned', label: 'Planned', statuses: ['planned', 'in-progress'] },
  { id: 'launched', label: 'Launched', statuses: ['released', 'done'] },
];

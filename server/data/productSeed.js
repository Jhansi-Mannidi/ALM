/** Product Management module seed — discovery → prioritization → roadmap */

export const PM_PRODUCTS = [
  {
    id: 'prod-phoenix',
    name: 'Phoenix Platform',
    description: 'Core ALM and delivery platform for enterprise teams',
    almProjectId: 'p1',
    color: '#2563EB',
    status: 'active',
  },
  {
    id: 'prod-nexus',
    name: 'Nexus Mobile',
    description: 'Cross-platform mobile companion app',
    almProjectId: 'p2',
    color: '#7C3AED',
    status: 'active',
  },
];

export const PM_COMPONENTS = [
  { id: 'comp-auth', productId: 'prod-phoenix', name: 'Auth & Security', description: 'Identity, SSO, RBAC' },
  { id: 'comp-api', productId: 'prod-phoenix', name: 'API Gateway', description: 'Rate limiting, routing' },
  { id: 'comp-ui', productId: 'prod-phoenix', name: 'Workspace UI', description: 'Shell, navigation, theming' },
  { id: 'comp-mobile-core', productId: 'prod-nexus', name: 'Mobile Core', description: 'Shared mobile SDK' },
];

export const PM_FEATURES = [
  {
    id: 'feat-sso',
    productId: 'prod-phoenix',
    componentId: 'comp-auth',
    title: 'Enterprise SSO (SAML/OIDC)',
    description: 'Single sign-on for enterprise customers',
    status: 'planned',
    impact: 9,
    effort: 6,
    customerDemand: 23,
    linkedIssueId: 'PHXN-275',
  },
  {
    id: 'feat-rbac',
    productId: 'prod-phoenix',
    componentId: 'comp-auth',
    title: 'Advanced RBAC',
    description: 'Role-based access with custom roles',
    status: 'in-progress',
    impact: 8,
    effort: 5,
    customerDemand: 18,
    linkedIssueId: 'PHXN-279',
  },
  {
    id: 'feat-redis',
    productId: 'prod-phoenix',
    componentId: 'comp-api',
    title: 'Redis rate limiting',
    description: 'Token bucket middleware for APIs',
    status: 'in-progress',
    impact: 7,
    effort: 4,
    customerDemand: 11,
    linkedIssueId: 'PHXN-275b',
  },
  {
    id: 'feat-dark',
    productId: 'prod-phoenix',
    componentId: 'comp-ui',
    title: 'Dark mode & theming',
    description: 'System-wide theme tokens',
    status: 'released',
    impact: 6,
    effort: 3,
    customerDemand: 15,
    linkedIssueId: 'PHXN-241',
  },
  {
    id: 'feat-offline',
    productId: 'prod-nexus',
    componentId: 'comp-mobile-core',
    title: 'Offline sync',
    description: 'Queue actions when offline',
    status: 'discovery',
    impact: 8,
    effort: 7,
    customerDemand: 9,
    linkedIssueId: null,
  },
  {
    id: 'feat-push',
    productId: 'prod-nexus',
    componentId: 'comp-mobile-core',
    title: 'Push notifications',
    description: 'Real-time alerts on mobile',
    status: 'planned',
    impact: 7,
    effort: 5,
    customerDemand: 12,
    linkedIssueId: null,
  },
];

export const PM_CUSTOMERS = [
  { id: 'cust-1', name: 'VoltusWave Corp', segment: 'Enterprise', tier: 'Strategic', notesCount: 14, contactEmail: 'product@voltuswave.io' },
  { id: 'cust-2', name: 'RetailMax Inc', segment: 'Enterprise', tier: 'Growth', notesCount: 9, contactEmail: 'it@retailmax.com' },
  { id: 'cust-3', name: 'FinEdge Bank', segment: 'Enterprise', tier: 'Strategic', notesCount: 11, contactEmail: 'platform@finedge.com' },
  { id: 'cust-4', name: 'HealthSync', segment: 'Mid-market', tier: 'Standard', notesCount: 6, contactEmail: 'ops@healthsync.io' },
  { id: 'cust-5', name: 'LogiChain', segment: 'Mid-market', tier: 'Standard', notesCount: 4, contactEmail: 'dev@logichain.com' },
];

export const PM_THEMES = [
  { id: 'theme-security', name: 'Security & compliance', insightCount: 8, featureIds: ['feat-sso', 'feat-rbac'] },
  { id: 'theme-performance', name: 'Performance & scale', insightCount: 5, featureIds: ['feat-redis'] },
  { id: 'theme-mobile', name: 'Mobile experience', insightCount: 6, featureIds: ['feat-offline', 'feat-push'] },
];

export const PM_INSIGHTS = [
  {
    id: 'ins-1',
    customerId: 'cust-1',
    title: 'Need SAML SSO for Okta',
    body: 'Security team requires SAML integration before Q3 rollout.',
    source: 'support',
    status: 'processed',
    themeId: 'theme-security',
    featureId: 'feat-sso',
    createdAt: '2026-05-28',
  },
  {
    id: 'ins-2',
    customerId: 'cust-3',
    title: 'API throttling under peak load',
    body: 'Payment gateway timeouts during month-end — need better rate limits.',
    source: 'sales',
    status: 'processed',
    themeId: 'theme-performance',
    featureId: 'feat-redis',
    createdAt: '2026-06-02',
  },
  {
    id: 'ins-3',
    customerId: 'cust-2',
    title: 'Custom roles per department',
    body: 'HR and Finance need separate permission sets without admin access.',
    source: 'email',
    status: 'processed',
    themeId: 'theme-security',
    featureId: 'feat-rbac',
    createdAt: '2026-06-05',
  },
  {
    id: 'ins-4',
    customerId: 'cust-4',
    title: 'Offline mode for field teams',
    body: 'Nurses need to log tasks without connectivity.',
    source: 'survey',
    status: 'unprocessed',
    themeId: 'theme-mobile',
    featureId: null,
    createdAt: '2026-06-10',
  },
  {
    id: 'ins-5',
    customerId: 'cust-5',
    title: 'Push alerts for SLA breaches',
    body: 'Ops wants mobile push when tickets breach SLA.',
    source: 'intercom',
    status: 'unprocessed',
    themeId: 'theme-mobile',
    featureId: null,
    createdAt: '2026-06-11',
  },
  {
    id: 'ins-6',
    customerId: 'cust-1',
    title: 'Dark mode for night shifts',
    body: 'Warehouse team requests dark UI — already shipped, positive feedback.',
    source: 'support',
    status: 'processed',
    themeId: null,
    featureId: 'feat-dark',
    createdAt: '2026-05-15',
  },
];

export const PM_INTEGRATIONS = [
  { id: 'int-slack', name: 'Slack', type: 'messaging', status: 'connected', connected: true, lastSync: '2026-06-12T09:00:00Z', icon: 'slack' },
  { id: 'int-zendesk', name: 'Zendesk', type: 'support', status: 'connected', connected: true, lastSync: '2026-06-12T08:30:00Z', icon: 'zendesk' },
  { id: 'int-intercom', name: 'Intercom', type: 'support', status: 'connected', connected: true, lastSync: '2026-06-11T16:00:00Z', icon: 'intercom' },
  { id: 'int-salesforce', name: 'Salesforce', type: 'crm', status: 'available', connected: false, lastSync: null, icon: 'salesforce' },
  { id: 'int-hubspot', name: 'HubSpot', type: 'crm', status: 'available', connected: false, lastSync: null, icon: 'hubspot' },
  { id: 'int-email', name: 'Email forwarding', type: 'email', status: 'connected', connected: true, lastSync: '2026-06-12T07:00:00Z', icon: 'email' },
];

export const PM_INITIATIVES = [
  {
    id: 'init-1',
    productId: 'prod-phoenix',
    name: 'Enterprise readiness',
    description: 'Security, SSO, and compliance for large accounts',
    status: 'active',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    featureIds: ['feat-sso', 'feat-rbac'],
  },
  {
    id: 'init-2',
    productId: 'prod-phoenix',
    name: 'Platform performance',
    description: 'Scale APIs and improve reliability',
    status: 'active',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    featureIds: ['feat-redis'],
  },
  {
    id: 'init-3',
    productId: 'prod-nexus',
    name: 'Mobile v1 launch',
    description: 'Core mobile experience for iOS and Android',
    status: 'planning',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    featureIds: ['feat-offline', 'feat-push'],
  },
];

export const PM_OKRS = [
  {
    id: 'okr-1',
    productId: 'prod-phoenix',
    objective: 'Win 3 enterprise deals in Q3',
    quarter: 'Q3 2026',
    status: 'on-track',
    keyResults: [
      { id: 'kr-1', title: 'Ship SSO', target: 100, current: 65, unit: '%' },
      { id: 'kr-2', title: 'NPS from enterprise pilots', target: 50, current: 42, unit: 'score' },
      { id: 'kr-3', title: 'Security audit passed', target: 1, current: 0, unit: 'audit' },
    ],
  },
  {
    id: 'okr-2',
    productId: 'prod-nexus',
    objective: 'Validate mobile MVP with 2 design partners',
    quarter: 'Q3 2026',
    status: 'at-risk',
    keyResults: [
      { id: 'kr-4', title: 'Beta users onboarded', target: 2, current: 1, unit: 'partners' },
      { id: 'kr-5', title: 'Core flows working offline', target: 100, current: 30, unit: '%' },
    ],
  },
];

export const PM_ROADMAP_ITEMS = [
  { id: 'rm-1', productId: 'prod-phoenix', featureId: 'feat-dark', title: 'Dark mode', lane: 'now', startDate: '2026-04-01', endDate: '2026-05-15', status: 'done' },
  { id: 'rm-2', productId: 'prod-phoenix', featureId: 'feat-rbac', title: 'Advanced RBAC', lane: 'now', startDate: '2026-05-01', endDate: '2026-06-30', status: 'in-progress' },
  { id: 'rm-3', productId: 'prod-phoenix', featureId: 'feat-redis', title: 'Rate limiting', lane: 'now', startDate: '2026-06-01', endDate: '2026-07-15', status: 'in-progress' },
  { id: 'rm-4', productId: 'prod-phoenix', featureId: 'feat-sso', title: 'Enterprise SSO', lane: 'next', startDate: '2026-07-01', endDate: '2026-09-30', status: 'planned' },
  { id: 'rm-5', productId: 'prod-nexus', featureId: 'feat-push', title: 'Push notifications', lane: 'next', startDate: '2026-08-01', endDate: '2026-10-31', status: 'planned' },
  { id: 'rm-6', productId: 'prod-nexus', featureId: 'feat-offline', title: 'Offline sync', lane: 'later', startDate: '2026-10-01', endDate: '2026-12-31', status: 'discovery' },
];

export const PM_PORTALS = [
  {
    id: 'portal-1',
    name: 'Phoenix Public Roadmap',
    productId: 'prod-phoenix',
    type: 'public',
    token: 'phoenix-public',
    published: true,
    views: 342,
    updatedAt: '2026-06-10',
  },
  {
    id: 'portal-2',
    name: 'Enterprise stakeholders (private)',
    productId: 'prod-phoenix',
    type: 'private',
    token: 'phoenix-enterprise',
    published: true,
    views: 89,
    updatedAt: '2026-06-08',
  },
];

export const PM_BRIEFS = [
  {
    id: 'brief-1',
    productId: 'prod-phoenix',
    title: 'Phoenix Platform — Product Brief Q3',
    content: '<p>Strategic focus on enterprise readiness: SSO, RBAC, and API scale. Target 3 net-new enterprise logos.</p>',
    status: 'published',
    updatedAt: '2026-06-01',
  },
  {
    id: 'brief-2',
    productId: 'prod-nexus',
    title: 'Nexus Mobile MVP scope',
    content: '<p>MVP includes push notifications and limited offline queue. Full sync deferred to v1.1.</p>',
    status: 'draft',
    updatedAt: '2026-05-20',
  },
];

export function pmScore(feature) {
  const impact = Number(feature.impact) || 0;
  const effort = Math.max(1, Number(feature.effort) || 1);
  const demand = Number(feature.customerDemand) || 0;
  return Math.round((impact * demand) / effort);
}

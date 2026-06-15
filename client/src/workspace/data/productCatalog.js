/** Product Management workspace navigation — Productboard-style layers */

export const PM_NAV_SECTIONS = [
  {
    id: 'home',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/workspace/product', icon: 'layoutDashboard', end: true },
    ],
  },
  {
    id: 'data-input',
    label: 'Data Input',
    items: [
      { id: 'insights', label: 'Insights', path: '/workspace/product/insights', icon: 'sparkles' },
      { id: 'customers', label: 'Customers', path: '/workspace/product/customers', icon: 'users' },
      { id: 'integrations', label: 'Integrations', path: '/workspace/product/integrations', icon: 'plug' },
    ],
  },
  {
    id: 'structure',
    label: 'Structure',
    items: [
      { id: 'hierarchy', label: 'Product Hierarchy', path: '/workspace/product/hierarchy', icon: 'layers' },
      { id: 'initiatives', label: 'Initiatives', path: '/workspace/product/initiatives', icon: 'target' },
      { id: 'okrs', label: 'OKRs', path: '/workspace/product/okrs', icon: 'trendingUp' },
    ],
  },
  {
    id: 'decision',
    label: 'Decision',
    items: [
      { id: 'prioritization', label: 'Prioritization', path: '/workspace/product/prioritization', icon: 'barChart' },
    ],
  },
  {
    id: 'output',
    label: 'Output',
    items: [
      { id: 'roadmap', label: 'Roadmap', path: '/workspace/product/roadmap', icon: 'map' },
      { id: 'releases', label: 'Releases', path: '/workspace/product/releases', icon: 'package' },
      { id: 'reports', label: 'Reports', path: '/workspace/product/reports', icon: 'fileSpreadsheet' },
    ],
  },
  {
    id: 'sharing',
    label: 'Sharing',
    items: [
      { id: 'portals', label: 'Portals', path: '/workspace/product/portals', icon: 'globe' },
      { id: 'briefs', label: 'Product Briefs', path: '/workspace/product/briefs', icon: 'fileText' },
    ],
  },
];

export const PM_LANES = [
  { id: 'now', label: 'Now', color: '#2563EB' },
  { id: 'next', label: 'Next', color: '#7C3AED' },
  { id: 'later', label: 'Later', color: '#64748B' },
];

export const PM_FEATURE_STATUSES = ['discovery', 'planned', 'in-progress', 'released'];

export const PM_INSIGHT_SOURCES = ['manual', 'support', 'sales', 'email', 'survey', 'intercom'];

export function statusChipClass(status) {
  const map = {
    discovery: 'chip-gray',
    planned: 'chip-blue',
    'in-progress': 'chip-amber',
    released: 'chip-green',
    unprocessed: 'chip-amber',
    processed: 'chip-green',
    active: 'chip-green',
    planning: 'chip-blue',
    draft: 'chip-gray',
    published: 'chip-green',
    'on-track': 'chip-green',
    'at-risk': 'chip-red',
    done: 'chip-green',
  };
  return map[status] || 'chip-gray';
}

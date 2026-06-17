export const EMPLOYEE_WORKSPACE_NAV = [
  { id: 'dashboard', label: 'Dashboard', path: '/workspace/employee', icon: 'layoutDashboard', end: true },
  { id: 'profile', label: 'My Profile', path: '/workspace/employee/profile', icon: 'users' },
  { id: 'documents', label: 'My Documents', path: '/workspace/employee/documents', icon: 'fileText' },
  { id: 'dates', label: 'Employment Dates', path: '/workspace/employee/dates', icon: 'calendarDays' },
];

export const EMPLOYEE_PEOPLE_NAV = [
  { id: 'colleagues', label: 'Colleagues', path: '/workspace/employee/colleagues', icon: 'users' },
];

export const EMPLOYEE_REQUESTS_NAV = [
  { id: 'my-assets', label: 'My Assets', path: '/workspace/employee/assets', icon: 'monitor' },
  { id: 'asset-tickets', label: 'Asset Tickets', path: '/workspace/employee/asset-tickets', icon: 'wrench' },
  { id: 'raise-ticket', label: 'Raise Ticket', path: '/workspace/employee/asset-tickets/new', icon: 'plus' },
  { id: 'ai-subscriptions', label: 'AI Subscriptions', path: '/workspace/employee/ai-subscriptions', icon: 'sparkles' },
  { id: 'request-ai', label: 'Request AI Tool', path: '/workspace/employee/ai-subscriptions/new', icon: 'plus' },
];

export const EMPLOYEE_EXIT_NAV = [
  { id: 'exit', label: 'Exit & Resignation', path: '/workspace/employee/exit', icon: 'logOut' },
];

export const ASSET_TICKET_TYPE_LABELS = {
  new: 'New asset request',
  replacement: 'Replacement',
  repair: 'Repair',
  return: 'Return asset',
};

export const TICKET_STATUS_CHIPS = {
  open: 'chip-amber',
  'in-progress': 'chip-blue',
  resolved: 'chip-green',
  closed: 'chip-gray',
};

export const TICKET_PRIORITY_CHIPS = {
  low: 'chip-gray',
  medium: 'chip-blue',
  high: 'chip-red',
};

export const AI_REQUEST_STATUS_CHIPS = {
  pending: 'chip-amber',
  approved: 'chip-green',
  rejected: 'chip-red',
};

export const AI_SUBSCRIPTION_STATUS_CHIPS = {
  active: 'chip-green',
  suspended: 'chip-amber',
  cancelled: 'chip-gray',
};

export const EXIT_STATUS_CHIPS = {
  submitted: 'chip-amber',
  'in-review': 'chip-blue',
  approved: 'chip-green',
  completed: 'chip-gray',
  withdrawn: 'chip-red',
};

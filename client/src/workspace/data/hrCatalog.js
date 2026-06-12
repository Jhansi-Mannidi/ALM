export const HR_WORKSPACE_NAV = [
  { id: 'dashboard', label: 'Dashboard', path: '/workspace/hr', icon: 'layoutDashboard' },
  { id: 'employees', label: 'Employee Directory', path: '/workspace/hr/employees', icon: 'users' },
  { id: 'onboarding', label: 'Onboarding', path: '/workspace/hr/onboarding', icon: 'userPlus' },
];

export const HR_RECRUITMENT_NAV = [
  { id: 'recruitment', label: 'All Openings', path: '/workspace/hr/recruitment', icon: 'briefcase' },
  { id: 'candidates', label: 'Candidates', path: '/workspace/hr/recruitment/candidates', icon: 'fileText' },
  { id: 'feedback', label: 'Feedback Forms', path: '/workspace/hr/recruitment/feedback', icon: 'clipboard' },
];

export const HR_OPERATIONS_NAV = [
  { id: 'approvals', label: 'Approvals', path: '/workspace/hr/approvals', icon: 'listChecks' },
  { id: 'hikes', label: 'Employee Hike', path: '/workspace/hr/hikes', icon: 'trendingUp' },
  { id: 'exit', label: 'Exit & Offboarding', path: '/workspace/hr/exit', icon: 'logOut' },
  { id: 'asset-tickets', label: 'Asset Tickets', path: '/workspace/hr/asset-tickets', icon: 'wrench' },
  { id: 'ai-subscriptions', label: 'AI Subscriptions', path: '/workspace/hr/ai-subscriptions', icon: 'sparkles' },
];

export const STAGE_COLORS = {
  applied: 'chip-gray',
  screening: 'chip-blue',
  technical: 'chip-purple',
  culture: 'chip-amber',
  offer: 'chip-green',
  hired: 'chip-green',
  rejected: 'chip-red',
};

export const RECOMMENDATION_OPTIONS = ['Strong Hire', 'Hire', 'Proceed', 'No Hire', 'Hold'];

export const RATING_CRITERIA = {
  screening: ['communication', 'technical', 'experience', 'potential'],
  technical: ['problemSolving', 'coding', 'systemDesign', 'communication'],
  culture: ['communication', 'teamwork', 'cultureFit', 'motivation'],
  default: ['communication', 'technical', 'experience', 'potential'],
};

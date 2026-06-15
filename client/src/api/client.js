const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      'Cannot reach the API. If you are on the deployed site, redeploy after the latest fix. For local dev, run: npm run dev'
    );
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('API server returned an invalid response. Is the backend running on port 3001?');
  }

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export const api = {
  login: (role) => request('/auth/login', { method: 'POST', body: JSON.stringify({ role }) }),
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (userId, data) =>
    request(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (userId) => request(`/users/${userId}`, { method: 'DELETE' }),
  removeProjectMember: (projectId, userId) =>
    request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  createIssue: (projectId, data) =>
    request(`/projects/${projectId}/issues`, { method: 'POST', body: JSON.stringify(data) }),
  createEpic: (projectId, data) =>
    request(`/projects/${projectId}/epics`, { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (projectId, issueId, data) =>
    request(`/projects/${projectId}/issues/${issueId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignTask: (projectId, data) =>
    request(`/projects/${projectId}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  createBug: (projectId, data) =>
    request(`/projects/${projectId}/bugs`, { method: 'POST', body: JSON.stringify(data) }),
  updateBug: (projectId, bugId, data) =>
    request(`/projects/${projectId}/bugs/${bugId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addMember: (projectId, data) =>
    request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  addRequirement: (projectId, data) =>
    request(`/projects/${projectId}/requirements`, { method: 'POST', body: JSON.stringify(data) }),
  createScopeSection: (projectId, data) =>
    request(`/projects/${projectId}/scope-sections`, { method: 'POST', body: JSON.stringify(data) }),
  deleteScopeSection: (projectId, sectionId) =>
    request(`/projects/${projectId}/scope-sections/${sectionId}`, { method: 'DELETE' }),
  createCeremony: (projectId, data) =>
    request(`/projects/${projectId}/ceremonies`, { method: 'POST', body: JSON.stringify(data) }),
  updateCeremony: (projectId, ceremonyId, data) =>
    request(`/projects/${projectId}/ceremonies/${ceremonyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCeremony: (projectId, ceremonyId) =>
    request(`/projects/${projectId}/ceremonies/${ceremonyId}`, { method: 'DELETE' }),
  addScopeSheet: (projectId, section, data) =>
    request(`/projects/${projectId}/scope-sheets/${section}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateScopeSheet: (projectId, section, sheetId, data) =>
    request(`/projects/${projectId}/scope-sheets/${section}/${sheetId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteScopeSheet: (projectId, section, sheetId) =>
    request(`/projects/${projectId}/scope-sheets/${section}/${sheetId}`, { method: 'DELETE' }),
  updateDeveloperScope: (projectId, data) =>
    request(`/projects/${projectId}/developer-scope`, { method: 'PATCH', body: JSON.stringify(data) }),
  addTestCase: (projectId, data) =>
    request(`/projects/${projectId}/test-cases`, { method: 'POST', body: JSON.stringify(data) }),
  updateTestCase: (projectId, tcId, data) =>
    request(`/projects/${projectId}/test-cases/${tcId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addTicket: (projectId, data) =>
    request(`/projects/${projectId}/tickets`, { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (projectId, ticketId, data) =>
    request(`/projects/${projectId}/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  addCredential: (projectId, data) =>
    request(`/projects/${projectId}/credentials`, { method: 'POST', body: JSON.stringify(data) }),
  updateCredential: (projectId, credId, data) =>
    request(`/projects/${projectId}/credentials/${credId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCredential: (projectId, credId) =>
    request(`/projects/${projectId}/credentials/${credId}`, { method: 'DELETE' }),
  updateRelease: (projectId, releaseId, data) =>
    request(`/projects/${projectId}/releases/${releaseId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRelease: (projectId, releaseId) =>
    request(`/projects/${projectId}/releases/${releaseId}`, { method: 'DELETE' }),
  getNotifications: () => request('/notifications'),
  addNotification: (data) =>
    request('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  clearNotifications: () => request('/notifications/read-all', { method: 'PATCH' }),
  startTimeLog: (projectId, data) =>
    request(`/projects/${projectId}/time-logs/start`, { method: 'POST', body: JSON.stringify(data) }),
  stopTimeLog: (projectId, data) =>
    request(`/projects/${projectId}/time-logs/stop`, { method: 'POST', body: JSON.stringify(data) }),
  createTimeLog: (projectId, data) =>
    request(`/projects/${projectId}/time-logs`, { method: 'POST', body: JSON.stringify(data) }),
  getHrDashboard: () => request('/hr/dashboard'),
  getHrApprovals: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/approvals${q ? `?${q}` : ''}`);
  },
  updateHrApproval: (id, data) =>
    request(`/hr/approvals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  approveAllHrApprovals: () =>
    request('/hr/approvals/approve-all', { method: 'POST' }),
  getHrHikes: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/hikes${q ? `?${q}` : ''}`);
  },
  getHrHikeCandidates: () => request('/hr/hikes/candidates'),
  getHrHikeReview: (employeeId) => request(`/hr/hikes/review/${employeeId}`),
  sendHrHikePerformance: (employeeId) =>
    request(`/hr/hikes/review/${employeeId}/send-performance`, { method: 'POST' }),
  updateHrHike: (id, data) =>
    request(`/hr/hikes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createHrHike: (data) =>
    request('/hr/hikes', { method: 'POST', body: JSON.stringify(data) }),
  getEmployeePortal: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/portal${q ? `?${q}` : ''}`);
  },
  updateEmployeeProfile: (data) =>
    request('/employee/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getEmployeeAssets: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/assets${q ? `?${q}` : ''}`);
  },
  getEmployeeAssetTickets: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/asset-tickets${q ? `?${q}` : ''}`);
  },
  createEmployeeAssetTicket: (data) =>
    request('/employee/asset-tickets', { method: 'POST', body: JSON.stringify(data) }),
  getEmployeeAiSubscriptions: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/ai-subscriptions${q ? `?${q}` : ''}`);
  },
  getEmployeeAiTools: () => request('/employee/ai-tools'),
  createEmployeeAiSubscriptionRequest: (data) =>
    request('/employee/ai-subscriptions/requests', { method: 'POST', body: JSON.stringify(data) }),
  getHrAiSubscriptionsOverview: () => request('/hr/ai-subscriptions/overview'),
  getHrAiSubscriptionRequests: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/ai-subscriptions/requests${q ? `?${q}` : ''}`);
  },
  updateHrAiSubscriptionRequest: (id, data) =>
    request(`/hr/ai-subscriptions/requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrAiActiveSubscriptions: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/ai-subscriptions/active${q ? `?${q}` : ''}`);
  },
  updateHrAiActiveSubscription: (id, data) =>
    request(`/hr/ai-subscriptions/active/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getEmployeeColleagues: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/colleagues${q ? `?${q}` : ''}`);
  },
  getEmployeePayslips: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/payslips${q ? `?${q}` : ''}`);
  },
  getEmployeeDates: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/dates${q ? `?${q}` : ''}`);
  },
  getEmployeeDocuments: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/documents${q ? `?${q}` : ''}`);
  },
  addEmployeeDocuments: (documents) =>
    request('/employee/documents', { method: 'POST', body: JSON.stringify({ documents }) }),
  getEmployeeExitRequests: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/employee/exit-requests${q ? `?${q}` : ''}`);
  },
  createEmployeeExitRequest: (data) =>
    request('/employee/exit-requests', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployeeExitRequest: (id, data) =>
    request(`/employee/exit-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrExitRequests: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/exit-requests${q ? `?${q}` : ''}`);
  },
  updateHrExitRequest: (id, data) =>
    request(`/hr/exit-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrAssetTickets: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/hr/asset-tickets${q ? `?${q}` : ''}`);
  },
  updateHrAssetTicket: (id, data) =>
    request(`/hr/asset-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrOnboarding: () => request('/hr/onboarding'),
  getHrOnboardingHire: (id) => request(`/hr/onboarding/${id}`),
  createHrOnboardingHire: (data) =>
    request('/hr/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  updateHrOnboardingHire: (id, data) =>
    request(`/hr/onboarding/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrStages: () => request('/hr/stages'),
  getHrEmployees: () => request('/hr/employees'),
  getHrEmployee: (id) => request(`/hr/employees/${id}`),
  createHrEmployee: (data) =>
    request('/hr/employees', { method: 'POST', body: JSON.stringify(data) }),
  deleteHrEmployee: (id) => request(`/hr/employees/${id}`, { method: 'DELETE' }),
  addHrEmployeeDocuments: (employeeId, documents) =>
    request(`/hr/employees/${employeeId}/documents`, {
      method: 'POST',
      body: JSON.stringify({ documents }),
    }),
  addHrEmployeePayslip: (employeeId, data) =>
    request(`/hr/employees/${employeeId}/payslips`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteHrEmployeePayslip: (employeeId, payslipId) =>
    request(`/hr/employees/${employeeId}/payslips/${payslipId}`, { method: 'DELETE' }),
  addHrEmployeeAsset: (employeeId, data) =>
    request(`/hr/employees/${employeeId}/assets`, { method: 'POST', body: JSON.stringify(data) }),
  updateHrEmployeeAssetImage: (employeeId, assetId, image) =>
    request(`/hr/employees/${employeeId}/assets/${assetId}`, {
      method: 'PATCH',
      body: JSON.stringify({ image }),
    }),
  getHrJobs: () => request('/hr/jobs'),
  getHrJob: (id) => request(`/hr/jobs/${id}`),
  createHrJob: (data) =>
    request('/hr/jobs', { method: 'POST', body: JSON.stringify(data) }),
  getHrCandidates: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/hr/candidates${q ? `?${q}` : ''}`);
  },
  getHrCandidate: (id) => request(`/hr/candidates/${id}`),
  createHrCandidate: (data) =>
    request('/hr/candidates', { method: 'POST', body: JSON.stringify(data) }),
  updateCandidateStage: (id, data) =>
    request(`/hr/candidates/${id}/stage`, { method: 'PATCH', body: JSON.stringify(data) }),
  createHrInterview: (data) =>
    request('/hr/interviews', { method: 'POST', body: JSON.stringify(data) }),
  updateHrInterview: (id, data) =>
    request(`/hr/interviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHrInterviews: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/hr/interviews${q ? `?${q}` : ''}`);
  },
  getHrFeedback: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/hr/feedback${q ? `?${q}` : ''}`);
  },
  submitHrFeedback: (data) =>
    request('/hr/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getFinanceDashboard: () => request('/finance/dashboard'),
  getFinanceSettings: () => request('/finance/settings'),
  updateFinanceSettings: (data) =>
    request('/finance/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getFinanceAccounts: () => request('/finance/accounts'),
  getFinanceAccount: (id) => request(`/finance/accounts/${id}`),
  createFinanceAccount: (data) =>
    request('/finance/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceAccount: (id, data) =>
    request(`/finance/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceAccount: (id) => request(`/finance/accounts/${id}`, { method: 'DELETE' }),
  getFinanceJournalEntries: () => request('/finance/journal-entries'),
  getFinanceJournalEntry: (id) => request(`/finance/journal-entries/${id}`),
  createFinanceJournalEntry: (data) =>
    request('/finance/journal-entries', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceJournalEntry: (id, data) =>
    request(`/finance/journal-entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  postFinanceJournalEntry: (id) =>
    request(`/finance/journal-entries/${id}`, { method: 'PATCH', body: JSON.stringify({ post: true }) }),
  deleteFinanceJournalEntry: (id) =>
    request(`/finance/journal-entries/${id}`, { method: 'DELETE' }),
  getFinanceLedger: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/finance/ledger${q ? `?${q}` : ''}`);
  },
  getFinanceInvoices: () => request('/finance/invoices'),
  getFinanceInvoice: (id) => request(`/finance/invoices/${id}`),
  createFinanceInvoice: (data) =>
    request('/finance/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceInvoice: (id, data) =>
    request(`/finance/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceInvoice: (id) => request(`/finance/invoices/${id}`, { method: 'DELETE' }),
  getFinanceExpenseCategories: () => request('/finance/expense-categories'),
  getFinanceExpenseSummary: () => request('/finance/expenses/summary'),
  getFinanceExpenses: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/finance/expenses${q ? `?${q}` : ''}`);
  },
  getFinanceExpense: (id) => request(`/finance/expenses/${id}`),
  createFinanceExpense: (data) =>
    request('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceExpense: (id, data) =>
    request(`/finance/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceExpense: (id) => request(`/finance/expenses/${id}`, { method: 'DELETE' }),
  getFinancePayments: () => request('/finance/payments'),
  getFinancePayment: (id) => request(`/finance/payments/${id}`),
  createFinancePayment: (data) =>
    request('/finance/payments', { method: 'POST', body: JSON.stringify(data) }),
  updateFinancePayment: (id, data) =>
    request(`/finance/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinancePayment: (id) => request(`/finance/payments/${id}`, { method: 'DELETE' }),
  getFinanceVendors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/finance/vendors${q ? `?${q}` : ''}`);
  },
  getFinanceVendor: (id) => request(`/finance/vendors/${id}`),
  createFinanceVendor: (data) =>
    request('/finance/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceVendor: (id, data) =>
    request(`/finance/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceVendor: (id) => request(`/finance/vendors/${id}`, { method: 'DELETE' }),
  getFinanceModule: (moduleKey) => request(`/finance/modules/${moduleKey}`),
  getFinanceModuleRecord: (moduleKey, id) => request(`/finance/modules/${moduleKey}/${id}`),
  createFinanceModule: (moduleKey, data) =>
    request(`/finance/modules/${moduleKey}`, { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceModule: (moduleKey, id, data) =>
    request(`/finance/modules/${moduleKey}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceModule: (moduleKey, id) =>
    request(`/finance/modules/${moduleKey}/${id}`, { method: 'DELETE' }),
  getFinanceReportCatalog: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/finance/report-catalog${q ? `?${q}` : ''}`);
  },
  updateFinanceReportCatalog: (id, data) =>
    request(`/finance/report-catalog/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getFinanceBanking: () => request('/finance/banking'),
  getFinanceBudgets: () => request('/finance/budgets'),
  getFinanceBudget: (id) => request(`/finance/budgets/${id}`),
  createFinanceBudget: (data) =>
    request('/finance/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceBudget: (id, data) =>
    request(`/finance/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinanceBudget: (id) => request(`/finance/budgets/${id}`, { method: 'DELETE' }),
  getFinanceReports: () => request('/finance/reports'),
  getProductDashboard: () => request('/product/dashboard'),
  getProductProducts: () => request('/product/products'),
  createProductProduct: (data) =>
    request('/product/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProductProduct: (id, data) =>
    request(`/product/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductProduct: (id) => request(`/product/products/${id}`, { method: 'DELETE' }),
  getProductComponents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/components${q ? `?${q}` : ''}`);
  },
  createProductComponent: (data) =>
    request('/product/components', { method: 'POST', body: JSON.stringify(data) }),
  updateProductComponent: (id, data) =>
    request(`/product/components/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductComponent: (id) => request(`/product/components/${id}`, { method: 'DELETE' }),
  getProductFeatures: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/features${q ? `?${q}` : ''}`);
  },
  createProductFeature: (data) =>
    request('/product/features', { method: 'POST', body: JSON.stringify(data) }),
  updateProductFeature: (id, data) =>
    request(`/product/features/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductFeature: (id) => request(`/product/features/${id}`, { method: 'DELETE' }),
  getProductCustomers: () => request('/product/customers'),
  createProductCustomer: (data) =>
    request('/product/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateProductCustomer: (id, data) =>
    request(`/product/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductCustomer: (id) => request(`/product/customers/${id}`, { method: 'DELETE' }),
  getProductInsights: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/insights${q ? `?${q}` : ''}`);
  },
  createProductInsight: (data) =>
    request('/product/insights', { method: 'POST', body: JSON.stringify(data) }),
  updateProductInsight: (id, data) =>
    request(`/product/insights/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductInsight: (id) => request(`/product/insights/${id}`, { method: 'DELETE' }),
  getProductThemes: () => request('/product/themes'),
  getProductIntegrations: () => request('/product/integrations'),
  createProductIntegration: (data) =>
    request('/product/integrations', { method: 'POST', body: JSON.stringify(data) }),
  updateProductIntegration: (id, data) =>
    request(`/product/integrations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductIntegration: (id) => request(`/product/integrations/${id}`, { method: 'DELETE' }),
  getProductInitiatives: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/initiatives${q ? `?${q}` : ''}`);
  },
  createProductInitiative: (data) =>
    request('/product/initiatives', { method: 'POST', body: JSON.stringify(data) }),
  updateProductInitiative: (id, data) =>
    request(`/product/initiatives/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductInitiative: (id) => request(`/product/initiatives/${id}`, { method: 'DELETE' }),
  getProductOkrs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/okrs${q ? `?${q}` : ''}`);
  },
  createProductOkr: (data) =>
    request('/product/okrs', { method: 'POST', body: JSON.stringify(data) }),
  updateProductOkr: (id, data) =>
    request(`/product/okrs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductOkr: (id) => request(`/product/okrs/${id}`, { method: 'DELETE' }),
  getProductPrioritization: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/prioritization${q ? `?${q}` : ''}`);
  },
  getProductRoadmap: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/roadmap${q ? `?${q}` : ''}`);
  },
  createProductRoadmapItem: (data) =>
    request('/product/roadmap', { method: 'POST', body: JSON.stringify(data) }),
  updateProductRoadmapItem: (id, data) =>
    request(`/product/roadmap/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductRoadmapItem: (id) => request(`/product/roadmap/${id}`, { method: 'DELETE' }),
  getProductReleases: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/releases${q ? `?${q}` : ''}`);
  },
  createProductRelease: (data) =>
    request('/product/releases', { method: 'POST', body: JSON.stringify(data) }),
  updateProductRelease: (projectId, releaseId, data) =>
    request(`/product/releases/${projectId}/${releaseId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductRelease: (projectId, releaseId) =>
    request(`/product/releases/${projectId}/${releaseId}`, { method: 'DELETE' }),
  getProductReports: () => request('/product/reports'),
  getProductPortals: () => request('/product/portals'),
  createProductPortal: (data) =>
    request('/product/portals', { method: 'POST', body: JSON.stringify(data) }),
  updateProductPortal: (id, data) =>
    request(`/product/portals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductPortal: (id) => request(`/product/portals/${id}`, { method: 'DELETE' }),
  getProductBriefs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/product/briefs${q ? `?${q}` : ''}`);
  },
  createProductBrief: (data) =>
    request('/product/briefs', { method: 'POST', body: JSON.stringify(data) }),
  updateProductBrief: (id, data) =>
    request(`/product/briefs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductBrief: (id) => request(`/product/briefs/${id}`, { method: 'DELETE' }),
  getProductShare: (token) => request(`/product/share/${token}`),
  getOfficeDashboard: () => request('/office/dashboard'),
  getOfficeInventory: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/office/inventory${q ? `?${q}` : ''}`);
  },
  createOfficeInventory: (data) =>
    request('/office/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateOfficeInventory: (id, data) =>
    request(`/office/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOfficeInventory: (id) => request(`/office/inventory/${id}`, { method: 'DELETE' }),
  getOfficeRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/office/requests${q ? `?${q}` : ''}`);
  },
  createOfficeRequest: (data) =>
    request('/office/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateOfficeRequest: (id, data) =>
    request(`/office/requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOfficeRequest: (id) => request(`/office/requests/${id}`, { method: 'DELETE' }),
  getOfficeVendors: () => request('/office/vendors'),
  createOfficeVendor: (data) =>
    request('/office/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateOfficeVendor: (id, data) =>
    request(`/office/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOfficeVendor: (id) => request(`/office/vendors/${id}`, { method: 'DELETE' }),
  getOfficeFood: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/office/food${q ? `?${q}` : ''}`);
  },
  createOfficeFood: (data) =>
    request('/office/food', { method: 'POST', body: JSON.stringify(data) }),
  updateOfficeFood: (id, data) =>
    request(`/office/food/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOfficeFood: (id) => request(`/office/food/${id}`, { method: 'DELETE' }),
};

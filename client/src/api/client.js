const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach API server. Run: npm run dev');
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
};

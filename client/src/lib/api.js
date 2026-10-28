const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { message: await res.text() };

  if (!res.ok) {
    const err = new ApiError(
      res.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || data.message || `Request failed with status ${res.status}`,
      data.error?.details
    );

    // If session expired / unauthenticated on a protected action, notify app
    if (
      res.status === 401 &&
      !path.includes('/auth/login') &&
      !path.includes('/auth/register')
    ) {
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: err }));
    }

    throw err;
  }

  return data.data;
}

export const api = {
  // System Health
  health: () => request('/api/health'),

  // Public Catalog
  getCategories: () => request('/api/categories'),
  getJourneys: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.q) qs.set('q', params.q);
    const query = qs.toString();
    return request(`/api/journeys${query ? `?${query}` : ''}`);
  },
  getJourney: (id) => request(`/api/journeys/${encodeURIComponent(id)}`),
  getJourneySteps: (id) => request(`/api/journeys/${encodeURIComponent(id)}/steps`),
  getJourneyDocuments: (id) => request(`/api/journeys/${encodeURIComponent(id)}/documents`),
  getJourneyBranches: (id) => request(`/api/journeys/${encodeURIComponent(id)}/branches`),

  // Auth
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  changePassword: (data) => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // User Journeys
  getUserJourneys: () => request('/api/me/journeys'),
  getUserJourney: (id) => request(`/api/me/journeys/${encodeURIComponent(id)}`),
  createUserJourney: (data) => request('/api/me/journeys', { method: 'POST', body: JSON.stringify(data) }),
  updateUserJourney: (id, data) => request(`/api/me/journeys/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUserJourney: (id, hard = false) => request(`/api/me/journeys/${encodeURIComponent(id)}${hard ? '?hard=true' : ''}`, { method: 'DELETE' }),
  restoreUserJourney: (id) => request(`/api/me/journeys/${encodeURIComponent(id)}/restore`, { method: 'POST' }),
  patchProgress: (id, { stepId, completed }) => request(`/api/me/journeys/${encodeURIComponent(id)}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ stepId, completed }),
  }),
  patchChecklist: (id, { documentName, checked, completed }) => request(`/api/me/journeys/${encodeURIComponent(id)}/checklist`, {
    method: 'PATCH',
    body: JSON.stringify({
      documentName,
      checked: checked !== undefined ? checked : completed,
      completed: completed !== undefined ? completed : checked,
    }),
  }),

  // Living Abroad Settings
  getAbroad: () => request('/api/me/abroad'),
  putAbroad: (data) => request('/api/me/abroad', { method: 'PUT', body: JSON.stringify(data) }),

  // Citizen Requests
  getUserRequests: () => request('/api/me/requests'),
  createUserRequest: (data) => request('/api/me/requests', { method: 'POST', body: JSON.stringify(data) }),
  getUserRequest: (id) => request(`/api/me/requests/${encodeURIComponent(id)}`),

  // Admin Operations
  getAdminJourneys: () => request('/api/admin/journeys'),
  getAdminJourney: (id) => request(`/api/admin/journeys/${encodeURIComponent(id)}`),
  createAdminJourney: (data) => request('/api/admin/journeys', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminJourney: (id, data) => request(`/api/admin/journeys/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  setAdminJourneyStatus: (id, status) => request(`/api/admin/journeys/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteAdminJourney: (id) => request(`/api/admin/journeys/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getAdminCategories: () => request('/api/admin/categories'),
  createAdminCategory: (data) => request('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminCategory: (id) => request(`/api/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getAdminRequests: (status) => request(`/api/admin/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateAdminRequest: (id, data) => request(`/api/admin/requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

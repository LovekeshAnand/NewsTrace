const API_BASE = import.meta.env.VITE_API_URL || 'https://newstrace-k9mf.onrender.com';

const getHeaders = () => {
  const h = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('nt_token');
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const request = async (url, options = {}) => {
  const res = await fetch(url, { headers: getHeaders(), ...options });
  if (res.status === 401) {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
};

export const api = {
  register: (data) => request(`${API_BASE}/auth/register`, { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request(`${API_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(data) }),
  me: () => request(`${API_BASE}/auth/me`),

  getOutlets: () => request(`${API_BASE}/outlets`),
  getOutletById: (id) => request(`${API_BASE}/outlets/${id}`),
  getOutletStats: (id) => request(`${API_BASE}/outlets/${id}/stats`),
  startScrape: (name, targetCount) => request(`${API_BASE}/outlets/scrape`, {
    method: 'POST', body: JSON.stringify({ name, targetCount })
  }),

  getJournalists: (limit = 50) => request(`${API_BASE}/journalists?limit=${limit}`),
  searchJournalists: (q) => request(`${API_BASE}/journalists/search?q=${encodeURIComponent(q)}`),
  getJournalistById: (id) => request(`${API_BASE}/journalists/${id}`),

  getScrapeJobs: (limit = 20) => request(`${API_BASE}/scrape/jobs?limit=${limit}`),
  getJobStatus: (id) => request(`${API_BASE}/scrape/jobs/${id}`),
  getQueueStats: () => request(`${API_BASE}/scrape/queue/stats`),

  research: (query) => request(`${API_BASE}/research`, {
    method: 'POST', body: JSON.stringify({ query })
  }),

  getGlobalStats: () => request(`${API_BASE}/analysis/global-stats`),
  compareOutlets: (ids) => request(`${API_BASE}/analysis/compare`, {
    method: 'POST', body: JSON.stringify({ outletIds: ids })
  })
};

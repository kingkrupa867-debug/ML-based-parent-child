import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const getCsrfToken = () =>
  document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];

const ensureCsrfCookie = async () => {
  if (!getCsrfToken()) {
    await api.get('/api/csrf/');
  }
};

api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Handle auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// ==================== AUTH API ====================

export const register = async (userData) => {
  await ensureCsrfCookie();
  const response = await api.post('/api/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  await ensureCsrfCookie();
  const response = await api.post('/api/login/', credentials);
  setAuthToken(response.data.token || 'session-authenticated');
  return response.data;
};

export const logout = async () => {
  await ensureCsrfCookie();
  const response = await api.post('/api/logout/');
  setAuthToken(null);
  return response.data;
};

// ==================== QUESTIONNAIRE API ====================

export const submitQuestionnaire = async (data) => {
  await ensureCsrfCookie();
  const response = await api.post('/api/submit-questionnaire/', data);
  return response.data;
};

export const getPrediction = async () => {
  const response = await api.get('/api/predict/');
  return response.data;
};

export const getResultsHistory = async () => {
  const response = await api.get('/api/results-history/');
  return response.data;
};

export const getRecommendations = async (resultId) => {
  const response = await api.get(`/api/recommendations/?result_id=${resultId}`);
  return response.data;
};

// ==================== USER API ====================

export const getCurrentUser = async () => {
  const response = await api.get('/api/user/');
  return response.data;
};

// ==================== SESSION API ====================

export const getMyInviteCode = async () => {
  // Pass username as fallback when cross-origin cookie not available
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await api.get(`/api/my-invite-code/?username=${encodeURIComponent(user.username || '')}`);
  return response.data;   // { invite_code: "ABCD1234" }
};

export const verifySessionCode = async (code) => {
  const response = await api.post('/api/verify-session-code/', { code });
  return response.data;   // { valid: true, parent_username: "...", family_id: "..." }
};

export default api;

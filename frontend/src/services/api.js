// Author : Jijanur Rahman
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include CSRF token
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  logout: () => api.post('/logout/'),
  getProfile: () => api.get('/profile/'),
};

export const roadmapAPI = {
  getRoadmapItems: (sortBy = 'created_at') => api.get(`/roadmap/?sort=${sortBy}`),
  getRoadmapItem: (id) => api.get(`/roadmap/${id}/`),
};

export const commentAPI = {
  getComments: (roadmapId) => api.get(`/roadmap/${roadmapId}/comments/`),
  createComment: (roadmapId, data) => api.post(`/roadmap/${roadmapId}/comments/`, data),
  updateComment: (commentId, data) => api.put(`/comments/${commentId}/`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}/`),
};

export const upvoteAPI = {
  upvoteItem: (roadmapItemId) => api.post('/upvote/', { roadmap_item: roadmapItemId }),
};

export default api;
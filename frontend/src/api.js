import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// dynamically read user_id from localStorage for RBAC testing
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('procura_user_id') || '1'; 
  config.headers['x-user-id'] = userId; 
  return config;
});

// Global & Category
export const getKpis = (params) => api.get('/kpis', { params });
export const getCategories = () => api.get('/categories');
export const getCategorySpend = (id) => api.get(`/categories/${id}/spend`);
export const getCategoryKpis = (id) => api.get(`/categories/${id}/kpis`);
export const getCategoryStrategy = (id) => api.get(`/categories/${id}/strategy`);
export const getCategoryStrategyChanges = (id, days = 7) => api.get(`/categories/${id}/strategy/changes?days=${days}`);
export const updateCategoryStrategy = (id, contentBlocks) => api.post(`/categories/${id}/strategy`, { content_blocks: contentBlocks });
export const generateCategoryInsights = (id) => api.post(`/categories/${id}/strategy/insights`);

export const uploadCategoryStrategyFile = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/categories/${id}/strategy/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const summarizeCategoryStrategy = (id) => api.post(`/categories/${id}/strategy/summarize`);
export const copilotEditCategoryStrategy = (id, prompt) => api.post(`/categories/${id}/strategy/copilot-edit`, { prompt });

export const getSpendAnalysis = (id) => api.get(`/categories/${id}/spend-analysis`);
export const analyzeSpendInsights = (id) => api.post(`/categories/${id}/spend-analysis/analyze`);

export const copilotQuery = (query, context = {}) => api.post('/copilot/query', { query, context });
export const getCategoryTasks = (id) => api.get(`/categories/${id}/tasks`);
export const toggleCategoryTask = (id, taskId) => api.post(`/categories/${id}/tasks/${taskId}/toggle`);
export const getMarketIntelligence = (id) => api.get(`/categories/${id}/market-intelligence`);

// Transactions (PR->PO)
export const getTransactionPipeline = (params) => api.get('/pr/pipeline', { params });
export const getTransactionAging = (params) => api.get('/pr/aging', { params });
export const getTransactionSlas = (params) => api.get('/pr/slas', { params });
export const getPrList = (params) => api.get('/pr/list', { params });
export const getPRs = () => api.get('/pr/list'); // Alias to resolve import in AppContext
export const getPrDetail = (id) => api.get(`/pr/${id}`);
export const getPrGantt = (id) => api.get(`/pr/${id}/gantt`);

// Vendors
export const getVendors = () => api.get('/vendors');
export const getVendorDetail = (id) => api.get(`/vendors/${id}`);
export const getVendorDashboardKpis = (params) => api.get('/vendors/dashboard/kpis', { params });
export const getVendorPerformance = (params) => api.get('/vendors/dashboard/performance', { params });
export const getVendorIntelligenceDash = (params) => api.get('/vendors/dashboard/intelligence', { params });
export const getVendorRegistration = () => api.get('/vendors/dashboard/registration');
export const getVendorSlaAging = () => api.get('/vendors/dashboard/sla-aging');
export const getVendorDiscovery = () => api.get('/vendors/dashboard/discovery');
export const getVendorTasks = () => api.get('/vendors/dashboard/tasks');

// Notifications & Tasks
export const getNotifications = (params = {}) => api.get('/notifications', { params });
export const getTaskSummary = () => api.get('/tasks/summary');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/mark-read`);
export const resolveNotification = (id) => api.patch(`/notifications/${id}/resolve`);

export default api;

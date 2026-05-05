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
export const getCategoryMetaFilters = () => api.get('/categories/meta/filters');
export const getCategorySpend = (id) => api.get(`/categories/${id}/spend`);
export const getCategoryKpis = (id, params = {}) => api.get(`/categories/${id}/kpis`, { params });
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

export const getSpendAnalysis = (id, timeFilter = 'monthly') => api.get(`/categories/${id}/spend-analysis?time_filter=${timeFilter}`);
export const analyzeSpendInsights = (id) => api.post(`/categories/${id}/spend-analysis/analyze`);

export const copilotQuery = (query, context = {}) => api.post('/copilot/query', { query, context });
export const getCategoryTasks = (id) => api.get(`/categories/${id}/tasks`);
export const toggleCategoryTask = (id, taskId) => api.post(`/categories/${id}/tasks/${taskId}/toggle`);
export const getMarketIntelligence = (id) => api.get(`/categories/${id}/market-intelligence`);

// Transactions (PR->PO)
export const getTransactionPipeline = (params) => api.get('/pr/pipeline', { params });
export const getTransactionAging = (params) => api.get('/pr/aging', { params });
export const getTransactionSlas = (params) => api.get('/pr/slas', { params });
export const getPrList = async (params) => {
  let serverData = [];
  try {
    const res = await api.get('/pr/list', { params });
    serverData = res.data || [];
  } catch (err) {
    console.error("Backend PR list fetch failed, using local storage fallback", err);
  }
  const localPRs = JSON.parse(localStorage.getItem('mock_raised_prs') || '[]');
  return { data: [...localPRs, ...serverData] };
};
export const getPRs = () => api.get('/pr/list'); // Alias to resolve import in AppContext
export const getPrDetail = (id) => api.get(`/pr/${id}`);
export const getPrGantt = async (id) => {
  const localPRs = JSON.parse(localStorage.getItem('mock_raised_prs') || '[]');
  const localPr = localPRs.find(pr => String(pr.id) === String(id) || `PR-${pr.id}` === String(id));
  if (localPr) {
     const status_order = ["REJECTED", "CREATED", "APPROVED", "SOURCING", "PO_CREATED", "CLOSED"];
     const raw_idx = status_order.indexOf(localPr.status?.toUpperCase() || "CREATED");
     let current_idx = 0;
     if (raw_idx === 4) current_idx = 4;
     else if (raw_idx === 5) current_idx = 5;
     else current_idx = Math.max(0, raw_idx - 1);

     const stages_meta = [
         {"name": "Purchase Requisition", "sla": 3},
         {"name": "RFx Release", "sla": 7},
         {"name": "Supplier Evaluation", "sla": 14},
         {"name": "Negotiations", "sla": 10},
         {"name": "PO Approval", "sla": 5},
     ];

     const stages = stages_meta.map((meta, i) => {
         const status = current_idx > i ? "completed" : (current_idx === i ? "in_progress" : "pending");
         const planned = meta.sla;
         let current = planned;
         if (status === "completed") {
            const variance = (i % 3) - 1; // Simplistic variation
            current = planned + variance;
         } else if (status === "in_progress") {
            current = planned + 2;
         }
         return {
             name: meta.name,
             status: status,
             owner: i === 0 ? localPr.requester : "Sourcing Lead",
             date: status === "completed" ? localPr.date : null,
             planned_days: planned,
             current_days: current
         };
     });

     return {
        data: {
          id: localPr.id,
          description: localPr.description,
          requester: localPr.requester,
          department: "Operations",
          date: localPr.date,
          status: localPr.status || "CREATED",
          amount: localPr.amount,
          currency: "INR",
          category: "General",
          pending_with: current_idx < 5 ? stages[current_idx].owner : null,
          stages: stages
        }
     };
  }
  try {
    return await api.get(`/pr/${id}/gantt`);
  } catch (err) {
    console.error("Backend PR Gantt fetch failed", err);
    throw err;
  }
};

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

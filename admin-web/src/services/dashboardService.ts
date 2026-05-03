import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data.stats;
  },
  getAnalytics: async () => {
    const response = await api.get('/admin/dashboard/analytics');
    return response.data.data;
  },
};

import api from '@/services/api';

export const reviewService = {
  getReviews: async (params: { page: number; limit: number }) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },
  deleteReview: async (id: string) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },
};

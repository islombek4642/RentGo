import api from '@/services/api';
import { BookingsFilters, BookingsResponse } from '../types';

export const bookingsService = {
  getBookings: async (filters: BookingsFilters): Promise<BookingsResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/admin/bookings?${params.toString()}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },
};

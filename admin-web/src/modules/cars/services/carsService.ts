import api from '@/services/api';
import { CarsFilters, CarsResponse } from '../types';

export const carsService = {
  getCars: async (filters: CarsFilters): Promise<CarsResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/admin/cars?${params.toString()}`);
    return response.data;
  },

  approveCar: async (id: string) => {
    const response = await api.patch(`/admin/cars/${id}/approve`);
    return response.data;
  },

  rejectCar: async (id: string) => {
    const response = await api.patch(`/admin/cars/${id}/reject`);
    return response.data;
  },
};

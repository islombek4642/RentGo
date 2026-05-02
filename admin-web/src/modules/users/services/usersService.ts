import api from '@/services/api';
import { UsersFilters, UsersResponse } from '../types';

export const usersService = {
  getUsers: async (filters: UsersFilters): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.role) params.append('role', filters.role);
    if (filters.is_verified !== undefined) params.append('is_verified', filters.is_verified.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  verifyUser: async (id: string, is_verified: boolean) => {
    const response = await api.patch(`/admin/users/${id}/verify`, { is_verified });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

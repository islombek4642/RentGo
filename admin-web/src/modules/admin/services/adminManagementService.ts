import api from '@/services/api';
import { AdminsResponse } from '../types';
import { Role } from '@/constants';

export const adminManagementService = {
  getAdmins: async (): Promise<AdminsResponse> => {
    const roles = ['admin', 'super_admin', 'moderator', 'support'].join(',');
    const response = await api.get('/admin/users', { params: { role: roles, limit: 100 } });
    return { status: 'success', users: response.data.users };
  },

  updateRole: async (id: string, role: Role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deactivateAdmin: async (id: string, is_active: boolean) => {
    const response = await api.patch(`/admin/users/${id}/deactivate`, { is_active });
    return response.data;
  },
};

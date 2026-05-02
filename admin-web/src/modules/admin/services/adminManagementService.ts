import api from '@/services/api';
import { AdminsResponse } from '../types';
import { Role } from '@/constants';

export const adminManagementService = {
  getAdmins: async (): Promise<AdminsResponse> => {
    // Fetch all staff roles
    const response = await api.get('/admin/users');
    // Filter staff roles on frontend for now or refine backend query
    const allUsers = response.data.users as any[];
    const admins = allUsers.filter(u => 
      ['admin', 'super_admin', 'moderator', 'support'].includes(u.role)
    );
    return { status: 'success', users: admins };
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

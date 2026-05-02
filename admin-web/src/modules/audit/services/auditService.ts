import api from '@/services/api';
import { AuditLogsFilters, AuditLogsResponse } from '../types';

export const auditService = {
  getLogs: async (filters: AuditLogsFilters): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.action) params.append('action', filters.action);

    const response = await api.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  },
};

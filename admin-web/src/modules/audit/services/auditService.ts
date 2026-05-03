import api from '@/services/api';
import { AuditLogsFilters, AuditLogsResponse } from '../types';

export const auditService = {
  getLogs: async (filters: AuditLogsFilters): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.action) params.append('action', filters.action);
    if (filters.resource_id) params.append('resource_id', filters.resource_id);
    if (filters.ip_address) params.append('ip_address', filters.ip_address);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await api.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  },
};

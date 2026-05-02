import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import { AuditLogsFilters } from '../types';

export const useAuditLogs = (filters: AuditLogsFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getLogs(filters),
  });
};

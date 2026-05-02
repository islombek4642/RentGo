import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManagementService } from '../services/adminManagementService';
import { Role } from '@/constants';

export const useAdminManagement = () => {
  const queryClient = useQueryClient();

  const adminsQuery = useQuery({
    queryKey: ['admin-team'],
    queryFn: adminManagementService.getAdmins,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      adminManagementService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminManagementService.deactivateAdmin(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    },
  });

  return {
    adminsQuery,
    roleMutation,
    deactivateMutation,
  };
};

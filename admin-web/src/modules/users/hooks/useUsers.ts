import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/usersService';
import { UsersFilters } from '../types';

export const useUsers = (filters: UsersFilters) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersService.getUsers(filters),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, is_verified }: { id: string; is_verified: boolean }) =>
      usersService.verifyUser(id, is_verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    usersQuery,
    verifyMutation,
    deleteMutation,
  };
};

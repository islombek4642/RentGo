import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsService } from '../services/bookingsService';
import { BookingsFilters } from '../types';

export const useBookings = (filters: BookingsFilters) => {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => bookingsService.getBookings(filters),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });

  return {
    bookingsQuery,
    statusMutation,
  };
};

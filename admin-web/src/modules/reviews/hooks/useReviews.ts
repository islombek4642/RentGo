import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';

export const useReviews = (params: { page: number; limit: number }) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => reviewService.getReviews(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  return {
    reviewsQuery,
    deleteMutation,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsService } from '../services/carsService';
import { CarsFilters } from '../types';

export const useCars = (filters: CarsFilters) => {
  const queryClient = useQueryClient();

  const carsQuery = useQuery({
    queryKey: ['admin-cars', filters],
    queryFn: () => carsService.getCars(filters),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => carsService.approveCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => carsService.rejectCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
    },
  });

  return {
    carsQuery,
    approveMutation,
    rejectMutation,
  };
};

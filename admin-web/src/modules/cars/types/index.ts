import { CAR_STATUS } from '@/constants';

export interface Car {
  id: string;
  owner_id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  location: string;
  image_url?: string;
  status: typeof CAR_STATUS[keyof typeof CAR_STATUS];
  description?: string;
  features?: string[] | string;
  car_type?: string;
  fuel_type?: string;
  transmission?: string;
  seats?: number;
  owner_name?: string;
  owner_phone?: string;
  display_location?: string;
  created_at: string;
}

export interface CarsResponse {
  status: string;
  cars: Car[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CarsFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

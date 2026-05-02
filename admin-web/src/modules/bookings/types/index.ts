import { BOOKING_STATUS } from '@/constants';

export interface Booking {
  id: string;
  car_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  created_at: string;
  brand: string;
  model: string;
  car_image?: string;
  renter_name: string;
  renter_phone: string;
  owner_name: string;
  owner_phone: string;
}

export interface BookingsResponse {
  status: string;
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingsFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

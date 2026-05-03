import { Role } from '@/constants';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  is_verified: boolean;
  is_active: boolean;
  license_image_url?: string;
  created_at: string;
}

export interface UsersResponse {
  status: string;
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  role?: string;
  is_verified?: boolean;
  search?: string;
}

import { Role } from '@/constants';

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface AdminsResponse {
  status: string;
  users: AdminUser[];
}

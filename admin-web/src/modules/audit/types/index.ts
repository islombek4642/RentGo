export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
}

export interface AuditLogsResponse {
  status: string;
  data: {
    logs: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AuditLogsFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  resource_id?: string;
  ip_address?: string;
  date_from?: string;
  date_to?: string;
}

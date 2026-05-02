export const ROLES = {
  USER: 'user',
  OWNER: 'owner',
  SUPPORT: 'support',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const CAR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const PERMISSIONS = {
  // Users
  USER_VIEW: 'user.view',
  USER_VERIFY: 'user.verify',
  USER_DELETE: 'user.delete',
  USER_MANAGE_ROLES: 'user.manage_roles',
  
  // Cars
  CAR_VIEW_ALL: 'car.view_all',
  CAR_APPROVE: 'car.approve',
  CAR_REJECT: 'car.reject',
  CAR_DELETE: 'car.delete',
  
  // Bookings
  BOOKING_VIEW_ALL: 'booking.view_all',
  BOOKING_MANAGE: 'booking.manage',
  
  // Reviews
  REVIEW_DELETE: 'review.delete',
  
  // System
  DASHBOARD_VIEW: 'dashboard.view',
  AUDIT_VIEW: 'audit.view'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const SYSTEM_CONFIG = {
  BCRYPT_SALT_ROUNDS: 10
};

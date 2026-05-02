export const ROLES = {
  USER: 'user',
  OWNER: 'owner',
  SUPPORT: 'support',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

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
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

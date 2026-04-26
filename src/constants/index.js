export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

export const SYSTEM_CONFIG = {
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
  RATE_LIMIT_MAX: 100,
  MAX_JSON_SIZE: '10kb',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  BCRYPT_SALT_ROUNDS: 12,
  DEFAULT_PAGINATION_LIMIT: 10,
  DEFAULT_PAGINATION_PAGE: 1,
};

import { logger } from './logger.js';

/**
 * Lightweight analytics tracking module
 * Logs structured events for key user actions
 * No external services - uses existing winston logger
 */

export const ANALYTICS_EVENTS = {
  AUTH: {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    REGISTER_SUCCESS: 'register_success',
    LOGOUT: 'logout',
  },
  BOOKING: {
    CREATED: 'booking_created',
    CREATE_FAILED: 'booking_failed',
    CANCELLED: 'booking_cancelled',
    CONFIRMED: 'owner_confirm',
    REJECTED: 'owner_reject',
    STARTED: 'trip_started',
    COMPLETED: 'trip_completed',
  },
  CAR: {
    LISTED: 'car_listed',
    UPDATED: 'car_updated',
  },
  REVIEW: {
    SUBMITTED: 'review_submitted',
  },
};

/**
 * Track an analytics event
 * @param {string} eventName - Event name from ANALYTICS_EVENTS
 * @param {string} userId - User ID
 * @param {object} metadata - Additional event data (safe fields only)
 */
export const trackEvent = (eventName, userId, metadata = {}) => {
  const eventLog = {
    type: 'ANALYTICS_EVENT',
    event: eventName,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    metadata,
  };

  logger.info(`[ANALYTICS] ${eventName} | user:${userId}`, eventLog);
};

/**
 * Track authentication events
 */
export const trackAuth = (event, userId, metadata = {}) => {
  trackEvent(event, userId, { category: 'auth', ...metadata });
};

/**
 * Track booking events
 */
export const trackBooking = (event, userId, metadata = {}) => {
  trackEvent(event, userId, { category: 'booking', ...metadata });
};

/**
 * Track car listing events
 */
export const trackCar = (event, userId, metadata = {}) => {
  trackEvent(event, userId, { category: 'car', ...metadata });
};

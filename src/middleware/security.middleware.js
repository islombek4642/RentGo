import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';

/**
 * General API Rate Limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for legitimate asset-heavy usage
  message: {
    status: 'error',
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, birozdan so\'ng urinib ko\'ring.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth specific Rate Limiter - STRICT
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 mins
  message: {
    status: 'error',
    message: 'Kirish uchun juda ko\'p urinishlar. Iltimos, 15 daqiqadan so\'ng urinib ko\'ring.'
  },
  skipSuccessfulRequests: false // Don't allow brute force even if they might hit one success
});

/**
 * Admin Action Rate Limiter - DEFENSIVE
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    status: 'error',
    message: 'Admin amallari uchun limitga yetdingiz.'
  }
});

/**
 * Password change specific Rate Limiter
 */
export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    status: 'error',
    message: 'Parolni o\'zgartirish uchun juda ko\'p urinishlar.'
  }
});

/**
 * Main security setup for Express app
 */
export const securityMiddleware = (app) => {
  // 1) Set security HTTP headers
  app.use(helmet());

  // 2) CORS configuration
  app.use(cors());

  // 3) Prevent Parameter Pollution
  app.use(hpp());

  // 4) Rate limiting
  app.use('/api', globalLimiter);
};

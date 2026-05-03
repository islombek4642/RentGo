import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';

/**
 * General API Rate Limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, 15 daqiqadan so\'ng urinib ko\'ring.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth specific Rate Limiter
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Kirish uchun juda ko\'p urinishlar bajarildi. Iltimos, bir soatdan so\'ng urinib ko\'ring.'
  },
  skipSuccessfulRequests: true
});

/**
 * Booking specific Rate Limiter
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    status: 'error',
    message: 'Siz juda ko\'p bandlov yaratdingiz. Iltimos, birozdan so\'ng urinib ko\'ring.'
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
    message: 'Parolni o\'zgartirish uchun juda ko\'p urinishlar. Iltimos, bir soatdan so\'ng urinib ko\'ring.'
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

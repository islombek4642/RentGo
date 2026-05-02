import winston from 'winston';
import * as Sentry from '@sentry/node';
import { HTTP_STATUS } from '../constants/index.js';

// Winston Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

/**
 * Global Error Handling Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Log error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Sentry logging in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }

  // Production Error Response (Clean, no stack trace)
  if (process.env.NODE_ENV === 'production') {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        code: err.code || 'INTERNAL_ERROR'
      });
    }
    
    // Programming or other unknown error: don't leak error details
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 'error',
      message: 'Nimadir xato ketdi! Iltimos, keyinroq urinib ko\'ring.',
      code: 'INTERNAL_ERROR'
    });
  }

  // Development Error Response (Detailed with stack)
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    code: err.code || 'INTERNAL_ERROR',
    stack: err.stack,
    error: err
  });
};

export default globalErrorHandler;
export { logger };

import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { t } from '../utils/i18n.js';

/**
 * Categorize error type for logging
 */
const getErrorCategory = (statusCode) => {
  if (statusCode >= 500) return 'SYSTEM_ERROR';
  if (statusCode === 401 || statusCode === 403) return 'AUTH_ERROR';
  if (statusCode === 400 || statusCode === 422) return 'VALIDATION_ERROR';
  if (statusCode === 404) return 'NOT_FOUND';
  return 'UNKNOWN_ERROR';
};

/**
 * Log error with structured data
 */
const logError = (err, req, category) => {
  const errorLog = {
    category,
    endpoint: `${req.method} ${req.originalUrl}`,
    userId: req.user?.id || 'anonymous',
    statusCode: err.statusCode,
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    // Safe payload logging (exclude passwords, tokens)
    payload: req.body ? sanitizePayload(req.body) : undefined,
    timestamp: new Date().toISOString(),
  };

  if (category === 'SYSTEM_ERROR') {
    logger.error(`[ERROR] ${category}: ${errorLog.endpoint} | user:${errorLog.userId} | ${err.message}`, errorLog);
  } else if (category === 'AUTH_ERROR') {
    logger.warn(`[ERROR] ${category}: ${errorLog.endpoint} | user:${errorLog.userId} | ${err.message}`, errorLog);
  } else {
    logger.info(`[ERROR] ${category}: ${errorLog.endpoint} | user:${errorLog.userId} | ${err.message}`, errorLog);
  }
};

/**
 * Sanitize payload to remove sensitive data
 */
const sanitizePayload = (payload) => {
  const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'secret'];
  const sanitized = { ...payload };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  
  return sanitized;
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code || 'ERROR',
    ...(err.details && { details: err.details })
  });
};

const sendErrorProd = (err, res, req) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR',
      ...(err.details && { details: err.details })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!',
      code: 'INTERNAL_ERROR',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
    err.message = t(req.lang, 'profile.upload_too_large') || 'File size too large (max 5MB)';
  }

  // Categorize and log error
  const category = getErrorCategory(err.statusCode);
  logError(err, req, category);

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res, req);
  }
};

export default globalErrorHandler;

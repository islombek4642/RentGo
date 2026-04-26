import { logger } from '../config/logger.js';

/**
 * Request logging middleware
 * Logs: method + route + status + response time + userId (if authenticated)
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anonymous';
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId,
      userAgent: req.get('user-agent')?.substring(0, 50),
      ip: req.ip || req.connection?.remoteAddress,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(`[REQUEST] ${logData.method} ${logData.url} ${logData.status} - ${logData.duration} | user:${userId}`);
    } else if (res.statusCode >= 400) {
      logger.warn(`[REQUEST] ${logData.method} ${logData.url} ${logData.status} - ${logData.duration} | user:${userId}`);
    } else {
      logger.info(`[REQUEST] ${logData.method} ${logData.url} ${logData.status} - ${logData.duration} | user:${userId}`);
    }
  });

  next();
};

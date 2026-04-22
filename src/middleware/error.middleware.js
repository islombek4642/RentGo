import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { t } from '../utils/i18n.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    ...(err.details && { details: err.details })
  });
};

const sendErrorProd = (err, res, req) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
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

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res, req);
  }
};

export default globalErrorHandler;

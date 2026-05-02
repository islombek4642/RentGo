import express from 'express';
import morgan from 'morgan';
import { securityMiddleware } from './middleware/security.middleware.js';
import { langMiddleware } from './middleware/lang.middleware.js';
import globalErrorHandler from './middleware/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import routes from './routes/index.js';
import AppError from './utils/AppError.js';
import { HTTP_STATUS } from './constants/index.js';
import { config } from './config/env.js';

const app = express();

// 1) GLOBAL MIDDLEWARES
// Serve static upload files
app.use('/uploads', express.static(config.uploadPath));

// Swagger Documentation
setupSwagger(app);

// Security headers, rate limiting, CORS
securityMiddleware(app);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Language detection
app.use(langMiddleware);

// Request logging (production visibility)
if (process.env.NODE_ENV === 'production') {
  app.use(requestLogger);
}

import pool from './config/db.js';

// 2) ROUTES
app.get('/api/v1/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', message: 'API is running and DB is connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});
app.use('/api/v1', routes);

// 3) UNHANDLED ROUTES
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND));
});

// 4) GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

export default app;

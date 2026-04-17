import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { config } from '../config/env.js';
import { SYSTEM_CONFIG } from '../constants/index.js';

export const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Limit requests from same API
  const limiter = rateLimit({
    max: SYSTEM_CONFIG.RATE_LIMIT_MAX,
    windowMs: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
    message: 'Too many requests from this IP, please try again in an hour!',
  });
  app.use('/api', limiter);

  // Implement CORS
  const corsOptions = {
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  };
  
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
};

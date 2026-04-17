import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { config } from '../config/env.js';
import { SYSTEM_CONFIG } from '../constants/index.js';
import { t } from '../utils/i18n.js';

// Helper: extract lang from Accept-Language header (mirrors lang.middleware logic)
const getLangFromHeader = (req) => {
  const headerValue = req.headers['accept-language'];
  if (!headerValue) return 'uz';
  const requested = headerValue.split(',')[0].split('-')[0].toLowerCase();
  return ['uz', 'ru', 'en'].includes(requested) ? requested : 'uz';
};

export const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Limit requests from same API — i18n-aware handler
  const limiter = rateLimit({
    max: SYSTEM_CONFIG.RATE_LIMIT_MAX,
    windowMs: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const lang = getLangFromHeader(req);
      res.status(429).json({
        status: 'fail',
        message: t(lang, 'common.rate_limit'),
      });
    },
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
  app.options(/.*/, cors(corsOptions));
};

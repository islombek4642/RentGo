import express from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

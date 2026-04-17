import express from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check — verify server is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                   example: 342.51
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2026-04-17T15:41:09.993Z'
 *                 environment:
 *                   type: string
 *                   enum: [development, production, test]
 *                   example: development
 */
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

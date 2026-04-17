import { config } from './config/env.js';
import app from './app.js';
import { logger } from './config/logger.js';
import pool from './config/db.js';

const port = config.port;

const server = app.listen(port, () => {
  logger.info(`Server running in ${config.env} mode on port ${port} 🚀`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

// Graceful DB shutdown
const closeDb = async () => {
  await pool.end();
  logger.info('Database pool closed.');
};

process.on('SIGINT', async () => {
  logger.info('SIGINT RECEIVED. Shutting down...');
  await closeDb();
  server.close(() => {
    process.exit(0);
  });
});

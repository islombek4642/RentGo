import { config } from './config/env.js';
import app from './app.js';
import { logger } from './config/logger.js';
import pool from './config/db.js';
import { setupDatabase } from './config/db-setup.js';

const port = config.port;

const startServer = async () => {
  try {
    // 1) Initialize Database (Migrations & Seed in Dev)
    await setupDatabase();

    // 2) Start Listening
    const server = app.listen(port, () => {
      logger.info(`Server running in ${config.env} mode on port ${port} 🚀`);
    });

    // Handle server-level errors (e.g. EADDRINUSE)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`FATAL: Port ${port} is already in use. Is another instance running?`);
      } else {
        logger.error('Server error:', err);
      }
      process.exit(1);
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

    process.on('SIGINT', async () => {
      logger.info('SIGINT RECEIVED. Shutting down...');
      await pool.end();
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error('CRITICAL: Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

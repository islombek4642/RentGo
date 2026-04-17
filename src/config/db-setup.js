import fs from 'fs';
import path from 'path';
import pool from './db.js';
import { logger } from './logger.js';
import { runSeedData } from '../utils/seed-utils.js';
import { config } from './env.js';

/**
 * Automatically initializes the database:
 * 1. Checks if tables exist -> Migrates if not.
 * 2. Checks if the database is empty -> Seeds if so.
 */
export const setupDatabase = async () => {
  // Safeguard: Only run in development and if flag is set
  const isDev = config.env === 'development';
  const autoInit = process.env.AUTO_DB_INIT === 'true';

  if (!isDev || !autoInit) {
    logger.debug('Database auto-initialization skipped (Production or AUTO_DB_INIT=false)');
    return;
  }

  logger.info('Starting automated database initialization...');

  try {
    // 1) Migration Check: Does 'users' table exist?
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tablesExist = tableCheck.rows[0].exists;

    if (!tablesExist) {
      logger.info('Tables not found. Running schema migration...');
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      // Execute each statement
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const statement of statements) {
        await pool.query(statement);
      }
      logger.info('Database schema migration completed successfully! 🚀');
    } else {
      logger.info('Database structure already exists. Skipping migration.');
    }

    // 2) Idempotent Seeding Check
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count);

    if (userCount === 0) {
      logger.info('Database is empty. Initiating seed process...');
      await runSeedData(pool);
      logger.info('Automated seeding completed successfully! 🌱');
    } else {
      logger.info('Database already contains data. Skipping auto-seed.');
    }

    logger.info('Database initialization finished! ✅');
  } catch (error) {
    logger.error('CRITICAL: Database auto-initialization failed:', error);
    // In dev, we can let it fail or log it. 
    // Usually, we want to know why migration failed.
    throw error; 
  }
};

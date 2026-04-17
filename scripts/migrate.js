import fs from 'fs';
import path from 'path';
import pool from '../src/config/db.js';
import { logger } from '../src/config/logger.js';

const migrate = async () => {
  try {
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    logger.info('Starting database migration...');
    
    // Split SQL by semicolon and execute each statement
    // Note: This is a simple parser and might need adjustment for complex SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }

    logger.info('Database migration completed successfully! 🚀');
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate();

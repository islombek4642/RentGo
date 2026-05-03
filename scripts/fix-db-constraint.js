import pool from '../src/config/db.js';
import { logger } from '../src/config/logger.js';

async function fixConstraint() {
  try {
    logger.info('Starting database constraint fix...');

    // 1) Find the name of the check constraint on the users table (it's usually users_role_check)
    // 2) Drop the old constraint
    // 3) Add the new constraint with all roles
    
    await pool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
      
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('user', 'owner', 'support', 'moderator', 'admin', 'super_admin'));
    `);

    logger.info('Database constraint successfully updated! ✅');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to fix database constraint:', error);
    process.exit(1);
  }
}

fixConstraint();

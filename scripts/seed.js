import pool from '../src/config/db.js';
import { logger } from '../src/config/logger.js';
import { runSeedData } from '../src/utils/seed-utils.js';

const seed = async () => {
  logger.info('Starting manual database seeding...');

  try {
    // Manual seeding often implies a fresh start
    logger.info('Cleaning existing data (Manual Reset)...');
    await pool.query('TRUNCATE users, cars, bookings, refresh_tokens CASCADE');
    
    // Use the shared seeding utility
    await runSeedData(pool);

    logger.info('Manual seeding completed successfully! 🌱');
  } catch (error) {
    logger.error('Manual seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();

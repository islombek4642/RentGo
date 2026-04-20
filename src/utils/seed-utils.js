import bcrypt from 'bcrypt';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { ROLES, SYSTEM_CONFIG } from '../constants/index.js';

/**
 * Shared seeding logic for database initialization
 * @param {object} pool - Database pool or client
 */
export const runSeedData = async (pool) => {
  logger.info('Running idempotent database seeding...');

  try {
    // 1) Ensure Admin exists
    const adminPassword = await bcrypt.hash(config.seeding.adminPassword, SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, phone, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (phone) DO NOTHING`,
      ['System Admin', '+998901234567', adminPassword, ROLES.ADMIN]
    );

    // 2) Ensure Regular User exists
    const userPassword = await bcrypt.hash(config.seeding.userPassword, SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
    const userResult = await pool.query(
      `INSERT INTO users (name, phone, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (phone) DO NOTHING 
       RETURNING id`,
      ['John Doe', '+998909876543', userPassword, ROLES.USER]
    );

    // Get an admin ID for car ownership (fallback if creation skipped)
    const adminCheck = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', [ROLES.ADMIN]);
    const adminId = adminCheck.rows[0]?.id;

    if (!adminId) {
       throw new Error('Could not find or create an admin user for car assignment.');
    }

    // 3) Create Sample Cars if none exist
    const carCheck = await pool.query('SELECT COUNT(*) FROM cars');
    if (parseInt(carCheck.rows[0].count) === 0) {
      const cars = [
        { brand: 'Chevrolet', model: 'Malibu', year: 2023, price: 500000, location: 'Tashkent' },
        { brand: 'Chevrolet', model: 'Tracker', year: 2022, price: 400000, location: 'Samarkand' },
        { brand: 'Kia', model: 'K5', year: 2023, price: 600000, location: 'Tashkent' },
      ];

      for (const car of cars) {
        await pool.query(
          'INSERT INTO cars (owner_id, brand, model, year, price_per_day, location) VALUES ($1, $2, $3, $4, $5, $6)',
          [adminId, car.brand, car.model, car.year, car.price, car.location]
        );
      }
      logger.info('Sample cars created.');
    } else {
      logger.info('Cars already exist, skipping car seeding.');
    }

    logger.info('Database seeding check completed! 🌱');
  } catch (error) {
    logger.error('Database seeding utility failed:', error);
    throw error;
  }
};

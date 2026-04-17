import bcrypt from 'bcrypt';
import pool from '../src/config/db.js';
import { logger } from '../src/config/logger.js';
import { ROLES, SYSTEM_CONFIG } from '../src/constants/index.js';

const seed = async () => {
  logger.info('Starting database seeding...');

  try {
    // 1) Clean existing data (optional, but good for fresh seed)
    await pool.query('TRUNCATE users, cars, bookings, refresh_tokens CASCADE');
    logger.info('Cleaned existing data.');

    // 2) Create Admin
    const adminPassword = await bcrypt.hash('admin123', SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
    const adminResult = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['System Admin', '+998901234567', adminPassword, ROLES.ADMIN]
    );
    const adminId = adminResult.rows[0].id;
    logger.info('Admin user created.');

    // 3) Create Regular User
    const userPassword = await bcrypt.hash('user123', SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
    const userResult = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['John Doe', '+998909876543', userPassword, ROLES.USER]
    );
    const userId = userResult.rows[0].id;
    logger.info('Regular user created.');

    // 4) Create Cars
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

    logger.info('Seeding completed successfully! 🌱');
  } catch (error) {
    logger.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seed();

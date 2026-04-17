import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';
import { SYSTEM_CONFIG } from '../src/constants/index.js';

/**
 * Creates a test user in the database.
 */
export const createTestUser = async (data = {}) => {
  const {
    name = 'Test User',
    phone = '+998901234567',
    password = 'password123',
    role = 'user'
  } = data;

  const hashedPassword = await bcrypt.hash(password, SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
  
  const result = await pool.query(
    'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role',
    [name, phone, hashedPassword, role]
  );
  
  return { ...result.rows[0], plainPassword: password };
};

/**
 * Creates a test car in the database.
 */
export const createTestCar = async (ownerId, data = {}) => {
  const {
    brand = 'Chevrolet',
    model = 'Malibu',
    year = 2023,
    price_per_day = 500000,
    location = 'Tashkent',
    is_available = true
  } = data;

  const result = await pool.query(
    'INSERT INTO cars (owner_id, brand, model, year, price_per_day, location, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [ownerId, brand, model, year, price_per_day, location, is_available]
  );
  
  return result.rows[0];
};

/**
 * Creates a test booking in the database.
 */
export const createTestBooking = async (carId, userId, data = {}) => {
  const {
    start_date = '2026-06-01',
    end_date = '2026-06-05',
    total_price = 2500000,
    status = 'pending'
  } = data;

  const result = await pool.query(
    'INSERT INTO bookings (car_id, user_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [carId, userId, start_date, end_date, total_price, status]
  );
  
  return result.rows[0];
};

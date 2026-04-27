import fs from 'fs';
import path from 'path';
import pg from 'pg';
import pool from '../src/config/db.js';
import { config } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';

const { Client } = pg;

/**
 * Ensures the test database exists.
 */
const ensureTestDatabaseExists = async () => {
  const client = new Client({
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.db.name]);
    
    if (res.rowCount === 0) {
      console.log(`Test database "${config.db.name}" not found. Creating...`);
      await client.query(`CREATE DATABASE "${config.db.name}"`);
    }
  } catch (err) {
    console.error('Error during test database existence check/creation:', err);
    throw err;
  } finally {
    await client.end();
  }
};

/**
 * Global setup for tests:
 * 1. Ensures test database exists and has schema.
 * 2. Truncates all tables before each test suite.
 */
beforeAll(async () => {
  // Ensure we are in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test setup must be run in NODE_ENV=test');
  }

  await ensureTestDatabaseExists();

  // Force a fresh schema for tests to avoid inconsistent states
  console.log('Refreshing test database schema...');
  await pool.query(`
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS refresh_tokens CASCADE;
    DROP TABLE IF EXISTS bookings CASCADE;
    DROP TABLE IF EXISTS cars CASCADE;
    DROP TABLE IF EXISTS districts CASCADE;
    DROP TABLE IF EXISTS regions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  console.log('Initializing schema...');
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      console.error(`Error executing statement: ${statement.substring(0, 50)}...`, err.message);
    }
  }
  console.log('Schema initialization completed.');

  // Ensure the check_dates constraint uses strict > (half-open interval model)
  try {
    await pool.query(`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_dates`);
    await pool.query(`ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date)`);
  } catch (e) {
    // Constraint already correct, ignore
  }

  // Seed basic locations for tests
  await pool.query(`
    INSERT INTO regions (id, name_uz) VALUES (1, 'Test Region') ON CONFLICT (id) DO NOTHING;
    INSERT INTO districts (id, region_id, name_uz) VALUES (1, 1, 'Test District') ON CONFLICT (id) DO NOTHING;
  `);
});

beforeEach(async () => {
  // Truncate tables and restart identity to ensure clean slate for every test file
  // We don't truncate regions/districts as they are static lookup data
  await pool.query('TRUNCATE TABLE users, cars, bookings, refresh_tokens RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  // Close pool after all tests in the file are done
  // Wait, Jest setup actually runs for each test file. 
  // We'll close the pool to prevent handle leaks.
  await pool.end();
});

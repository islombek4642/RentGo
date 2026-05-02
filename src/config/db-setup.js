import fs from 'fs';
import path from 'path';
import pg from 'pg';
import pool from './db.js';
import { logger } from './logger.js';
import { runSeedData } from '../utils/seed-utils.js';
import { config } from './env.js';

// Load regions and districts data
let regionsData = [];
let districtsData = [];
try {
  const regionsPath = path.join(process.cwd(), 'database', 'data', 'regions.json');
  const districtsPath = path.join(process.cwd(), 'database', 'data', 'districts.json');
  if (fs.existsSync(regionsPath)) {
    regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
  }
  if (fs.existsSync(districtsPath)) {
    districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
  }
} catch (error) {
  logger.warn('Could not load regions/districts data files:', error.message);
}

const { Client } = pg;

/**
 * Ensures the target database exists.
 * Connects to 'postgres' database to check and create if necessary.
 */
const ensureDatabaseExists = async () => {
  const client = new Client({
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    database: 'postgres', // Connect to default postgres DB
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.db.name]);
    
    if (res.rowCount === 0) {
      logger.info(`Database "${config.db.name}" not found. Creating...`);
      // CREATE DATABASE cannot be run in a transaction, and pg library handles it fine outside if we use a client
      await client.query(`CREATE DATABASE "${config.db.name}"`);
      logger.info(`Database "${config.db.name}" created successfully!`);
    } else {
      logger.debug(`Database "${config.db.name}" already exists.`);
    }
  } catch (err) {
    logger.error('Error during database existence check/creation:', err);
    throw err;
  } finally {
    await client.end();
  }
};

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
    // 0) Ensure database itself exists
    await ensureDatabaseExists();
    // 1) Migration Check: Does all required tables exist?
    const tableCheck = await pool.query(`
      SELECT 
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')) as has_users,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'regions')) as has_regions,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'districts')) as has_districts,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews')) as has_reviews;
    `);

    const hasUsers = tableCheck.rows[0].has_users === true || tableCheck.rows[0].has_users === 't';
    const hasRegions = tableCheck.rows[0].has_regions === true || tableCheck.rows[0].has_regions === 't';
    const hasDistricts = tableCheck.rows[0].has_districts === true || tableCheck.rows[0].has_districts === 't';
    const hasReviews = tableCheck.rows[0].has_reviews === true || tableCheck.rows[0].has_reviews === 't';
    const tablesExist = hasUsers && hasRegions && hasDistricts && hasReviews;

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
    }
    
    // 1.5) Check and add missing columns to existing tables
    // Check if cars table has region_id column
    const columnCheck = await pool.query(`
      SELECT 
        EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'region_id') as has_region_id,
        EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'car_type') as has_car_type,
        EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'status') as has_status
    `);
    
    const hasRegionIdColumn = columnCheck.rows[0].has_region_id === true || columnCheck.rows[0].has_region_id === 't';
    const hasCarTypeColumn = columnCheck.rows[0].has_car_type === true || columnCheck.rows[0].has_car_type === 't';
    const hasStatusColumn = columnCheck.rows[0].has_status === true || columnCheck.rows[0].has_status === 't';
    
    if (!hasRegionIdColumn) {
      logger.info('Adding missing location columns to cars table...');
      await pool.query(`
        ALTER TABLE cars 
        ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL;
      `);
      logger.info('Location columns added to cars table! ✅');
    }

    if (!hasCarTypeColumn) {
      logger.info('Adding missing enhanced columns to cars table...');
      await pool.query(`
        ALTER TABLE cars 
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS car_type VARCHAR(50) DEFAULT 'economy' CHECK (car_type IN ('economy', 'standard', 'luxury', 'suv', 'minivan')),
        ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
        ADD COLUMN IF NOT EXISTS transmission VARCHAR(50) DEFAULT 'automatic' CHECK (transmission IN ('automatic', 'manual')),
        ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 5;
      `);
      logger.info('Enhanced car columns added to cars table! ✅');
    }

    if (!hasStatusColumn) {
      logger.info('Adding missing status column to cars table...');
      await pool.query(`
        ALTER TABLE cars 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
        
        -- Mark existing cars as approved to avoid breaking current listings
        UPDATE cars SET status = 'approved' WHERE status IS NULL OR status = 'pending';
      `);
      logger.info('Status column added to cars table! ✅');
    }
    
    // Check and create reviews table if missing
    if (!hasReviews) {
      logger.info('Creating reviews table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
          reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT one_review_per_booking UNIQUE(booking_id, reviewer_id)
        );
        CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON reviews(car_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
      `);
      logger.info('Reviews table created! ✅');
    }

    // 2) Seed regions and districts if empty
    if (regionsData.length > 0 && districtsData.length > 0) {
      const regionCountResult = await pool.query('SELECT COUNT(*) FROM regions');
      const regionCount = parseInt(regionCountResult.rows[0].count);
      
      if (regionCount === 0) {
        logger.info('Seeding regions and districts...');
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Seed regions
          for (const region of regionsData) {
            await client.query(`
              INSERT INTO regions (id, soato_id, name_uz, name_ru, name_oz)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (id) DO NOTHING
            `, [region.id, region.soato_id, region.name_uz, region.name_ru, region.name_oz]);
          }
          
          // Seed districts
          for (const district of districtsData) {
            await client.query(`
              INSERT INTO districts (id, region_id, soato_id, name_uz, name_ru, name_oz)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO NOTHING
            `, [district.id, district.region_id, district.soato_id, district.name_uz, district.name_ru, district.name_oz]);
          }
          
          await client.query('COMMIT');
          logger.info(`Seeded ${regionsData.length} regions and ${districtsData.length} districts! ✅`);
        } catch (error) {
          await client.query('ROLLBACK');
          logger.error('Failed to seed locations:', error);
        } finally {
          client.release();
        }
      } else {
        logger.info('Regions already seeded. Skipping location seed.');
      }
    }

    // 3) Idempotent Seeding Check for users and cars
    logger.info('Running idempotent seeding check...');
    await runSeedData(pool);
    logger.info('Seeding check completed! ✅');

    logger.info('Database initialization finished! ✅');
  } catch (error) {
    logger.error('CRITICAL: Database auto-initialization failed:', error);
    // In dev, we can let it fail or log it. 
    // Usually, we want to know why migration failed.
    throw error; 
  }
};

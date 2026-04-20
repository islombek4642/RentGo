import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting location system migration...');
    
    await client.query('BEGIN');

    // 1. Create Regions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
          id INTEGER PRIMARY KEY,
          soato_id INTEGER,
          name_uz VARCHAR(255) NOT NULL,
          name_ru VARCHAR(255),
          name_oz VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created regions table');

    // 2. Create Districts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS districts (
          id INTEGER PRIMARY KEY,
          region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
          soato_id INTEGER,
          name_uz VARCHAR(255) NOT NULL,
          name_ru VARCHAR(255),
          name_oz VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created districts table');

    // 3. Update Cars table
    const checkRegionCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='cars' AND column_name='region_id';
    `);

    if (checkRegionCol.rowCount === 0) {
      await client.query(`
        ALTER TABLE cars 
        ADD COLUMN region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
        ADD COLUMN district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL;
      `);
      console.log('Added region_id and district_id to cars table');
    } else {
      console.log('Columns already exist in cars table');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.log('Migration failed:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

migrate();

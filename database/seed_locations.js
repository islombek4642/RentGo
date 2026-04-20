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

import fs from 'fs';
import path from 'path';

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting location seeding...');
    
    // 1. Fetch data
    console.log('Fetching regions...');
    const regionsRes = await fetch('https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/regions.json');
    const regions = await regionsRes.json();
    fs.writeFileSync(path.join('database', 'data', 'regions.json'), JSON.stringify(regions, null, 2));

    console.log('Fetching districts...');
    const districtsRes = await fetch('https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/districts.json');
    const districts = await districtsRes.json();
    fs.writeFileSync(path.join('database', 'data', 'districts.json'), JSON.stringify(districts, null, 2));

    await client.query('BEGIN');

    // 2. Clear existing (optional, but good for clean start if idempotent)
    // For this seed, we'll use ON CONFLICT DO UPDATE
    
    // 3. Seed Regions
    console.log(`Seeding ${regions.length} regions...`);
    for (const region of regions) {
      await client.query(`
        INSERT INTO regions (id, soato_id, name_uz, name_ru, name_oz)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          soato_id = EXCLUDED.soato_id,
          name_uz = EXCLUDED.name_uz,
          name_ru = EXCLUDED.name_ru,
          name_oz = EXCLUDED.name_oz
      `, [region.id, region.soato_id, region.name_uz, region.name_ru, region.name_oz]);
    }

    // 4. Seed Districts
    console.log(`Seeding ${districts.length} districts...`);
    for (const district of districts) {
      await client.query(`
        INSERT INTO districts (id, region_id, soato_id, name_uz, name_ru, name_oz)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          region_id = EXCLUDED.region_id,
          soato_id = EXCLUDED.soato_id,
          name_uz = EXCLUDED.name_uz,
          name_ru = EXCLUDED.name_ru,
          name_oz = EXCLUDED.name_oz
      `, [district.id, district.region_id, district.soato_id, district.name_uz, district.name_ru, district.name_oz]);
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();

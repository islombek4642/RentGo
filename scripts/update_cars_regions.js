import pool from '../src/config/db.js';

async function updateCars() {
  try {
    const res = await pool.query(`
      UPDATE cars 
      SET region_id = CASE 
            WHEN location ILIKE '%Tashkent%' THEN 11 
            WHEN location ILIKE '%Samarkand%' THEN 8 
            ELSE region_id 
          END, 
          district_id = CASE 
            WHEN location ILIKE '%Tashkent%' THEN 198 
            WHEN location ILIKE '%Samarkand%' THEN 147 
            ELSE district_id 
          END
    `);
    console.log(`Updated ${res.rowCount} cars with region/district IDs.`);
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    await pool.end();
  }
}

updateCars();

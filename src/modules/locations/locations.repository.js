import pool from '../../config/db.js';

class LocationRepository {
  async findAllRegions() {
    const result = await pool.query(`
      SELECT r.id, r.name_uz, r.name_ru, r.name_oz, COUNT(c.id)::INTEGER as car_count
      FROM regions r
      LEFT JOIN cars c ON r.id = c.region_id
      GROUP BY r.id, r.name_uz, r.name_ru, r.name_oz
      ORDER BY car_count DESC, r.name_uz ASC
    `);
    return result.rows;
  }

  async findDistrictsByRegion(regionId) {
    const result = await pool.query(`
      SELECT id, region_id, name_uz, name_ru, name_oz 
      FROM districts 
      WHERE region_id = $1 
      ORDER BY name_uz ASC
    `, [regionId]);
    return result.rows;
  }

  async findRegionById(id) {
    const result = await pool.query('SELECT * FROM regions WHERE id = $1', [id]);
    return result.rows[0];
  }

  async findDistrictById(id) {
    const result = await pool.query('SELECT * FROM districts WHERE id = $1', [id]);
    return result.rows[0];
  }
}

export default new LocationRepository();

import pool from '../../config/db.js';

class UserRepository {
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, phone, role, is_verified, license_image_url, created_at,
        (SELECT COUNT(*) FROM cars WHERE owner_id = $1) as car_count
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, phone, is_verified, license_image_url } = data;
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           is_verified = COALESCE($3, is_verified),
           license_image_url = COALESCE($4, license_image_url),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, name, phone, role, is_verified, license_image_url, updated_at`,
      [name, phone, is_verified, license_image_url, id]
    );
    return result.rows[0];
  }
}

export default new UserRepository();

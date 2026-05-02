import pool from '../../config/db.js';

class UserRepository {
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, phone, role, is_verified, license_image_url, is_active, created_at,
        (SELECT COUNT(*) FROM cars WHERE owner_id = $1 AND deleted_at IS NULL) as car_count
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  async findByPhone(phone) {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
      [phone]
    );
    return result.rows[0];
  }

  async create(userData) {
    const { name, phone, password, role = 'user' } = userData;
    const result = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role, is_verified, is_active, created_at',
      [name, phone, password, role]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { 
      name = null, 
      phone = null, 
      is_verified = null, 
      license_image_url = null,
      role = null,
      is_active = null
    } = data;
    
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           is_verified = COALESCE($3, is_verified),
           license_image_url = COALESCE($4, license_image_url),
           role = COALESCE($5, role),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING id, name, phone, role, is_verified, license_image_url, is_active, updated_at`,
      [name, phone, is_verified, license_image_url, role, is_active, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
}

export default new UserRepository();

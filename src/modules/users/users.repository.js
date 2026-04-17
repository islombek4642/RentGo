import pool from '../../config/db.js';

class UserRepository {
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, phone } = data;
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, phone, role, updated_at',
      [name, phone, id]
    );
    return result.rows[0];
  }
}

export default new UserRepository();

import pool from '../../config/db.js';

class AuthRepository {
  async findByPhone(phone) {
    const result = await pool.query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM cars WHERE owner_id = u.id) as car_count
       FROM users u WHERE phone = $1`,
      [phone]
    );
    return result.rows[0];
  }

  async create(user) {
    const { name, phone, password, role } = user;
    const result = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role, created_at, 0 as car_count',
      [name, phone, password, role || 'user']
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, phone, role, created_at,
        (SELECT COUNT(*) FROM cars WHERE owner_id = $1) as car_count
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // REFRESH TOKEN METHODS
  async createRefreshToken(userId, token, expiresAt) {
    const result = await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  async findRefreshToken(token) {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0];
  }

  async deleteRefreshToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async deleteUserRefreshTokens(userId) {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

export default new AuthRepository();

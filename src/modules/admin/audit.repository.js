import pool from '../../config/db.js';

class AuditRepository {
  async create(logData) {
    const { user_id, action, resource, resource_id, details, ip_address } = logData;
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, action, resource, resource_id, JSON.stringify(details), ip_address]
    );
    return result.rows[0];
  }

  async findAll({ page, limit, user_id, action }) {
    const offset = (page - 1) * limit;
    const values = [];
    let query = 'SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1';

    if (user_id) {
      values.push(user_id);
      query += ` AND al.user_id = $${values.length}`;
    }
    if (action) {
      values.push(action);
      query += ` AND al.action = $${values.length}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }
}

export default new AuditRepository();

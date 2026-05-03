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

  async findAll({ page, limit, user_id, action, resource_id, ip_address, date_from, date_to }) {
    const offset = (page - 1) * limit;
    const values = [];
    let query = 'SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM audit_logs al WHERE 1=1';

    const addFilter = (condition, value) => {
      if (value) {
        values.push(value);
        const clause = ` AND ${condition} $${values.length}`;
        query += clause;
        countQuery += clause;
      }
    };

    addFilter('al.user_id =', user_id);
    addFilter('al.action =', action);
    addFilter('al.resource_id =', resource_id);
    addFilter('al.ip_address =', ip_address);

    if (date_from) {
      values.push(date_from);
      const clause = ` AND al.created_at >= $${values.length}`;
      query += clause;
      countQuery += clause;
    }
    if (date_to) {
      values.push(date_to);
      const clause = ` AND al.created_at <= $${values.length}`;
      query += clause;
      countQuery += clause;
    }

    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY al.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    return {
      logs: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}

export default new AuditRepository();

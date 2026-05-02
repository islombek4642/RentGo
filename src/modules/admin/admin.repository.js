import pool from '../../config/db.js';

class AdminRepository {
  async findAllUsers({ page, limit, role, is_verified }) {
    const offset = (page - 1) * limit;
    const values = [];
    let query = 'SELECT id, name, phone, role, is_verified, license_image_url, is_active, created_at FROM users WHERE deleted_at IS NULL';

    if (role) {
      values.push(role);
      query += ` AND role = $${values.length}`;
    }
    if (is_verified !== undefined) {
      values.push(is_verified);
      query += ` AND is_verified = $${values.length}`;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_users`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return {
      users: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findAllCars({ page, limit, status }) {
    const offset = (page - 1) * limit;
    const values = [];
    let query = `
      SELECT c.*, u.name as owner_name, u.phone as owner_phone
      FROM cars c
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.deleted_at IS NULL
    `;

    if (status) {
      values.push(status);
      query += ` AND c.status = $${values.length}`;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_cars`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY c.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return {
      cars: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getDashboardStats() {
    const queries = {
      totalUsers: 'SELECT COUNT(*) FROM users',
      totalCars: 'SELECT COUNT(*) FROM cars',
      totalBookings: 'SELECT COUNT(*) FROM bookings',
      pendingBookings: `SELECT COUNT(*) FROM bookings WHERE status = '${BOOKING_STATUS.PENDING}'`,
      totalRevenue: `SELECT SUM(total_price) FROM bookings WHERE status = '${BOOKING_STATUS.COMPLETED}'`
    };

    const results = await Promise.all(
      Object.values(queries).map(q => pool.query(q))
    );

    const keys = Object.keys(queries);
    const stats = {};
    keys.forEach((key, index) => {
      stats[key] = parseFloat(results[index].rows[0].count || results[index].rows[0].sum || 0);
    });

    return stats;
  }

  async updateCarStatus(carId, status) {
    const result = await pool.query(
      'UPDATE cars SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, carId]
    );
    return result.rows[0];
  }

  async findAllBookings({ page, limit, status, search }) {
    const offset = (page - 1) * limit;
    const values = [];
    let query = `
      SELECT b.*, 
             c.brand, c.model, c.image_url as car_image,
             u.name as renter_name, u.phone as renter_phone,
             o.name as owner_name, o.phone as owner_phone
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN users u ON b.user_id = u.id
      JOIN users o ON c.owner_id = o.id
      WHERE b.deleted_at IS NULL
    `;

    if (status) {
      values.push(status);
      query += ` AND b.status = $${values.length}`;
    }
    if (search) {
      values.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${values.length} OR c.brand ILIKE $${values.length} OR c.model ILIKE $${values.length})`;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_bookings`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY b.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return {
      bookings: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async updateBookingStatus(id, status) {
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  async deleteReview(reviewId) {
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
  }

  async getSuperAdminCount() {
    const result = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'super_admin' AND deleted_at IS NULL AND is_active = TRUE"
    );
    return parseInt(result.rows[0].count);
  }
}

export default new AdminRepository();

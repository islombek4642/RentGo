import pool from '../../config/db.js';

class BookingRepository {
  async findAllByUser(userId) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model, 
              (SELECT COUNT(*) > 0 FROM reviews r WHERE r.booking_id = b.id AND r.reviewer_id = $1) as has_review
       FROM bookings b 
       JOIN cars c ON b.car_id = c.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(bookingData) {
    const { car_id, user_id, start_date, end_date, total_price } = bookingData;
    const result = await pool.query(
      'INSERT INTO bookings (car_id, user_id, start_date, end_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [car_id, user_id, start_date, end_date, total_price]
    );
    return result.rows[0];
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  async findOverlapping(carId, startDate, endDate, excludeBookingId = null) {
    // Convert to YYYY-MM-DD format if Date objects
    const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    
    console.log('[OVERLAP CHECK]', { carId, start, end, excludeBookingId });
    
    let query = `
       SELECT *, start_date::date as start_d, end_date::date as end_d FROM bookings 
       WHERE car_id = $1 
       AND status IN ('pending', 'confirmed', 'in_progress')
       AND start_date::date <= $3::date 
       AND end_date::date >= $2::date
    `;
    const params = [carId, start, end];

    if (excludeBookingId) {
      params.push(excludeBookingId);
      query += ` AND id != $${params.length}`;
    }

    const result = await pool.query(query, params);
    console.log('[OVERLAP FOUND]', result.rows.length, 'bookings');
    result.rows.forEach(r => {
      console.log(`  - Booking ${r.id}: ${r.start_d} to ${r.end_d} (status: ${r.status})`);
    });
    return result.rows;
  }

  async findUpcomingBookings(carId, afterDate) {
    const result = await pool.query(
      `SELECT start_date, end_date, status FROM bookings 
       WHERE car_id = $1 
       AND status IN ('pending', 'confirmed')
       AND end_date >= $2
       ORDER BY start_date ASC`,
      [carId, afterDate]
    );
    return result.rows;
  }

  async findAllByOwner(ownerId) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model, u.name as renter_name, u.phone as renter_phone
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE c.owner_id = $1
       ORDER BY b.created_at DESC`,
      [ownerId]
    );
    return result.rows;
  }
}

export default new BookingRepository();

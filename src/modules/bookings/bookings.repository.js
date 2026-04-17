import pool from '../../config/db.js';

class BookingRepository {
  async findAllByUser(userId) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model 
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

  async findOverlapping(carId, startDate, endDate) {
    const result = await pool.query(
      `SELECT * FROM bookings 
       WHERE car_id = $1 
       AND status NOT IN ('cancelled')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [carId, startDate, endDate]
    );
    return result.rows;
  }
}

export default new BookingRepository();

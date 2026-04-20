import pool from '../../config/db.js';

class ReviewRepository {
  async create(reviewData) {
    const { booking_id, reviewer_id, target_id, car_id, rating, comment } = reviewData;
    const result = await pool.query(
      `INSERT INTO reviews (booking_id, reviewer_id, target_id, car_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_id, reviewer_id, target_id, car_id, rating, comment]
    );
    return result.rows[0];
  }

  async findByCarId(carId) {
    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name 
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.car_id = $1
       ORDER BY r.created_at DESC`,
      [carId]
    );
    return result.rows;
  }

  async findByTargetId(targetId) {
    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name 
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.target_id = $1
       ORDER BY r.created_at DESC`,
      [targetId]
    );
    return result.rows;
  }

  async exists(bookingId, reviewerId) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM reviews WHERE booking_id = $1 AND reviewer_id = $2)',
      [bookingId, reviewerId]
    );
    return result.rows[0].exists;
  }

  async getAverageRatingForCar(carId) {
    const result = await pool.query(
      'SELECT AVG(rating)::numeric(2,1) as average, COUNT(*)::int as count FROM reviews WHERE car_id = $1',
      [carId]
    );
    return result.rows[0];
  }

  async getAverageRatingForUser(userId) {
    const result = await pool.query(
      'SELECT AVG(rating)::numeric(2,1) as average, COUNT(*)::int as count FROM reviews WHERE target_id = $1',
      [userId]
    );
    return result.rows[0];
  }
}

export default new ReviewRepository();

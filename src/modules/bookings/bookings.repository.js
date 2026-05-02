import pool from '../../config/db.js';
import { formatDateLocal } from '../../utils/date-utils.js';

class BookingRepository {
  async findAllByUser(userId) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model, c.image_url as car_image, c.price_per_day,
              u.name as owner_name, u.phone as owner_phone, u.is_verified as owner_verified,
              (SELECT COUNT(*) > 0 FROM reviews r WHERE r.booking_id = b.id AND r.reviewer_id = $1) as has_review
       FROM bookings b 
       JOIN cars c ON b.car_id = c.id 
       JOIN users u ON c.owner_id = u.id
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model, c.image_url as car_image, c.price_per_day,
              u.name as renter_name, u.phone as renter_phone, u.is_verified as renter_verified
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByIdWithDetails(id) {
    const result = await pool.query(
      `SELECT b.*, c.brand, c.model, c.image_url as car_image, c.price_per_day, c.owner_id,
              c.location as car_location,
              r.name_uz as region_name_uz, r.name_ru as region_name_ru, r.name_oz as region_name_oz,
              d.name_uz as district_name_uz, d.name_ru as district_name_ru, d.name_oz as district_name_oz,
              u.name as renter_name, u.phone as renter_phone, u.is_verified as renter_verified
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       LEFT JOIN regions r ON c.region_id = r.id
       LEFT JOIN districts d ON c.district_id = d.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
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

  async findOverlapping(carId, startDate, endDate, excludeBookingId = null, client = null) {
    const start = formatDateLocal(startDate);
    const end = formatDateLocal(endDate);
    
    console.log(`[OVERLAP CHECK] car=${carId} requested=[${start}, ${end}) excludeId=${excludeBookingId || 'none'}`);
    
    // Half-open interval overlap: two ranges [A_start, A_end) and [B_start, B_end) overlap
    // if and only if A_start < B_end AND A_end > B_start.
    // This means bookings that touch at a boundary (end === start) do NOT overlap.
    // CRITICAL: FOR UPDATE locks rows to prevent race condition double bookings
    let query = `
       SELECT *, start_date::date as start_d, end_date::date as end_d FROM bookings 
       WHERE car_id = $1 
       AND status IN ('pending', 'confirmed', 'in_progress')
       AND start_date::date < $3::date 
       AND end_date::date > $2::date
    `;
    const params = [carId, start, end];

    if (excludeBookingId) {
      params.push(excludeBookingId);
      query += ` AND id != $${params.length}`;
    }
    
    // Add FOR UPDATE to lock rows during transaction (prevents race condition)
    query += ` FOR UPDATE`;

    const db = client || pool;
    const result = await db.query(query, params);
    console.log(`[OVERLAP RESULT] ${result.rows.length} conflicting booking(s) found`);
    result.rows.forEach(r => {
      console.log(`  - Booking ${r.id}: [${formatDateLocal(r.start_d)}, ${formatDateLocal(r.end_d)}) status=${r.status}`);
    });
    return result.rows;
  }

  async findUpcomingBookings(carId, afterDate) {
    const result = await pool.query(
      `SELECT start_date, end_date, status FROM bookings 
       WHERE car_id = $1 
       AND status IN ('${BOOKING_STATUS.PENDING}', '${BOOKING_STATUS.CONFIRMED}', '${BOOKING_STATUS.IN_PROGRESS}')
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

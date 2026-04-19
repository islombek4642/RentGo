import bookingRepository from './bookings.repository.js';
import carService from '../cars/cars.service.js';
import AppError from '../../utils/AppError.js';
import { transaction } from '../../config/db.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS } from '../../constants/index.js';

class BookingService {
  async createBooking(userId, bookingData, lang) {
    const { car_id, start_date, end_date } = bookingData;

    // Use transaction to ensure data consistency
    return await transaction(async (client) => {
      // 1) Verify car exists and is available
      // Note: In a real-world scenario, we'd use 'SELECT ... FOR UPDATE' here
      const car = await carService.getCar(car_id, lang);
      if (!car.is_available) {
        throw new AppError(t(lang, 'booking.not_available'), HTTP_STATUS.BAD_REQUEST);
      }

      // 2) Parse duration
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // 3) Check for overlaps
      const overlaps = await bookingRepository.findOverlapping(car_id, start_date, end_date);
      if (overlaps.length > 0) {
        
        // Calculate Next Available Date
        const today = new Date();
        today.setHours(0,0,0,0);
        let lastEnd = new Date(today);
        lastEnd.setDate(lastEnd.getDate() - 1); // start checking from today
        
        const upcoming = await bookingRepository.findUpcomingBookings(car_id, today.toISOString().split('T')[0]);
        let nextAvailableDate = null;
        
        for (const b of upcoming) {
          const bStart = new Date(b.start_date);
          const gapDays = Math.round((bStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24));
          const freeDays = gapDays - 1;
          
          if (freeDays >= diffDays) {
            nextAvailableDate = new Date(lastEnd.getTime() + 24 * 60 * 60 * 1000);
            break;
          }
          
          const bEnd = new Date(b.end_date);
          if (bEnd > lastEnd) {
            lastEnd = bEnd;
          }
        }
        
        if (!nextAvailableDate) {
          nextAvailableDate = new Date(lastEnd.getTime() + 24 * 60 * 60 * 1000);
        }

        const conflictStart = new Date(overlaps[0].start_date).toISOString().split('T')[0];
        const conflictEnd = new Date(overlaps[0].end_date).toISOString().split('T')[0];

        throw new AppError(
          t(lang, 'booking.overlap'), 
          HTTP_STATUS.BAD_REQUEST,
          {
            code: 'BOOKING_CONFLICT',
            conflictRange: { start: conflictStart, end: conflictEnd },
            nextAvailableDate: nextAvailableDate.toISOString().split('T')[0]
          }
        );
      }

      // 4) Calculate total price
      const total_price = diffDays * car.price_per_day;

      // 4) Create booking
      return await bookingRepository.create({
        car_id,
        user_id: userId,
        start_date,
        end_date,
        total_price,
      });
    });
  }

  async getUserBookings(userId) {
    return await bookingRepository.findAllByUser(userId);
  }

  async updateBookingStatus(bookingId, userId, status, userRole, lang) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError(t(lang, 'booking.not_found'), HTTP_STATUS.NOT_FOUND);

    if (booking.user_id !== userId && userRole !== 'admin') {
      throw new AppError(t(lang, 'common.forbidden'), HTTP_STATUS.FORBIDDEN);
    }

    return await bookingRepository.updateStatus(bookingId, status);
  }

  async updateBookingDates(bookingId, userId, newStartDate, newEndDate, lang) {
    return await transaction(async (client) => {
      const booking = await bookingRepository.findById(bookingId);
      if (!booking) throw new AppError(t(lang, 'booking.not_found'), HTTP_STATUS.NOT_FOUND);

      if (booking.user_id !== userId) {
        throw new AppError(t(lang, 'common.forbidden'), HTTP_STATUS.FORBIDDEN);
      }

      const car = await carService.getCar(booking.car_id, lang);

      const overlaps = await bookingRepository.findOverlapping(booking.car_id, newStartDate, newEndDate, bookingId);
      if (overlaps.length > 0) {
        throw new AppError(t(lang, 'booking.overlap'), HTTP_STATUS.BAD_REQUEST, { code: 'BOOKING_CONFLICT' });
      }

      const start = new Date(newStartDate);
      const end = new Date(newEndDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
      const total_price = diffDays * car.price_per_day;

      // Notice: In real app, standard update method should update the dates. Here we simulate structure.
      const result = await client.query(
        'UPDATE bookings SET start_date = $1, end_date = $2, total_price = $3 WHERE id = $4 RETURNING *',
        [newStartDate, newEndDate, total_price, bookingId]
      );
      return result.rows[0];
    });
  }

  async getCarBookedDates(carId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = await bookingRepository.findUpcomingBookings(carId, todayStr);
    
    return bookings.map(b => ({
      start_date: new Date(b.start_date).toISOString().split('T')[0],
      end_date: new Date(b.end_date).toISOString().split('T')[0],
      status: b.status
    }));
  }
}

export default new BookingService();

import bookingRepository from './bookings.repository.js';
import carService from '../cars/cars.service.js';
import AppError from '../../utils/AppError.js';
import { transaction } from '../../config/db.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS, BOOKING_STATUS } from '../../constants/index.js';
import { formatDateLocal, parseDateLocal } from '../../utils/date-utils.js';

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

      // 2) Parse duration - ensure dates are treated as local dates without timezone
      // Convert to YYYY-MM-DD format to avoid timezone issues
      const startStr = formatDateLocal(start_date);
      const endStr = formatDateLocal(end_date);
      const start = parseDateLocal(startStr);
      const end = parseDateLocal(endStr);

      // Validate: end_date must be strictly after start_date (no zero-day bookings)
      if (start >= end) {
        throw new AppError(t(lang, 'booking.invalid_dates') || 'End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }

      // Date model: [start_date, end_date) — half-open interval
      // end_date is exclusive (checkout day), so days = end - start
      const diffTime = Math.abs(end - start);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // 3) Check for overlaps - use date-only strings
      const overlaps = await bookingRepository.findOverlapping(car_id, startStr, endStr);
      if (overlaps.length > 0) {
        
        // Calculate Next Available Date
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const upcoming = await bookingRepository.findUpcomingBookings(car_id, formatDateLocal(today));
        let nextAvailableDate = null;
        
        // With half-open intervals [start, end), the end_date IS the first free day.
        // We walk through bookings to find a gap >= diffDays.
        let lastEnd = new Date(today); // start scanning from today
        
        for (const b of upcoming) {
          const bStart = parseDateLocal(b.start_date);
          const bEnd = parseDateLocal(b.end_date);
          
          // Gap between lastEnd and bStart (both are free days in half-open model)
          const gapDays = Math.round((bStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gapDays >= diffDays) {
            nextAvailableDate = new Date(lastEnd);
            break;
          }
          
          // Move lastEnd to this booking's end (which is the first free day after this booking)
          if (bEnd > lastEnd) {
            lastEnd = bEnd;
          }
        }
        
        if (!nextAvailableDate) {
          // No gap found within existing bookings — next available is after the last booking
          nextAvailableDate = new Date(lastEnd);
        }

        const conflictStart = formatDateLocal(overlaps[0].start_date);
        const conflictEnd = formatDateLocal(overlaps[0].end_date);
        const nextAvailStr = formatDateLocal(nextAvailableDate);

        throw new AppError(
          t(lang, 'booking.overlap'), 
          HTTP_STATUS.BAD_REQUEST,
          {
            code: 'BOOKING_CONFLICT',
            conflictRange: { start: conflictStart, end: conflictEnd },
            nextAvailableDate: nextAvailStr
          }
        );
      }

      // 4) Calculate total price
      const total_price = diffDays * car.price_per_day;

      // 5) Create booking - use date-only strings
      return await bookingRepository.create({
        car_id,
        user_id: userId,
        start_date: startStr,
        end_date: endStr,
        total_price,
      });
    });
  }

  async getUserBookings(userId) {
    return await bookingRepository.findAllByUser(userId);
  }

  async getOwnerBookings(ownerId) {
    return await bookingRepository.findAllByOwner(ownerId);
  }

  async updateBookingStatus(bookingId, userId, newStatus, userRole, lang) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError(t(lang, 'booking.not_found'), HTTP_STATUS.NOT_FOUND);

    // Get car to check ownership
    const car = await carService.getCar(booking.car_id, lang);
    const isOwner = car.owner_id === userId;
    const isRenter = booking.user_id === userId;
    const isAdmin = userRole === 'admin';

    const currentStatus = booking.status;

    // Strict State Machine Transitions
    const allowedTransitions = {
      pending: {
        confirmed: isOwner || isAdmin,
        rejected: isOwner || isAdmin,
        cancelled: isRenter || isAdmin,
      },
      confirmed: {
        in_progress: isOwner || isAdmin,
        cancelled: isRenter || isAdmin,
      },
      in_progress: {
        completed: isOwner || isAdmin,
      },
    };

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus][newStatus]) {
      throw new AppError(t(lang, 'common.forbidden'), HTTP_STATUS.FORBIDDEN);
    }

    // Trust System: Cancellation Policy Enforcement
    if (newStatus === BOOKING_STATUS.CANCELLED && !isAdmin) {
      if (currentStatus === BOOKING_STATUS.CONFIRMED) {
        const now = new Date();
        const startTime = new Date(booking.start_date);
        const diffHours = (startTime - now) / (1000 * 60 * 60);

        if (diffHours < 24) {
          throw new AppError(t(lang, 'booking.error_cancel_deadline'), HTTP_STATUS.BAD_REQUEST);
        }
      }
    }

    return await bookingRepository.updateStatus(bookingId, newStatus);
  }

  async updateBookingDates(bookingId, userId, newStartDate, newEndDate, lang) {
    return await transaction(async (client) => {
      const booking = await bookingRepository.findById(bookingId);
      if (!booking) throw new AppError(t(lang, 'booking.not_found'), HTTP_STATUS.NOT_FOUND);

      if (booking.user_id !== userId) {
        throw new AppError(t(lang, 'common.forbidden'), HTTP_STATUS.FORBIDDEN);
      }

      const car = await carService.getCar(booking.car_id, lang);

      // Validate: end must be strictly after start
      const start = parseDateLocal(newStartDate);
      const end = parseDateLocal(newEndDate);
      if (start >= end) {
        throw new AppError(t(lang, 'booking.invalid_dates') || 'End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }

      const overlaps = await bookingRepository.findOverlapping(booking.car_id, newStartDate, newEndDate, bookingId);
      if (overlaps.length > 0) {
        throw new AppError(t(lang, 'booking.overlap'), HTTP_STATUS.BAD_REQUEST, { code: 'BOOKING_CONFLICT' });
      }

      // Half-open interval: days = end - start (no +1)
      const diffDays = Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      const total_price = diffDays * car.price_per_day;

      const result = await client.query(
        'UPDATE bookings SET start_date = $1, end_date = $2, total_price = $3 WHERE id = $4 RETURNING *',
        [newStartDate, newEndDate, total_price, bookingId]
      );
      return result.rows[0];
    });
  }

  async getCarBookedDates(carId) {
    const todayStr = formatDateLocal(new Date());
    const bookings = await bookingRepository.findUpcomingBookings(carId, todayStr);
    
    return bookings.map(b => ({
      start_date: formatDateLocal(b.start_date),
      end_date: formatDateLocal(b.end_date),
      status: b.status
    }));
  }
}

export default new BookingService();

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

      // 2) Check for overlaps
      const overlaps = await bookingRepository.findOverlapping(car_id, start_date, end_date);
      if (overlaps.length > 0) {
        throw new AppError(t(lang, 'booking.overlap'), HTTP_STATUS.BAD_REQUEST);
      }

      // 3) Calculate total price
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
}

export default new BookingService();

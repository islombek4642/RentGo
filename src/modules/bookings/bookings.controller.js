import bookingService from './bookings.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS } from '../../constants/index.js';
import { trackBooking, ANALYTICS_EVENTS } from '../../config/analytics.js';

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user.id, req.body, req.lang);
    
    trackBooking(ANALYTICS_EVENTS.BOOKING.CREATED, req.user.id, { 
      bookingId: booking.id, 
      carId: booking.car_id,
      totalPrice: booking.total_price 
    });
    
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: t(req.lang, 'booking.success'),
      data: { booking },
    });
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  });

  getOwnerBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getOwnerBookings(req.user.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  });

  getBookingById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { booking },
    });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user.id,
      status,
      req.user.role,
      req.lang
    );

    // Track owner actions
    if (status === 'confirmed') {
      trackBooking(ANALYTICS_EVENTS.BOOKING.CONFIRMED, req.user.id, { bookingId: booking.id });
    } else if (status === 'rejected') {
      trackBooking(ANALYTICS_EVENTS.BOOKING.REJECTED, req.user.id, { bookingId: booking.id });
    } else if (status === 'in_progress') {
      trackBooking(ANALYTICS_EVENTS.BOOKING.STARTED, req.user.id, { bookingId: booking.id });
    } else if (status === 'completed') {
      trackBooking(ANALYTICS_EVENTS.BOOKING.COMPLETED, req.user.id, { bookingId: booking.id });
    } else if (status === 'cancelled') {
      trackBooking(ANALYTICS_EVENTS.BOOKING.CANCELLED, req.user.id, { bookingId: booking.id });
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { booking },
    });
  });

  getCarBookedDates = asyncHandler(async (req, res) => {
    const dates = await bookingService.getCarBookedDates(req.params.carId);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { dates },
    });
  });
}

export default new BookingController();

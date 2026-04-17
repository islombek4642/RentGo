import bookingService from './bookings.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS } from '../../constants/index.js';

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user.id, req.body, req.lang);
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

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user.id,
      status,
      req.user.role,
      req.lang
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { booking },
    });
  });
}

export default new BookingController();

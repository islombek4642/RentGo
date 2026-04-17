import express from 'express';
import bookingController from './bookings.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createBookingSchema, updateBookingStatusSchema } from './bookings.validation.js';

const router = express.Router();

router.use(protect); // All booking routes are protected

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.patch('/:id/status', validate(updateBookingStatusSchema), bookingController.updateStatus);

export default router;

import express from 'express';
import bookingController from './bookings.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createBookingSchema, updateBookingStatusSchema } from './bookings.validation.js';

const router = express.Router();

router.use(protect); // All booking routes are protected

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: |
 *       Books a car for a given date range. The total price is calculated automatically
 *       based on the car's `price_per_day` and the number of days.
 *       Will fail if the car is unavailable or dates overlap with an existing booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - car_id
 *               - start_date
 *               - end_date
 *             properties:
 *               car_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the car to book
 *                 example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Booking start date (ISO 8601, must be today or future)
 *                 example: '2026-05-01'
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Booking end date (must be >= start_date)
 *                 example: '2026-05-05'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Booking created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Car not available or dates overlap with existing booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(createBookingSchema), bookingController.createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get all bookings for the currently authenticated user
 *     description: Returns a list of all bookings made by the logged-in user, including joined car brand and model.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   description: Number of bookings returned
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/owner', bookingController.getOwnerBookings);
router.get('/my', bookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     description: Returns detailed booking information including car and owner details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking UUID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @swagger
 * /bookings/car/{carId}:
 *   get:
 *     summary: Get upcoming booked dates for a specific car
 *     description: Returns a list of start and end dates with their pending/confirmed status to build an availability heatmap.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/car/:carId', bookingController.getCarBookedDates);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update the status of a booking
 *     description: |
 *       Users can cancel their own bookings.
 *       Admins can set any status (confirmed, cancelled, completed).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking UUID
 *         example: c3d4e5f6-a7b8-9012-cdef-123456789012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — not your booking and not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', validate(updateBookingStatusSchema), bookingController.updateStatus);

export default router;

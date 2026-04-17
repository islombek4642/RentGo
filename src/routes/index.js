import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import carRoutes from '../modules/cars/cars.routes.js';
import bookingRoutes from '../modules/bookings/bookings.routes.js';
import healthRoutes from './health.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/health', healthRoutes);

export default router;

import express from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import carRoutes from '../modules/cars/cars.routes.js';
import bookingRoutes from '../modules/bookings/bookings.routes.js';
import reviewsRoutes from '../modules/reviews/reviews.routes.js';
import locationsRoutes from '../modules/locations/locations.routes.js';
import healthRoutes from './health.routes.js';

const router = express.Router();

// API Welcome Route
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Welcome to RentGo API v1',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/v1/health'
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/locations', locationsRoutes);
router.use('/health', healthRoutes);

export default router;

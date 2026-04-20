import express from 'express';
import reviewController from './reviews.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Reviews and Ratings system
 */

router.get('/car/:carId', reviewController.getCarReviews);
router.get('/user/:userId', reviewController.getUserReviews);

router.post('/', protect, reviewController.createReview);

export default router;

import reviewRepository from './reviews.repository.js';
import bookingRepository from '../bookings/bookings.repository.js';
import carRepository from '../cars/cars.repository.js';
import AppError from '../../utils/AppError.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS, BOOKING_STATUS } from '../../constants/index.js';

class ReviewService {
  async createReview(reviewerId, reviewData, lang) {
    const { booking_id, rating, comment } = reviewData;

    // 1. Verify booking exists and belongs to the reviewer
    const booking = await bookingRepository.findById(booking_id);
    if (!booking) {
      throw new AppError(t(lang, 'booking.not_found'), HTTP_STATUS.NOT_FOUND);
    }

    if (booking.user_id !== reviewerId) {
      throw new AppError(t(lang, 'common.forbidden'), HTTP_STATUS.FORBIDDEN);
    }

    // 2. Verify booking is completed
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new AppError(t(lang, 'review.error_not_completed'), HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Check for existing review
    const alreadyReviewed = await reviewRepository.exists(booking_id, reviewerId);
    if (alreadyReviewed) {
      throw new AppError(t(lang, 'review.error_already_reviewed'), HTTP_STATUS.BAD_REQUEST);
    }

    // 4. Get car to find target (owner)
    // Note: this MVP assumes renter reviews owner's car & owner.
    // If we support owner reviewing renter, we'd need more logic.
    const car = await carRepository.findById(booking.car_id);
    
    return await reviewRepository.create({
      booking_id,
      reviewer_id: reviewerId,
      target_id: car.owner_id,
      car_id: booking.car_id,
      rating,
      comment
    });
  }

  async getCarReviews(carId) {
    const reviews = await reviewRepository.findByCarId(carId);
    const stats = await reviewRepository.getAverageRatingForCar(carId);
    return { reviews, stats };
  }

  async getUserReviews(userId) {
    const reviews = await reviewRepository.findByTargetId(userId);
    const stats = await reviewRepository.getAverageRatingForUser(userId);
    return { reviews, stats };
  }
}

export default new ReviewService();

import reviewService from './reviews.service.js';
import { HTTP_STATUS } from '../../constants/index.js';

class ReviewController {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body, req.lang);
      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCarReviews(req, res, next) {
    try {
      const result = await reviewService.getCarReviews(req.params.carId);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReviews(req, res, next) {
    try {
      const result = await reviewService.getUserReviews(req.params.userId);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();

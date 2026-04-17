import AppError from '../utils/AppError.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'user']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

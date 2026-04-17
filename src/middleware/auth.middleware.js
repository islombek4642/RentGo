import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import pool from '../config/db.js';
import { t } from '../utils/i18n.js';
import { HTTP_STATUS } from '../constants/index.js';

export const protect = asyncHandler(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
  }

  // 2) Verification token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3) Check if user still exists
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];

    if (!user) {
      return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
  }
});

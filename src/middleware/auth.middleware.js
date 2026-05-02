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

    // 3) Check if user still exists and is active/not deleted
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE', 
      [decoded.id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
    }

    // 4) Check token_version (invalidate old tokens after password change / deactivation)
    if (decoded.token_version !== undefined && decoded.token_version !== user.token_version) {
      return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(t(req.lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED));
  }
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE', 
      [decoded.id]
    );
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    // If token is invalid, we just proceed as guest
    next();
  }
});

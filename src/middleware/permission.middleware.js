import { ROLE_PERMISSIONS } from '../config/roles.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Permission name from PERMISSIONS constant
 */
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    // Check for global wildcard or specific permission
    const hasAccess = permissions.includes('*') || permissions.includes(permission);

    if (!hasAccess) {
      return next(
        new AppError('Sizda ushbu amalni bajarish uchun ruxsat yo\'q', HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};

/**
 * Middleware to restrict access to specific roles (legacy/simple check)
 * @param  {...string} roles - Allowed roles
 */
export const restrictToRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Sizda ushbu bo\'limga kirish ruxsati yo\'q', HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };
};

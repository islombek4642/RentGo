import express from 'express';
import adminController from './admin.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { hasPermission } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management APIs
 */

// Dashboard
router.get('/dashboard', hasPermission(PERMISSIONS.DASHBOARD_VIEW), adminController.getDashboard);
router.get('/dashboard/analytics', hasPermission(PERMISSIONS.DASHBOARD_VIEW), adminController.getAnalytics);

// User Management
router.get('/users', hasPermission(PERMISSIONS.USER_VIEW), adminController.getAllUsers);
router.patch('/users/:id/verify', hasPermission(PERMISSIONS.USER_VERIFY), adminController.verifyUser);
router.patch('/users/:id/role', hasPermission(PERMISSIONS.USER_MANAGE_ROLES), adminController.updateUserRole);
router.patch('/users/:id/deactivate', hasPermission(PERMISSIONS.USER_MANAGE_ROLES), adminController.deactivateUser);
router.delete('/users/:id', hasPermission(PERMISSIONS.USER_DELETE), adminController.deleteUser);

// Car Moderation
router.get('/cars', hasPermission(PERMISSIONS.CAR_VIEW_ALL), adminController.getAllCars);
router.patch('/cars/:id/approve', hasPermission(PERMISSIONS.CAR_APPROVE), adminController.approveCar);
router.patch('/cars/:id/reject', hasPermission(PERMISSIONS.CAR_REJECT), adminController.rejectCar);

// Booking Management
router.get('/bookings', hasPermission(PERMISSIONS.BOOKING_VIEW_ALL), adminController.getAllBookings);
router.patch('/bookings/:id/status', hasPermission(PERMISSIONS.BOOKING_MANAGE), adminController.updateBookingStatus);

// Review Moderation
router.get('/reviews', hasPermission(PERMISSIONS.REVIEW_DELETE), adminController.getAllReviews);
router.delete('/reviews/:id', hasPermission(PERMISSIONS.REVIEW_DELETE), adminController.deleteReview);

// Audit Logs
router.get('/audit-logs', hasPermission(PERMISSIONS.AUDIT_VIEW), adminController.getAuditLogs);

export default router;

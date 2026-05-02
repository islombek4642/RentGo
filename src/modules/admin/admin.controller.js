import adminService from './admin.service.js';
import auditService from './audit.service.js';
import { HTTP_STATUS } from '../../constants/index.js';

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, is_verified } = req.query;
      const result = await adminService.getAllUsers({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        role, 
        is_verified: is_verified !== undefined ? is_verified === 'true' : undefined 
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async verifyUser(req, res, next) {
    try {
      const { id } = req.params;
      const { is_verified } = req.body;
      const user = await adminService.verifyUser(id, is_verified);
      await auditService.log(req, 'USER_VERIFY', 'users', id, { is_verified });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await adminService.deleteUser(req.params.id, req.user.id);
      await auditService.log(req, 'USER_DELETE', 'users', req.params.id);
      res.status(HTTP_STATUS.NO_CONTENT).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }

  async getAllCars(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const result = await adminService.getAllCars({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        status 
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async approveCar(req, res, next) {
    try {
      const car = await adminService.approveCar(req.params.id);
      await auditService.log(req, 'CAR_APPROVE', 'cars', req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { car } });
    } catch (error) {
      next(error);
    }
  }

  async rejectCar(req, res, next) {
    try {
      const car = await adminService.rejectCar(req.params.id);
      await auditService.log(req, 'CAR_REJECT', 'cars', req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { car } });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { stats } });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await adminService.updateUserRole(id, role, req.user.id);
      await auditService.log(req, 'USER_ROLE_UPDATE', 'users', id, { new_role: role });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const data = await adminService.getAllBookings({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        status, 
        search 
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...data });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const booking = await adminService.updateBookingStatus(id, status);
      await auditService.log(req, 'BOOKING_STATUS_UPDATE', 'bookings', id, { new_status: status });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { booking } });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      await adminService.deleteReview(req.params.id);
      await auditService.log(req, 'REVIEW_DELETE', 'reviews', req.params.id);
      res.status(HTTP_STATUS.NO_CONTENT).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, user_id, action } = req.query;
      const logs = await auditService.getLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        user_id,
        action
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { logs } });
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const user = await adminService.deactivateUser(id, is_active, req.user.id);
      await auditService.log(req, is_active ? 'USER_ACTIVATE' : 'USER_DEACTIVATE', 'users', id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

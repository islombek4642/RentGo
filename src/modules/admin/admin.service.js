import adminRepository from './admin.repository.js';
import userRepository from '../users/users.repository.js';
import carRepository from '../cars/cars.repository.js';
import AppError from '../../utils/AppError.js';
import { transaction } from '../../config/db.js';
import { HTTP_STATUS, CAR_STATUS } from '../../constants/index.js';

class AdminService {
  async getAllUsers(filters) {
    return await adminRepository.findAllUsers(filters);
  }

  async verifyUser(userId, isVerified) {
    const user = await userRepository.update(userId, { is_verified: isVerified });
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    return user;
  }

  async deleteUser(userId, currentUserId) {
    if (userId === currentUserId) {
      throw new AppError('O\'zingizni o\'chirib tashlay olmaysiz!', HTTP_STATUS.BAD_REQUEST);
    }

    return await transaction(async (client) => {
      // CRITICAL: Prevent Race Condition using Transaction-level Advisory Lock
      // Lock ID 1 is reserved for Global Admin Management operations
      await client.query('SELECT pg_advisory_xact_lock(1)');

      const user = await userRepository.findById(userId);
      if (user?.role === 'super_admin') {
        const superAdminCount = await adminRepository.getSuperAdminCount(client);
        if (superAdminCount <= 1) {
          throw new AppError('Oxirgi Super Adminni o\'chirib bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
        }
      }

      await userRepository.delete(userId, client);
    });
  }

  async getAllCars(filters) {
    return await adminRepository.findAllCars(filters);
  }

  async approveCar(carId) {
    const car = await adminRepository.updateCarStatus(carId, CAR_STATUS.APPROVED);
    if (!car) throw new AppError('Car not found', HTTP_STATUS.NOT_FOUND);
    return car;
  }

  async rejectCar(carId) {
    const car = await adminRepository.updateCarStatus(carId, CAR_STATUS.REJECTED);
    if (!car) throw new AppError('Car not found', HTTP_STATUS.NOT_FOUND);
    return car;
  }

  async getDashboardStats() {
    return await adminRepository.getDashboardStats();
  }

  async deleteReview(reviewId) {
    await adminRepository.deleteReview(reviewId);
  }

  async getAllReviews(filters) {
    return await adminRepository.findAllReviews(filters);
  }

  async getAllBookings(filters) {
    return await adminRepository.findAllBookings(filters);
  }

  async updateBookingStatus(id, status) {
    const booking = await adminRepository.updateBookingStatus(id, status);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    return booking;
  }

  async updateUserRole(userId, role, currentUserId) {
    return await transaction(async (client) => {
      // Lock for global admin management
      await client.query('SELECT pg_advisory_xact_lock(1)');

      const currentUser = await userRepository.findById(currentUserId);
      
      // Only super_admin can promote someone to super_admin
      if (role === 'super_admin' && currentUser?.role !== 'super_admin') {
        throw new AppError('Faqat Super Admin boshqa foydalanuvchiga Super Admin rolini bera oladi!', HTTP_STATUS.FORBIDDEN);
      }

      if (userId === currentUserId) {
        throw new AppError('O\'z rolingizni o\'zgartira olmaysiz!', HTTP_STATUS.BAD_REQUEST);
      }

      const user = await userRepository.findById(userId);
      if (user?.role === 'super_admin' && role !== 'super_admin') {
        const superAdminCount = await adminRepository.getSuperAdminCount(client);
        if (superAdminCount <= 1) {
          throw new AppError('Oxirgi Super Admin rolni o\'zgartirib bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
        }
      }

      const updatedUser = await userRepository.update(userId, { role }, client);
      if (!updatedUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      return updatedUser;
    });
  }

  async deactivateUser(userId, isActive, currentUserId) {
    if (userId === currentUserId) {
      throw new AppError('O\'zingizni bloklay olmaysiz!', HTTP_STATUS.BAD_REQUEST);
    }

    return await transaction(async (client) => {
      // Lock for global admin management
      await client.query('SELECT pg_advisory_xact_lock(1)');

      const user = await userRepository.findById(userId);
      if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

      if (user.role === 'super_admin' && !isActive) {
        const superAdminCount = await adminRepository.getSuperAdminCount(client);
        if (superAdminCount <= 1) {
          throw new AppError('Oxirgi Super Adminni bloklab bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
        }
      }

      const updatedUser = await userRepository.update(userId, { is_active: isActive }, client);
      return updatedUser;
    });
  }

  async getAnalytics() {
    return await adminRepository.getAnalytics();
  }
}

export default new AdminService();

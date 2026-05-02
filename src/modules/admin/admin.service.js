import adminRepository from './admin.repository.js';
import userRepository from '../users/users.repository.js';
import carRepository from '../cars/cars.repository.js';
import AppError from '../../utils/AppError.js';
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

    const user = await userRepository.findById(userId);
    if (user?.role === 'super_admin') {
      const superAdminCount = await adminRepository.getSuperAdminCount();
      if (superAdminCount <= 1) {
        throw new AppError('Oxirgi Super Adminni o\'chirib bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
      }
    }

    await userRepository.delete(userId);
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

  async getAllBookings(filters) {
    return await adminRepository.findAllBookings(filters);
  }

  async updateBookingStatus(id, status) {
    const booking = await adminRepository.updateBookingStatus(id, status);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    return booking;
  }

  async updateUserRole(userId, role, currentUserId) {
    if (userId === currentUserId) {
      throw new AppError('O\'z rolingizni o\'zgartira olmaysiz!', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await userRepository.findById(userId);
    if (user?.role === 'super_admin' && role !== 'super_admin') {
      const superAdminCount = await adminRepository.getSuperAdminCount();
      if (superAdminCount <= 1) {
        throw new AppError('Oxirgi Super Admin rolni o\'zgartirib bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updatedUser = await userRepository.update(userId, { role });
    if (!updatedUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    return updatedUser;
  }

  async deactivateUser(userId, isActive, currentUserId) {
    if (userId === currentUserId) {
      throw new AppError('O\'zingizni bloklay olmaysiz!', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

    if (user.role === 'super_admin' && !isActive) {
      const superAdminCount = await adminRepository.getSuperAdminCount();
      if (superAdminCount <= 1) {
        throw new AppError('Oxirgi Super Adminni bloklab bo\'lmaydi!', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updatedUser = await userRepository.update(userId, { is_active: isActive });
    return updatedUser;
  }
}

export default new AdminService();

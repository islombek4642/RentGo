import carRepository from './cars.repository.js';
import AppError from '../../utils/AppError.js';
import { ROLES, HTTP_STATUS } from '../../constants/index.js';
import { t } from '../../utils/i18n.js';

class CarService {
  async getAllCars(filters) {
    return await carRepository.findAll(filters);
  }

  async getCar(id, lang) {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError(t(lang, 'car.not_found'), HTTP_STATUS.NOT_FOUND);
    return car;
  }

  async createCar(userId, carData) {
    return await carRepository.create({ ...carData, owner_id: userId });
  }

  async updateCar(carId, userId, carData, lang) {
    const car = await this.getCar(carId, lang);

    // Only owner can update
    if (car.owner_id !== userId) {
      throw new AppError(t(lang, 'car.not_owner'), HTTP_STATUS.FORBIDDEN);
    }

    return await carRepository.update(carId, carData);
  }

  async deleteCar(carId, user, lang) {
    const car = await this.getCar(carId, lang);

    // Only owner or admin can delete
    if (car.owner_id !== user.id && user.role !== ROLES.ADMIN) {
      throw new AppError(t(lang, 'car.no_delete_permission'), HTTP_STATUS.FORBIDDEN);
    }

    await carRepository.delete(carId);
  }
}

export default new CarService();

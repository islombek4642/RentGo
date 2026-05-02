import carRepository from './cars.repository.js';
import locationRepository from '../locations/locations.repository.js';
import AppError from '../../utils/AppError.js';
import { ROLES, HTTP_STATUS } from '../../constants/index.js';
import { t } from '../../utils/i18n.js';

class CarService {
  async getAllCars(filters, lang) {
    const result = await carRepository.findAll(filters);
    result.cars = result.cars.map(car => this._formatCarLocation(car, lang));
    return result;
  }

  async getOwnerCars(ownerId) {
    const cars = await carRepository.findAllByOwner(ownerId);
    return cars.map(car => this._formatCarLocation(car, 'uz')); // Default to uz for owner list
  }

  async getCar(id, lang, user = null) {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError(t(lang, 'car.not_found'), HTTP_STATUS.NOT_FOUND);

    // Access Control: Guest users can only see approved cars
    // Owner and Admin can see their own / any car
    const isApproved = car.status === 'approved';
    const isOwner = user && car.owner_id === user.id;
    const isAdmin = user && user.role === ROLES.ADMIN;

    if (!isApproved && !isOwner && !isAdmin) {
      throw new AppError(t(lang, 'car.not_found'), HTTP_STATUS.NOT_FOUND); // Hide existence for security
    }

    return this._formatCarLocation(car, lang);
  }

  async createCar(userId, carData) {
    await this._validateLocation(carData.region_id, carData.district_id);
    return await carRepository.create({ ...carData, owner_id: userId });
  }

  async updateCar(carId, user, carData, lang) {
    const car = await this.getCar(carId, lang, user);

    // Only owner can update
    if (car.owner_id !== user.id) {
      throw new AppError(t(lang, 'car.not_owner'), HTTP_STATUS.FORBIDDEN);
    }

    if (carData.region_id || carData.district_id) {
       await this._validateLocation(carData.region_id || car.region_id, carData.district_id || car.district_id);
    }

    return await carRepository.update(carId, carData);
  }

  async deleteCar(carId, user, lang) {
    const car = await this.getCar(carId, lang, user);

    // Only owner or admin can delete
    if (car.owner_id !== user.id && user.role !== ROLES.ADMIN) {
      throw new AppError(t(lang, 'car.no_delete_permission'), HTTP_STATUS.FORBIDDEN);
    }

    await carRepository.delete(carId);
  }

  async _validateLocation(regionId, districtId) {
    if (!regionId || !districtId) {
      throw new AppError('Region and District are required.', HTTP_STATUS.BAD_REQUEST);
    }

    const region = await locationRepository.findRegionById(regionId);
    if (!region) {
      throw new AppError('Invalid Region ID', HTTP_STATUS.BAD_REQUEST);
    }

    const district = await locationRepository.findDistrictById(districtId);
    if (!district || district.region_id !== parseInt(regionId)) {
      throw new AppError('Invalid District ID for the selected Region', HTTP_STATUS.BAD_REQUEST);
    }
  }

  _formatCarLocation(car, lang) {
    const l = lang === 'ru' ? 'ru' : (lang === 'oz' ? 'oz' : 'uz');
    
    if (car.region_name_uz && car.district_name_uz) {
      const regionName = car[`region_name_${l}`] || car.region_name_uz;
      const districtName = car[`district_name_${l}`] || car.district_name_uz;
      car.display_location = `${regionName}, ${districtName}`;
    } else {
      car.display_location = car.location; // Fallback to old string location
    }
    
    return car;
  }
}

export default new CarService();

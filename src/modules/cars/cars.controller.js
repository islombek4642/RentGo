import carService from './cars.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../constants/index.js';

class CarController {
  getAllCars = asyncHandler(async (req, res) => {
    const data = await carService.getAllCars(req.query, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data,
    });
  });

  getMyCars = asyncHandler(async (req, res) => {
    const cars = await carService.getOwnerCars(req.user.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      results: cars.length,
      data: { cars },
    });
  });

  getCar = asyncHandler(async (req, res) => {
    const car = await carService.getCar(req.params.id, req.lang, req.user);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { car },
    });
  });

  createCar = asyncHandler(async (req, res) => {
    // Handle image upload if exists
    const carData = { ...req.body };
    if (req.file) {
      carData.image_url = req.file.path;
    }

    const car = await carService.createCar(req.user.id, carData);
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: { car },
    });
  });

  updateCar = asyncHandler(async (req, res) => {
    const carData = { ...req.body };
    if (req.file) {
      carData.image_url = req.file.path;
    }

    const car = await carService.updateCar(req.params.id, req.user, carData, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { car },
    });
  });

  deleteCar = asyncHandler(async (req, res) => {
    await carService.deleteCar(req.params.id, req.user, req.lang);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  });
}

export default new CarController();

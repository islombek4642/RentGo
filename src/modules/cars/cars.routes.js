import express from 'express';
import carController from './cars.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { carSchema, carUpdateSchema } from './cars.validation.js';

const router = express.Router();

// Public routes
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCar);

// Private routes
router.use(protect);

router.post('/', upload.single('image'), validate(carSchema), carController.createCar);
router.patch('/:id', upload.single('image'), validate(carUpdateSchema), carController.updateCar);
router.delete('/:id', carController.deleteCar);

export default router;

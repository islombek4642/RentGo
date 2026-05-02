import express from 'express';
import carController from './cars.controller.js';
import { protect, optionalProtect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { carSchema, carUpdateSchema } from './cars.validation.js';

const router = express.Router();

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars with optional filters and pagination
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of cars per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by city/location (partial match)
 *         example: Tashkent
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by car brand (partial match)
 *         example: Chevrolet
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by car model (partial match)
 *         example: Malibu
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per day
 *         example: 200000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per day
 *         example: 800000
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *         example: true
 *     responses:
 *       200:
 *         description: List of cars with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     cars:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Car'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', carController.getAllCars);

// Private routes - require authentication
// IMPORTANT: /my must be registered BEFORE protect + /:id
// so Express doesn't treat the string 'my' as a car UUID
router.use(protect);

router.get('/my', carController.getMyCars);

// Unprotect for public car-by-id lookup (re-add public access without protect for /:id)
// Actually /:id is already public because it was registered before protect above.

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a single car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Car UUID
 *         example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *     responses:
 *       200:
 *         description: Car details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     car:
 *                       $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', optionalProtect, carController.getCar);

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car listing (authenticated)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - year
 *               - price_per_day
 *               - location
 *             properties:
 *               brand:
 *                 type: string
 *                 example: Kia
 *               model:
 *                 type: string
 *                 example: K5
 *               year:
 *                 type: integer
 *                 example: 2023
 *               price_per_day:
 *                 type: number
 *                 example: 600000
 *               location:
 *                 type: string
 *                 example: Tashkent
 *               is_available:
 *                 type: boolean
 *                 default: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional car image file (max 5MB)
 *     responses:
 *       201:
 *         description: Car created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     car:
 *                       $ref: '#/components/schemas/Car'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', upload.single('image'), validate(carSchema), carController.createCar);

/**
 * @swagger
 * /cars/{id}:
 *   patch:
 *     summary: Update a car listing (owner only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Car UUID
 *         example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 example: Chevrolet
 *               model:
 *                 type: string
 *                 example: Tracker
 *               year:
 *                 type: integer
 *                 example: 2024
 *               price_per_day:
 *                 type: number
 *                 example: 450000
 *               location:
 *                 type: string
 *                 example: Samarkand
 *               is_available:
 *                 type: boolean
 *                 example: false
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new car image
 *     responses:
 *       200:
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     car:
 *                       $ref: '#/components/schemas/Car'
 *       403:
 *         description: Forbidden — you are not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id', upload.single('image'), validate(carUpdateSchema), carController.updateCar);

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car listing (owner or admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Car UUID
 *         example: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *     responses:
 *       204:
 *         description: Car deleted successfully — no content returned
 *       403:
 *         description: Forbidden — not owner or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', carController.deleteCar);

export default router;

import express from 'express';
import userController from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes in this module are protected

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);

export default router;

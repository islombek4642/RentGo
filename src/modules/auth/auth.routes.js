import express from 'express';
import authController from './auth.controller.js';
import validate from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);

export default router;

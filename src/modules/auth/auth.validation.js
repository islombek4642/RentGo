import joi from 'joi';
import { SYSTEM_CONFIG } from '../../constants/index.js';

export const registerSchema = joi.object({
  name: joi.string().required().min(2).max(50),
  phone: joi.string().required().pattern(/^[0-9+]+$/).message('Phone must be a valid number'),
  password: joi.string().required().min(6),
  role: joi.string().valid('user', 'admin').default('user'),
});

export const loginSchema = joi.object({
  phone: joi.string().required(),
  password: joi.string().required(),
});

export const refreshSchema = joi.object({
  refreshToken: joi.string().required(),
});

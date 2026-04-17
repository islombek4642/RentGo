import joi from 'joi';
import { SYSTEM_CONFIG } from '../../constants/index.js';

export const carSchema = joi.object({
  brand: joi.string().required().min(2).max(100),
  model: joi.string().required().min(1).max(100),
  year: joi.number().required().integer().min(1900).max(new Date().getFullYear() + 1),
  price_per_day: joi.number().required().positive(),
  location: joi.string().required().min(2).max(255),
  image_url: joi.string().uri().optional(),
  is_available: joi.boolean().default(true),
});

export const carUpdateSchema = joi.object({
  brand: joi.string().min(2).max(100),
  model: joi.string().min(1).max(100),
  year: joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  price_per_day: joi.number().positive(),
  location: joi.string().min(2).max(255),
  image_url: joi.string().uri(),
  is_available: joi.boolean(),
});

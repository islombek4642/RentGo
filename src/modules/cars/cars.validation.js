import joi from 'joi';
import { SYSTEM_CONFIG } from '../../constants/index.js';

export const carSchema = joi.object({
  brand: joi.string().required().min(2).max(100),
  model: joi.string().required().min(1).max(100),
  year: joi.number().required().integer().min(1900).max(new Date().getFullYear() + 1),
  price_per_day: joi.number().required().positive(),
  region_id: joi.number().required(),
  district_id: joi.number().required(),
  location: joi.string().optional().allow('', null).max(255),
  image_url: joi.string().optional(),
  is_available: joi.boolean().default(true),
  // NEW: Enhanced car fields
  description: joi.string().optional().allow('', null).max(1000),
  features: joi.array().items(joi.string()).optional().default([]),
  car_type: joi.string().valid('economy', 'standard', 'luxury', 'suv', 'minivan').default('economy'),
  fuel_type: joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').default('petrol'),
  transmission: joi.string().valid('automatic', 'manual').default('automatic'),
  seats: joi.number().integer().min(2).max(50).default(5),
});

export const carUpdateSchema = joi.object({
  brand: joi.string().min(2).max(100),
  model: joi.string().min(1).max(100),
  year: joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  price_per_day: joi.number().positive(),
  region_id: joi.number(),
  district_id: joi.number(),
  location: joi.string().allow('', null).max(255),
  image_url: joi.string(),
  is_available: joi.boolean(),
  // NEW: Enhanced car fields
  description: joi.string().allow('', null).max(1000),
  features: joi.array().items(joi.string()),
  car_type: joi.string().valid('economy', 'standard', 'luxury', 'suv', 'minivan'),
  fuel_type: joi.string().valid('petrol', 'diesel', 'electric', 'hybrid'),
  transmission: joi.string().valid('automatic', 'manual'),
  seats: joi.number().integer().min(2).max(50),
});

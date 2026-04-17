import joi from 'joi';
import { BOOKING_STATUS } from '../../constants/index.js';

export const createBookingSchema = joi.object({
  car_id: joi.string().uuid().required(),
  start_date: joi.date().required(),
  end_date: joi.date().required().greater(joi.ref('start_date')).allow(joi.ref('start_date')),
});

export const updateBookingStatusSchema = joi.object({
  status: joi.string().valid(...Object.values(BOOKING_STATUS)).required(),
});

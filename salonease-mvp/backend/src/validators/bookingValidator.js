const Joi = require('joi');
const BOOKING_STATUSES = require('../config/bookingStatuses');

const createBookingSchema = Joi.object({
  clientId: Joi.string().uuid(),
  clientName: Joi.string().max(100),
  clientEmail: Joi.string().email().allow('', null),
  clientPhone: Joi.string().max(13),
  staffId: Joi.string().uuid().required(),
  serviceId: Joi.string().uuid().required(),
  appointmentDateTime: Joi.date().iso().greater('now').required(),
  notes: Joi.string().max(500).allow('', null),
  status: Joi.string().valid(...Object.values(BOOKING_STATUSES)).default(BOOKING_STATUSES.PENDING)
}).custom((value, helpers) => {
  if (!value.clientId && (!value.clientName || !value.clientPhone)) {
    return helpers.message('Either clientId or both clientName and clientPhone must be provided');
  }
  return value;
});

const updateBookingSchema = Joi.object({
  clientId: Joi.string().uuid(),
  staffId: Joi.string().uuid(),
  serviceId: Joi.string().uuid(),
  appointmentDateTime: Joi.date().iso().greater('now'),
  status: Joi.string().valid(...Object.values(BOOKING_STATUSES)),
  notes: Joi.string().max(500).allow('', null)
}).min(1); // At least one field must be provided for update

exports.validateCreateBooking = (bookingData) => {
  return createBookingSchema.validate(bookingData, { abortEarly: false });
};

exports.validateUpdateBooking = (bookingData) => {
  return updateBookingSchema.validate(bookingData, { abortEarly: false });
}; 
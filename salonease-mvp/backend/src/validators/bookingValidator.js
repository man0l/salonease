const Joi = require('joi');
const BOOKING_STATUSES = require('../config/bookingStatuses');

const createBookingSchema = Joi.object({
  clientId: Joi.string().uuid(),
  clientName: Joi.string().max(100),
  clientEmail: Joi.string().email(),
  clientPhone: Joi.string().max(20),
  staffId: Joi.string().uuid().required(),
  serviceId: Joi.string().uuid().required(),
  appointmentDateTime: Joi.date().iso().greater('now').required(),
  notes: Joi.string().max(500).allow('', null),
  status: Joi.string().valid(...Object.values(BOOKING_STATUSES)).default(BOOKING_STATUSES.PENDING)
}).custom((value, helpers) => {
  if (!value.clientId && (!value.clientName || !value.clientEmail || !value.clientPhone)) {
    return helpers.error('any.custom', {
      message: 'Either clientId or complete client information (name, email, and phone) must be provided'
    });
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
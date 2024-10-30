const Joi = require('joi');
const BOOKING_STATUSES = require('../config/bookingStatuses');

const createBookingSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  staffId: Joi.string().uuid().required(),
  serviceId: Joi.string().uuid().required(),
  appointmentDateTime: Joi.date().iso().greater('now').required(),
  endTime: Joi.date().iso().greater(Joi.ref('appointmentDateTime')).required(),
  salonId: Joi.string().uuid().required(),
  notes: Joi.string().max(500).allow('', null),
  status: Joi.string().valid(...Object.values(BOOKING_STATUSES)).default(BOOKING_STATUSES.PENDING)
});

const updateBookingSchema = Joi.object({
  clientId: Joi.string().uuid(),
  staffId: Joi.string().uuid(),
  serviceId: Joi.string().uuid(),
  appointmentDateTime: Joi.date().iso().greater('now'),
  endTime: Joi.date().iso().greater(Joi.ref('appointmentDateTime')),
  salonId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(BOOKING_STATUSES)),
  notes: Joi.string().max(500).allow('', null)
}).min(1); // At least one field must be provided for update

exports.validateCreateBooking = (bookingData) => {
  return createBookingSchema.validate(bookingData, { abortEarly: false });
};

exports.validateUpdateBooking = (bookingData) => {
  return updateBookingSchema.validate(bookingData, { abortEarly: false });
}; 
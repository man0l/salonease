const Joi = require('joi');

const salonSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required'
  }),
  contactNumber: Joi.string().required().messages({
    'string.empty': 'Contact number is required',
    'any.required': 'Contact number is required'
  }),
  description: Joi.string().allow('', null)
});

exports.validateSalon = (salon) => salonSchema.validate(salon, { abortEarly: false });

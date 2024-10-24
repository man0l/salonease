const Joi = require('joi');

const baseSalonSchema = {
  name: Joi.string().trim().min(1).max(255).messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 1 character long',
    'string.max': 'Name cannot exceed 255 characters'
  }),
  address: Joi.string().trim().min(1).max(255).messages({
    'string.empty': 'Address is required',
    'string.min': 'Address must be at least 1 character long',
    'string.max': 'Address cannot exceed 255 characters'
  }),
  contactNumber: Joi.string().trim().pattern(/^[0-9]{5,20}$/).messages({
    'string.empty': 'Contact number is required',
    'string.pattern.base': 'Contact number must be between 5 and 20 digits'
  }),
  description: Joi.string().allow('', null).max(1000).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  })
};

const createSalonSchema = Joi.object({
  ...baseSalonSchema,
  name: baseSalonSchema.name.required(),
  address: baseSalonSchema.address.required(),
  contactNumber: baseSalonSchema.contactNumber.required()
});

const updateSalonSchema = Joi.object(baseSalonSchema).min(1);

exports.validateCreateSalon = (salon) => createSalonSchema.validate(salon, { 
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
 });
exports.validateUpdateSalon = (salon) => updateSalonSchema.validate(salon, { 
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});

const Joi = require('joi');

const baseClientSchema = {
  name: Joi.string().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().allow(null).messages({
    'string.email': 'Email is invalid'
  }),
  phone: Joi.string().pattern(/^[+\d]+$/).messages({
    'string.pattern.base': 'Phone number can only contain digits and + symbol'
  }),
  notes: Joi.string().allow('', null)
};

const createClientSchema = Joi.object({
  ...baseClientSchema,
  name: baseClientSchema.name.required(),
  phone: baseClientSchema.phone.required().messages({
    'any.required': 'Phone number is required'
  })
});

const updateClientSchema = Joi.object(baseClientSchema)
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update'
    });

exports.validateCreateClient = (client) => createClientSchema.validate(client, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});

exports.validateUpdateClient = (client) => updateClientSchema.validate(client, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});

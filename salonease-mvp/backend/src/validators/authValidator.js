const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email is invalid',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required().messages({
    'string.pattern.base': 'Password must contain only letters and numbers (minimum 8 characters)',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.validateRegister = (user) => registerSchema.validate(user, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});
exports.validateLogin = (credentials) => loginSchema.validate(credentials, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});

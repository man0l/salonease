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
  password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
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

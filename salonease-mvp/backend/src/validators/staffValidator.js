const Joi = require('joi');

const inviteStaffSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  fullName: Joi.string().trim().required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required'
  }),
  image: Joi.string().allow(null, '').optional()
});

exports.validateInviteStaff = (data) => inviteStaffSchema.validate(data, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
}); 
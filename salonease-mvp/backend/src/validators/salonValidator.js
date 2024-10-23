const Joi = require('joi');

const salonSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  contactNumber: Joi.string().required(),
  description: Joi.string().allow('', null),
});

exports.validateSalon = (salon) => salonSchema.validate(salon);

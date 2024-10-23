const Joi = require('joi');

const serviceSchema = Joi.object({
  id: Joi.string().uuid().allow(null),
  name: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().positive().precision(2).required(),
  duration: Joi.number().integer().positive().required(),
  description: Joi.string().allow('', null),
  promotionalOffer: Joi.string().allow('', null),
});

exports.validateService = (service) => serviceSchema.validate(service, { allowUnknown: true });

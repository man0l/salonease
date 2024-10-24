const Joi = require('joi');

const baseServiceSchema = {
  name: Joi.string(),
  categoryId: Joi.number().integer(),
  price: Joi.number().positive().precision(2),
  duration: Joi.number().integer().positive(),
  description: Joi.string().allow('', null),
  promotionalOffer: Joi.string().allow('', null),
};

const createServiceSchema = Joi.object({
  ...baseServiceSchema,
  name: baseServiceSchema.name.required(),
  categoryId: baseServiceSchema.categoryId.required(),
  price: baseServiceSchema.price.required(),
  duration: baseServiceSchema.duration.required(),
});

const updateServiceSchema = Joi.object(baseServiceSchema).min(1);

exports.validateCreateService = (service) => createServiceSchema.validate(service, { allowUnknown: true });

exports.validateUpdateService = (service) => updateServiceSchema.validate(service, { 
  allowUnknown: true,
  stripUnknown: true 
});

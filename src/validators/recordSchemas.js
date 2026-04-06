const { Joi } = require('../middlewares/validateRequest');

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const recordBodySchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().min(2).max(50).pattern(/^[a-zA-Z0-9 _\-/&]+$/).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().trim().max(500).allow('', null),
});

const recordQuerySchema = Joi.object({
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(50).pattern(/^[a-zA-Z0-9 _\-/&]+$/),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'date-range validation').messages({
  'any.invalid': 'startDate cannot be greater than endDate',
});

module.exports = {
  idParamSchema,
  recordBodySchema,
  recordQuerySchema,
};
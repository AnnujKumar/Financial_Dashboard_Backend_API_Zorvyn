const Joi = require('joi');

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

const buildValidator = (schema, source) => (req, res, next) => {
  const { error, value } = schema.validate(req[source], validationOptions);

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }

  req[source] = value;
  return next();
};

module.exports = {
  validateBody: (schema) => buildValidator(schema, 'body'),
  validateQuery: (schema) => buildValidator(schema, 'query'),
  validateParams: (schema) => buildValidator(schema, 'params'),
  Joi,
};
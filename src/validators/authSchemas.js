const { Joi } = require('../middlewares/validateRequest');

const usernameSchema = Joi.string()
  .trim()
  .min(3)
  .max(50)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .required();

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required();

const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  registerBodySchema: Joi.object({
    username: usernameSchema,
    password: passwordSchema,
    role: Joi.string().valid('viewer', 'analyst', 'admin').default('viewer'),
  }),
  loginBodySchema: Joi.object({
    username: usernameSchema,
    password: Joi.string().min(1).max(72).required(),
  }),
  userIdParamSchema,
  updateUserStatusSchema: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
  updateUserRoleSchema: Joi.object({
    role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
  }),
};
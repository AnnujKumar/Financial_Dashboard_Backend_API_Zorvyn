const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateParams } = require('../middlewares/validateRequest');
const {
	registerBodySchema,
	loginBodySchema,
	userIdParamSchema,
	updateUserStatusSchema,
	updateUserRoleSchema,
} = require('../validators/authSchemas');

router.post('/register',validateBody(registerBodySchema), authController.register);
router.post('/login', validateBody(loginBodySchema), authController.login);
router.get('/users', verifyToken, authorizeRoles('admin'), authController.listUsers);
router.patch('/users/:id/status', verifyToken, authorizeRoles('admin'), validateParams(userIdParamSchema), validateBody(updateUserStatusSchema), authController.updateUserStatus); // Admin only
router.patch('/users/:id/role', verifyToken, authorizeRoles('admin'), validateParams(userIdParamSchema), validateBody(updateUserRoleSchema), authController.updateUserRole);

module.exports = router;
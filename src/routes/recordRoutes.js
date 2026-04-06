const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validateRequest');
const { idParamSchema, recordBodySchema, recordQuerySchema } = require('../validators/recordSchemas');

// Analyst/Admin can read records
router.get('/', verifyToken, authorizeRoles('analyst', 'admin'), validateQuery(recordQuerySchema), recordController.getRecords);

// Only Analyst and Admin can Create/Update records
router.post('/', verifyToken, authorizeRoles('admin'), validateBody(recordBodySchema), recordController.createRecord);
router.put('/:id', verifyToken, authorizeRoles('admin'), validateParams(idParamSchema), validateBody(recordBodySchema), recordController.updateRecord);

// Only Admin can Delete records
router.delete('/:id', verifyToken, authorizeRoles('admin'), validateParams(idParamSchema), recordController.deleteRecord);

module.exports = router;
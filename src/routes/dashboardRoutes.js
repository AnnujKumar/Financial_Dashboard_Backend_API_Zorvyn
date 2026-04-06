const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// Viewers can view dashboards, as well as analysts and admins
router.get('/summary', verifyToken, authorizeRoles('viewer', 'analyst', 'admin'), dashboardController.getSummary);

module.exports = router;
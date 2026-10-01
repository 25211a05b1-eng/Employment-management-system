const express = require('express');
const router = express.Router();
const {
    getEmployeeDashboard,
    getManagerDashboard,
    getAdminDashboard
} = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/employee', getEmployeeDashboard);
router.get('/manager', authorizeRoles('MANAGER', 'ADMIN'), getManagerDashboard);
router.get('/admin', authorizeRoles('ADMIN'), getAdminDashboard);

module.exports = router;

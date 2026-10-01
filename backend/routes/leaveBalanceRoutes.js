const express = require('express');
const router = express.Router();
const {
    getLeaveBalances,
    getEmployeeBalances,
    updateLeaveBalance
} = require('../controllers/leaveBalanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', getLeaveBalances);
router.get('/:employeeId', getEmployeeBalances);

// Admin can adjust/configure leave balances
router.put('/:id', authorizeRoles('ADMIN'), updateLeaveBalance);

module.exports = router;

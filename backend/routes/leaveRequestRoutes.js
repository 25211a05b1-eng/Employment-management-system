const express = require('express');
const router = express.Router();
const {
    applyLeaveRequest,
    getLeaveRequests,
    getLeaveRequestById,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest
} = require('../controllers/leaveRequestController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', applyLeaveRequest);
router.get('/', getLeaveRequests);
router.get('/:id', getLeaveRequestById);

// Manager & Admin approval / rejection
router.post('/:id/approve', authorizeRoles('MANAGER', 'ADMIN'), approveLeaveRequest);
router.post('/:id/reject', authorizeRoles('MANAGER', 'ADMIN'), rejectLeaveRequest);

// Employee / Manager / Admin cancellation of eligible pending requests
router.post('/:id/cancel', cancelLeaveRequest);

module.exports = router;

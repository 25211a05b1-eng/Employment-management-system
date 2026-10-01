const express = require('express');
const router = express.Router();
const {
    getLeaveTypes,
    getLeaveTypeById,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType
} = require('../controllers/leaveTypeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', getLeaveTypes);
router.get('/:id', getLeaveTypeById);

// Admin-only leave type management
router.post('/', authorizeRoles('ADMIN'), createLeaveType);
router.put('/:id', authorizeRoles('ADMIN'), updateLeaveType);
router.delete('/:id', authorizeRoles('ADMIN'), deleteLeaveType);

module.exports = router;

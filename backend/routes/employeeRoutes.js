const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getManagers
} = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);

// Accessible by all authenticated users (e.g. for dropdowns)
router.get('/managers', getManagers);

// List employees (Managers see their direct reports, Admin sees all)
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getEmployees);
router.get('/:id', getEmployeeById);

// Admin-only employee creation, modification, deletion
router.post('/', authorizeRoles('ADMIN'), createEmployee);
router.put('/:id', authorizeRoles('ADMIN'), updateEmployee);
router.delete('/:id', authorizeRoles('ADMIN'), deleteEmployee);

module.exports = router;

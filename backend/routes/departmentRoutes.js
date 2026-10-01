const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    getDepartmentById, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment 
} = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All department routes require authentication
router.use(verifyToken);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin-only management routes
router.post('/', authorizeRoles('ADMIN'), createDepartment);
router.put('/:id', authorizeRoles('ADMIN'), updateDepartment);
router.delete('/:id', authorizeRoles('ADMIN'), deleteDepartment);

module.exports = router;

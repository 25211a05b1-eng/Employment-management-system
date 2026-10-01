const { pool } = require('../config/db');

// @desc    Get all departments (with employee counts)
// @route   GET /api/departments
// @access  Private (All authenticated roles)
const getDepartments = async (req, res) => {
    try {
        const [departments] = await pool.query(`
            SELECT d.id, d.name, d.description, d.created_at, d.updated_at,
                   COUNT(u.id) AS employee_count
            FROM departments d
            LEFT JOIN users u ON u.department_id = d.id AND u.status = 'ACTIVE'
            GROUP BY d.id
            ORDER BY d.name ASC
        `);

        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments: ' + error.message
        });
    }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Private (All authenticated roles)
const getDepartmentById = async (req, res) => {
    try {
        const deptId = parseInt(req.params.id, 10);
        const [rows] = await pool.query(`
            SELECT d.*, COUNT(u.id) AS employee_count 
            FROM departments d 
            LEFT JOIN users u ON u.department_id = d.id 
            WHERE d.id = ?
            GROUP BY d.id
        `, [deptId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found.'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department: ' + error.message
        });
    }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required.'
            });
        }

        // Check duplicate name
        const [existing] = await pool.query('SELECT id FROM departments WHERE LOWER(name) = ?', [name.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name.trim(), description ? description.trim() : null]
        );

        const [created] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Department created successfully.',
            data: created[0]
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department: ' + error.message
        });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res) => {
    try {
        const deptId = parseInt(req.params.id, 10);
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required.'
            });
        }

        // Check if another department has the same name
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE LOWER(name) = ? AND id != ?',
            [name.trim().toLowerCase(), deptId]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Another department with this name already exists.'
            });
        }

        await pool.query(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            [name.trim(), description !== undefined ? description.trim() : null, deptId]
        );

        const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);

        res.json({
            success: true,
            message: 'Department updated successfully.',
            data: updated[0]
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department: ' + error.message
        });
    }
};

// @desc    Delete department (Safe delete check)
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
    try {
        const deptId = parseInt(req.params.id, 10);

        // Check if department exists
        const [dept] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);
        if (dept.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found.'
            });
        }

        // Check if employees are assigned to this department
        const [employees] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE department_id = ?', [deptId]);
        if (employees[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department: ${employees[0].count} employee(s) are currently assigned to it. Reassign them first.`
            });
        }

        await pool.query('DELETE FROM departments WHERE id = ?', [deptId]);

        res.json({
            success: true,
            message: 'Department deleted successfully.'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department: ' + error.message
        });
    }
};

module.exports = {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};

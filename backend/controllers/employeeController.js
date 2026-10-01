const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { isValidEmail, isValidPhone } = require('../utils/validators');

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Private (Admin & Manager)
const getEmployees = async (req, res) => {
    try {
        const { role, department_id, status, search, manager_id } = req.query;

        let query = `
            SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, 
                   u.joining_date, u.status, u.created_at,
                   d.name AS department_name,
                   m.name AS manager_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users m ON u.manager_id = m.id
            WHERE 1=1
        `;
        const params = [];

        // If requester is a Manager, they only view their direct reports
        if (req.user.role === 'MANAGER') {
            query += ' AND (u.manager_id = ? OR u.id = ?)';
            params.push(req.user.id, req.user.id);
        }

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (department_id) {
            query += ' AND u.department_id = ?';
            params.push(department_id);
        }

        if (status) {
            query += ' AND u.status = ?';
            params.push(status);
        }

        if (manager_id && req.user.role === 'ADMIN') {
            query += ' AND u.manager_id = ?';
            params.push(manager_id);
        }

        if (search) {
            query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY u.id ASC';

        const [employees] = await pool.query(query, params);

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees: ' + error.message
        });
    }
};

// @desc    Get single employee details by ID
// @route   GET /api/employees/:id
// @access  Private (Admin, Manager, or Self)
const getEmployeeById = async (req, res) => {
    try {
        const empId = parseInt(req.params.id, 10);

        // Security check
        if (req.user.role === 'EMPLOYEE' && req.user.id !== empId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only view your own profile.'
            });
        }

        const [rows] = await pool.query(`
            SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, 
                   u.joining_date, u.status, u.created_at,
                   d.name AS department_name,
                   m.name AS manager_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users m ON u.manager_id = m.id
            WHERE u.id = ?
        `, [empId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        const employee = rows[0];

        // If manager, verify employee is assigned to them
        if (req.user.role === 'MANAGER' && employee.manager_id !== req.user.id && employee.id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: This employee is not assigned to you.'
            });
        }

        // Also fetch leave balances for the employee for current year
        const currentYear = new Date().getFullYear();
        const [balances] = await pool.query(`
            SELECT lb.*, lt.name AS leave_type_name, lt.paid 
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = ? AND lb.year = ?
        `, [empId, currentYear]);

        res.json({
            success: true,
            data: {
                ...employee,
                balances
            }
        });
    } catch (error) {
        console.error('Get employee by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee: ' + error.message
        });
    }
};

// @desc    Create new employee / manager / admin
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
    try {
        const { employee_id, name, email, password, phone, role, department_id, manager_id, joining_date, status } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Check duplicate email
        const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Handle employee_id
        let empId = employee_id ? employee_id.trim().toUpperCase() : null;
        if (!empId) {
            const prefix = role === 'ADMIN' ? 'ADM' : role === 'MANAGER' ? 'MGR' : 'EMP';
            const [last] = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
            const nextNum = (last.length > 0 ? last[0].id + 1 : 1);
            empId = `${prefix}${String(nextNum).padStart(3, '0')}`;
        } else {
            const [existingEmpId] = await pool.query('SELECT id FROM users WHERE employee_id = ?', [empId]);
            if (existingEmpId.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID already exists. Please choose a unique one.'
                });
            }
        }

        const validRole = ['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role) ? role : 'EMPLOYEE';
        const userStatus = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const joinDate = joining_date || new Date().toISOString().split('T')[0];

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            `INSERT INTO users (employee_id, name, email, password, phone, role, department_id, manager_id, joining_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empId,
                name.trim(),
                email.trim().toLowerCase(),
                hashedPassword,
                phone || null,
                validRole,
                department_id ? parseInt(department_id, 10) : null,
                manager_id ? parseInt(manager_id, 10) : null,
                joinDate,
                userStatus
            ]
        );

        const newUserId = result.insertId;

        // Populate leave balances
        const currentYear = new Date().getFullYear();
        const [leaveTypes] = await pool.query('SELECT id, default_days FROM leave_types');
        for (const lt of leaveTypes) {
            await pool.query(
                `INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year)
                 VALUES (?, ?, ?, 0, ?, ?)`,
                [newUserId, lt.id, lt.default_days, lt.default_days, currentYear]
            );
        }

        const [created] = await pool.query(`
            SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, 
                   u.joining_date, u.status, d.name AS department_name, m.name AS manager_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users m ON u.manager_id = m.id
            WHERE u.id = ?
        `, [newUserId]);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully with initialized leave balances.',
            data: created[0]
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating employee: ' + error.message
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
const updateEmployee = async (req, res) => {
    try {
        const empId = parseInt(req.params.id, 10);
        const { employee_id, name, email, password, phone, role, department_id, manager_id, joining_date, status } = req.body;

        const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [empId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        const current = existing[0];

        // Check unique email if changed
        if (email && email.trim().toLowerCase() !== current.email.toLowerCase()) {
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email address.'
                });
            }
            const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim().toLowerCase(), empId]);
            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Another user with this email already exists.'
                });
            }
        }

        // Check unique employee_id if changed
        if (employee_id && employee_id.trim().toUpperCase() !== current.employee_id.toUpperCase()) {
            const [idCheck] = await pool.query('SELECT id FROM users WHERE employee_id = ? AND id != ?', [employee_id.trim().toUpperCase(), empId]);
            if (idCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Another user with this Employee ID already exists.'
                });
            }
        }

        let newHashedPassword = current.password;
        if (password && password.trim().length > 0) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long.'
                });
            }
            const salt = await bcrypt.genSalt(10);
            newHashedPassword = await bcrypt.hash(password, salt);
        }

        await pool.query(
            `UPDATE users 
             SET employee_id = ?, name = ?, email = ?, password = ?, phone = ?, role = ?, 
                 department_id = ?, manager_id = ?, joining_date = ?, status = ?
             WHERE id = ?`,
            [
                employee_id ? employee_id.trim().toUpperCase() : current.employee_id,
                name ? name.trim() : current.name,
                email ? email.trim().toLowerCase() : current.email,
                newHashedPassword,
                phone !== undefined ? phone : current.phone,
                role || current.role,
                department_id !== undefined ? (department_id ? parseInt(department_id, 10) : null) : current.department_id,
                manager_id !== undefined ? (manager_id ? parseInt(manager_id, 10) : null) : current.manager_id,
                joining_date || current.joining_date,
                status || current.status,
                empId
            ]
        );

        const [updated] = await pool.query(`
            SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, 
                   u.joining_date, u.status, d.name AS department_name, m.name AS manager_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users m ON u.manager_id = m.id
            WHERE u.id = ?
        `, [empId]);

        res.json({
            success: true,
            message: 'Employee updated successfully.',
            data: updated[0]
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating employee: ' + error.message
        });
    }
};

// @desc    Delete or deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
    try {
        const empId = parseInt(req.params.id, 10);

        if (req.user.id === empId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete or deactivate your own admin account.'
            });
        }

        const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [empId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        // If employee has leave requests, soft deactivate to preserve audit history
        const [requests] = await pool.query('SELECT COUNT(*) AS count FROM leave_requests WHERE user_id = ?', [empId]);

        if (requests[0].count > 0) {
            await pool.query("UPDATE users SET status = 'INACTIVE' WHERE id = ?", [empId]);
            return res.json({
                success: true,
                message: 'Employee has associated leave history. Account has been deactivated safely.'
            });
        }

        // Otherwise delete user
        await pool.query('DELETE FROM users WHERE id = ?', [empId]);

        res.json({
            success: true,
            message: 'Employee deleted successfully.'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee: ' + error.message
        });
    }
};

// @desc    Get all managers (for manager selection dropdowns)
// @route   GET /api/employees/managers
// @access  Private (All authenticated roles)
const getManagers = async (req, res) => {
    try {
        const [managers] = await pool.query(`
            SELECT u.id, u.employee_id, u.name, u.email, d.name AS department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role IN ('MANAGER', 'ADMIN') AND u.status = 'ACTIVE'
            ORDER BY u.name ASC
        `);

        res.json({
            success: true,
            data: managers
        });
    } catch (error) {
        console.error('Get managers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching managers: ' + error.message
        });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getManagers
};

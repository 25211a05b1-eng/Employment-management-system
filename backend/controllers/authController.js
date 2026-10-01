const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { isValidEmail } = require('../utils/validators');

// Generate JWT Helper
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            employee_id: user.employee_id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'super_secret_employee_leave_management_jwt_key_2026',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    );
};

// @desc    Register a new user / employee
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone, department_id, manager_id, joining_date, employee_id } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Check if email already exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Generate or validate employee_id
        let empId = employee_id ? employee_id.trim().toUpperCase() : null;
        if (!empId) {
            const [lastEmp] = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
            const nextNum = (lastEmp.length > 0 ? lastEmp[0].id + 1 : 1);
            empId = `EMP${String(nextNum).padStart(3, '0')}`;
        } else {
            const [existingEmpId] = await pool.query('SELECT id FROM users WHERE employee_id = ?', [empId]);
            if (existingEmpId.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID already taken. Please choose another or leave blank for auto-generation.'
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const joinDate = joining_date || new Date().toISOString().split('T')[0];
        const deptId = department_id ? parseInt(department_id, 10) : null;
        const mgrId = manager_id ? parseInt(manager_id, 10) : null;

        // Insert new user
        const [result] = await pool.query(
            `INSERT INTO users (employee_id, name, email, password, phone, role, department_id, manager_id, joining_date, status) 
             VALUES (?, ?, ?, ?, ?, 'EMPLOYEE', ?, ?, ?, 'ACTIVE')`,
            [empId, name.trim(), email.trim().toLowerCase(), hashedPassword, phone || null, deptId, mgrId, joinDate]
        );

        const newUserId = result.insertId;

        // Initialize default leave balances for all available leave types for current year
        const currentYear = new Date().getFullYear();
        const [leaveTypes] = await pool.query('SELECT id, default_days FROM leave_types');

        for (const lt of leaveTypes) {
            await pool.query(
                `INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) 
                 VALUES (?, ?, ?, 0, ?, ?)`,
                [newUserId, lt.id, lt.default_days, lt.default_days, currentYear]
            );
        }

        // Fetch created user without password
        const [users] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, u.joining_date, u.status, d.name AS department_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = ?`,
            [newUserId]
        );

        const user = users[0];
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully with default leave balances.',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration: ' + error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        // Look up user by email
        const [rows] = await pool.query(
            `SELECT u.*, d.name AS department_name, m.name AS manager_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             LEFT JOIN users m ON u.manager_id = m.id 
             WHERE u.email = ?`,
            [email.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = rows[0];

        // Check if user is active
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact HR or System Administrator.'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Do not return password hash
        delete user.password;

        const token = generateToken(user);

        res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login: ' + error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, u.joining_date, u.status, u.created_at,
                    d.name AS department_name, m.name AS manager_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             LEFT JOIN users m ON u.manager_id = m.id 
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile: ' + error.message
        });
    }
};

// @desc    Update current user profile (phone, password)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { phone, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // If updating password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to set a new password.'
                });
            }

            const [userRows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
            const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect.'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long.'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        // If updating phone
        if (phone !== undefined) {
            await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, userId]);
        }

        const [updatedRows] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email, u.phone, u.role, u.department_id, u.manager_id, u.joining_date, u.status,
                    d.name AS department_name, m.name AS manager_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             LEFT JOIN users m ON u.manager_id = m.id 
             WHERE u.id = ?`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile: ' + error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};

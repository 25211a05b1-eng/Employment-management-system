const { pool } = require('../config/db');

// @desc    Get all leave balances (filtered by role / query parameters)
// @route   GET /api/leave-balances
// @access  Private
const getLeaveBalances = async (req, res) => {
    try {
        const { user_id, year, department_id } = req.query;
        const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();

        let query = `
            SELECT lb.id, lb.user_id, lb.leave_type_id, lb.total_days, lb.used_days, lb.remaining_days, lb.year,
                   u.employee_id, u.name AS employee_name, u.email AS employee_email, u.role,
                   d.name AS department_name,
                   lt.name AS leave_type_name, lt.paid, lt.default_days
            FROM leave_balances lb
            JOIN users u ON lb.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.year = ?
        `;
        const params = [currentYear];

        // Role-based restrictions
        if (req.user.role === 'EMPLOYEE') {
            query += ' AND lb.user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'MANAGER') {
            // Manager can see own balances AND assigned employees
            if (user_id) {
                query += ' AND (lb.user_id = ? AND (u.manager_id = ? OR lb.user_id = ?))';
                params.push(user_id, req.user.id, req.user.id);
            } else {
                query += ' AND (u.manager_id = ? OR lb.user_id = ?)';
                params.push(req.user.id, req.user.id);
            }
        } else {
            // Admin can filter by user_id or department
            if (user_id) {
                query += ' AND lb.user_id = ?';
                params.push(user_id);
            }
            if (department_id) {
                query += ' AND u.department_id = ?';
                params.push(department_id);
            }
        }

        query += ' ORDER BY u.name ASC, lt.id ASC';

        const [rows] = await pool.query(query, params);

        res.json({
            success: true,
            count: rows.length,
            year: currentYear,
            data: rows
        });
    } catch (error) {
        console.error('Get leave balances error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balances: ' + error.message
        });
    }
};

// @desc    Get leave balances for a specific employee
// @route   GET /api/leave-balances/:employeeId
// @access  Private
const getEmployeeBalances = async (req, res) => {
    try {
        const empIdentifier = req.params.employeeId;
        const currentYear = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

        // Check if employeeId is numeric ID or string employee_id (EMP001)
        let userQuery = 'SELECT id, employee_id, name, email, department_id, manager_id FROM users WHERE ';
        const userParams = [];

        if (!isNaN(empIdentifier)) {
            userQuery += 'id = ?';
            userParams.push(parseInt(empIdentifier, 10));
        } else {
            userQuery += 'employee_id = ?';
            userParams.push(empIdentifier);
        }

        const [userRows] = await pool.query(userQuery, userParams);
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        const targetUser = userRows[0];

        // Access check
        if (req.user.role === 'EMPLOYEE' && req.user.id !== targetUser.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only view your own leave balance.'
            });
        }

        if (req.user.role === 'MANAGER' && targetUser.manager_id !== req.user.id && targetUser.id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only view balances of employees assigned to you.'
            });
        }

        // Ensure balances exist for this year
        const [existingBalances] = await pool.query(
            'SELECT * FROM leave_balances WHERE user_id = ? AND year = ?',
            [targetUser.id, currentYear]
        );

        if (existingBalances.length === 0) {
            // Auto initialize from leave types
            const [types] = await pool.query('SELECT id, default_days FROM leave_types');
            for (const lt of types) {
                await pool.query(
                    `INSERT IGNORE INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year)
                     VALUES (?, ?, ?, 0, ?, ?)`,
                    [targetUser.id, lt.id, lt.default_days, lt.default_days, currentYear]
                );
            }
        }

        const [balances] = await pool.query(`
            SELECT lb.id, lb.user_id, lb.leave_type_id, lb.total_days, lb.used_days, lb.remaining_days, lb.year,
                   lt.name AS leave_type_name, lt.description AS leave_type_description, lt.paid
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = ? AND lb.year = ?
            ORDER BY lt.id ASC
        `, [targetUser.id, currentYear]);

        res.json({
            success: true,
            employee: targetUser,
            year: currentYear,
            data: balances
        });
    } catch (error) {
        console.error('Get employee balances error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee balances: ' + error.message
        });
    }
};

// @desc    Update / configure a leave balance (total days, used days, remaining days)
// @route   PUT /api/leave-balances/:id
// @access  Private (Admin only)
const updateLeaveBalance = async (req, res) => {
    try {
        const balanceId = parseInt(req.params.id, 10);
        const { total_days, used_days } = req.body;

        const [rows] = await pool.query('SELECT * FROM leave_balances WHERE id = ?', [balanceId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave balance record not found.'
            });
        }

        const current = rows[0];
        const newTotal = total_days !== undefined ? parseInt(total_days, 10) : current.total_days;
        const newUsed = used_days !== undefined ? parseInt(used_days, 10) : current.used_days;

        if (isNaN(newTotal) || newTotal < 0) {
            return res.status(400).json({
                success: false,
                message: 'Total days must be a non-negative number.'
            });
        }

        if (isNaN(newUsed) || newUsed < 0) {
            return res.status(400).json({
                success: false,
                message: 'Used days must be a non-negative number.'
            });
        }

        const newRemaining = newTotal - newUsed;
        if (newRemaining < 0) {
            return res.status(400).json({
                success: false,
                message: `Remaining balance cannot be negative (Total: ${newTotal}, Used: ${newUsed}).`
            });
        }

        await pool.query(
            'UPDATE leave_balances SET total_days = ?, used_days = ?, remaining_days = ? WHERE id = ?',
            [newTotal, newUsed, newRemaining, balanceId]
        );

        const [updated] = await pool.query(`
            SELECT lb.*, lt.name AS leave_type_name, u.name AS employee_name 
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            JOIN users u ON lb.user_id = u.id
            WHERE lb.id = ?
        `, [balanceId]);

        res.json({
            success: true,
            message: 'Leave balance updated successfully.',
            data: updated[0]
        });
    } catch (error) {
        console.error('Update leave balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating leave balance: ' + error.message
        });
    }
};

module.exports = {
    getLeaveBalances,
    getEmployeeBalances,
    updateLeaveBalance
};

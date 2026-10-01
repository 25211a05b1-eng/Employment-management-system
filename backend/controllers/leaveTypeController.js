const { pool } = require('../config/db');

// @desc    Get all leave types
// @route   GET /api/leave-types
// @access  Private (All authenticated roles)
const getLeaveTypes = async (req, res) => {
    try {
        const [leaveTypes] = await pool.query('SELECT * FROM leave_types ORDER BY id ASC');
        res.json({
            success: true,
            count: leaveTypes.length,
            data: leaveTypes
        });
    } catch (error) {
        console.error('Get leave types error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave types: ' + error.message
        });
    }
};

// @desc    Get single leave type by ID
// @route   GET /api/leave-types/:id
// @access  Private (All authenticated roles)
const getLeaveTypeById = async (req, res) => {
    try {
        const leaveTypeId = parseInt(req.params.id, 10);
        const [rows] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [leaveTypeId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found.'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Get leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave type: ' + error.message
        });
    }
};

// @desc    Create new leave type
// @route   POST /api/leave-types
// @access  Private (Admin only)
const createLeaveType = async (req, res) => {
    try {
        const { name, description, default_days, paid } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Leave type name is required.'
            });
        }

        const days = parseInt(default_days, 10);
        if (isNaN(days) || days < 0) {
            return res.status(400).json({
                success: false,
                message: 'Default days must be a non-negative number.'
            });
        }

        const isPaid = paid === undefined ? true : Boolean(paid);

        // Check duplicate name
        const [existing] = await pool.query('SELECT id FROM leave_types WHERE LOWER(name) = ?', [name.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Leave type with this name already exists.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO leave_types (name, description, default_days, paid) VALUES (?, ?, ?, ?)',
            [name.trim(), description ? description.trim() : null, days, isPaid]
        );

        const newTypeId = result.insertId;

        // Automatically populate balances for all active users for the current year
        const currentYear = new Date().getFullYear();
        const [activeUsers] = await pool.query("SELECT id FROM users WHERE status = 'ACTIVE'");

        for (const user of activeUsers) {
            await pool.query(
                `INSERT IGNORE INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year)
                 VALUES (?, ?, ?, 0, ?, ?)`,
                [user.id, newTypeId, days, days, currentYear]
            );
        }

        const [created] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [newTypeId]);

        res.status(201).json({
            success: true,
            message: 'Leave type created and balances initialized for all active employees.',
            data: created[0]
        });
    } catch (error) {
        console.error('Create leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating leave type: ' + error.message
        });
    }
};

// @desc    Update leave type
// @route   PUT /api/leave-types/:id
// @access  Private (Admin only)
const updateLeaveType = async (req, res) => {
    try {
        const leaveTypeId = parseInt(req.params.id, 10);
        const { name, description, default_days, paid } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Leave type name is required.'
            });
        }

        const days = parseInt(default_days, 10);
        if (isNaN(days) || days < 0) {
            return res.status(400).json({
                success: false,
                message: 'Default days must be a non-negative number.'
            });
        }

        const isPaid = paid === undefined ? true : Boolean(paid);

        // Check duplicate name for other types
        const [existing] = await pool.query(
            'SELECT id FROM leave_types WHERE LOWER(name) = ? AND id != ?',
            [name.trim().toLowerCase(), leaveTypeId]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Another leave type with this name already exists.'
            });
        }

        await pool.query(
            'UPDATE leave_types SET name = ?, description = ?, default_days = ?, paid = ? WHERE id = ?',
            [name.trim(), description !== undefined ? description.trim() : null, days, isPaid, leaveTypeId]
        );

        const [updated] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [leaveTypeId]);

        res.json({
            success: true,
            message: 'Leave type updated successfully.',
            data: updated[0]
        });
    } catch (error) {
        console.error('Update leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating leave type: ' + error.message
        });
    }
};

// @desc    Delete leave type (Safe delete check)
// @route   DELETE /api/leave-types/:id
// @access  Private (Admin only)
const deleteLeaveType = async (req, res) => {
    try {
        const leaveTypeId = parseInt(req.params.id, 10);

        // Check if leave requests exist with this type
        const [requests] = await pool.query('SELECT COUNT(*) AS count FROM leave_requests WHERE leave_type_id = ?', [leaveTypeId]);
        if (requests[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete leave type: ${requests[0].count} historical leave request(s) are linked to it.`
            });
        }

        await pool.query('DELETE FROM leave_types WHERE id = ?', [leaveTypeId]);

        res.json({
            success: true,
            message: 'Leave type deleted successfully.'
        });
    } catch (error) {
        console.error('Delete leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting leave type: ' + error.message
        });
    }
};

module.exports = {
    getLeaveTypes,
    getLeaveTypeById,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType
};

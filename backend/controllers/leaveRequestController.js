const { pool } = require('../config/db');
const { calculateDays, isValidDate } = require('../utils/validators');

// @desc    Apply for a new leave request
// @route   POST /api/leave-requests
// @access  Private (Employee, Manager, Admin)
const applyLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { leave_type_id, start_date, end_date, reason, optional_comments } = req.body;

        // Validation
        if (!leave_type_id) {
            return res.status(400).json({
                success: false,
                message: 'Leave type is required.'
            });
        }

        if (!start_date || !isValidDate(start_date)) {
            return res.status(400).json({
                success: false,
                message: 'Valid start date is required (YYYY-MM-DD).'
            });
        }

        if (!end_date || !isValidDate(end_date)) {
            return res.status(400).json({
                success: false,
                message: 'Valid end date is required (YYYY-MM-DD).'
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reason for leave is required.'
            });
        }

        // Calculate days
        const numberOfDays = calculateDays(start_date, end_date);
        if (numberOfDays <= 0) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be earlier than start date.'
            });
        }

        // Fetch leave type
        const [types] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [parseInt(leave_type_id, 10)]);
        if (types.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Selected leave type not found.'
            });
        }
        const leaveType = types[0];

        // Leave year based on start date
        const leaveYear = new Date(start_date).getFullYear();

        // If paid leave, check available leave balance
        if (leaveType.paid) {
            const [balances] = await pool.query(
                'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?',
                [userId, leaveType.id, leaveYear]
            );

            if (balances.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `No leave balance allocated for ${leaveType.name} in year ${leaveYear}. Please contact HR.`
                });
            }

            const balance = balances[0];
            if (balance.remaining_days < numberOfDays) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient leave balance for ${leaveType.name}. Requested: ${numberOfDays} day(s), Available: ${balance.remaining_days} day(s).`
                });
            }
        }

        // Check for overlapping leave requests (PENDING or APPROVED)
        const [overlaps] = await pool.query(`
            SELECT id, start_date, end_date, status 
            FROM leave_requests 
            WHERE user_id = ? 
              AND status IN ('PENDING', 'APPROVED')
              AND NOT (end_date < ? OR start_date > ?)
        `, [userId, start_date, end_date]);

        if (overlaps.length > 0) {
            const overlap = overlaps[0];
            return res.status(400).json({
                success: false,
                message: `You already have an existing ${overlap.status} leave request from ${overlap.start_date} to ${overlap.end_date}. Overlapping dates are not allowed.`
            });
        }

        // Insert new leave request with PENDING status
        const [result] = await pool.query(
            `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, number_of_days, reason, optional_comments, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [userId, leaveType.id, start_date, end_date, numberOfDays, reason.trim(), optional_comments ? optional_comments.trim() : null]
        );

        const newRequestId = result.insertId;

        // Fetch inserted request with user and type details
        const [createdRequest] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name, lt.paid,
                   u.name AS employee_name, u.employee_id, d.name AS department_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE lr.id = ?
        `, [newRequestId]);

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully. Status is PENDING approval.',
            data: createdRequest[0]
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting leave request: ' + error.message
        });
    }
};

// @desc    Get all leave requests (scoped by role & query parameters)
// @route   GET /api/leave-requests
// @access  Private
const getLeaveRequests = async (req, res) => {
    try {
        const { status, leave_type_id, department_id, employee_id, team_only } = req.query;

        let query = `
            SELECT lr.id, lr.user_id, lr.leave_type_id, lr.start_date, lr.end_date, lr.number_of_days,
                   lr.reason, lr.optional_comments, lr.status, lr.manager_remarks, lr.rejection_reason,
                   lr.approved_by, lr.approved_at, lr.created_at, lr.updated_at,
                   lt.name AS leave_type_name, lt.paid,
                   u.name AS employee_name, u.employee_id, u.email AS employee_email,
                   d.name AS department_name,
                   approver.name AS approver_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users approver ON lr.approved_by = approver.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based scoping
        if (req.user.role === 'EMPLOYEE') {
            query += ' AND lr.user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'MANAGER') {
            if (team_only === 'true') {
                // Only requests from direct reports
                query += ' AND u.manager_id = ?';
                params.push(req.user.id);
            } else if (req.query.my_requests === 'true') {
                query += ' AND lr.user_id = ?';
                params.push(req.user.id);
            } else {
                // Manager sees requests from assigned team members OR their own
                query += ' AND (u.manager_id = ? OR lr.user_id = ?)';
                params.push(req.user.id, req.user.id);
            }
        } else {
            // ADMIN
            if (employee_id) {
                query += ' AND u.id = ?';
                params.push(employee_id);
            }
        }

        if (status) {
            query += ' AND lr.status = ?';
            params.push(status);
        }

        if (leave_type_id) {
            query += ' AND lr.leave_type_id = ?';
            params.push(leave_type_id);
        }

        if (department_id) {
            query += ' AND u.department_id = ?';
            params.push(department_id);
        }

        query += ' ORDER BY lr.created_at DESC';

        const [requests] = await pool.query(query, params);

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests: ' + error.message
        });
    }
};

// @desc    Get single leave request by ID
// @route   GET /api/leave-requests/:id
// @access  Private
const getLeaveRequestById = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);

        const [rows] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name, lt.paid,
                   u.name AS employee_name, u.employee_id, u.email AS employee_email, u.manager_id,
                   d.name AS department_name,
                   approver.name AS approver_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users approver ON lr.approved_by = approver.id
            WHERE lr.id = ?
        `, [requestId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const request = rows[0];

        // Access check
        if (req.user.role === 'EMPLOYEE' && request.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only view your own leave requests.'
            });
        }

        if (req.user.role === 'MANAGER' && request.user_id !== req.user.id && request.manager_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You are not authorized to view this request.'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get leave request by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave request: ' + error.message
        });
    }
};

// @desc    Approve a pending leave request
// @route   POST /api/leave-requests/:id/approve
// @access  Private (Manager & Admin)
const approveLeaveRequest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const requestId = parseInt(req.params.id, 10);
        const { manager_remarks } = req.body;

        await connection.beginTransaction();

        // Lock row for update
        const [rows] = await connection.query(`
            SELECT lr.*, u.manager_id, u.name AS employee_name, lt.paid, lt.name AS leave_type_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.id = ? FOR UPDATE
        `, [requestId]);

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const leaveReq = rows[0];

        // Check if request is still PENDING
        if (leaveReq.status !== 'PENDING') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot approve request with current status '${leaveReq.status}'. Only PENDING requests can be approved.`
            });
        }

        // Authorization check: Manager can only approve direct reports (or Admin can approve any)
        if (req.user.role === 'MANAGER' && leaveReq.manager_id !== req.user.id) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only approve leave requests of your assigned direct reports.'
            });
        }

        const leaveYear = new Date(leaveReq.start_date).getFullYear();

        // If paid leave, deduct leave balance
        if (leaveReq.paid) {
            const [balances] = await connection.query(
                'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ? FOR UPDATE',
                [leaveReq.user_id, leaveReq.leave_type_id, leaveYear]
            );

            if (balances.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Leave balance record not found for employee for year ${leaveYear}.`
                });
            }

            const currentBalance = balances[0];
            if (currentBalance.remaining_days < leaveReq.number_of_days) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Cannot approve: Employee now has insufficient remaining days (Requested: ${leaveReq.number_of_days}, Remaining: ${currentBalance.remaining_days}).`
                });
            }

            // Deduct balance
            const updatedUsed = currentBalance.used_days + leaveReq.number_of_days;
            const updatedRemaining = currentBalance.total_days - updatedUsed;

            await connection.query(
                'UPDATE leave_balances SET used_days = ?, remaining_days = ? WHERE id = ?',
                [updatedUsed, updatedRemaining, currentBalance.id]
            );
        }

        // Update leave request status to APPROVED
        await connection.query(
            `UPDATE leave_requests 
             SET status = 'APPROVED', 
                 approved_by = ?, 
                 approved_at = NOW(), 
                 manager_remarks = ?
             WHERE id = ?`,
            [req.user.id, manager_remarks || 'Approved', requestId]
        );

        await connection.commit();

        // Return updated request
        const [updatedRows] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name, lt.paid,
                   u.name AS employee_name, u.employee_id,
                   approver.name AS approver_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN users approver ON lr.approved_by = approver.id
            WHERE lr.id = ?
        `, [requestId]);

        res.json({
            success: true,
            message: 'Leave request approved successfully and leave balance updated.',
            data: updatedRows[0]
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving leave request: ' + error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Reject a pending leave request
// @route   POST /api/leave-requests/:id/reject
// @access  Private (Manager & Admin)
const rejectLeaveRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        const { rejection_reason, manager_remarks } = req.body;

        if (!rejection_reason || !rejection_reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A rejection reason is strictly required when rejecting a leave request.'
            });
        }

        const [rows] = await pool.query(`
            SELECT lr.*, u.manager_id, u.name AS employee_name 
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE lr.id = ?
        `, [requestId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const leaveReq = rows[0];

        if (leaveReq.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject request with status '${leaveReq.status}'. Only PENDING requests can be rejected.`
            });
        }

        // Authorization check
        if (req.user.role === 'MANAGER' && leaveReq.manager_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only reject leave requests of your assigned direct reports.'
            });
        }

        // Update to REJECTED - Do NOT deduct leave balance!
        await pool.query(
            `UPDATE leave_requests 
             SET status = 'REJECTED', 
                 rejection_reason = ?, 
                 manager_remarks = ?, 
                 approved_by = ?, 
                 approved_at = NOW() 
             WHERE id = ?`,
            [rejection_reason.trim(), manager_remarks ? manager_remarks.trim() : rejection_reason.trim(), req.user.id, requestId]
        );

        const [updatedRows] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name,
                   u.name AS employee_name, u.employee_id,
                   approver.name AS approver_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN users approver ON lr.approved_by = approver.id
            WHERE lr.id = ?
        `, [requestId]);

        res.json({
            success: true,
            message: 'Leave request rejected. No leave balance was deducted.',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave request: ' + error.message
        });
    }
};

// @desc    Cancel an eligible leave request (Employee can cancel their own PENDING request)
// @route   POST /api/leave-requests/:id/cancel
// @access  Private (Employee, Manager, Admin)
const cancelLeaveRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);

        const [rows] = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [requestId]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const leaveReq = rows[0];

        // Access check
        if (req.user.role === 'EMPLOYEE' && leaveReq.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only cancel your own leave requests.'
            });
        }

        // Only PENDING requests can be cancelled by employee
        if (leaveReq.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a request that is already ${leaveReq.status}. Only PENDING requests are eligible for cancellation.`
            });
        }

        await pool.query(
            "UPDATE leave_requests SET status = 'CANCELLED' WHERE id = ?",
            [requestId]
        );

        const [updated] = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [requestId]);

        res.json({
            success: true,
            message: 'Leave request cancelled successfully. No leave balance was affected.',
            data: updated[0]
        });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling leave request: ' + error.message
        });
    }
};

module.exports = {
    applyLeaveRequest,
    getLeaveRequests,
    getLeaveRequestById,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest
};

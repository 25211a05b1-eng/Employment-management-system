const { pool } = require('../config/db');

// @desc    Get Employee Dashboard Data
// @route   GET /api/dashboard/employee
// @access  Private (Employee, Manager, Admin)
const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentYear = new Date().getFullYear();

        // 1. Employee Info
        const [userRows] = await pool.query(`
            SELECT u.id, u.employee_id, u.name, u.email, u.role, u.joining_date,
                   d.name AS department_name, m.name AS manager_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN users m ON u.manager_id = m.id
            WHERE u.id = ?
        `, [userId]);

        const employee = userRows[0];

        // 2. Leave Balances for current year
        const [balances] = await pool.query(`
            SELECT lb.id, lb.leave_type_id, lb.total_days, lb.used_days, lb.remaining_days,
                   lt.name AS leave_type_name, lt.paid
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = ? AND lb.year = ?
            ORDER BY lt.id ASC
        `, [userId, currentYear]);

        // Aggregate counts
        let totalBalance = 0;
        let casualLeave = 0;
        let sickLeave = 0;
        let annualLeave = 0;
        let optionalLeave = 0;

        balances.forEach((b) => {
            totalBalance += b.remaining_days;
            const nameLower = b.leave_type_name.toLowerCase();
            if (nameLower.includes('casual')) casualLeave = b.remaining_days;
            else if (nameLower.includes('sick')) sickLeave = b.remaining_days;
            else if (nameLower.includes('annual') || nameLower.includes('earned')) annualLeave = b.remaining_days;
            else if (nameLower.includes('optional')) optionalLeave = b.remaining_days;
        });

        // 3. Leave Requests Counts
        const [requestStats] = await pool.query(`
            SELECT 
                COUNT(*) AS total_requests,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_requests,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_requests,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_requests,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_requests
            FROM leave_requests
            WHERE user_id = ?
        `, [userId]);

        // 4. Recent Requests (latest 5)
        const [recentRequests] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name 
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.user_id = ?
            ORDER BY lr.created_at DESC
            LIMIT 5
        `, [userId]);

        // 5. Chart.js formatted data for leave usage
        const chartData = {
            labels: balances.map(b => b.leave_type_name),
            datasets: [
                {
                    label: 'Remaining Days',
                    data: balances.map(b => b.remaining_days),
                    backgroundColor: '#198754'
                },
                {
                    label: 'Used Days',
                    data: balances.map(b => b.used_days),
                    backgroundColor: '#0d6efd'
                }
            ]
        };

        res.json({
            success: true,
            data: {
                employee,
                stats: {
                    totalBalance,
                    casualLeave,
                    sickLeave,
                    annualLeave,
                    optionalLeave,
                    pendingRequests: Number(requestStats[0].pending_requests) || 0,
                    approvedRequests: Number(requestStats[0].approved_requests) || 0,
                    rejectedRequests: Number(requestStats[0].rejected_requests) || 0,
                    cancelledRequests: Number(requestStats[0].cancelled_requests) || 0
                },
                balances,
                recentRequests,
                chartData
            }
        });
    } catch (error) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee dashboard: ' + error.message
        });
    }
};

// @desc    Get Manager Dashboard Data
// @route   GET /api/dashboard/manager
// @access  Private (Manager & Admin)
const getManagerDashboard = async (req, res) => {
    try {
        const managerId = req.user.id;

        // 1. Team Members Count
        const [teamCount] = await pool.query(
            "SELECT COUNT(*) AS total_team_members FROM users WHERE manager_id = ? AND status = 'ACTIVE'",
            [managerId]
        );

        // 2. Pending Requests from assigned team
        const [pendingRequests] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name, lt.paid,
                   u.name AS employee_name, u.employee_id, u.email AS employee_email,
                   d.name AS department_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.manager_id = ? AND lr.status = 'PENDING'
            ORDER BY lr.created_at ASC
        `, [managerId]);

        // 3. Team Leave Statistics
        const [teamStats] = await pool.query(`
            SELECT 
                COUNT(*) AS total_requests,
                SUM(CASE WHEN lr.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN lr.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
                SUM(CASE WHEN lr.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE u.manager_id = ?
        `, [managerId]);

        // 4. Employees currently on leave today
        const today = new Date().toISOString().split('T')[0];
        const [onLeaveToday] = await pool.query(`
            SELECT lr.id, lr.start_date, lr.end_date, lr.reason,
                   u.name AS employee_name, u.employee_id,
                   lt.name AS leave_type_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE u.manager_id = ? 
              AND lr.status = 'APPROVED' 
              AND ? BETWEEN lr.start_date AND lr.end_date
        `, [managerId, today]);

        // 5. Team Leave Distribution Chart Data
        const [typeDist] = await pool.query(`
            SELECT lt.name AS leave_type, COUNT(lr.id) AS count
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE u.manager_id = ?
            GROUP BY lt.id
        `, [managerId]);

        res.json({
            success: true,
            data: {
                teamMembersCount: teamCount[0].total_team_members,
                pendingCount: pendingRequests.length,
                approvedCount: Number(teamStats[0].approved_count) || 0,
                rejectedCount: Number(teamStats[0].rejected_count) || 0,
                onLeaveTodayCount: onLeaveToday.length,
                pendingRequests,
                onLeaveToday,
                chartData: {
                    labels: typeDist.map(t => t.leave_type),
                    datasets: [
                        {
                            label: 'Leave Requests by Type',
                            data: typeDist.map(t => t.count),
                            backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#fd7e14', '#6c757d']
                        }
                    ]
                }
            }
        });
    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching manager dashboard: ' + error.message
        });
    }
};

// @desc    Get Admin Dashboard Data & Chart.js Statistics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
    try {
        // 1. Overall counts
        const [empCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_users,
                SUM(CASE WHEN role = 'EMPLOYEE' THEN 1 ELSE 0 END) AS total_employees,
                SUM(CASE WHEN role = 'MANAGER' THEN 1 ELSE 0 END) AS total_managers,
                SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS total_admins,
                SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_employees,
                SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactive_employees
            FROM users
        `);

        const [deptCount] = await pool.query('SELECT COUNT(*) AS total_departments FROM departments');

        const [reqCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_requests,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_requests,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_requests,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_requests,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_requests
            FROM leave_requests
        `);

        // 2. Chart 1: Status Distribution (Approved vs Rejected vs Pending vs Cancelled)
        const statusChart = {
            labels: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
            datasets: [
                {
                    data: [
                        Number(reqCounts[0].approved_requests) || 0,
                        Number(reqCounts[0].pending_requests) || 0,
                        Number(reqCounts[0].rejected_requests) || 0,
                        Number(reqCounts[0].cancelled_requests) || 0
                    ],
                    backgroundColor: ['#198754', '#ffc107', '#dc3545', '#6c757d']
                }
            ]
        };

        // 3. Chart 2: Leave Requests by Leave Type
        const [byTypeRows] = await pool.query(`
            SELECT lt.name AS leave_type, COUNT(lr.id) AS count
            FROM leave_types lt
            LEFT JOIN leave_requests lr ON lt.id = lr.leave_type_id
            GROUP BY lt.id
            ORDER BY lt.id ASC
        `);

        const typeChart = {
            labels: byTypeRows.map(r => r.leave_type),
            datasets: [
                {
                    label: 'Leave Requests',
                    data: byTypeRows.map(r => r.count),
                    backgroundColor: ['#0d6efd', '#20c997', '#fd7e14', '#6f42c1', '#0dcaf0']
                }
            ]
        };

        // 4. Chart 3: Department-wise Leave Usage
        const [byDeptRows] = await pool.query(`
            SELECT d.name AS department_name, COUNT(lr.id) AS leave_count
            FROM departments d
            LEFT JOIN users u ON u.department_id = d.id
            LEFT JOIN leave_requests lr ON lr.user_id = u.id AND lr.status = 'APPROVED'
            GROUP BY d.id
            ORDER BY leave_count DESC
        `);

        const departmentChart = {
            labels: byDeptRows.map(r => r.department_name),
            datasets: [
                {
                    label: 'Approved Leaves',
                    data: byDeptRows.map(r => r.leave_count),
                    backgroundColor: '#0d6efd'
                }
            ]
        };

        // 5. Chart 4: Leave Requests by Month (Last 6 Months)
        const [byMonthRows] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') AS month_label,
                DATE_FORMAT(created_at, '%Y-%m') AS sort_month,
                COUNT(id) AS total_requests,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count
            FROM leave_requests
            GROUP BY sort_month, month_label
            ORDER BY sort_month ASC
            LIMIT 6
        `);

        const monthlyChart = {
            labels: byMonthRows.map(r => r.month_label),
            datasets: [
                {
                    label: 'Total Requests',
                    data: byMonthRows.map(r => r.total_requests),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: true
                },
                {
                    label: 'Approved Requests',
                    data: byMonthRows.map(r => r.approved_count),
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.2)',
                    fill: true
                }
            ]
        };

        // 6. Recent Requests (latest 6 across system)
        const [recentRequests] = await pool.query(`
            SELECT lr.*, lt.name AS leave_type_name,
                   u.name AS employee_name, u.employee_id, d.name AS department_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY lr.created_at DESC
            LIMIT 6
        `);

        res.json({
            success: true,
            data: {
                counts: {
                    totalEmployees: Number(empCounts[0].total_employees) || 0,
                    totalManagers: Number(empCounts[0].total_managers) || 0,
                    totalAdmins: Number(empCounts[0].total_admins) || 0,
                    activeEmployees: Number(empCounts[0].active_employees) || 0,
                    inactiveEmployees: Number(empCounts[0].inactive_employees) || 0,
                    totalDepartments: Number(deptCount[0].total_departments) || 0,
                    pendingRequests: Number(reqCounts[0].pending_requests) || 0,
                    approvedLeaves: Number(reqCounts[0].approved_requests) || 0,
                    rejectedLeaves: Number(reqCounts[0].rejected_requests) || 0,
                    cancelledLeaves: Number(reqCounts[0].cancelled_requests) || 0
                },
                charts: {
                    statusChart,
                    typeChart,
                    departmentChart,
                    monthlyChart
                },
                recentRequests
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin dashboard: ' + error.message
        });
    }
};

module.exports = {
    getEmployeeDashboard,
    getManagerDashboard,
    getAdminDashboard
};

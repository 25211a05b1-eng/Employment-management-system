const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token missing.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_employee_leave_management_jwt_key_2026');

        // Fetch latest user details from database (ensuring account is still active)
        const [rows] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email, u.role, u.department_id, u.manager_id, u.status, d.name AS department_name 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. User not found.'
            });
        }

        const user = rows[0];

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact your administrator.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token authentication failed.'
        });
    }
};

module.exports = {
    verifyToken
};

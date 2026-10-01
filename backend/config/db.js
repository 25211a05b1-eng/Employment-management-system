const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_leave_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true // Return date strings (YYYY-MM-DD) instead of JS Date objects
});

// Test MySQL Database Connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database:', process.env.DB_NAME || 'employee_leave_management');
        connection.release();
        return true;
    } catch (error) {
        console.error('MySQL database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};

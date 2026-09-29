const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');
const leaveBalanceRoutes = require('./routes/leaveBalanceRoutes');
const leaveRequestRoutes = require('./routes/leaveRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware Imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
    origin: '*', // For academic & local testing flexibility
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root / Health Check API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Employee Leave Management System REST API is running successfully',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server and Test DB
const startServer = async () => {
    try {
        const isDbConnected = await testConnection();
        if (!isDbConnected) {
            console.warn('Warning: Server started but database connection failed. Check MySQL service.');
        }

        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(` Employee Leave Management System Backend API`);
            console.log(` Server running on http://localhost:${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`====================================================`);
        });
    } catch (error) {
        console.error('Fatal error starting server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;

// Global Error Handling Middleware

const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Resource not found: ${req.method} ${req.originalUrl}`
    });
};

const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Application Error:', err);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = {
    notFound,
    errorHandler
};

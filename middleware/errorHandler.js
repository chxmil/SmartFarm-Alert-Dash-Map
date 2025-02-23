const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);

    // Set status code (default: 500 Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;

const ApiError = require('../shared/ApiError');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: {
                status: 400,
                message: 'Validation error',
                code: 'VALIDATION_ERROR',
                details: err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }

    // Prisma known errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: {
                status: 409,
                message: `Unique constraint violation on: ${err.meta?.target?.join(', ')}`,
                code: 'DUPLICATE_ENTRY',
            },
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: { status: 404, message: 'Record not found', code: 'NOT_FOUND' },
        });
    }

    // Custom ApiError
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: {
                status: err.status,
                message: err.message,
                code: err.code,
            },
        });
    }

    // Unexpected errors
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: {
            status: 500,
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
            code: 'INTERNAL_ERROR',
        },
    });
}

module.exports = errorHandler;

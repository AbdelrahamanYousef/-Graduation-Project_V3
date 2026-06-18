/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(status, message, code = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }

    static badRequest(message = 'Bad request') {
        return new ApiError(400, message, 'BAD_REQUEST');
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message, 'UNAUTHORIZED');
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message, 'FORBIDDEN');
    }

    static notFound(message = 'Not found') {
        return new ApiError(404, message, 'NOT_FOUND');
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message, 'CONFLICT');
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message, 'INTERNAL_ERROR');
    }
}

module.exports = ApiError;

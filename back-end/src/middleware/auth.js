const { verifyToken } = require('../lib/jwt');
const ApiError = require('../shared/ApiError');
const prisma = require('../lib/prisma');

/**
 * Authenticate any user (USER or ADMIN) via JWT
 * Sets req.user with { id, name, email, role, status }
 */
async function authUser(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) throw ApiError.unauthorized('No token provided');

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, phone: true, role: true, status: true },
        });

        if (!user || user.deletedAt || user.status !== 'ACTIVE') {
            throw ApiError.unauthorized('User not found or inactive');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Invalid or expired token'));
        }
        next(err);
    }
}

/**
 * Authenticate ADMIN-only users via JWT
 * Rejects users with role !== ADMIN
 */
async function authAdmin(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) throw ApiError.unauthorized('No token provided');

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, phone: true, role: true, status: true },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw ApiError.unauthorized('User not found or inactive');
        }

        if (user.role !== 'ADMIN') {
            throw ApiError.forbidden('Admin access required');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Invalid or expired token'));
        }
        next(err);
    }
}

/**
 * Optional auth — attaches user if token present, but doesn't reject unauthenticated
 */
async function optionalAuth(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) return next();

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, phone: true, role: true, status: true },
        });

        if (user && user.status === 'ACTIVE') {
            req.user = user;
        }

        next();
    } catch {
        next(); // silently continue if token is invalid
    }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
        return auth.slice(7);
    }
    return null;
}

module.exports = { authUser, authAdmin, optionalAuth };

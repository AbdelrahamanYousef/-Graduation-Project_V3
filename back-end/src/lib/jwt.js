const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate access token
 */
function generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * Generate refresh token
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

/**
 * Verify access token
 */
function verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };

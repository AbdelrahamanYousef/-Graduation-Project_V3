const service = require('./auth.service');
const { verifyToken } = require('../../lib/jwt');

async function adminLogin(req, res, next) {
    try {
        const result = await service.adminLogin(req.body.email, req.body.password);
        res.json(result);
    } catch (e) { next(e); }
}

async function register(req, res, next) {
    try {
        const result = await service.register(req.body.email, req.body.password, req.body.name);
        res.status(201).json(result);
    } catch (e) { next(e); }
}

async function verifyEmail(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authentication required' });
        const decoded = verifyToken(token);
        const result = await service.verifyEmail(decoded.id, req.body.otp);
        res.json(result);
    } catch (e) { next(e); }
}

async function resendVerification(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authentication required' });
        const decoded = verifyToken(token);
        const result = await service.resendVerification(decoded.id);
        res.json(result);
    } catch (e) { next(e); }
}

async function login(req, res, next) {
    try {
        const result = await service.login(req.body.email, req.body.password);
        res.json(result);
    } catch (e) { next(e); }
}

async function forgotPassword(req, res, next) {
    try {
        const result = await service.forgotPassword(req.body.email);
        res.json(result);
    } catch (e) { next(e); }
}

async function resetPassword(req, res, next) {
    try {
        const result = await service.resetPassword(req.body.token, req.body.newPassword);
        res.json(result);
    } catch (e) { next(e); }
}

async function me(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.json({ user: null });
        try {
            const decoded = verifyToken(token);
            const user = await service.getCurrentUser(decoded.id);
            res.json(user);
        } catch(e) {
            return res.json({ user: null });
        }
    } catch (e) { next(e); }
}

async function refresh(req, res, next) {
    try { res.json(await service.refreshTokens(req.body.refreshToken)); } catch (e) { next(e); }
}

async function logout(req, res, next) {
    try {
        const result = await service.logout(req.body.refreshToken);
        res.json(result);
    } catch (e) { next(e); }
}

module.exports = {
    adminLogin, register, verifyEmail, resendVerification, login,
    forgotPassword, resetPassword,
    me, refresh, logout,
};

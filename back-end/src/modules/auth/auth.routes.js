const { Router } = require('express');
const controller = require('./auth.controller');
const { authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased to 1000 in dev
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased to 1000 in dev
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
});

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const router = Router();

// ── Admin login ──────────────────────────────────
router.post('/admin/login', loginLimiter, validate({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
}), controller.adminLogin);

// ── Email + Password registration ────────────────
router.post('/register', authLimiter, validate({
    body: z.object({
        email: z.string().email(),
        password: passwordSchema,
        name: z.string().min(2),
    }),
}), controller.register);

// ── Email + Password login (donors & admins) ─────
router.post('/login', loginLimiter, validate({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
}), controller.login);

// ── Email verification ───────────────────────────
router.post('/verify-email', authLimiter, controller.verifyEmail);

router.post('/resend-verification', authLimiter, controller.resendVerification);

// ── Password Reset Flow ──────────────────────────
router.post('/forgot-password', authLimiter, validate({
    body: z.object({ email: z.string().email() })
}), controller.forgotPassword);

router.post('/reset-password', authLimiter, validate({
    body: z.object({
        token: z.string().min(10),
        newPassword: passwordSchema
    })
}), controller.resetPassword);

// ── Common ───────────────────────────────────────
router.get('/me', controller.me);

router.post('/refresh', validate({
    body: z.object({ refreshToken: z.string().min(1) }),
}), controller.refresh);

router.post('/logout', controller.logout);

module.exports = router;

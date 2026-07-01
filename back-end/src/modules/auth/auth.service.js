const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../lib/prisma');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../lib/jwt');
const config = require('../../config');
const ApiError = require('../../shared/ApiError');
const { generateOtp, sendVerificationEmail, sendPasswordResetEmail } = require('../../lib/email');

/**
 * Register a new user with email + password
 * Creates the account, sends OTP to email, returns token + user (unverified)
 */
async function register(email, password, name) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw ApiError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await prisma.user.create({
        data: {
            email,
            name,
            passwordHash,
            role: 'USER',
            emailVerified: false,
            verificationOtp: otp,
            verificationOtpExpiry: otpExpiry,
        },
    });

    // Send OTP email
    await sendVerificationEmail(email, otp);

    const payload = { id: user.id, role: user.role };
    const token = generateToken(payload);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: false,
            loggedInAt: new Date().toISOString(),
        },
        message: 'Verification OTP sent to your email',
    };
}

/**
 * Verify email with OTP code
 */
async function verifyEmail(userId, otp) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    if (user.emailVerified) {
        return {
            user: buildUserResponse(user),
            message: 'Email already verified',
        };
    }

    if (!user.verificationOtp || !user.verificationOtpExpiry) {
        throw ApiError.badRequest('No verification pending. Please request a new code.');
    }

    if (new Date() > user.verificationOtpExpiry) {
        throw ApiError.badRequest('Verification code expired. Please request a new code.');
    }

    if (user.verificationOtp !== otp) {
        throw ApiError.badRequest('Invalid verification code');
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            emailVerified: true,
            verificationOtp: null,
            verificationOtpExpiry: null,
        },
    });

    return {
        user: buildUserResponse(updated),
        message: 'Email verified successfully',
    };
}

/**
 * Resend verification OTP
 */
async function resendVerification(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    if (user.emailVerified) {
        throw ApiError.badRequest('Email already verified');
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationOtp: otp,
            verificationOtpExpiry: otpExpiry,
        },
    });

    await sendVerificationEmail(user.email, otp);

    return { message: 'New verification code sent' };
}

/**
 * Login with email + password (for both donors and admins)
 */
async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is inactive');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Block login if email is not verified
    if (!user.emailVerified) {
        throw ApiError.forbidden('Please verify your email before logging in. Check your inbox for the verification code.');
    }

    const payload = { id: user.id, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user.id, refreshToken);

    return {
        token,
        refreshToken,
        user: buildUserResponse(user),
    };
}

/**
 * Admin login with email + password (role-restricted)
 */
async function adminLogin(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
        throw ApiError.unauthorized('Invalid email or password');
    }
    if (user.role !== 'ADMIN') {
        throw ApiError.unauthorized('Admin access required');
    }
    if (user.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is inactive');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const payload = { id: user.id, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user.id, refreshToken);

    return {
        token,
        refreshToken,
        user: {
            email: user.email,
            name: user.name,
            nameEn: '',
            role: user.role,
            roleEn: 'Admin',
            loggedInAt: new Date().toISOString(),
        },
    };
}

/**
 * Forgot password
 */
async function forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
        // Prevent enumeration by returning success regardless
        return { message: 'If an account with that email exists, a password reset email has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetTokenHash,
            resetPasswordTokenExpiry: resetTokenExpiry,
        },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account with that email exists, a password reset email has been sent.' };
}

/**
 * Reset password
 */
async function resetPassword(token, newPassword) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: resetTokenHash,
            resetPasswordTokenExpiry: { gt: new Date() },
        },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordTokenExpiry: null,
        },
    });

    return { message: 'Password has been successfully reset' };
}

/**
 * Get current user from token
 */
async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { user: null };

    return { user: buildUserResponse(user) };
}

/**
 * Refresh token securely
 */
async function refreshTokens(refreshToken) {
    // Check if token exists in DB
    const dbToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });

    if (!dbToken) {
        throw ApiError.unauthorized('Invalid refresh token');
    }

    if (dbToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        throw ApiError.unauthorized('Refresh token expired');
    }

    const user = dbToken.user;
    if (user.deletedAt || user.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is inactive or deleted');
    }

    // Verify JWT signature
    try {
        verifyRefreshToken(refreshToken);
    } catch (error) {
        throw ApiError.unauthorized('Invalid refresh token signature');
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    // Issue new tokens
    const payload = { id: user.id, role: user.role };
    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user.id, newRefreshToken);

    return {
        token: newToken,
        refreshToken: newRefreshToken,
    };
}

/**
 * Logout
 */
async function logout(refreshToken) {
    if (refreshToken) {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    return { success: true, message: 'Logged out successfully' };
}

/**
 * Save refresh token to DB helper
 */
async function saveRefreshToken(userId, token) {
    // Expire in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    });
}

/**
 * Build a consistent user response object
 */
function buildUserResponse(user) {
    const isPlaceholder = user.email?.includes('@placeholder.local');

    if (user.role === 'ADMIN') {
        return {
            email: user.email,
            name: user.name,
            nameEn: '',
            role: user.role,
            roleEn: 'Admin',
            emailVerified: user.emailVerified,
            photo: user.avatarUrl,
            emailNotifications: user.emailNotifications,
            loggedInAt: new Date().toISOString(),
        };
    }

    return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        nameEn: '',
        email: isPlaceholder ? null : user.email,
        emailVerified: user.emailVerified,
        photo: user.avatarUrl,
        emailNotifications: user.emailNotifications,
        joinDate: user.createdAt.toISOString().split('T')[0],
        totalDonations: 0,
        donationCount: 0,
        loggedInAt: new Date().toISOString(),
    };
}

module.exports = {
    register, verifyEmail, resendVerification, login,
    adminLogin, getCurrentUser, refreshTokens,
    forgotPassword, resetPassword, logout
};

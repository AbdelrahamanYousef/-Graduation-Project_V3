require('dotenv').config();

const jwt = {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

if (jwt.secret === 'dev-secret' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  WARNING: Using default JWT secrets in production! Set JWT_SECRET and JWT_REFRESH_SECRET in .env');
}

module.exports = {
    port: parseInt(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt,
    demoOtp: process.env.DEMO_OTP || '1234',
    upload: {
        dir: process.env.UPLOAD_DIR || 'uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
    emailFrom: process.env.EMAIL_FROM || 'Nour Charity <noreply@nour-charity.org>',
};

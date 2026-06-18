const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Generate a 6-digit OTP code
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create nodemailer transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });
}

/**
 * Build the HTML email body for OTP verification
 */
function buildOtpHtml(otp) {
    return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #00b16a 0%, #064e3b 100%); padding: 32px; text-align: center;">
                                    <h1 style="color: white; font-size: 32px; margin: 0 0 4px 0; font-weight: bold;">نور</h1>
                                    <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">جمعية نور الخيرية</p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px 32px; text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 16px;">✉️</div>
                                    <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 12px 0;">كود التحقق</h2>
                                    <p style="color: #666; font-size: 15px; margin: 0 0 28px 0; line-height: 1.6;">
                                        استخدم هذا الكود لتأكيد بريدك الإلكتروني لإنشاء حسابك في نور.
                                    </p>

                                    <!-- OTP Code Box -->
                                    <div style="background: #f0fdf4; border: 2px dashed #00b16a; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 20px;">
                                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #00b16a; font-family: 'Courier New', monospace;">
                                            ${otp}
                                        </span>
                                    </div>

                                    <p style="color: #999; font-size: 13px; margin: 0;">صالح لمدة <strong>15 دقيقة</strong></p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 32px; background: #f8fafb; border-top: 1px solid #eee; text-align: center;">
                                    <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.6;">
                                        إذا لم تطلب هذا الكود، تجاهل هذه الرسالة بأمان.<br>
                                        هذا البريد الإلكتروني أرسل تلقائياً من جمعية نور الخيرية.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

/**
 * Send verification OTP via email using Gmail SMTP
 */
async function sendVerificationEmail(email, otp) {
    const subject = 'نور - كود التحقق من البريد الإلكتروني';
    const html = buildOtpHtml(otp);

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject,
            html,
        });
        console.log(`✅ Verification email sent to ${email}`);
        return { success: true, method: 'email' };
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        // Fallback: log OTP to console so dev workflow isn't broken
        console.log(`📧 Fallback OTP for ${email}: ${otp}`);
        return { success: false, method: 'console', error: error.message };
    }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetToken) {
    const subject = 'نور - إعادة تعيين كلمة المرور';
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>إعادة تعيين كلمة المرور</h2>
            <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام الرمز التالي:</p>
            <div style="background: #f0fdf4; border: 2px dashed #00b16a; border-radius: 12px; padding: 20px; display: inline-block; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #00b16a;">${resetToken}</span>
            </div>
            <p>هذا الرمز صالح لمدة ساعة واحدة.</p>
            <p>إذا لم تطلب ذلك، يرجى تجاهل هذه الرسالة.</p>
        </body>
        </html>
    `;

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject,
            html,
        });
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send reset email to ${email}:`, error.message);
        console.log(`📧 Fallback Reset Token for ${email}: ${resetToken}`);
        return { success: false, error: error.message };
    }
}

module.exports = { generateOtp, sendVerificationEmail, sendPasswordResetEmail };

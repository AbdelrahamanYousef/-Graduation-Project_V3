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
 * Send donation verification OTP via email
 */
async function sendDonationOtpEmail(email, otp, amount) {
    const subject = 'نور - تأكيد عملية التبرع';
    const html = `
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
                            <tr>
                                <td style="background: linear-gradient(135deg, #00b16a 0%, #064e3b 100%); padding: 32px; text-align: center;">
                                    <h1 style="color: white; font-size: 32px; margin: 0 0 4px 0; font-weight: bold;">نور</h1>
                                    <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">جمعية نور الخيرية</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 32px; text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                                    <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 12px 0;">تأكيد التبرع بقيمة ${amount} ج.م</h2>
                                    <p style="color: #666; font-size: 15px; margin: 0 0 28px 0; line-height: 1.6;">
                                        استخدم الكود التالي لتأكيد وإتمام عملية التبرع الخاصة بك.
                                    </p>
                                    <div style="background: #f0fdf4; border: 2px dashed #00b16a; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 20px;">
                                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #00b16a; font-family: 'Courier New', monospace;">
                                            ${otp}
                                        </span>
                                    </div>
                                    <p style="color: #999; font-size: 13px; margin: 0;">صالح لمدة <strong>5 دقائق</strong></p>
                                </td>
                            </tr>
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

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject,
            html,
        });
        console.log(`✅ Donation OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send donation email to ${email}:`, error.message);
        console.log(`📧 Fallback Donation OTP for ${email}: ${otp}`);
        return { success: false, error: error.message };
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

/**
 * Send volunteer approval email
 */
async function sendVolunteerApprovalEmail(email, name) {
    const subject = 'نور - قبول طلب التطوع';
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
            <h2 style="color: #00b16a;">تهانينا، تم قبول طلب التطوع الخاص بك!</h2>
            <p>عزيزنا المتطوع <strong>${name}</strong>،</p>
            <p>يسعدنا إبلاغك بقبول طلبك للانضمام إلى فريق متطوعي جمعية نور الخيرية.</p>
            <p>سيقوم مسؤول التوظيف والتطوع بالتواصل معك قريباً لتنسيق الخطوات التالية ومواعيد المقابلات الشخصية أو التعيين.</p>
            <br>
            <p>مع تحيات،</p>
            <p><strong>فريق جمعية نور الخيرية</strong></p>
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
        console.log(`✅ Volunteer approval email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send volunteer approval email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send contact reply email
 */
async function sendContactReplyEmail(email, name, originalSubject, replyText) {
    const subject = `نور - رد على رسالتك: ${originalSubject}`;
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right;">
            <h2 style="color: #00b16a; border-bottom: 2px solid #00b16a; padding-bottom: 10px;">رد على رسالة التواصل الخاصة بك</h2>
            <p>مرحباً <strong>${name}</strong>،</p>
            <p>نشكرك على تواصلك مع جمعية نور الخيرية بخصوص الموضوع: <strong>"${originalSubject}"</strong>.</p>
            <p>فيما يلي الرد من إدارة الجمعية:</p>
            <div style="background-color: #f9f9f9; border-right: 4px solid #00b16a; padding: 15px; margin: 20px 0; white-space: pre-wrap; font-size: 15px; color: #333;">
                ${replyText}
            </div>
            <br>
            <p>مع تحيات،</p>
            <p><strong>إدارة جمعية نور الخيرية</strong></p>
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
        console.log(`✅ Contact reply email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send contact reply email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send volunteer rejection email
 */
async function sendVolunteerRejectionEmail(email, name, reason) {
    const subject = 'نور - اعتذار عن طلب التطوع';
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
            <h2 style="color: #ef4444;">نأسف، لم يتم قبول طلب التطوع</h2>
            <p>عزيزنا المتقدم <strong>${name}</strong>،</p>
            <p>نشكرك على اهتمامك بالانضمام إلى فريق متطوعي جمعية نور الخيرية.</p>
            <p>نأسف لإبلاغك أنه بعد مراجعة طلبك، لم يتسنى لنا قبوله في الوقت الحالي.</p>
            <p><strong>سبب الرفض:</strong> ${reason}</p>
            <p>نتمنى لك التوفيق، وندعوك للتقديم مرة أخرى في المستقبل.</p>
            <br>
            <p>مع تحيات،</p>
            <p><strong>فريق جمعية نور الخيرية</strong></p>
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
        console.log(`✅ Volunteer rejection email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send volunteer rejection email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send volunteer info request email
 */
async function sendVolunteerInfoRequestEmail(email, name, message) {
    const subject = 'نور - طلب معلومات إضافية لطلب التطوع';
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
            <h2 style="color: #f59e0b;">طلب معلومات إضافية</h2>
            <p>عزيزنا المتقدم <strong>${name}</strong>،</p>
            <p>نشكرك على تقديم طلب التطوع في جمعية نور الخيرية.</p>
            <p>نود إبلاغك أننا بحاجة لبعض المعلومات الإضافية لاستكمال مراجعة طلبك:</p>
            <div style="background-color: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 14px; color: #333; text-align: right;">
                ${message}
            </div>
            <p>يرجى تحديث بياناتك في أقرب وقت ممكن.</p>
            <br>
            <p>مع تحيات،</p>
            <p><strong>فريق جمعية نور الخيرية</strong></p>
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
        console.log(`✅ Volunteer info request email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send volunteer info request email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { generateOtp, sendVerificationEmail, sendDonationOtpEmail, sendPasswordResetEmail, sendVolunteerApprovalEmail, sendContactReplyEmail, sendVolunteerRejectionEmail, sendVolunteerInfoRequestEmail };

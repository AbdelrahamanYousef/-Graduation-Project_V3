import axios from 'axios';

/**
 * Axios instance pre-configured for the Nour Charity API
 *
 * - Base URL: http://localhost:5000/api
 * - JWT token injection via request interceptor
 * - Global error handling via response interceptor
 */
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        // Attempt to read the JWT from localStorage
        const adminToken = localStorage.getItem('nour-admin-token');
        const donorToken = localStorage.getItem('nour-donor-token');
        const token = adminToken || donorToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// Translation mapping for common backend error messages to Arabic
const errorTranslations = {
    // Password strength validation errors
    'Password must be at least 8 characters long': 'يجب أن تكون كلمة المرور مكونة من 8 أحرف على الأقل',
    'Password must contain at least one uppercase letter': 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z)',
    'Password must contain at least one lowercase letter': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل (a-z)',
    'Password must contain at least one number': 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9)',
    'Password must contain at least one special character': 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (مثل @، #، $)',
    
    // Reset password errors
    'Invalid or expired password reset token': 'رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية',
    'No verification pending. Please request a new code.': 'لا يوجد كود تحقق قيد الانتظار. يرجى طلب كود جديد.',
    'Verification code expired. Please request a new code.': 'انتهت صلاحية كود التحقق. يرجى طلب كود جديد.',
    'Invalid verification code': 'كود التحقق غير صحيح',
    'Email already verified': 'البريد الإلكتروني تم التحقق منه بالفعل',
    'Email already registered': 'البريد الإلكتروني مسجل بالفعل',
    'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Account is inactive': 'الحساب غير نشط',
    'Admin access required': 'مطلوب صلاحية مسؤول لتسجيل الدخول',
    'Please verify your email before logging in. Check your inbox for the verification code.': 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني للحصول على كود التحقق.',
    
    // General / Rate limiting
    'Too many requests from this IP, please try again after 15 minutes': 'لقد قمت بمحاولات كثيرة جداً، يرجى المحاولة مرة أخرى بعد 15 دقيقة',
    'Too many login attempts, please try again after 15 minutes': 'محاولات دخول كثيرة جداً، يرجى المحاولة مرة أخرى بعد 15 دقيقة',
};

function translateError(msg) {
    if (!msg) return msg;
    // Check direct match
    if (errorTranslations[msg]) {
        return errorTranslations[msg];
    }
    // Check partial match for rate limit or similar messages
    for (const [english, arabic] of Object.entries(errorTranslations)) {
        if (msg.toLowerCase().includes(english.toLowerCase())) {
            return arabic;
        }
    }
    return msg;
}

// ─── Response Interceptor ───────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Normalize error shape for consistent handling
        const status = error.response?.status;
        
        let message = 'حدث خطأ غير متوقع';

        // Extract server-side errors
        const responseData = error.response?.data;
        if (responseData?.error) {
            const serverError = responseData.error;
            if (serverError.details && Array.isArray(serverError.details)) {
                // If there are multiple validation details
                message = serverError.details
                    .map((d) => translateError(d.message))
                    .join(' \n ');
            } else {
                message = translateError(serverError.message) || message;
            }
        } else if (responseData?.message) {
            message = translateError(responseData.message);
        } else if (error.message) {
            message = translateError(error.message);
        }

        // 401 — clear tokens and optionally redirect
        if (status === 401) {
            localStorage.removeItem('nour-admin-token');
            localStorage.removeItem('nour-donor-token');
            // Don't hard-redirect here; let the auth context/guard handle it
        }

        // Return a normalized rejection so consumers can do:
        //   catch(err) { err.status, err.message }
        return Promise.reject({ status, message, original: error });
    },
);

export default apiClient;

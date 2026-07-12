import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import { useInjectStyles } from '../../utils/injectStyles';

const adminLoginStyles = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes bounceIn { 0% { transform: scale(0); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
`;

function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    useInjectStyles(adminLoginStyles, 'admin-login-styles');
    const { login, isAdmin } = useAuth();

    const [step, setStep] = useState('form');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAdmin) {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            const from = location.state?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await forgotPassword(forgotEmail);
            setSuccessMsg(res.message);
            setTimeout(() => {
                setStep('reset');
                setSuccessMsg('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'فشل في طلب إعادة تعيين كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword !== confirmNewPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(resetToken, newPassword);
            setSuccessMsg(res.message);
            setTimeout(() => {
                setStep('form');
                setSuccessMsg('');
                setResetToken('');
                setNewPassword('');
                setConfirmNewPassword('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'فشل في إعادة تعيين كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    const inputBaseClass = "w-full px-10 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm";

    return (
        <div>
            <div className="flex flex-col md:flex-row min-h-screen w-full">
                {/* Mobile branding */}
                <div className="w-full flex md:hidden items-center justify-center py-4 px-2 gap-1.5 flex-col bg-primary-500 text-white">
                    <span className="text-4xl"><i className="fa-solid fa-moon" /></span>
                    <h4 className="text-2xl font-extrabold">نور</h4>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white font-bold">لوحة التحكم</span>
                </div>

                {/* Desktop branding panel */}
                <div className="hidden md:flex w-1/2 relative overflow-hidden">
                    <div className="relative flex flex-col justify-center w-full h-full min-h-full overflow-hidden p-8 bg-primary-500 text-white">
                        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 rounded-full bg-white/10 blur-[80px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-3/5 h-3/5 rounded-full bg-white/5 blur-[100px]" />
                        <div className="relative z-10 p-2 lg:p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-12 h-12 rounded-full bg-white text-primary-500 flex items-center justify-center text-2xl">
                                    <i className="fa-solid fa-moon"></i>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold">نور</h3>
                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white font-bold">لوحة التحكم</span>
                                </div>
                            </div>
                            <h5 className="text-xl mb-6 opacity-90 leading-relaxed">
                                مرحباً بك في لوحة إدارة نظام نور الخيري
                            </h5>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: 'fa-solid fa-chart-pie', text: 'لوحة تحكم شاملة' },
                                    { icon: 'fa-solid fa-folder-open', text: 'إدارة المشاريع والبرامج' },
                                    { icon: 'fa-solid fa-coins', text: 'تتبع التبرعات والمالية' },
                                    { icon: 'fa-solid fa-arrow-trend-up', text: 'تقارير وإحصائيات' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded flex items-center justify-center bg-white/10">
                                            <i className={item.icon}></i>
                                        </div>
                                        <h6 className="text-lg" style={{ fontSize: '1.1rem' }}>{item.text}</h6>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form panel */}
                <div className="w-full md:w-1/2 flex-grow flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 min-h-screen">
                    <div className="w-full max-w-[450px] mx-auto p-2.5 sm:p-3 md:p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-card">
                        {/* Sign in form */}
                        {step === 'form' && (
                            <div style={{ animation: 'slideIn 0.4s ease' }}>
                                <div className="flex flex-col gap-1 mb-4">
                                    <div className="w-12 h-12 rounded flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)', color: 'var(--color-primary-500)' }}>
                                        <i className="fa-solid fa-lock"></i>
                                    </div>
                                    <h4 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">تسجيل دخول المسؤول</h4>
                                    <p className="text-base text-neutral-500 dark:text-neutral-400">
                                        أدخل بيانات حسابك للوصول إلى لوحة التحكم
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-3">
                                        {error && (
                                            <div className="p-3 rounded-lg text-sm bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 border border-error-100 dark:border-error-500/20">
                                                {error}
                                            </div>
                                        )}

                                        <div className="relative">
                                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@nour.org"
                                                autoFocus
                                                autoComplete="email"
                                                className={inputBaseClass}
                                                dir="auto"
                                            />
                                        </div>

                                        <div className="relative">
                                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                className={inputBaseClass}
                                                dir="auto"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-neutral-400"
                                                aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                                            >
                                                {showPassword ? (
                                                    <i className="fa-solid fa-eye-slash" style={{ fontSize: 16 }}></i>
                                                ) : (
                                                    <i className="fa-solid fa-eye" style={{ fontSize: 16 }}></i>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex justify-start mt-[-4px]">
                                            <button
                                                type="button"
                                                onClick={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }}
                                                className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors bg-transparent border-none p-0"
                                            >
                                                هل نسيت كلمة المرور؟
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !email || !password}
                                            className="w-full py-3.5 text-base font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : 'تسجيل الدخول'}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-4 text-center">
                                    <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary-500 transition-colors">
                                        <i className="fa-solid fa-arrow-right"></i>
                                        العودة للموقع
                                    </Link>
                                </div>

                                <div className="mt-4 p-4 rounded-lg flex gap-1.5 bg-info-50 dark:bg-info-500/10 text-neutral-900 dark:text-neutral-100 border border-info-100 dark:border-info-500/20">
                                    <span className="text-info-500 mt-0.5"><i className="fa-solid fa-lightbulb"></i></span>
                                    <p className="text-sm">
                                        للتجربة: <strong>admin@nour.org</strong> / <strong>admin123</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Forgot password step */}
                        {step === 'forgot' && (
                            <div style={{ animation: 'slideIn 0.4s ease' }}>
                                <div className="text-center mb-4">
                                    <div className="text-5xl text-primary-500 mb-2" style={{ animation: 'bounceIn 0.5s ease' }}>
                                        <i className="fa-solid fa-key" />
                                    </div>
                                    <h5 className="text-xl font-bold mb-1 text-neutral-900 dark:text-neutral-100">
                                        استعادة كلمة المرور
                                    </h5>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                        أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور
                                    </p>
                                </div>

                                {error && <div className="p-3 rounded-lg text-sm mb-2 bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 border border-error-100 dark:border-error-500/20">{error}</div>}
                                {successMsg && <div className="p-3 rounded-lg text-sm mb-2 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 border border-success-100 dark:border-success-500/20">{successMsg}</div>}

                                <form onSubmit={handleForgotPassword}>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative">
                                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="admin@nour.org"
                                                autoFocus
                                                required
                                                className={inputBaseClass}
                                                dir="auto"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !forgotEmail}
                                            className="w-full py-3.5 text-base font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : 'إرسال الرمز'}
                                        </button>
                                    </div>
                                </form>

                                <button
                                    onClick={() => { setStep('form'); setError(''); setSuccessMsg(''); }}
                                    className="w-full mt-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors bg-transparent border-none p-0"
                                >
                                    العودة لتسجيل الدخول
                                </button>
                            </div>
                        )}

                        {/* Reset password step */}
                        {step === 'reset' && (
                            <div style={{ animation: 'slideIn 0.4s ease' }}>
                                <div className="text-center mb-4">
                                    <div className="text-5xl text-primary-500 mb-2" style={{ animation: 'bounceIn 0.5s ease' }}>
                                        <i className="fa-solid fa-lock-open" />
                                    </div>
                                    <h5 className="text-xl font-bold mb-1 text-neutral-900 dark:text-neutral-100">
                                        كلمة مرور جديدة
                                    </h5>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                        أدخل الرمز المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة
                                    </p>
                                </div>

                                {error && <div className="p-3 rounded-lg text-sm mb-2 bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 border border-error-100 dark:border-error-500/20">{error}</div>}
                                {successMsg && <div className="p-3 rounded-lg text-sm mb-2 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 border border-success-100 dark:border-success-500/20">{successMsg}</div>}

                                <form onSubmit={handleResetPassword}>
                                    <div className="flex flex-col gap-2.5">
                                        <div className="relative">
                                            <i className="fa-solid fa-hashtag absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                value={resetToken}
                                                onChange={(e) => setResetToken(e.target.value)}
                                                placeholder="الرمز المكون من الأحرف والأرقام"
                                                required
                                                className={inputBaseClass}
                                                dir="auto"
                                            />
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="٨ أحرف على الأقل، حرف كبير، رقم، ورمز"
                                                required
                                                className={inputBaseClass}
                                                dir="auto"
                                            />
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm pointer-events-none" />
                                            <input
                                                type="password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                                className={`${inputBaseClass} ${confirmNewPassword.length > 0 && newPassword !== confirmNewPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
                                                dir="auto"
                                            />
                                            {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                                                <p className="text-xs text-error-500 mt-1">كلمتا المرور غير متطابقتين</p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !resetToken || !newPassword || !confirmNewPassword}
                                            className="w-full py-3.5 text-base font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : 'حفظ كلمة المرور'}
                                        </button>
                                    </div>
                                </form>

                                <button
                                    onClick={() => { setStep('form'); setError(''); setSuccessMsg(''); }}
                                    className="w-full mt-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors bg-transparent border-none p-0"
                                >
                                    إلغاء
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;

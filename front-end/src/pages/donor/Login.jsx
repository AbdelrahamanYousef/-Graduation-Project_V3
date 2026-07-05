import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useInjectStyles } from '../../utils/injectStyles';
import LoginBrandingMobile from './LoginBrandingMobile';
import LoginBrandingPanel from './LoginBrandingPanel';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import OtpVerificationForm from './OtpVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

const loginStyles = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark: _, toggleTheme } = useTheme();
    const { isDonorLoggedIn, donorLogin, registerDonor, verifyDonorEmail, resendDonorVerification } = useAuth();
    useInjectStyles(loginStyles, 'login-styles');

    const [tab, setTab] = useState(0);
    const [step, setStep] = useState('form');

    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);

    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [otpSentTo, setOtpSentTo] = useState('');

    useEffect(() => {
        if (isDonorLoggedIn) {
            const from = location.state?.from || '/account';
            navigate(from, { replace: true });
        }
    }, [isDonorLoggedIn, navigate, location]);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        const result = await donorLogin(signInEmail, signInPassword);
        setLoading(false);
        if (result.success) {
            const from = location.state?.from || '/account';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (signUpPassword !== signUpConfirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (signUpPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await registerDonor({
            email: signUpEmail,
            password: signUpPassword,
            name: signUpName,
        });
        setLoading(false);

        if (result.success) {
            setOtpSentTo(signUpEmail);
            setStep('verify');
            setOtp(['', '', '', '', '', '']);
        } else {
            setError(result.error);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        const result = await verifyDonorEmail(otpString);
        setLoading(false);

        if (result.success) {
            const from = location.state?.from || '/account';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        const result = await resendDonorVerification();
        setLoading(false);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
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
                setTab(0);
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

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full">
            <LoginBrandingMobile />
            <LoginBrandingPanel />

            <div className="w-full md:w-1/2 flex-grow flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 md:min-h-screen">
                <div className="w-full max-w-[420px] mx-auto p-2.5 sm:p-3 md:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    {step === 'form' && (
                        <div key="form" style={{ animation: 'slideIn 0.4s ease' }}>
                            <div className="flex mb-3 bg-primary-50/10 dark:bg-primary-900/10 rounded-lg p-1">
                                <button
                                    onClick={() => { setTab(0); setError(''); }}
                                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${
                                        tab === 0
                                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                >
                                    تسجيل الدخول
                                </button>
                                <button
                                    onClick={() => { setTab(1); setError(''); }}
                                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${
                                        tab === 1
                                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                >
                                    إنشاء حساب
                                </button>
                            </div>

                            {tab === 0 && (
                                <SignInForm
                                    signInEmail={signInEmail}
                                    setSignInEmail={setSignInEmail}
                                    signInPassword={signInPassword}
                                    setSignInPassword={setSignInPassword}
                                    showSignInPassword={showSignInPassword}
                                    setShowSignInPassword={setShowSignInPassword}
                                    loading={loading}
                                    onSubmit={handleSignIn}
                                    onForgotPassword={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }}
                                    error={error}
                                />
                            )}

                            {tab === 1 && (
                                <SignUpForm
                                    signUpName={signUpName}
                                    setSignUpName={setSignUpName}
                                    signUpEmail={signUpEmail}
                                    setSignUpEmail={setSignUpEmail}
                                    signUpPassword={signUpPassword}
                                    setSignUpPassword={setSignUpPassword}
                                    signUpConfirmPassword={signUpConfirmPassword}
                                    setSignUpConfirmPassword={setSignUpConfirmPassword}
                                    showSignUpPassword={showSignUpPassword}
                                    setShowSignUpPassword={setShowSignUpPassword}
                                    loading={loading}
                                    onSubmit={handleSignUp}
                                    error={error}
                                />
                            )}

                            <div className="relative my-3 text-center">
                                <div className="absolute top-1/2 inset-x-0 h-px bg-neutral-200 dark:bg-neutral-700"></div>
                                <span className="relative z-[1] bg-white dark:bg-neutral-800 px-2 inline-block text-neutral-500 dark:text-neutral-400 text-xs">أو</span>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 py-3 rounded-xl font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                            >
                                الاستمرار كضيف ←
                            </button>
                        </div>
                    )}

                    {step === 'verify' && (
                        <OtpVerificationForm
                            otp={otp}
                            handleOtpChange={handleOtpChange}
                            handleOtpKeyDown={handleOtpKeyDown}
                            loading={loading}
                            error={error}
                            otpSentTo={otpSentTo}
                            onSubmit={handleVerifyOtp}
                            onResend={handleResendOtp}
                            onBack={() => { setStep('form'); setError(''); setOtp(['', '', '', '', '', '']); }}
                        />
                    )}

                    {step === 'forgot' && (
                        <ForgotPasswordForm
                            forgotEmail={forgotEmail}
                            setForgotEmail={setForgotEmail}
                            loading={loading}
                            error={error}
                            successMsg={successMsg}
                            onSubmit={handleForgotPassword}
                            onBack={() => { setStep('form'); setError(''); setSuccessMsg(''); }}
                        />
                    )}

                    {step === 'reset' && (
                        <ResetPasswordForm
                            resetToken={resetToken}
                            setResetToken={setResetToken}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            confirmNewPassword={confirmNewPassword}
                            setConfirmNewPassword={setConfirmNewPassword}
                            loading={loading}
                            error={error}
                            successMsg={successMsg}
                            onSubmit={handleResetPassword}
                            onBack={() => { setStep('form'); setError(''); setSuccessMsg(''); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;

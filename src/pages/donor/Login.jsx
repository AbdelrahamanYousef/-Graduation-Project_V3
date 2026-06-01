import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Typography,
    TextField,
    Stack,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    alpha,
    InputAdornment,
    IconButton,
    Paper,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// --- Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.4; }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)); }
  50% { filter: drop-shadow(0 0 24px rgba(255, 255, 255, 0.6)); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(2.4); opacity: 0; }
`;

// --- Styled Components ---
const BrandingRoot = styled(Box)({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    background: 'linear-gradient(145deg, #0f766e 0%, #115e59 50%, #134e4a 100%)',
    overflow: 'hidden',
    padding: 32,
});

const Particle = styled('div')(({ delay, top, left, size }) => ({
    position: 'absolute',
    width: size || 8,
    height: size || 8,
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '50%',
    animation: `${float} 7s ease-in-out infinite`,
    animationDelay: delay || '0s',
    top: top || '0%',
    left: left || '0%',
    pointerEvents: 'none',
}));

const GlowRing = styled('div')({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    animation: `${pulseRing} 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
});

const StyledOtpInput = styled('input')(({ theme }) => ({
    width: 50,
    height: 54,
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: 12,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    '&:focus': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
}));

const particles = [
    { top: '10%', left: '12%', delay: '0s' },
    { top: '25%', left: '85%', size: 10, delay: '0.9s' },
    { top: '45%', left: '18%', size: 6, delay: '1.7s' },
    { top: '65%', left: '72%', delay: '2.3s' },
    { top: '18%', left: '55%', size: 14, delay: '3.1s' },
    { top: '80%', left: '38%', size: 5, delay: '1.2s' },
    { top: '88%', left: '78%', size: 8, delay: '2.8s' },
    { top: '35%', left: '40%', size: 4, delay: '0.4s' },
];

function Login() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isDonorLoggedIn, donorLogin, registerDonor, verifyDonorEmail, resendDonorVerification } = useAuth();

    // Tab: 0 = Sign In, 1 = Sign Up
    const [tab, setTab] = useState(0);
    // Step: 'form' | 'verify' | 'forgot' | 'reset'
    const [step, setStep] = useState('form');

    // Sign In fields
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);

    // Sign Up fields
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);

    // OTP fields
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    // Forgot / Reset Password fields
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [otpSentTo, setOtpSentTo] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isDonorLoggedIn) {
            navigate('/account', { replace: true });
        }
    }, [isDonorLoggedIn, navigate]);

    // ── Sign In ────────────────────────────────────────────
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        const result = await donorLogin(signInEmail, signInPassword);
        setLoading(false);
        if (result.success) {
            navigate('/account');
        } else {
            setError(result.error);
        }
    };

    // ── Sign Up ────────────────────────────────────────────
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

    // ── OTP Verification ───────────────────────────────────
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
            navigate('/account');
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

    // ── Forgot / Reset Password ────────────────────────────
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

    // Shared field style to reduce repetition
    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            transition: 'all 0.2s ease',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
        },
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', width: '100%' }}>
            {/* ── Mobile: compact branding banner (visible only on xs/sm) ── */}
            <Box
                sx={{
                    width: '100%',
                    display: { xs: 'flex', md: 'none' },
                    background: 'linear-gradient(145deg, #d4a017 0%, #b8860b 50%, #8b6508 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                    px: 2,
                    gap: 1.5,
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ fontSize: 40, color: 'common.white', animation: `${glow} 3s ease-in-out infinite` }}>
                    <i className="fa-solid fa-moon" />
                </Box>
                <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 800 }}>
                    نور
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 300 }}>
                    {t('auth.loginSubtitle')}
                </Typography>
            </Box>

            {/* ── Desktop: Visual / Branding Panel ── */}
            <Box
                sx={{
                    width: { md: '50%' },
                    display: { xs: 'none', md: 'flex' },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <BrandingRoot>
                    {/* Decorative particles */}
                    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        {particles.map((p, i) => (
                            <Particle key={i} {...p} />
                        ))}
                    </Box>

                    {/* Pulsing glow rings behind icon */}
                    <Box sx={{ position: 'relative', mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GlowRing />
                        <GlowRing style={{ animationDelay: '1.5s' }} />
                        <Box
                            sx={{
                                fontSize: 80,
                                color: 'common.white',
                                animation: `${glow} 3s ease-in-out infinite`,
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <i className="fa-solid fa-moon" />
                        </Box>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            color: 'common.white',
                            mb: 2,
                            fontWeight: 800,
                            letterSpacing: 1,
                            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        }}
                    >
                        نور
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            maxWidth: 380,
                            mx: 'auto',
                            mb: 8,
                            lineHeight: 1.7,
                            textAlign: 'center',
                            fontWeight: 400,
                        }}
                    >
                        {t('auth.loginSubtitle')}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="center"
                        alignItems="center"
                        divider={
                            <Box
                                sx={{
                                    width: '1px',
                                    height: 40,
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                }}
                            />
                        }
                    >
                        {[
                            { value: '١٥ مليون+', label: 'تبرعات' },
                            { value: '١٢,٠٠٠+', label: 'مستفيد' },
                            { value: '٨٧+', label: 'مشروع' },
                        ].map((stat) => (
                            <Box key={stat.label} sx={{ textAlign: 'center', px: 1 }}>
                                <Typography variant="h5" fontWeight="bold" color="common.white">
                                    {stat.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </BrandingRoot>
            </Box>

            {/* ── Form Panel ── */}
            <Box
                sx={{
                    width: { xs: '100%', md: '50%' },
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8fafc',
                    px: { xs: 2, sm: 4, md: 6, lg: 8 },
                    py: { xs: 3, md: 4 },
                    minHeight: { md: '100vh' },
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        mx: 'auto',
                        p: { xs: 2.5, sm: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    {/* FORM STEP */}
                    {step === 'form' && (
                        <Box key="form" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => {
                                    setTab(v);
                                    setError('');
                                }}
                                variant="fullWidth"
                                sx={{
                                    mb: 3,
                                    minHeight: 44,
                                    '& .MuiTabs-flexContainer': { gap: 1 },
                                    '& .MuiTabs-indicator': { display: 'none' },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        borderRadius: 2,
                                        minHeight: 40,
                                        color: 'text.secondary',
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        transition: 'all 0.2s ease',
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            fontWeight: 700,
                                        },
                                    },
                                }}
                            >
                                <Tab label="تسجيل الدخول" />
                                <Tab label="إنشاء حساب" />
                            </Tabs>

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
                            {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{successMsg}</Alert>}

                            {/* ── Sign In Tab ── */}
                            {tab === 0 && (
                                <Box component="form" onSubmit={handleSignIn} sx={{ animation: `${slideIn} 0.3s ease` }}>
                                    <Stack spacing={2.5}>
                                        <TextField
                                            fullWidth
                                            label="البريد الإلكتروني"
                                            type="email"
                                            value={signInEmail}
                                            onChange={(e) => setSignInEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            autoFocus
                                            required
                                            sx={fieldSx}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="كلمة المرور"
                                            type={showSignInPassword ? 'text' : 'password'}
                                            value={signInPassword}
                                            onChange={(e) => setSignInPassword(e.target.value)}
                                            required
                                            sx={fieldSx}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconButton
                                                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                                                            edge="start"
                                                            size="small"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <i className={`fa-solid ${showSignInPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.85rem' }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: -0.5 }}>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => {
                                                    setStep('forgot');
                                                    setError('');
                                                    setSuccessMsg('');
                                                }}
                                                sx={{
                                                    minWidth: 'auto',
                                                    p: 0,
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    textTransform: 'none',
                                                }}
                                            >
                                                هل نسيت كلمة المرور؟
                                            </Button>
                                        </Box>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading || !signInEmail || !signInPassword}
                                            sx={{
                                                py: 1.4,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            {loading ? <CircularProgress size={22} color="inherit" /> : 'تسجيل الدخول'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            {/* ── Sign Up Tab ── */}
                            {tab === 1 && (
                                <Box component="form" onSubmit={handleSignUp} sx={{ animation: `${slideIn} 0.3s ease` }}>
                                    <Stack spacing={2.2}>
                                        <TextField
                                            fullWidth
                                            label="الاسم الكامل"
                                            value={signUpName}
                                            onChange={(e) => setSignUpName(e.target.value)}
                                            placeholder="مثال: أحمد محمد"
                                            autoFocus
                                            required
                                            sx={fieldSx}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-user" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="البريد الإلكتروني"
                                            type="email"
                                            value={signUpEmail}
                                            onChange={(e) => setSignUpEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            required
                                            sx={fieldSx}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="كلمة المرور"
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            value={signUpPassword}
                                            onChange={(e) => setSignUpPassword(e.target.value)}
                                            placeholder="٦ أحرف على الأقل"
                                            required
                                            sx={fieldSx}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconButton
                                                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                                            edge="start"
                                                            size="small"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <i className={`fa-solid ${showSignUpPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.85rem' }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="تأكيد كلمة المرور"
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            value={signUpConfirmPassword}
                                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                                            required
                                            error={signUpConfirmPassword.length > 0 && signUpPassword !== signUpConfirmPassword}
                                            helperText={
                                                signUpConfirmPassword.length > 0 && signUpPassword !== signUpConfirmPassword
                                                    ? 'كلمتا المرور غير متطابقتين'
                                                    : ''
                                            }
                                            sx={fieldSx}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading || !signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword}
                                            sx={{
                                                py: 1.4,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            {loading ? <CircularProgress size={22} color="inherit" /> : 'إنشاء حساب'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            {/* Divider */}
                            <Box sx={{ position: 'relative', my: 3, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        insetInline: 0,
                                        height: '1px',
                                        bgcolor: 'divider',
                                    }}
                                />
                                <Typography
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        bgcolor: 'background.paper',
                                        px: 2,
                                        display: 'inline-block',
                                        color: 'text.secondary',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    أو
                                </Typography>
                            </Box>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/')}
                                sx={{
                                    py: 1.2,
                                    color: 'text.secondary',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                الاستمرار كضيف ←
                            </Button>
                        </Box>
                    )}

                    {/* ── Email Verification Step ── */}
                    {step === 'verify' && (
                        <Box key="verify" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        fontSize: 52,
                                        color: 'primary.main',
                                        mb: 2,
                                        animation: `${bounceIn} 0.5s ease`,
                                    }}
                                >
                                    <i className="fa-solid fa-envelope-circle-check" />
                                </Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    تأكيد البريد الإلكتروني
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 1 }}>
                                    أرسلنا كود تحقق مكون من 6 أرقام إلى
                                </Typography>
                                <Typography fontWeight="bold" color="primary.main" dir="ltr" sx={{ display: 'inline-block' }}>
                                    {otpSentTo}
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}

                            <Box component="form" onSubmit={handleVerifyOtp}>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={1.2} justifyContent="center" dir="ltr">
                                        {otp.map((digit, i) => (
                                            <StyledOtpInput
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </Stack>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={loading || otp.some((d) => !d)}
                                        sx={{
                                            py: 1.4,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {loading ? <CircularProgress size={22} color="inherit" /> : 'تأكيد'}
                                    </Button>
                                </Stack>
                            </Box>

                            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                                <Typography color="text.secondary" variant="body2">
                                    لم تتلقى الكود؟
                                </Typography>
                                <Button
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontWeight: 700 }}
                                >
                                    إعادة الإرسال
                                </Button>
                            </Stack>

                            <Button
                                onClick={() => {
                                    setStep('form');
                                    setError('');
                                    setOtp(['', '', '', '', '', '']);
                                }}
                                sx={{ mt: 2, width: '100%', color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                            >
                                العودة لتسجيل الدخول
                            </Button>
                        </Box>
                    )}

                    {/* ── Forgot Password Step ── */}
                    {step === 'forgot' && (
                        <Box key="forgot" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        fontSize: 52,
                                        color: 'primary.main',
                                        mb: 2,
                                        animation: `${bounceIn} 0.5s ease`,
                                    }}
                                >
                                    <i className="fa-solid fa-key" />
                                </Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    استعادة كلمة المرور
                                </Typography>
                                <Typography color="text.secondary">
                                    أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
                            {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{successMsg}</Alert>}

                            <Box component="form" onSubmit={handleForgotPassword}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="البريد الإلكتروني"
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        autoFocus
                                        required
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={loading || !forgotEmail}
                                        sx={{
                                            py: 1.4,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {loading ? <CircularProgress size={22} color="inherit" /> : 'إرسال الرمز'}
                                    </Button>
                                </Stack>
                            </Box>

                            <Button
                                onClick={() => {
                                    setStep('form');
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                sx={{ mt: 3, width: '100%', color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                            >
                                العودة لتسجيل الدخول
                            </Button>
                        </Box>
                    )}

                    {/* ── Reset Password Step ── */}
                    {step === 'reset' && (
                        <Box key="reset" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        fontSize: 52,
                                        color: 'primary.main',
                                        mb: 2,
                                        animation: `${bounceIn} 0.5s ease`,
                                    }}
                                >
                                    <i className="fa-solid fa-lock-open" />
                                </Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    كلمة مرور جديدة
                                </Typography>
                                <Typography color="text.secondary">
                                    أدخل الرمز المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
                            {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{successMsg}</Alert>}

                            <Box component="form" onSubmit={handleResetPassword}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="رمز الاستعادة"
                                        value={resetToken}
                                        onChange={(e) => setResetToken(e.target.value)}
                                        placeholder="الرمز المكون من الأحرف والأرقام"
                                        required
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-hashtag" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="كلمة المرور الجديدة"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="٨ أحرف على الأقل، حرف كبير، رقم، ورمز"
                                        required
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="تأكيد كلمة المرور"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                        error={confirmNewPassword.length > 0 && newPassword !== confirmNewPassword}
                                        helperText={
                                            confirmNewPassword.length > 0 && newPassword !== confirmNewPassword
                                                ? 'كلمتا المرور غير متطابقتين'
                                                : ''
                                        }
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={loading || !resetToken || !newPassword || !confirmNewPassword}
                                        sx={{
                                            py: 1.4,
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {loading ? <CircularProgress size={22} color="inherit" /> : 'حفظ كلمة المرور'}
                                    </Button>
                                </Stack>
                            </Box>

                            <Button
                                onClick={() => {
                                    setStep('form');
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                sx={{ mt: 3, width: '100%', color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                            >
                                إلغاء
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default Login;

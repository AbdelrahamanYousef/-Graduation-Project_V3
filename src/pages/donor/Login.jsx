import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Container,
    Grid,
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
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// --- Animations ---
const floatLogin = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.8); opacity: 0.6; }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3)); }
  50% { filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.6)); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---
const BrandingSection = styled(Box)(({ theme }) => ({
    display: 'none',
    position: 'relative',
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 50%, #064e3b 100%)`,
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const Particle = styled('div')(({ delay, top, left, size }) => ({
    position: 'absolute',
    width: size || 8,
    height: size || 8,
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    animation: `${floatLogin} 8s ease-in-out infinite`,
    animationDelay: delay || '0s',
    top: top || '0%',
    left: left || '0%',
}));

const StyledOtpInput = styled('input')(({ theme }) => ({
    width: 52,
    height: 56,
    textAlign: 'center',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    '&:focus': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
}));

const particles = [
    { top: '10%', left: '15%', delay: '0s' },
    { top: '30%', left: '80%', size: 10, delay: '0.7s' },
    { top: '50%', left: '25%', size: 6, delay: '1.4s' },
    { top: '70%', left: '65%', delay: '2.1s' },
    { top: '20%', left: '50%', size: 12, delay: '2.8s' },
    { top: '85%', left: '35%', size: 5, delay: '3.5s' },
];

function Login() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isDonorLoggedIn, donorLogin, registerDonor, verifyDonorEmail, resendDonorVerification } = useAuth();

    // Tab: 0 = Sign In, 1 = Sign Up
    const [tab, setTab] = useState(0);
    // Step: 'form' | 'verify'
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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding */}
            <Grid item xs={12} md={6} component={BrandingSection}>
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'common.white', p: 4 }}>
                    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                        {particles.map((p, i) => (
                            <Particle key={i} {...p} />
                        ))}
                    </Box>

                    <Box sx={{
                        fontSize: 64,
                        display: 'block',
                        mb: 2,
                        animation: `${glow} 3s ease-in-out infinite`
                    }}>
                        <i className="fa-solid fa-moon"></i>
                    </Box>

                    <Typography variant="h1" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                        {'نور'}
                    </Typography>

                    <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 400, mx: 'auto', mb: 6, lineHeight: 1.6 }}>
                        {t('auth.loginSubtitle')}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={4}
                        justifyContent="center"
                        divider={<Box sx={{ width: 1, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }} />}
                    >
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{'١٥ مليون+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{'تبرعات'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{'١٢,٠٠٠+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{'مستفيد'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{'٨٧+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{'مشروع'}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} md={6} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, md: 8 },
                bgcolor: 'background.default'
            }}>
                <Box sx={{ width: '100%', maxWidth: 420 }}>
                    {step === 'form' && (
                        <Box key="form" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            {/* Tabs */}
                            <Tabs
                                value={tab}
                                onChange={(_, v) => { setTab(v); setError(''); }}
                                variant="fullWidth"
                                sx={{ mb: 4 }}
                            >
                                <Tab label={'تسجيل الدخول'} />
                                <Tab label={'إنشاء حساب'} />
                            </Tabs>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}

                            {/* ── Sign In Tab ── */}
                            {tab === 0 && (
                                <Box component="form" onSubmit={handleSignIn} sx={{ animation: `${slideIn} 0.3s ease` }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label={'البريد الإلكتروني'}
                                            type="email"
                                            value={signInEmail}
                                            onChange={(e) => setSignInEmail(e.target.value)}
                                            placeholder={'example@email.com'}
                                            autoFocus
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary }}></i>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label={'كلمة المرور'}
                                            type={showSignInPassword ? 'text' : 'password'}
                                            value={signInPassword}
                                            onChange={(e) => setSignInPassword(e.target.value)}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary }}></i>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowSignInPassword(!showSignInPassword)} edge="end" size="small">
                                                            <i className={`fa-solid ${showSignInPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.9rem' }}></i>
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading || !signInEmail || !signInPassword}
                                            sx={{ py: 1.5, fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'تسجيل الدخول'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            {/* ── Sign Up Tab ── */}
                            {tab === 1 && (
                                <Box component="form" onSubmit={handleSignUp} sx={{ animation: `${slideIn} 0.3s ease` }}>
                                    <Stack spacing={2.5}>
                                        <TextField
                                            fullWidth
                                            label={'الاسم الكامل'}
                                            value={signUpName}
                                            onChange={(e) => setSignUpName(e.target.value)}
                                            placeholder={'مثال: أحمد محمد'}
                                            autoFocus
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-user" style={{ color: theme.palette.text.secondary }}></i>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label={'البريد الإلكتروني'}
                                            type="email"
                                            value={signUpEmail}
                                            onChange={(e) => setSignUpEmail(e.target.value)}
                                            placeholder={'example@email.com'}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary }}></i>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label={'كلمة المرور'}
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            value={signUpPassword}
                                            onChange={(e) => setSignUpPassword(e.target.value)}
                                            placeholder={'٦ أحرف على الأقل'}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary }}></i>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowSignUpPassword(!showSignUpPassword)} edge="end" size="small">
                                                            <i className={`fa-solid ${showSignUpPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.9rem' }}></i>
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label={'تأكيد كلمة المرور'}
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            value={signUpConfirmPassword}
                                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                                            required
                                            error={signUpConfirmPassword.length > 0 && signUpPassword !== signUpConfirmPassword}
                                            helperText={signUpConfirmPassword.length > 0 && signUpPassword !== signUpConfirmPassword ? 'كلمتا المرور غير متطابقتين' : ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary }}></i>
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
                                            sx={{ py: 1.5, fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'إنشاء حساب'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            <Box sx={{ position: 'relative', my: 3, textAlign: 'center' }}>
                                <Typography
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        bgcolor: 'background.default',
                                        px: 2,
                                        display: 'inline-block',
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {'أو'}
                                </Typography>
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    right: 0,
                                    height: 1,
                                    bgcolor: 'divider',
                                    zIndex: 0
                                }} />
                            </Box>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/')}
                                sx={{ py: 1.5, color: 'text.secondary', borderColor: 'divider' }}
                            >
                                {'الاستمرار كضيف'} {'←'}
                            </Button>
                        </Box>
                    )}

                    {/* ── Email Verification Step ── */}
                    {step === 'verify' && (
                        <Box key="verify" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box sx={{
                                    fontSize: 48,
                                    color: 'primary.main',
                                    mb: 2,
                                    animation: `${bounceIn} 0.5s ease`
                                }}>
                                    <i className="fa-solid fa-envelope-circle-check"></i>
                                </Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    {'تأكيد البريد الإلكتروني'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 1 }}>
                                    {'أرسلنا كود تحقق مكون من 6 أرقام إلى'}
                                </Typography>
                                <Typography fontWeight="bold" color="primary.main" dir="ltr" sx={{ display: 'inline-block' }}>
                                    {otpSentTo}
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}

                            <Box component="form" onSubmit={handleVerifyOtp}>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={1.5} justifyContent="center" dir="ltr">
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
                                        disabled={loading || otp.some(d => !d)}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'تأكيد'}
                                    </Button>
                                </Stack>
                            </Box>

                            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                                <Typography color="text.secondary" variant="body2">
                                    {'لم تتلقى الكود؟'}
                                </Typography>
                                <Button
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    {'إعادة الإرسال'}
                                </Button>
                            </Stack>

                            <Button
                                onClick={() => { setStep('form'); setError(''); setOtp(['', '', '', '', '', '']); }}
                                sx={{ mt: 2, width: '100%', color: 'text.secondary' }}
                            >
                                {'العودة لتسجيل الدخول'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}

export default Login;

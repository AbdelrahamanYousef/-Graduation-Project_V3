import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, getLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    TextField,
    InputAdornment,
    Stack,
    alpha
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
    width: 56,
    height: 56,
    textAlign: 'center',
    fontSize: '1.5rem',
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

const RoleCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(4, 2),
    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: theme.shadows[4],
        transform: 'translateY(-5px)',
    },
}));

function Login() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isDonorLoggedIn, donorLogin } = useAuth();
    const isEn = getLanguage() === 'en';
    const [step, setStep] = useState('phone'); // phone | otp | register
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');

    // If already logged in, redirect to account
    useEffect(() => {
        if (isDonorLoggedIn) {
            navigate('/account', { replace: true });
        }
    }, [isDonorLoggedIn, navigate]);

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (phone.length >= 10) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep('otp');
            }, 1000);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Simulate: new user goes to registration, existing user logs in directly
            setStep('register');
        }, 800);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            donorLogin(phone, {
                name: regName,
                nameEn: regName,
                email: regEmail || undefined,
            });
            navigate('/account');
        }, 600);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Particles config
    const particles = [
        { top: '10%', left: '15%', delay: '0s' },
        { top: '30%', left: '80%', size: 10, delay: '0.7s' },
        { top: '50%', left: '25%', size: 6, delay: '1.4s' },
        { top: '70%', left: '65%', delay: '2.1s' },
        { top: '20%', left: '50%', size: 12, delay: '2.8s' },
        { top: '85%', left: '35%', size: 5, delay: '3.5s' },
        { top: '45%', left: '90%', delay: '4.2s' },
        { top: '60%', left: '10%', size: 7, delay: '4.9s' }
    ];

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
                        {isEn ? 'Nour' : 'نور'}
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
                            <Typography variant="h5" fontWeight="bold">{isEn ? '15M+' : '١٥ مليون+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{isEn ? 'Donations' : 'تبرعات'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{isEn ? '12,000+' : '١٢,٠٠٠+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{isEn ? 'Beneficiaries' : 'مستفيد'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{isEn ? '87+' : '٨٧+'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{isEn ? 'Projects' : 'مشروع'}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} md={6} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 4, md: 8 },
                bgcolor: 'background.default'
            }}>
                <Box sx={{ width: '100%', maxWidth: 420 }}>
                    {/* Step: Phone */}
                    {step === 'phone' && (
                        <Box key="phone" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {t('auth.loginTitle')}
                                </Typography>
                                <Typography color="text.secondary">
                                    {t('auth.welcome')}
                                </Typography>
                            </Box>

                            <form onSubmit={handleSendOTP}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label={t('auth.phoneNumber')}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder={t('auth.enterPhone')}
                                        inputProps={{ maxLength: 11 }}
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Box sx={{
                                                        px: 1,
                                                        fontWeight: 'bold',
                                                        color: 'text.secondary',
                                                        borderRight: theme.direction === 'ltr' ? `1px solid ${theme.palette.divider}` : 'none',
                                                        borderLeft: theme.direction === 'rtl' ? `1px solid ${theme.palette.divider}` : 'none',
                                                    }}>
                                                        +20
                                                    </Box>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={phone.length < 10 || loading}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? t('common.loading') : t('auth.sendOTP')}
                                    </Button>
                                </Stack>
                            </form>

                            <Box sx={{ position: 'relative', my: 4, textAlign: 'center' }}>
                                <Typography
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        bgcolor: 'background.default',
                                        px: 2,
                                        display: 'inline-block',
                                        color: 'text.secondary'
                                    }}
                                >
                                    {isEn ? 'or' : 'أو'}
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
                                {t('auth.continueAsGuest')} {isEn ? '→' : '←'}
                            </Button>
                        </Box>
                    )}

                    {/* Step: OTP */}
                    {step === 'otp' && (
                        <Box key="otp" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {t('auth.enterOTP')}
                                </Typography>
                                <Typography color="text.secondary">
                                    {t('auth.otpSent')} <strong dir="ltr">+20 {phone}</strong>
                                </Typography>
                            </Box>

                            <form onSubmit={handleVerifyOTP}>
                                <Stack spacing={4}>
                                    <Stack direction="row" spacing={2} justifyContent="center" dir="ltr">
                                        {otp.map((digit, i) => (
                                            <StyledOtpInput
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </Stack>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={otp.some(d => !d) || loading}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? t('common.loading') : t('auth.verifyOTP')}
                                    </Button>
                                </Stack>
                            </form>

                            <Button
                                onClick={() => setStep('phone')}
                                sx={{ mt: 2, width: '100%', color: 'primary.main' }}
                            >
                                {t('auth.resendOTP')}
                            </Button>
                        </Box>
                    )}

                    {/* Step: Register */}
                    {step === 'register' && (
                        <Box key="register" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box sx={{
                                    fontSize: 48,
                                    color: 'success.main',
                                    mb: 2,
                                    animation: `${bounceIn} 0.5s ease`
                                }}>
                                    <i className="fa-solid fa-circle-check"></i>
                                </Box>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {t('auth.welcomeNew')}
                                </Typography>
                                <Typography color="text.secondary">
                                    {t('auth.completeProfile')}
                                </Typography>
                            </Box>

                            <form onSubmit={handleRegister}>
                                <Stack spacing={3}>
                                    <TextField
                                        label={t('auth.registerName')}
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        placeholder={isEn ? 'e.g. Ahmed Mohamed' : 'مثال: أحمد محمد'}
                                        fullWidth
                                        autoFocus
                                    />
                                    <TextField
                                        label={t('auth.registerEmail')}
                                        type="email"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder={isEn ? 'e.g. ahmed@email.com' : 'مثال: ahmed@email.com'}
                                        fullWidth
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={!regName.trim() || loading}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? t('common.loading') : t('auth.startJourney')} {isEn ? '→' : '←'}
                                    </Button>
                                </Stack>
                            </form>

                            <Button
                                onClick={() => {
                                    donorLogin(phone);
                                    navigate('/account');
                                }}
                                sx={{ mt: 2, width: '100%', color: 'text.secondary' }}
                            >
                                {isEn ? 'Skip for now' : 'تخطي الآن'} {isEn ? '→' : '←'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}

export default Login;

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
    Alert,
    Chip,
    CircularProgress,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// --- Animations ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

// --- Styled branding panel ---
const BrandingRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    overflow: 'hidden', 
    padding: 32,
}));

/**
 * AdminLogin - Login page for admin panel access (with forgot/reset password flow)
 */
function AdminLogin() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAdmin } = useAuth();

    // Step: 'form' | 'forgot' | 'reset'
    const [step, setStep] = useState('form');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot / Reset Password fields
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect to admin
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
        await new Promise((r) => setTimeout(r, 800));

        const result = login(email, password);
        setLoading(false);

        if (result.success) {
            const from = location.state?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
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
            {/* ── Mobile compact branding banner ── */}
            <Box
                sx={{
                    width: '100%',
                    display: { xs: 'flex', md: 'none' },
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                    px: 2,
                    gap: 1.5,
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ fontSize: 36 }}>
                    <i className="fa-solid fa-moon" />
                </Box>
                <Typography variant="h4" fontWeight={800}>نور</Typography>
                <Chip
                    label="لوحة التحكم"
                    size="small"
                    sx={{ bgcolor: alpha('#fff', 0.2), color: 'common.white', fontWeight: 'bold' }}
                />
            </Box>

            {/* ── Desktop Branding Panel ── */}
            <Box
                sx={{
                    width: { md: '50%' },
                    display: { xs: 'none', md: 'flex' },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <BrandingRoot>
                    {/* Decorative blurs */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '-10%',
                            left: '-10%',
                            width: '50%',
                            height: '50%',
                            borderRadius: '50%',
                            bgcolor: alpha('#fff', 0.1),
                            filter: 'blur(80px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '-10%',
                            right: '-10%',
                            width: '60%',
                            height: '60%',
                            borderRadius: '50%',
                            bgcolor: alpha('#fff', 0.05),
                            filter: 'blur(100px)',
                        }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, lg: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    bgcolor: 'common.white',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                }}
                            >
                                <i className="fa-solid fa-moon"></i>
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight="bold">نور</Typography>
                                <Chip
                                    label="لوحة التحكم"
                                    size="small"
                                    sx={{ bgcolor: alpha('#fff', 0.2), color: 'common.white', fontWeight: 'bold' }}
                                />
                            </Box>
                        </Box>

                        <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6 }}>
                            مرحباً بك في لوحة إدارة نظام نور الخيري
                        </Typography>

                        <Stack spacing={3}>
                            {[
                                { icon: 'fa-solid fa-chart-pie', text: 'لوحة تحكم شاملة' },
                                { icon: 'fa-solid fa-folder-open', text: 'إدارة المشاريع والبرامج' },
                                { icon: 'fa-solid fa-coins', text: 'تتبع التبرعات والمالية' },
                                { icon: 'fa-solid fa-arrow-trend-up', text: 'تقارير وإحصائيات' },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: alpha('#fff', 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={item.icon}></i>
                                    </Box>
                                    <Typography variant="h6" fontSize="1.1rem">{item.text}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
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
                        maxWidth: 450,
                        mx: 'auto',
                        p: { xs: 2.5, sm: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    {/* ── Sign In Step ── */}
                    {step === 'form' && (
                        <Box key="form" sx={{ animation: `${slideIn} 0.4s ease` }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 24,
                                        mb: 2,
                                    }}
                                >
                                    <i className="fa-solid fa-lock"></i>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">تسجيل دخول المسؤول</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    أدخل بيانات حسابك للوصول إلى لوحة التحكم
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    {error && (
                                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                                            {error}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="البريد الإلكتروني"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@nour.org"
                                        autoFocus
                                        autoComplete="email"
                                        fullWidth
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-envelope" style={{ color: theme.palette.text.secondary }}></i>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="كلمة المرور"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        fullWidth
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="fa-solid fa-lock" style={{ color: theme.palette.text.secondary }}></i>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                                                    >
                                                        {showPassword ? (
                                                            <i className="fa-solid fa-eye-slash" style={{ fontSize: 16 }}></i>
                                                        ) : (
                                                            <i className="fa-solid fa-eye" style={{ fontSize: 16 }}></i>
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: -1 }}>
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
                                        disabled={loading || !email || !password}
                                        sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 3, textTransform: 'none' }}
                                    >
                                        {loading ? <CircularProgress size={22} color="inherit" /> : 'تسجيل الدخول'}
                                    </Button>
                                </Stack>
                            </form>

                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Button
                                    component={Link}
                                    to="/"
                                    startIcon={<i className="fa-solid fa-arrow-right"></i>}
                                    color="inherit"
                                >
                                    العودة للموقع
                                </Button>
                            </Box>

                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 4,
                                    p: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: 'text.primary',
                                    border: 1,
                                    borderColor: alpha(theme.palette.info.main, 0.2),
                                    display: 'flex',
                                    gap: 1.5,
                                }}
                            >
                                <Box sx={{ color: 'info.main', mt: 0.5 }}>
                                    <i className="fa-solid fa-lightbulb"></i>
                                </Box>
                                <Typography variant="body2">
                                    للتجربة: <strong>admin@nour.org</strong> / <strong>admin123</strong>
                                </Typography>
                            </Paper>
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

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                            {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

                            <Box component="form" onSubmit={handleForgotPassword}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="البريد الإلكتروني"
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="admin@nour.org"
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

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                            {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

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

export default AdminLogin;

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Container,
    Paper,
    Stack,
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
    Alert,
    Chip
} from '@mui/material';

/**
 * AdminLogin - Login page for admin panel access
 */
function AdminLogin() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAdmin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const result = login(email, password);
        setLoading(false);

        if (result.success) {
            const from = location.state?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Branding */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: { xs: 4, lg: 8 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Background Elements */}
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

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'common.white',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24
                        }}>
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
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    bgcolor: alpha('#fff', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i className={item.icon}></i>
                                </Box>
                                <Typography variant="h6" fontSize="1.1rem">{item.text}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Grid>

            {/* Right Form */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 4, sm: 8 },
                    bgcolor: 'background.paper'
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 450 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            mb: 2
                        }}>
                            <i className="fa-solid fa-lock"></i>
                        </Box>
                        <Typography variant="h4" fontWeight="bold">تسجيل دخول المسؤول</Typography>
                        <Typography variant="body1" color="text.secondary">أدخل بيانات حسابك للوصول إلى لوحة التحكم</Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {error && (
                                <Alert severity="error" icon={<i className="fa-solid fa-triangle-exclamation"></i>}>
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
                                variant="outlined"
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
                                variant="outlined"
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

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading || !email || !password}
                                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                            >
                                {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
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
                            gap: 1.5
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
            </Grid>
        </Grid>
    );
}

export default AdminLogin;

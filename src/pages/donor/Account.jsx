import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Tabs,
    Tab,
    Stack,
    Divider,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import { t, getLanguage, formatCurrency, formatDate } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import styled from '@emotion/styled';

// --- Styled Components ---

const ProfileHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const StatCard = styled(Card)(({ theme, color }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        backgroundColor: color || theme.palette.primary.main,
    }
}));

const ActionCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(4),
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    },
}));

/**
 * Account Page - User Profile & Dashboard
 */
function Account() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { isDonorLoggedIn, donorUser, donorLogout, updateDonorPhoto } = useAuth();
    const isEn = getLanguage() === 'en';
    const photoInputRef = useRef(null);

    const handlePhotoUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateDonorPhoto(ev.target.result);
        };
        reader.readAsDataURL(file);
    }, [updateDonorPhoto]);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        return ['overview', 'donations', 'profile'].includes(tab) ? tab : 'overview';
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Sync tab with URL param changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'donations', 'profile'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // If not logged in, show login prompt
    if (!isDonorLoggedIn) {
        return (
            <Box sx={{ py: 10, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Container maxWidth="sm">
                    <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                        <Box sx={{ color: 'text.secondary', fontSize: '3rem', mb: 2 }}>
                            <i className="fa-solid fa-lock"></i>
                        </Box>
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            {isEn ? 'Login Required' : 'يجب تسجيل الدخول'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            {isEn ? 'Please login to view your account and donation history' : 'يرجى تسجيل الدخول لعرض حسابك وسجل تبرعاتك'}
                        </Typography>
                        <Button component={Link} to="/login" variant="contained" size="large">
                            {t('nav.login')}
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    // Use data from auth context
    const user = {
        name: isEn ? (donorUser.nameEn || donorUser.name) : donorUser.name,
        email: donorUser.email,
        phone: donorUser.phone,
        joinDate: donorUser.joinDate || donorUser.loggedInAt,
        totalDonations: donorUser.totalDonations || 0,
        donationCount: donorUser.donationCount || 0,
    };

    // Mock donations (would come from API)
    const donations = [
        { id: 1, date: '2024-01-15', project: isEn ? 'Clean Water Project' : 'مشروع المياه النظيفة', amount: 5000, status: 'completed' },
        { id: 2, date: '2024-01-10', project: isEn ? 'Orphan Sponsorship' : 'كفالة يتيم', amount: 1500, status: 'completed' },
        { id: 3, date: '2023-12-25', project: isEn ? 'Medical Convoy' : 'القافلة الطبية', amount: 3000, status: 'completed' },
        { id: 4, date: '2023-12-15', project: isEn ? 'Classroom Setup' : 'تجهيز فصول دراسية', amount: 2500, status: 'completed' },
        { id: 5, date: '2023-11-20', project: isEn ? 'Iftar for Fasting' : 'إفطار صائم', amount: 1000, status: 'completed' },
    ];

    const handleLogout = () => {
        donorLogout();
        navigate('/');
    };

    return (
        <Box sx={{ py: 6, bgcolor: 'background.default', minHeight: '90vh' }}>
            <Container>
                {/* Header */}
                <ProfileHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={donorUser?.photo}
                                sx={{ width: 80, height: 80, cursor: 'pointer', border: `2px solid ${theme.palette.primary.main}` }}
                                onClick={() => photoInputRef.current?.click()}
                            >
                                {!donorUser?.photo && <i className="fa-solid fa-user"></i>}
                            </Avatar>
                            <IconButton
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: isEn ? -10 : 'auto',
                                    left: isEn ? 'auto' : -10,
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'background.paper' }
                                }}
                                onClick={() => photoInputRef.current?.click()}
                            >
                                <i className="fa-solid fa-camera" style={{ fontSize: '0.8rem' }}></i>
                            </IconButton>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {isEn ? 'Hello' : 'أهلاً'}، {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEn ? 'Member since' : 'عضو منذ'} {formatDate(user.joinDate)}
                            </Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" color="error" size="small" onClick={handleLogout} startIcon={<i className="fa-solid fa-right-from-bracket"></i>}>
                        {isEn ? 'Logout' : 'تسجيل الخروج'}
                    </Button>
                </ProfileHeader>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label={isEn ? 'Overview' : 'نظرة عامة'} value="overview" icon={<i className="fa-solid fa-chart-pie"></i>} iconPosition="start" />
                        <Tab label={isEn ? 'My Donations' : 'تبرعاتي'} value="donations" icon={<i className="fa-solid fa-hand-holding-heart"></i>} iconPosition="start" />
                        <Tab label={isEn ? 'My Profile' : 'بياناتي'} value="profile" icon={<i className="fa-solid fa-user"></i>} iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Content */}
                <Box>
                    {activeTab === 'overview' && (
                        <OverviewTab user={user} donations={donations} isEn={isEn} theme={theme} />
                    )}
                    {activeTab === 'donations' && (
                        <DonationsTab donations={donations} isEn={isEn} />
                    )}
                    {activeTab === 'profile' && (
                        <ProfileTab user={user} isEn={isEn} donorUser={donorUser} updateDonorPhoto={updateDonorPhoto} />
                    )}
                </Box>
            </Container>
        </Box>
    );
}

function OverviewTab({ user, donations, isEn, theme }) {
    return (
        <Stack spacing={4}>
            {/* Stats */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard color={theme.palette.primary.main}>
                        <Box sx={{ color: 'primary.main', fontSize: '2rem', mb: 2 }}>
                            <i className="fa-solid fa-coins"></i>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {formatCurrency(user.totalDonations)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isEn ? 'Total Donations' : 'إجمالي تبرعاتك'}
                        </Typography>
                    </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard color={theme.palette.secondary.main}>
                        <Box sx={{ color: 'secondary.main', fontSize: '2rem', mb: 2 }}>
                            <i className="fa-solid fa-gift"></i>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {user.donationCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isEn ? 'Number of Donations' : 'عدد التبرعات'}
                        </Typography>
                    </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard color={theme.palette.success.main}>
                        <Box sx={{ color: 'success.main', fontSize: '2rem', mb: 2 }}>
                            <i className="fa-solid fa-chart-pie"></i>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {user.donationCount > 0 ? formatCurrency(Math.round(user.totalDonations / user.donationCount)) : formatCurrency(0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isEn ? 'Average Donation' : 'متوسط التبرع'}
                        </Typography>
                    </StatCard>
                </Grid>
            </Grid>

            {/* Recent Donations */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {isEn ? 'Recent Donations' : 'آخر التبرعات'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                        {donations.slice(0, 3).map(donation => (
                            <Box key={donation.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                        <i className="fa-solid fa-hand-holding-heart"></i>
                                    </Avatar>
                                    <Typography fontWeight="medium">{donation.project}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography fontWeight="bold" color="primary.main">{formatCurrency(donation.amount)}</Typography>
                                    <Typography variant="caption" color="text.secondary">{formatDate(donation.date)}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    {isEn ? 'Quick Actions' : 'إجراءات سريعة'}
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <ActionCard component={Link} to="/donate">
                            <Box sx={{ fontSize: '2rem', color: 'primary.main', mb: 2 }}>
                                <i className="fa-solid fa-credit-card"></i>
                            </Box>
                            <Typography fontWeight="bold">{isEn ? 'Donate Now' : 'تبرع الآن'}</Typography>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <ActionCard component={Link} to="/projects">
                            <Box sx={{ fontSize: '2rem', color: 'secondary.main', mb: 2 }}>
                                <i className="fa-solid fa-folder-open"></i>
                            </Box>
                            <Typography fontWeight="bold">{isEn ? 'Browse Projects' : 'تصفح المشاريع'}</Typography>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <ActionCard component={Link} to="/transparency">
                            <Box sx={{ fontSize: '2rem', color: 'info.main', mb: 2 }}>
                                <i className="fa-solid fa-file-lines"></i>
                            </Box>
                            <Typography fontWeight="bold">{isEn ? 'Transparency Reports' : 'تقارير الشفافية'}</Typography>
                        </ActionCard>
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
}

function DonationsTab({ donations, isEn }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{isEn ? 'Date' : 'التاريخ'}</TableCell>
                        <TableCell>{isEn ? 'Project' : 'المشروع'}</TableCell>
                        <TableCell>{isEn ? 'Amount' : 'المبلغ'}</TableCell>
                        <TableCell>{isEn ? 'Status' : 'الحالة'}</TableCell>
                        <TableCell>{isEn ? 'Receipt' : 'الإيصال'}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {donations.map(donation => (
                        <TableRow key={donation.id} hover>
                            <TableCell>{formatDate(donation.date)}</TableCell>
                            <TableCell>{donation.project}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{formatCurrency(donation.amount)}</TableCell>
                            <TableCell>
                                <Chip label={isEn ? 'Completed' : 'مكتمل'} color="success" size="small" />
                            </TableCell>
                            <TableCell>
                                <IconButton size="small">
                                    <i className="fa-solid fa-file-invoice"></i>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function ProfileTab({ user, isEn, donorUser, updateDonorPhoto }) {
    const profilePhotoRef = useRef(null);

    const handleProfilePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateDonorPhoto(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Stack spacing={4} maxWidth="md">
            {/* Photo Upload Section */}
            <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <Box sx={{ position: 'relative', mb: 3 }}>
                        <Avatar
                            src={donorUser?.photo}
                            sx={{ width: 120, height: 120, cursor: 'pointer' }}
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            {!donorUser?.photo && <i className="fa-solid fa-user" style={{ fontSize: '3rem' }}></i>}
                        </Avatar>
                        <IconButton
                            sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            <i className="fa-solid fa-camera"></i>
                        </IconButton>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" size="small" onClick={() => profilePhotoRef.current?.click()}>
                            {t('account.changePhoto')}
                        </Button>
                        {donorUser?.photo && (
                            <Button variant="outlined" color="error" size="small" onClick={() => updateDonorPhoto(null)}>
                                {t('account.removePhoto')}
                            </Button>
                        )}
                    </Stack>
                    <input
                        ref={profilePhotoRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProfilePhoto}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {isEn ? 'Account Information' : 'معلومات الحساب'}
                    </Typography>
                    <Stack spacing={3} component="form" sx={{ mt: 3 }}>
                        <TextField
                            label={isEn ? 'Full Name' : 'الاسم الكامل'}
                            defaultValue={user.name}
                            fullWidth
                        />
                        <TextField
                            label={isEn ? 'Email Address' : 'البريد الإلكتروني'}
                            type="email"
                            defaultValue={user.email}
                            fullWidth
                        />
                        <TextField
                            label={isEn ? 'Phone Number' : 'رقم الهاتف'}
                            type="tel"
                            defaultValue={user.phone}
                            fullWidth
                        />
                        <Button variant="contained" type="submit" sx={{ alignSelf: 'flex-start' }}>
                            {isEn ? 'Save Changes' : 'حفظ التغييرات'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ border: 1, borderColor: 'error.main' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="error">
                        {isEn ? 'Account Settings' : 'إعدادات الحساب'}
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography fontWeight="medium">{isEn ? 'Change Password' : 'تغيير كلمة المرور'}</Typography>
                                <Typography variant="body2" color="text.secondary">{isEn ? 'Update your password' : 'قم بتحديث كلمة المرور الخاصة بك'}</Typography>
                            </Box>
                            <Button variant="outlined" size="small">{isEn ? 'Change' : 'تغيير'}</Button>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography fontWeight="medium">{isEn ? 'Email Notifications' : 'إشعارات البريد'}</Typography>
                                <Typography variant="body2" color="text.secondary">{isEn ? 'Manage notification preferences' : 'إدارة تفضيلات الإشعارات'}</Typography>
                            </Box>
                            <Button variant="outlined" size="small">{isEn ? 'Manage' : 'إدارة'}</Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}

export default Account;

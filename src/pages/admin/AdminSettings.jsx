import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Tabs,
    Tab,
    Grid,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    IconButton,
    Avatar,
    MenuItem,
    useTheme,
    alpha
} from '@mui/material';

/**
 * Admin Settings Page - الإعدادات
 */
function AdminSettings() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const users = [
        { id: 1, name: 'أحمد محمد', email: 'ahmed@nour.org', role: 'مدير', status: 'active' },
        { id: 2, name: 'فاطمة علي', email: 'fatma@nour.org', role: 'محاسب', status: 'active' },
        { id: 3, name: 'خالد عبدالله', email: 'khaled@nour.org', role: 'منسق برامج', status: 'active' },
        { id: 4, name: 'سارة أحمد', email: 'sara@nour.org', role: 'موظف', status: 'inactive' },
    ];

    const integrations = [
        { name: 'فودافون كاش', icon: 'fa-solid fa-mobile-screen', status: 'connected', desc: 'بوابة الدفع الإلكتروني', color: 'error' },
        { name: 'فوري', icon: 'fa-solid fa-credit-card', status: 'connected', desc: 'نقاط الدفع', color: 'primary' },
        { name: 'PayMob', icon: 'fa-solid fa-coins', status: 'disconnected', desc: 'معالج المدفوعات', color: 'info' },
        { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', status: 'connected', desc: 'إشعارات واتساب', color: 'success' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    الإعدادات
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    إعدادات النظام والتفضيلات
                </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
                    <Tab icon={<i className="fa-solid fa-gear" />} iconPosition="start" label="عام" />
                    <Tab icon={<i className="fa-solid fa-users" />} iconPosition="start" label="المستخدمين" />
                    <Tab icon={<i className="fa-solid fa-bell" />} iconPosition="start" label="الإشعارات" />
                    <Tab icon={<i className="fa-solid fa-link" />} iconPosition="start" label="التكاملات" />
                </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ py: 2 }}>
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>معلومات الجمعية</Typography>
                                    <Stack spacing={3}>
                                        <TextField label="اسم الجمعية" defaultValue="جمعية نور الخيرية" fullWidth />
                                        <TextField label="البريد الإلكتروني" defaultValue="info@nour-charity.org" type="email" fullWidth />
                                        <TextField label="رقم الهاتف" defaultValue="+20 2 1234 5678" type="tel" fullWidth />
                                        <TextField label="العنوان" defaultValue="القاهرة، مصر" fullWidth />
                                        <Button variant="contained" size="large">حفظ التغييرات</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>إعدادات النظام</Typography>
                                    <Stack spacing={3}>
                                        <TextField select label="اللغة" defaultValue="ar" fullWidth>
                                            <MenuItem value="ar">العربية</MenuItem>
                                            <MenuItem value="en">English</MenuItem>
                                        </TextField>
                                        <TextField select label="المنطقة الزمنية" defaultValue="africa/cairo" fullWidth>
                                            <MenuItem value="africa/cairo">القاهرة (GMT+2)</MenuItem>
                                        </TextField>
                                        <TextField select label="العملة" defaultValue="egp" fullWidth>
                                            <MenuItem value="egp">جنيه مصري (EGP)</MenuItem>
                                        </TextField>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6">المستخدمين</Typography>
                            <Button variant="contained" startIcon={<i className="fa-solid fa-plus"></i>} size="small">
                                إضافة مستخدم
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>البريد الإلكتروني</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الدور</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14 }}>
                                                        <i className="fa-solid fa-user"></i>
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip label={user.role} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Box sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: user.status === 'active' ? 'success.main' : 'text.disabled'
                                                    }} />
                                                    <Typography variant="body2">{user.status === 'active' ? 'نشط' : 'غير نشط'}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small"><i className="fa-solid fa-pen-to-square" style={{ fontSize: 16 }}></i></IconButton>
                                                    <IconButton size="small" color="error"><i className="fa-solid fa-trash" style={{ fontSize: 16 }}></i></IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}

                {activeTab === 2 && (
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>إعدادات الإشعارات</Typography>
                            <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                                {[
                                    { label: 'تبرع جديد', desc: 'إشعار عند استلام تبرع جديد', enabled: true },
                                    { label: 'طلب صرف', desc: 'إشعار عند وجود طلب صرف معلق', enabled: true },
                                    { label: 'حالة جديدة', desc: 'إشعار عند إضافة مستفيد جديد', enabled: false },
                                    { label: 'تقرير أسبوعي', desc: 'ملخص أسبوعي بالنشاطات', enabled: true },
                                ].map((notif, i) => (
                                    <Box key={i} sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="medium">{notif.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">{notif.desc}</Typography>
                                        </Box>
                                        <Switch defaultChecked={notif.enabled} />
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 3 && (
                    <Grid container spacing={3}>
                        {integrations.map((int, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{
                                                fontSize: 24,
                                                color: `${int.color}.main`,
                                                bgcolor: alpha(theme.palette[int.color].main, 0.1),
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className={int.icon}></i>
                                            </Box>
                                            <Chip
                                                label={int.status === 'connected' ? '✓ متصل' : 'غير متصل'}
                                                color={int.status === 'connected' ? 'success' : 'default'}
                                                size="small"
                                                variant="soft"
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" gutterBottom>{int.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{int.desc}</Typography>
                                        </Box>
                                        <Button
                                            variant={int.status === 'connected' ? 'outlined' : 'contained'}
                                            size="small"
                                            fullWidth
                                        >
                                            {int.status === 'connected' ? 'إعدادات' : 'ربط'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
}

export default AdminSettings;

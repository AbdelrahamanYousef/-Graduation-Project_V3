import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    LinearProgress,
    Stack,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import { formatCurrency } from '../../i18n';

/**
 * Admin Finance Page - المالية
 */
function AdminFinance() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Mock financial data
    const monthlyData = [
        { month: 'يناير', income: 450000, expenses: 380000 },
        { month: 'فبراير', income: 520000, expenses: 410000 },
        { month: 'مارس', income: 480000, expenses: 420000 },
        { month: 'أبريل', income: 610000, expenses: 490000 },
    ];

    const disbursements = [
        { id: 1, beneficiary: 'عائلة محمد أحمد', amount: 2500, type: 'دعم شهري', date: '2024-01-15', status: 'pending' },
        { id: 2, beneficiary: 'فاطمة السيد', amount: 5000, type: 'علاج طبي', date: '2024-01-14', status: 'approved' },
        { id: 3, beneficiary: 'مدرسة النور', amount: 15000, type: 'مستلزمات تعليمية', date: '2024-01-13', status: 'completed' },
        { id: 4, beneficiary: 'عائلة حسن علي', amount: 3000, type: 'إغاثة عاجلة', date: '2024-01-12', status: 'completed' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'approved': return 'info';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'approved': return 'معتمد';
            case 'pending': return 'معلق';
            default: return status;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        الإدارة المالية
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        إدارة الميزانيات والصرفيات
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<i className="fa-solid fa-download"></i>}>
                        تصدير التقرير
                    </Button>
                    <Button variant="contained" startIcon={<i className="fa-solid fa-plus"></i>}>
                        طلب صرف جديد
                    </Button>
                </Stack>
            </Box>

            {/* Stats */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main'
                                }}>
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                </Box>
                                <Chip label="+12%" color="success" size="small" variant="soft" />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {formatCurrency(2060000)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                إجمالي الإيرادات
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: 'error.main'
                                }}>
                                    <i className="fa-solid fa-arrow-trend-down"></i>
                                </Box>
                                <Chip label="-5%" color="error" size="small" variant="soft" />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {formatCurrency(1700000)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                إجمالي المصروفات
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main'
                                }}>
                                    <i className="fa-solid fa-wallet"></i>
                                </Box>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {formatCurrency(360000)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                الرصيد المتاح
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: 'warning.main'
                                }}>
                                    <i className="fa-solid fa-hourglass-half"></i>
                                </Box>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                8
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                طلبات معلقة
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="finance tabs">
                    <Tab label="نظرة عامة" icon={<i className="fa-solid fa-chart-pie"></i>} iconPosition="start" />
                    <Tab label="الصرفيات" icon={<i className="fa-solid fa-money-bill-transfer"></i>} iconPosition="start" />
                    <Tab label="الميزانيات" icon={<i className="fa-solid fa-clipboard-list"></i>} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ py: 2 }}>
                {activeTab === 0 && (
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>الإيرادات والمصروفات الشهرية</Typography>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'flex-end',
                                height: 300,
                                pt: 4,
                                pb: 2,
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}>
                                {monthlyData.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 250 }}>
                                            <Tooltip title={`الإيرادات: ${formatCurrency(item.income)}`}>
                                                <Box sx={{
                                                    width: 30,
                                                    bgcolor: 'success.main',
                                                    borderRadius: '4px 4px 0 0',
                                                    height: `${(item.income / 700000) * 100}%`,
                                                    transition: 'height 0.3s'
                                                }} />
                                            </Tooltip>
                                            <Tooltip title={`المصروفات: ${formatCurrency(item.expenses)}`}>
                                                <Box sx={{
                                                    width: 30,
                                                    bgcolor: 'error.main',
                                                    borderRadius: '4px 4px 0 0',
                                                    height: `${(item.expenses / 700000) * 100}%`,
                                                    transition: 'height 0.3s'
                                                }} />
                                            </Tooltip>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">{item.month}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                                    <Typography variant="body2">الإيرادات</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                                    <Typography variant="body2">المصروفات</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 1 && (
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المستفيد</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>النوع</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المبلغ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>التاريخ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {disbursements.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>{item.beneficiary}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(item.status)}
                                                    color={getStatusColor(item.status)}
                                                    size="small"
                                                    variant="soft"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <IconButton size="small" color="success">
                                                                <i className="fa-solid fa-check" style={{ fontSize: 14 }}></i>
                                                            </IconButton>
                                                            <IconButton size="small" color="error">
                                                                <i className="fa-solid fa-xmark" style={{ fontSize: 14 }}></i>
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <IconButton size="small">
                                                        <i className="fa-solid fa-eye" style={{ fontSize: 14 }}></i>
                                                    </IconButton>
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
                    <Grid container spacing={3}>
                        {['رعاية الأيتام', 'الرعاية الصحية', 'التعليم', 'الإغاثة العاجلة'].map((program, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{program}</Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={60 + i * 10}
                                                sx={{ height: 8, borderRadius: 1, mb: 1 }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatCurrency(200000 + i * 50000)} مصروف
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                من {formatCurrency(400000 + i * 50000)}
                                            </Typography>
                                        </Box>
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

export default AdminFinance;

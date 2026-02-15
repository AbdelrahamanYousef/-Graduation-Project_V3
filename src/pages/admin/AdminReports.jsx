import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import { formatCurrency } from '../../i18n';

/**
 * Admin Reports Page - التقارير
 */
function AdminReports() {
    const theme = useTheme();

    const reports = [
        {
            id: 1,
            title: 'تقرير التبرعات الشهري',
            type: 'donations',
            period: 'يناير 2024',
            generated: '2024-01-31',
            icon: 'fa-solid fa-coins',
            color: 'success'
        },
        {
            id: 2,
            title: 'تقرير المستفيدين',
            type: 'beneficiaries',
            period: 'الربع الأول 2024',
            generated: '2024-01-15',
            icon: 'fa-solid fa-users',
            color: 'primary'
        },
        {
            id: 3,
            title: 'تقرير المشاريع',
            type: 'projects',
            period: 'السنة المالية 2023',
            generated: '2024-01-01',
            icon: 'fa-solid fa-folder-open',
            color: 'warning'
        },
        {
            id: 4,
            title: 'التقرير المالي',
            type: 'finance',
            period: 'ديسمبر 2023',
            generated: '2024-01-05',
            icon: 'fa-solid fa-chart-pie',
            color: 'info'
        },
    ];

    const quickStats = [
        { label: 'إجمالي التبرعات', value: formatCurrency(15234567), change: '+15%', positive: true },
        { label: 'عدد المتبرعين', value: '1,245', change: '+8%', positive: true },
        { label: 'المستفيدين الجدد', value: '342', change: '+22%', positive: true },
        { label: 'المشاريع المكتملة', value: '18', change: '+3', positive: true },
    ];

    const reportTypes = [
        { title: 'تقرير التبرعات', desc: 'تحليل شامل للتبرعات والمتبرعين', icon: 'fa-solid fa-coins', color: 'success' },
        { title: 'تقرير المستفيدين', desc: 'إحصائيات المستفيدين والحالات', icon: 'fa-solid fa-users', color: 'primary' },
        { title: 'تقرير المشاريع', desc: 'أداء المشاريع ونسب الإنجاز', icon: 'fa-solid fa-folder-open', color: 'warning' },
        { title: 'التقرير المالي', desc: 'الإيرادات والمصروفات والميزانية', icon: 'fa-solid fa-chart-pie', color: 'info' },
    ];

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
                        التقارير والإحصائيات
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        تقارير شاملة عن أداء الجمعية
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<i className="fa-solid fa-chart-pie"></i>}
                >
                    إنشاء تقرير جديد
                </Button>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={2}>
                {quickStats.map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {stat.label}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                    {stat.value}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: stat.positive ? 'success.main' : 'error.main',
                                        bgcolor: alpha(stat.positive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontWeight: 'medium'
                                    }}
                                >
                                    {stat.change}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Report Types */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>إنشاء تقرير سريع</Typography>
                <Grid container spacing={2}>
                    {reportTypes.map((type, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card
                                elevation={0}
                                sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    height: '100%',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: `${type.color}.main`,
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[2]
                                    }
                                }}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                                    <Box sx={{
                                        fontSize: 32,
                                        color: `${type.color}.main`,
                                        bgcolor: alpha(theme.palette[type.color].main, 0.1),
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className={type.icon}></i>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {type.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {type.desc}
                                        </Typography>
                                    </Box>
                                    <Button variant="outlined" size="small" color={type.color} fullWidth>
                                        إنشاء
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Recent Reports */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>التقارير الأخيرة</Typography>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                        {reports.map((report) => (
                            <Box
                                key={report.id}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette[report.color].main, 0.1),
                                        color: `${report.color}.main`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 18
                                    }}>
                                        <i className={report.icon}></i>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {report.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {report.period} • تم الإنشاء {report.generated}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" startIcon={<i className="fa-solid fa-eye"></i>} color="inherit">
                                        عرض
                                    </Button>
                                    <Button size="small" startIcon={<i className="fa-solid fa-download"></i>} color="inherit">
                                        تحميل
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Card>
            </Box>
        </Box>
    );
}

export default AdminReports;

import { Link } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
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
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency } from '../../i18n';

/**
 * Admin Dashboard - Main overview page
 */
function Dashboard() {
    const theme = useTheme();

    // Mock KPI data
    const kpis = [
        {
            label: t('admin.totalRevenue'),
            value: formatCurrency(2450000),
            change: '+12%',
            trend: 'up',
            icon: 'fa-solid fa-coins',
            color: 'success'
        },
        {
            label: t('admin.activeProjects'),
            value: '24',
            change: '+3',
            trend: 'up',
            icon: 'fa-solid fa-clipboard-list',
            color: 'primary'
        },
        {
            label: t('admin.pendingCases'),
            value: '18',
            change: '-5',
            trend: 'down',
            icon: 'fa-solid fa-users',
            color: 'warning'
        },
        {
            label: t('admin.monthlyDonations'),
            value: formatCurrency(485000),
            change: '+8%',
            trend: 'up',
            icon: 'fa-solid fa-chart-line',
            color: 'info'
        },
    ];

    // Mock recent donations
    const recentDonations = [
        { id: 1, donor: 'أحمد محمد', amount: 500, project: 'كسوة الشتاء', time: 'منذ 5 دقائق', type: 'صدقة' },
        { id: 2, donor: 'سارة علي', amount: 1000, project: 'كفالة الأيتام', time: 'منذ 15 دقيقة', type: 'زكاة' },
        { id: 3, donor: 'محمود حسن', amount: 200, project: 'تبرع عام', time: 'منذ 30 دقيقة', type: 'صدقة' },
        { id: 4, donor: 'فاطمة أحمد', amount: 2000, project: 'إفطار الصائمين', time: 'منذ ساعة', type: 'وقف' },
        { id: 5, donor: 'خالد عبدالله', amount: 350, project: 'القافلة الطبية', time: 'منذ ساعتين', type: 'صدقة' },
    ];

    // Mock pending tasks
    const pendingTasks = [
        { id: 1, title: 'مراجعة طلب استحقاق جديد', priority: 'high', assignee: 'سارة' },
        { id: 2, title: 'اعتماد صرف دفعة مشروع الشتاء', priority: 'medium', assignee: 'أحمد' },
        { id: 3, title: 'تحديث بيانات 5 مستفيدين', priority: 'low', assignee: 'محمد' },
        { id: 4, title: 'مراجعة تقرير الربع الثالث', priority: 'medium', assignee: 'فاطمة' },
    ];

    // Mock recent activity
    const activities = [
        { id: 1, action: 'تمت إضافة مشروع جديد', user: 'محمد أحمد', time: 'منذ 10 دقائق', icon: 'fa-solid fa-plus', color: 'primary' },
        { id: 2, action: 'تم اعتماد طلب استحقاق', user: 'سارة علي', time: 'منذ 30 دقيقة', icon: 'fa-solid fa-check', color: 'success' },
        { id: 3, action: 'تم تحديث بيانات مستفيد', user: 'أحمد خالد', time: 'منذ ساعة', icon: 'fa-solid fa-pen', color: 'info' },
        { id: 4, action: 'تم إغلاق دفعة توزيع', user: 'فاطمة حسن', time: 'منذ ساعتين', icon: 'fa-solid fa-box', color: 'warning' },
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Page Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {t('admin.dashboard')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        مرحباً بك، محمد <i className="fa-regular fa-hand"></i>
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<i className="fa-solid fa-download"></i>}>
                    تصدير التقرير
                </Button>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={2}>
                {kpis.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette[kpi.color].main, 0.1),
                                        color: `${kpi.color}.main`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20
                                    }}>
                                        <i className={kpi.icon}></i>
                                    </Box>
                                    <Chip
                                        label={`${kpi.change} من الشهر الماضي`}
                                        size="small"
                                        color={kpi.trend === 'up' ? 'success' : 'error'}
                                        variant="soft"
                                        sx={{ height: 20, fontSize: 10 }}
                                    />
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {kpi.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {kpi.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Main Grid */}
            <Grid container spacing={3}>
                {/* Recent Donations and Pending Tasks */}
                <Grid item xs={12} lg={8}>
                    <Stack spacing={3}>
                        {/* Recent Donations */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.recentDonations')}</Typography>
                                <Button component={Link} to="/admin/donations" size="small">عرض الكل</Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell>المتبرع</TableCell>
                                            <TableCell>المبلغ</TableCell>
                                            <TableCell>المشروع</TableCell>
                                            <TableCell>النوع</TableCell>
                                            <TableCell>الوقت</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentDonations.map(donation => (
                                            <TableRow key={donation.id} hover>
                                                <TableCell sx={{ fontWeight: 'medium' }}>{donation.donor}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                    {formatCurrency(donation.amount)}
                                                </TableCell>
                                                <TableCell>{donation.project}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={donation.type}
                                                        size="small"
                                                        color={donation.type === 'زكاة' ? 'primary' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                    {donation.time}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>

                        {/* Quick Actions */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.quickActions')}</Typography>
                            </Box>
                            <CardContent>
                                <Grid container spacing={2}>
                                    {[
                                        { label: t('admin.addProject'), icon: 'fa-solid fa-clipboard-list', link: '/admin/projects/new', color: 'primary' },
                                        { label: t('admin.addProgram'), icon: 'fa-solid fa-folder-open', link: '/admin/programs/new', color: 'secondary' },
                                        { label: t('admin.viewReports'), icon: 'fa-solid fa-chart-line', link: '/admin/reports', color: 'info' },
                                        { label: t('admin.manageUsers'), icon: 'fa-solid fa-users', link: '/admin/settings/users', color: 'success' },
                                    ].map((action, i) => (
                                        <Grid item xs={6} sm={3} key={i}>
                                            <Button
                                                component={Link}
                                                to={action.link}
                                                variant="outlined"
                                                color="inherit"
                                                fullWidth
                                                sx={{
                                                    py: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1,
                                                    height: '100%',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        borderColor: `${action.color}.main`,
                                                        color: `${action.color}.main`,
                                                        bgcolor: alpha(theme.palette[action.color].main, 0.04)
                                                    }
                                                }}
                                            >
                                                <Box sx={{ fontSize: 24, mb: 0.5 }}><i className={action.icon}></i></Box>
                                                <Typography variant="body2" fontWeight="medium">{action.label}</Typography>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Sidebar: Pending Tasks & Activity */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Pending Tasks */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">المهام المعلقة</Typography>
                                <Chip label={pendingTasks.length} size="small" color="error" />
                            </Box>
                            <List disablePadding>
                                {pendingTasks.map((task, i) => (
                                    <ListItem
                                        key={task.id}
                                        divider={i !== pendingTasks.length - 1}
                                        secondaryAction={
                                            <IconButton edge="end" size="small" color="success">
                                                <i className="fa-regular fa-square-check"></i>
                                            </IconButton>
                                        }
                                    >
                                        <Box sx={{
                                            width: 4,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: `${getPriorityColor(task.priority)}.main`,
                                            mr: 2
                                        }} />
                                        <ListItemText
                                            primary={task.title}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                            secondary={`← ${task.assignee}`}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>

                        {/* Recent Activity */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.recentActivity')}</Typography>
                            </Box>
                            <List disablePadding>
                                {activities.map((activity, i) => (
                                    <ListItem key={activity.id} alignItems="flex-start">
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette[activity.color].main, 0.1), color: `${activity.color}.main`, fontSize: 14 }}>
                                                <i className={activity.icon}></i>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={activity.action}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                            secondary={
                                                <Stack direction="row" spacing={1} component="span" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                                                    <span>{activity.user}</span>
                                                    <span>•</span>
                                                    <span>{activity.time}</span>
                                                </Stack>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;

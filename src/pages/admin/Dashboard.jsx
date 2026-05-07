import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Stack, IconButton, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, useTheme, alpha, Snackbar, Alert
} from '@mui/material';
import { t, formatCurrency } from '../../i18n';
import { AdminPageHeader, AdminStatsGrid } from '../../components/admin';
import { getPriorityColor } from '../../utils/admin.helpers';
import { useAdminData } from '../../contexts/AdminDataContext';
import { dashboardPendingTasks, dashboardActivities } from '../../data/adminMockData';

/**
 * Dashboard — reads all stats from shared AdminDataContext (real data)
 */
function Dashboard() {
    const theme = useTheme();
    const { state, dashboardStats } = useAdminData();

    const [tasks, setTasks] = useState(dashboardPendingTasks);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '' });

    const handleCompleteTask = useCallback((taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setSnackbar({ open: true, msg: 'تم إنهاء المهمة بنجاح ✓' });
    }, []);

    // Live KPIs derived from real context data
    const kpis = [
        {
            label: 'إجمالي التبرعات',
            value: formatCurrency(dashboardStats.totalRevenue),
            icon: 'fa-solid fa-coins',
            color: 'success',
            change: `${state.donations.length} تبرع`,
        },
        {
            label: 'المشاريع النشطة',
            value: String(dashboardStats.activeProjects),
            icon: 'fa-solid fa-clipboard-list',
            color: 'primary',
            change: `من أصل ${dashboardStats.totalProjects} مشروع`,
        },
        {
            label: 'البرامج المفعّلة',
            value: String(state.programs.filter(p => !p.status || p.status === 'active').length),
            icon: 'fa-solid fa-folder-open',
            color: 'info',
            change: `الكل: ${state.programs.length}`,
        },
        {
            label: 'الحالات الأشد احتياجاً',
            value: String(state.projects.filter(p => p.featured).length),
            icon: 'fa-solid fa-star',
            color: 'warning',
            change: 'مميزة في الرئيسية',
        },
    ];

    const quickActions = [
        { label: t('admin.addProject'), icon: 'fa-solid fa-clipboard-list', link: '/admin/projects', color: 'primary' },
        { label: t('admin.addProgram'), icon: 'fa-solid fa-folder-open', link: '/admin/programs', color: 'secondary' },
        { label: t('admin.viewReports'), icon: 'fa-solid fa-chart-line', link: '/admin/reports', color: 'info' },
        { label: t('admin.manageUsers'), icon: 'fa-solid fa-users', link: '/admin/settings', color: 'success' },
    ];

    // Most recent 5 donations from context
    const recentDonations = [...state.donations].reverse().slice(0, 5);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.dashboard')}
                subtitle="مرحباً بك في لوحة تحكم جمعية نور الخيرية 👋"
                secondaryAction={{ label: t('admin.exportReport'), icon: 'fa-solid fa-download', onClick: () => setSnackbar({ open: true, msg: 'جاري تصدير التقرير...' }) }}
            />

            <AdminStatsGrid stats={kpis} columns={3} />

            <Grid container spacing={3}>
                {/* Recent Donations + Quick Actions */}
                <Grid item xs={12} lg={8}>
                    <Stack spacing={3}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.recentDonations')}</Typography>
                                <Button component={Link} to="/admin/donations" size="small">{t('admin.viewAllBtn')}</Button>
                            </Box>
                            {recentDonations.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                    <Typography variant="body2">لا توجد تبرعات بعد</Typography>
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.donationsPage.donor')}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.donationsPage.amount')}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.donationsPage.project')}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>طريقة الدفع</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.donationsPage.date')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentDonations.map(donation => (
                                                <TableRow key={donation.id} hover>
                                                    <TableCell sx={{ fontWeight: 'medium' }}>{donation.donor}</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>{formatCurrency(donation.amount)}</TableCell>
                                                    <TableCell>{donation.project}</TableCell>
                                                    <TableCell>{donation.method}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{donation.date || donation.time}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Card>

                        {/* Quick Actions */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.quickActions')}</Typography>
                            </Box>
                            <CardContent>
                                <Grid container spacing={2}>
                                    {quickActions.map((action, i) => (
                                        <Grid item xs={6} sm={3} key={i}>
                                            <Button
                                                component={Link} to={action.link} variant="outlined" color="inherit" fullWidth
                                                sx={{
                                                    py: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        borderColor: `${action.color}.main`, color: `${action.color}.main`,
                                                        bgcolor: alpha(theme.palette[action.color].main, 0.04)
                                                    }
                                                }}
                                            >
                                                <Box sx={{ fontSize: 24, mb: 0.5 }}><i className={action.icon} /></Box>
                                                <Typography variant="body2" fontWeight="medium">{action.label}</Typography>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Pending Tasks */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.pendingTasks')}</Typography>
                                <Chip label={tasks.length} size="small" color={tasks.length > 0 ? 'error' : 'success'} />
                            </Box>
                            {tasks.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">لا توجد مهام معلقة ✓</Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {tasks.map((task, i) => (
                                        <ListItem
                                            key={task.id}
                                            divider={i !== tasks.length - 1}
                                            secondaryAction={
                                                <IconButton edge="end" size="small" color="success" onClick={() => handleCompleteTask(task.id)}>
                                                    <i className="fa-regular fa-square-check" />
                                                </IconButton>
                                            }
                                        >
                                            <Box sx={{ width: 4, height: 40, borderRadius: 1, bgcolor: `${getPriorityColor(task.priority)}.main`, mr: 2 }} />
                                            <ListItemText
                                                primary={task.title}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                                secondary={`← ${task.assignee}`}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Card>

                        {/* Summary stats */}
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">ملخص البيانات</Typography>
                            </Box>
                            <List disablePadding>
                                {[
                                    { label: 'إجمالي المشاريع', value: state.projects.length, icon: 'fa-solid fa-clipboard-list', color: 'primary' },
                                    { label: 'مشاريع مكتملة', value: state.projects.filter(p => p.status === 'completed').length, icon: 'fa-solid fa-circle-check', color: 'success' },
                                    { label: 'حالات عاجلة مميزة', value: state.projects.filter(p => p.featured).length, icon: 'fa-solid fa-star', color: 'warning' },
                                    { label: 'عدد البرامج', value: state.programs.length, icon: 'fa-solid fa-folder-open', color: 'info' },
                                    { label: 'المتبرعون الفريدون', value: dashboardStats.totalDonors, icon: 'fa-solid fa-users', color: 'secondary' },
                                ].map((item, i) => (
                                    <ListItem key={i} divider={i !== 4}>
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.1), color: `${item.color}.main`, fontSize: 14 }}>
                                                <i className={item.icon} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                        <Typography variant="h6" fontWeight="bold" color={`${item.color}.main`}>{item.value}</Typography>
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
                                {dashboardActivities.map((activity) => (
                                    <ListItem key={activity.id} alignItems="flex-start">
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette[activity.color].main, 0.1), color: `${activity.color}.main`, fontSize: 14 }}>
                                                <i className={activity.icon} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={activity.action}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                            secondary={
                                                <Stack direction="row" spacing={1} component="span" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                                                    <span>{activity.user}</span><span>•</span><span>{activity.time}</span>
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

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, msg: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;

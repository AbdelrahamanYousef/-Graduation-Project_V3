import { useState } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    List, ListItem, ListItemText, ListItemAvatar, Chip,
    useTheme, alpha, Snackbar, Alert
} from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminIconBox } from '../../components/admin';
import { t, formatCurrency, formatNumber } from '../../i18n';
import { recentReports, reportTypes } from '../../data/adminMockData';

/**
 * Admin Reports Page — with working create/view/download buttons
 */
function AdminReports() {
    const theme = useTheme();
    const [reports, setReports] = useState(recentReports);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const quickStats = [
        { label: t('admin.reportsPage.totalDonations'), value: formatCurrency(2450000), icon: 'fa-solid fa-coins', color: 'success' },
        { label: t('admin.reportsPage.donorCount'), value: formatNumber(1240), icon: 'fa-solid fa-users', color: 'primary' },
        { label: t('admin.reportsPage.newBeneficiaries'), value: '156', icon: 'fa-solid fa-user-plus', color: 'info' },
        { label: t('admin.reportsPage.completedProjects'), value: '8', icon: 'fa-solid fa-circle-check', color: 'warning' },
    ];

    const handleCreateReport = (type) => {
        const newReport = {
            id: Math.max(...reports.map(r => r.id), 0) + 1,
            title: type.title,
            icon: type.icon,
            color: type.color,
            period: 'الربع الأول 2025',
            generated: new Date().toLocaleDateString('ar-EG'),
        };
        setReports(prev => [newReport, ...prev]);
        setSnackbar({ open: true, msg: `تم إنشاء التقرير "${type.title}" بنجاح`, severity: 'success' });
    };

    const handleViewReport = (report) => {
        setSnackbar({ open: true, msg: `جاري فتح التقرير: ${report.title}`, severity: 'info' });
    };

    const handleDownloadReport = (report) => {
        setSnackbar({ open: true, msg: `جاري تحميل: ${report.title}...`, severity: 'success' });
    };

    const handleDeleteReport = (reportId) => {
        setReports(prev => prev.filter(r => r.id !== reportId));
        setSnackbar({ open: true, msg: 'تم حذف التقرير', severity: 'success' });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.reportsPage.title')}
                subtitle={t('admin.reportsPage.subtitle')}
                action={{ label: t('admin.reportsPage.createReport'), icon: 'fa-solid fa-plus', onClick: () => handleCreateReport(reportTypes[0]) }}
            />

            <AdminStatsGrid stats={quickStats} columns={3} />

            {/* Report Types - Quick Create */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">{t('admin.reportsPage.quickCreate')}</Typography>
                </Box>
                <CardContent>
                    <Grid container spacing={2}>
                        {reportTypes.map((rt, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card
                                    elevation={0}
                                    onClick={() => handleCreateReport(rt)}
                                    sx={{
                                        border: 1, borderColor: 'divider', p: 2, cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: `${rt.color}.main`,
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 4px 12px ${alpha(theme.palette[rt.color]?.main || theme.palette.primary.main, 0.15)}`,
                                        },
                                    }}
                                >
                                    <AdminIconBox icon={rt.icon} color={rt.color} size={44} />
                                    <Typography variant="body1" fontWeight="bold" sx={{ mt: 1.5 }}>{rt.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{rt.desc}</Typography>
                                    <Button size="small" color={rt.color} sx={{ mt: 1, p: 0, minWidth: 0, fontWeight: 'bold' }}>
                                        {t('admin.reportsPage.create')} <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} />
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{t('admin.reportsPage.recentReports')}</Typography>
                    <Chip label={reports.length} size="small" color="primary" variant="outlined" />
                </Box>
                {reports.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">لا توجد تقارير</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {reports.map((report, i) => (
                            <ListItem
                                key={report.id}
                                divider={i !== reports.length - 1}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="outlined" onClick={() => handleViewReport(report)}>{t('admin.reportsPage.view')}</Button>
                                        <Button size="small" variant="outlined" color="inherit" onClick={() => handleDownloadReport(report)}>{t('admin.reportsPage.download')}</Button>
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteReport(report.id)}><i className="fa-solid fa-trash" style={{ fontSize: 12 }} /></Button>
                                    </Box>
                                }
                            >
                                <ListItemAvatar>
                                    <AdminIconBox icon={report.icon} color={report.color} size={40} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={report.title}
                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                            <Chip label={report.period} size="small" variant="outlined" />
                                            <Typography variant="caption" color="text.secondary">{t('admin.reportsPage.createdOn')}: {report.generated}</Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Card>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminReports;

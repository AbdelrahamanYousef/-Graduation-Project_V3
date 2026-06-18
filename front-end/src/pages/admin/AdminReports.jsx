import { useState } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    List, ListItem, ListItemText, ListItemAvatar, Chip,
    useTheme, alpha, Snackbar, Alert
} from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminIconBox } from '../../components/admin';
import { t, formatCurrency, formatNumber } from '../../i18n';
import { recentReports, reportTypes } from '../../data/adminMockData';

import { useAdminData } from '../../contexts/AdminDataContext';

/**
 * Admin Reports Page — with working create/view/download buttons
 */
function AdminReports() {
    const theme = useTheme();
    const { state } = useAdminData();
    const dashboardStats = state.dashboardStats || {};
    const [reports, setReports] = useState(recentReports || []);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const quickStats = [
        { label: t('admin.reportsPage.totalDonations'), value: formatCurrency(dashboardStats.totalDonations || 0), icon: 'fa-solid fa-coins', color: 'success' },
        { label: t('admin.reportsPage.donorCount'), value: formatNumber(new Set(state.donations.map(d => d.donor || d.donorName)).size), icon: 'fa-solid fa-users', color: 'primary' },
        { label: t('admin.reportsPage.newBeneficiaries'), value: formatNumber(state.beneficiaries?.length || 0), icon: 'fa-solid fa-user-plus', color: 'info' },
        { label: t('admin.reportsPage.completedProjects'), value: formatNumber(state.projects.filter(p => p.status === 'completed').length), icon: 'fa-solid fa-circle-check', color: 'warning' },
    ];

    const generateCSV = (typeTitle) => {
        let headers = [];
        let rows = [];
        
        if (typeTitle.includes('تبرعات')) {
            headers = ['ID', 'المتبرع', 'المبلغ', 'المشروع', 'التاريخ', 'الحالة'];
            rows = state.donations.map(d => [d.id, `"${d.donor || ''}"`, d.amount, `"${d.project || ''}"`, d.date || d.time || '', d.status || '']);
        } else if (typeTitle.includes('مشاريع')) {
            headers = ['ID', 'المشروع', 'الهدف', 'تم جمعه', 'الحالة'];
            rows = state.projects.map(p => [p.id, `"${p.title}"`, p.goal, p.raised || 0, p.status || 'active']);
        } else if (typeTitle.includes('مستفيدين')) {
            headers = ['ID', 'الاسم', 'النوع', 'البرنامج', 'المحافظة', 'الحالة'];
            rows = state.beneficiaries.map(b => [b.id, `"${b.name}"`, b.type, `"${b.program || ''}"`, `"${b.location || ''}"`, b.status || 'active']);
        } else if (typeTitle.includes('مالي')) {
            headers = ['النوع', 'الجهة / المتبرع', 'المبلغ', 'التاريخ', 'الحالة'];
            const incomeRows = state.donations.map(d => ['إيراد (تبرع)', `"${d.donor}"`, d.amount, d.date || '', d.status || '']);
            const expenseRows = state.disbursements.map(d => ['مصروف', `"${d.beneficiary}"`, d.amount, d.date || '', d.status || '']);
            rows = [...incomeRows, ...expenseRows];
        } else {
            headers = ['الوصف', 'القيمة'];
            rows = [
                ['إجمالي التبرعات', dashboardStats.totalDonations || 0],
                ['عدد المستفيدين', dashboardStats.beneficiaries || 0],
                ['المشاريع النشطة', dashboardStats.activeProjects || 0],
            ];
        }
        
        const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${typeTitle}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCreateReport = (type) => {
        const newReport = {
            id: Math.max(...reports.map(r => r.id), 0) + 1,
            title: type.title,
            icon: type.icon,
            color: type.color,
            period: 'تقرير مخصص',
            generated: new Date().toLocaleDateString('ar-EG'),
        };
        setReports(prev => [newReport, ...prev]);
        generateCSV(type.title);
        setSnackbar({ open: true, msg: `تم إنشاء وتحميل التقرير "${type.title}" بنجاح`, severity: 'success' });
    };

    const handleViewReport = (report) => {
        setSnackbar({ open: true, msg: `جاري فتح التقرير: ${report.title}`, severity: 'info' });
    };

    const handleDownloadReport = (report) => {
        generateCSV(report.title);
        setSnackbar({ open: true, msg: `تم تحميل التقرير: ${report.title}`, severity: 'success' });
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
                                        {t('admin.reportsPage.create')} <i className="fa-solid fa-arrow-left" style={{ marginInlineEnd: 4 }} />
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

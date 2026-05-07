import { useState, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, LinearProgress,
    useTheme, alpha, Snackbar, Alert
} from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { formatCurrency, t } from '../../i18n';
import { financeMonthlyData, financeDisbursements as initialDisbursements } from '../../data/adminMockData';

/**
 * Admin Finance Page — with approve/reject disbursements
 */
function AdminFinance() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('overview');
    const [disbursements, setDisbursements] = useState(initialDisbursements);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const totals = financeMonthlyData.reduce((acc, m) => ({
        income: acc.income + m.income,
        expenses: acc.expenses + m.expenses,
    }), { income: 0, expenses: 0 });

    const kpis = [
        { label: t('admin.financePage.totalIncome'), value: formatCurrency(totals.income), icon: 'fa-solid fa-arrow-trend-up', color: 'success', change: '+12%' },
        { label: t('admin.financePage.totalExpenses'), value: formatCurrency(totals.expenses), icon: 'fa-solid fa-arrow-trend-down', color: 'error', change: '+8%', trend: 'up' },
        { label: t('admin.financePage.availableBalance'), value: formatCurrency(totals.income - totals.expenses), icon: 'fa-solid fa-wallet', color: 'primary' },
        { label: t('admin.financePage.pendingRequests'), value: String(disbursements.filter(d => d.status === 'pending').length), icon: 'fa-solid fa-clock', color: 'warning' },
    ];

    const tabs = [
        { label: t('admin.financePage.overview'), value: 'overview' },
        { label: `${t('admin.financePage.disbursements')} (${disbursements.length})`, value: 'disbursements' },
        { label: t('admin.financePage.budgets'), value: 'budgets' },
    ];

    const handleApprove = useCallback((row) => {
        setDisbursements(prev => prev.map(d => d.id === row.id ? { ...d, status: 'approved' } : d));
        setSnackbar({ open: true, msg: `تم اعتماد صرف ${formatCurrency(row.amount)} لـ "${row.beneficiary}"`, severity: 'success' });
    }, []);

    const handleViewDisbursement = useCallback((row) => {
        setSnackbar({ open: true, msg: `عرض تفاصيل: ${row.beneficiary} — ${formatCurrency(row.amount)}`, severity: 'info' });
    }, []);

    const disbursementColumns = [
        { key: 'beneficiary', label: t('admin.financePage.beneficiary'), fontWeight: 'medium' },
        { key: 'type', label: t('admin.financePage.type') },
        { key: 'amount', label: t('admin.financePage.amount'), render: (v) => formatCurrency(v), fontWeight: 'bold', color: 'primary.main' },
        { key: 'date', label: t('admin.financePage.date') },
        { key: 'status', label: t('admin.financePage.status'), type: 'status' },
    ];

    const disbursementActions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => handleViewDisbursement(row) },
        { icon: 'fa-solid fa-check', tooltip: 'اعتماد', show: (row) => row.status === 'pending', color: 'success', onClick: (row) => handleApprove(row) },
        { icon: 'fa-solid fa-xmark', tooltip: 'رفض', show: (row) => row.status === 'pending', color: 'error', onClick: (row) => {
            setDisbursements(prev => prev.map(d => d.id === row.id ? { ...d, status: 'inactive' } : d));
            setSnackbar({ open: true, msg: `تم رفض طلب الصرف`, severity: 'warning' });
        }},
    ];

    const maxValue = Math.max(...financeMonthlyData.flatMap(m => [m.income, m.expenses]));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.financePage.title')}
                subtitle={t('admin.financePage.subtitle')}
                action={{ label: t('admin.financePage.newDisbursement'), icon: 'fa-solid fa-plus', onClick: () => setSnackbar({ open: true, msg: 'نموذج طلب الصرف — قريباً', severity: 'info' }) }}
                secondaryAction={{ label: t('admin.financePage.exportReport'), icon: 'fa-solid fa-download', onClick: () => setSnackbar({ open: true, msg: 'جاري تصدير التقرير المالي...', severity: 'success' }) }}
            />

            <AdminStatsGrid stats={kpis} columns={3} />

            <AdminFilterBar tabs={tabs} activeTab={activeTab} onTabChange={(_, v) => setActiveTab(v)} />

            {activeTab === 'overview' && (
                <>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">{t('admin.financePage.monthlyChart')}</Typography>
                        </Box>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                {financeMonthlyData.map((m) => (
                                    <Box key={m.month} sx={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'flex-end', height: 120, mb: 1 }}>
                                            <Box sx={{ width: 24, bgcolor: alpha(theme.palette.success.main, 0.8), borderRadius: '4px 4px 0 0', height: `${(m.income / maxValue) * 100}%`, transition: 'height 0.5s ease' }} />
                                            <Box sx={{ width: 24, bgcolor: alpha(theme.palette.error.main, 0.6), borderRadius: '4px 4px 0 0', height: `${(m.expenses / maxValue) * 100}%`, transition: 'height 0.5s ease' }} />
                                        </Box>
                                        <Typography variant="caption" fontWeight="medium">{m.month}</Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Typography variant="caption" display="block" color="success.main">{formatCurrency(m.income)}</Typography>
                                            <Typography variant="caption" display="block" color="error.main">{formatCurrency(m.expenses)}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
                                    <Typography variant="caption">{t('admin.financePage.income')}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 0.5 }} />
                                    <Typography variant="caption">{t('admin.financePage.expenses')}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={2}>
                        {[
                            { label: 'كفالة الأيتام', spent: 320000, total: 500000, color: 'primary' },
                            { label: 'الرعاية الصحية', spent: 180000, total: 300000, color: 'info' },
                            { label: 'الإغاثة العاجلة', spent: 450000, total: 600000, color: 'error' },
                        ].map((budget, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">{budget.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatCurrency(budget.spent)} {t('admin.financePage.of')} {formatCurrency(budget.total)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={Math.round((budget.spent / budget.total) * 100)} color={budget.color} sx={{ height: 8, borderRadius: 1, mb: 0.5 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block' }}>
                                        {t('admin.financePage.spent')}: {Math.round((budget.spent / budget.total) * 100)}%
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {activeTab === 'disbursements' && (
                <AdminDataTable columns={disbursementColumns} data={disbursements} actions={disbursementActions} />
            )}

            {activeTab === 'budgets' && (
                <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                    {t('admin.financePage.budgets')} — قريباً...
                </Typography>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminFinance;

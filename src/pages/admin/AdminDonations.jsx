import { useState, useMemo } from 'react';
import { Box, TextField, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Chip, Divider } from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatCurrency, formatDate, t } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';

/**
 * Admin Donations Page — with search, filters, view details, and export
 */
function AdminDonations() {
    const { state } = useAdminData();
    const donations = state.donations;
    const [dateRange, setDateRange] = useState('all');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [viewDonation, setViewDonation] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '' });

    // Apply filters
    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            if (search && !d.donor.includes(search) && !String(d.id).includes(search)) return false;
            if (statusFilter && d.status !== statusFilter) return false;
            if (projectFilter && d.project !== projectFilter) return false;
            return true;
        });
    }, [donations, search, statusFilter, projectFilter]);

    const stats = useMemo(() => {
        const total = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
        return {
            total,
            count: filteredDonations.length,
            avgAmount: filteredDonations.length ? Math.round(total / filteredDonations.length) : 0,
        };
    }, [filteredDonations]);

    const kpis = [
        { label: t('admin.donationsPage.totalDonations'), value: formatCurrency(stats.total), color: 'success', icon: 'fa-solid fa-coins' },
        { label: t('admin.donationsPage.donationCount'), value: String(stats.count), color: 'primary', icon: 'fa-solid fa-hashtag' },
        { label: t('admin.donationsPage.avgDonation'), value: formatCurrency(stats.avgAmount), color: 'info', icon: 'fa-solid fa-chart-simple' },
    ];

    const uniqueProjects = [...new Set(donations.map(d => d.project))];

    const columns = [
        { key: 'id', label: t('admin.donationsPage.donationId'), render: (v) => `#${String(v).padStart(5, '0')}`, sx: { fontFamily: 'monospace', color: 'text.secondary' } },
        { key: 'donor', label: t('admin.donationsPage.donor'), fontWeight: 'medium' },
        { key: 'project', label: t('admin.donationsPage.project') },
        { key: 'amount', label: t('admin.donationsPage.amount'), render: (v) => formatCurrency(v), fontWeight: 'bold', color: 'primary.main' },
        { key: 'method', label: t('admin.donationsPage.paymentMethod') },
        { key: 'date', label: t('admin.donationsPage.date'), render: (v) => formatDate(v) },
        { key: 'status', label: t('admin.donationsPage.status'), type: 'status' },
    ];

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => setViewDonation(row) },
        { icon: 'fa-solid fa-file-lines', tooltip: 'إيصال', onClick: () => setSnackbar({ open: true, msg: 'جاري تحميل الإيصال...' }) },
    ];

    const handleExport = () => {
        setSnackbar({ open: true, msg: `جاري تصدير ${filteredDonations.length} تبرع إلى Excel...` });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.donationsPage.title')}
                subtitle={t('admin.donationsPage.subtitle')}
                secondaryAction={{ label: t('admin.donationsPage.exportExcel'), icon: 'fa-solid fa-download', onClick: handleExport }}
            />

            <AdminStatsGrid stats={kpis} columns={4} />

            <AdminFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t('admin.donationsPage.searchPlaceholder')}
            >
                <TextField select size="small" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} sx={{ minWidth: 180 }} label={t('admin.donationsPage.project')}>
                    <MenuItem value="">{t('admin.donationsPage.allProjects')}</MenuItem>
                    {uniqueProjects.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }} label={t('admin.donationsPage.status')}>
                    <MenuItem value="">{t('admin.donationsPage.allStatuses')}</MenuItem>
                    <MenuItem value="completed">مكتمل</MenuItem>
                    <MenuItem value="pending">قيد المعالجة</MenuItem>
                    <MenuItem value="refunded">مسترد</MenuItem>
                </TextField>
                <TextField select size="small" value={dateRange} onChange={(e) => setDateRange(e.target.value)} sx={{ minWidth: 150 }} label={t('admin.donationsPage.period')}>
                    <MenuItem value="all">{t('admin.donationsPage.allPeriods')}</MenuItem>
                    <MenuItem value="today">{t('admin.donationsPage.today')}</MenuItem>
                    <MenuItem value="week">{t('admin.donationsPage.thisWeek')}</MenuItem>
                    <MenuItem value="month">{t('admin.donationsPage.thisMonth')}</MenuItem>
                </TextField>
            </AdminFilterBar>

            <AdminDataTable columns={columns} data={filteredDonations} actions={actions} emptyMessage="لا توجد تبرعات مطابقة للبحث" />

            {/* View Donation Dialog */}
            <Dialog open={!!viewDonation} onClose={() => setViewDonation(null)} maxWidth="sm" fullWidth>
                {viewDonation && (
                    <>
                        <DialogTitle>تفاصيل التبرع #{String(viewDonation.id).padStart(5, '0')}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">المتبرع</Typography>
                                    <Typography fontWeight="bold">{viewDonation.donor}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">المبلغ</Typography>
                                    <Typography fontWeight="bold" color="primary">{formatCurrency(viewDonation.amount)}</Typography>
                                </Grid>
                                <Grid item xs={12}><Divider /></Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">المشروع</Typography>
                                    <Typography>{viewDonation.project}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">طريقة الدفع</Typography>
                                    <Typography>{viewDonation.method}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">التاريخ</Typography>
                                    <Typography>{formatDate(viewDonation.date)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">الحالة</Typography>
                                    <Box sx={{ mt: 0.5 }}><Chip label={viewDonation.status === 'completed' ? 'مكتمل' : viewDonation.status === 'pending' ? 'قيد المعالجة' : 'مسترد'} color={viewDonation.status === 'completed' ? 'success' : viewDonation.status === 'pending' ? 'warning' : 'error'} size="small" /></Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewDonation(null)}>إغلاق</Button>
                            <Button variant="contained" onClick={() => { setViewDonation(null); setSnackbar({ open: true, msg: 'جاري تحميل الإيصال...' }); }}>تحميل الإيصال</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, msg: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminDonations;

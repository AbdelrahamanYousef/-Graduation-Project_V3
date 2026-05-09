import { useState, useMemo } from 'react';
import { Box, TextField, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Grid, Chip, Divider, Select, FormControl } from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { formatCurrency, formatDate, t } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';

/**
 * Admin Donations Page — with search, filters, view details, and export
 */
function AdminDonations() {
    const { state, dispatch } = useAdminData();
    const donations = state.donations;
    const [dateRange, setDateRange] = useState('all');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [viewDonation, setViewDonation] = useState(null);
    const [viewDonor, setViewDonor] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const emptyForm = { donor: '', amount: '', project: '', method: 'Cash (Offline)', status: 'completed' };
    const [formData, setFormData] = useState(emptyForm);

    // Apply filters
    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            if (search && !d.donor.includes(search) && !String(d.id).includes(search)) return false;
            if (statusFilter && d.status !== statusFilter) return false;
            if (projectFilter && d.project !== projectFilter) return false;
            if (dateRange !== 'all' && d.date) {
                const donDate = new Date(d.date);
                const today = new Date();
                if (dateRange === 'today' && donDate.toDateString() !== today.toDateString()) return false;
                if (dateRange === 'week' && (today - donDate) / (1000 * 60 * 60 * 24) > 7) return false;
                if (dateRange === 'month' && (today.getMonth() !== donDate.getMonth() || today.getFullYear() !== donDate.getFullYear())) return false;
            }
            return true;
        });
    }, [donations, search, statusFilter, projectFilter, dateRange]);

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
        { key: 'donor', label: t('admin.donationsPage.donor'), fontWeight: 'medium', render: (v) => <Typography sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }} onClick={() => setViewDonor(v)}>{v}</Typography> },
        { key: 'project', label: t('admin.donationsPage.project') },
        { key: 'amount', label: t('admin.donationsPage.amount'), render: (v) => formatCurrency(v), fontWeight: 'bold', color: 'primary.main' },
        { key: 'method', label: t('admin.donationsPage.paymentMethod') },
        { key: 'date', label: t('admin.donationsPage.date'), render: (v) => formatDate(v) },
        { 
            key: 'status', label: t('admin.donationsPage.status'), 
            render: (val, row) => (
                <FormControl size="small" variant="standard">
                    <Select
                        value={val || 'pending'}
                        onChange={(e) => handleStatusChange(row, e.target.value)}
                        disableUnderline
                        sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: val === 'completed' ? 'success.main' : val === 'rejected' ? 'error.main' : 'warning.main' }}
                    >
                        <MenuItem value="pending">قيد المعالجة</MenuItem>
                        <MenuItem value="completed">مكتمل</MenuItem>
                        <MenuItem value="rejected">مرفوض</MenuItem>
                        <MenuItem value="refunded">مسترد</MenuItem>
                    </Select>
                </FormControl>
            )
        },
    ];

    const handleStatusChange = (row, newStatus) => {
        dispatch(adminActions.updateDonation({ id: row.id, status: newStatus }));
        setSnackbar({ open: true, msg: `تم تغيير حالة التبرع إلى ${newStatus === 'completed' ? 'مكتمل' : newStatus === 'rejected' ? 'مرفوض' : newStatus === 'refunded' ? 'مسترد' : 'قيد المعالجة'}`, severity: 'success' });
    };

    const confirmDelete = () => {
        dispatch(adminActions.deleteDonation(deleteConfirm.id));
        setSnackbar({ open: true, msg: 'تم حذف التبرع بنجاح', severity: 'success' });
        setDeleteConfirm({ open: false, id: null });
    };

    const handleAddSubmit = () => {
        if (!formData.donor || !formData.amount || !formData.project) {
            setSnackbar({ open: true, msg: 'يرجى إدخال جميع الحقول الإلزامية' });
            return;
        }
        dispatch(adminActions.addDonation({
            id: Math.max(...donations.map(d => d.id), 0) + 1,
            ...formData,
            amount: Number(formData.amount),
            date: new Date().toISOString(),
        }));
        setSnackbar({ open: true, msg: 'تم إضافة التبرع بنجاح', severity: 'success' });
        setIsAddModalOpen(false);
        setFormData(emptyForm);
    };

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => setViewDonation(row) },
        { icon: 'fa-solid fa-trash', tooltip: 'حذف التبرع', color: 'error', onClick: (row) => setDeleteConfirm({ open: true, id: row.id }) },
    ];

    const handleExport = () => {
        setSnackbar({ open: true, msg: `جاري تصدير ${filteredDonations.length} تبرع إلى Excel...` });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.donationsPage.title')}
                subtitle={t('admin.donationsPage.subtitle')}
                action={{ label: 'إضافة تبرع يدوي', icon: 'fa-solid fa-plus', onClick: () => setIsAddModalOpen(true) }}
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

            {/* Add Offline Donation Dialog */}
            <AdminFormDialog
                open={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleAddSubmit}
                title="إضافة تبرع يدوي (أوفلاين)"
                submitLabel="إضافة التبرع"
            >
                <TextField label="اسم المتبرع" fullWidth required value={formData.donor} onChange={(e) => setFormData({ ...formData, donor: e.target.value })} />
                <TextField label="المبلغ (ج.م)" fullWidth required type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                <TextField select label="المشروع الموجه إليه" fullWidth required value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
                    {state.projects.map(p => <MenuItem key={p.id} value={p.title}>{p.title}</MenuItem>)}
                </TextField>
                <TextField label="طريقة الدفع" fullWidth disabled value={formData.method} />
            </AdminFormDialog>

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

            {/* Donor History Modal */}
            <Dialog open={!!viewDonor} onClose={() => setViewDonor(null)} maxWidth="md" fullWidth>
                <DialogTitle>سجل تبرعات: {viewDonor}</DialogTitle>
                <DialogContent dividers>
                    <AdminDataTable 
                        columns={columns.filter(c => c.key !== 'donor')} 
                        data={donations.filter(d => d.donor === viewDonor)} 
                        actions={[]} 
                        emptyMessage="لا توجد تبرعات" 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDonor(null)}>إغلاق</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من حذف هذا التبرع بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء وسيتم خصم المبلغ من إجمالي التبرعات.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, id: null })} color="inherit">إلغاء</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">حذف نهائياً</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, msg: '', severity: 'success' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity || 'success'} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminDonations;

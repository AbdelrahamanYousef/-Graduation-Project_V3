import { useState, useCallback } from 'react';
import { TextField, Box, Typography, useTheme, alpha, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { AdminPageHeader, AdminDataTable, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { t, formatCurrency } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';


/**
 * Admin Programs Page — Full CRUD, affects home page programs section
 */
function AdminPrograms() {
    const theme = useTheme();
    const { state, dispatch } = useAdminData();
    const programsList = state.programs;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [formData, setFormData] = useState({ name: '', nameEn: '', icon: '', color: '#0B6B6B', description: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, program: null });

    const resetForm = () => setFormData({ name: '', nameEn: '', icon: '', color: '#0B6B6B', description: '' });

    const handleAdd = () => {
        setSelectedProgram(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((program) => {
        setSelectedProgram(program);
        setFormData({
            name: program.name || '',
            nameEn: program.nameEn || '',
            icon: program.icon || '',
            color: program.color || '#0B6B6B',
            description: program.description || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((program) => {
        setDeleteConfirm({ open: true, program });
    }, []);

    const confirmDelete = () => {
        const { program } = deleteConfirm;
        if (!program) return;
        
        dispatch(adminActions.deleteProgram(program.id));
        setSnackbar({ open: true, msg: `تم حذف البرنامج "${program.name}" بنجاح`, severity: 'success' });
        setDeleteConfirm({ open: false, program: null });
    };

    const handleToggleStatus = useCallback((program) => {
        dispatch(adminActions.toggleProgramStatus(program.id));
        const nextStatus = program.status === 'active' ? 'inactive' : 'active';
        setSnackbar({
            open: true,
            msg: nextStatus === 'active'
                ? `تم تفعيل "${program.name}" — سيظهر في الصفحة الرئيسية`
                : `تم إيقاف "${program.name}" — لن يظهر في الصفحة الرئيسية`,
            severity: 'info'
        });
    }, [dispatch]);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال اسم البرنامج', severity: 'error' });
            return;
        }

        if (selectedProgram) {
            dispatch(adminActions.updateProgram({
                ...selectedProgram,
                name: formData.name,
                nameEn: formData.nameEn,
                icon: formData.icon,
                color: formData.color,
                description: formData.description,
            }));
            setSnackbar({ open: true, msg: `تم تحديث "${formData.name}" — تم التعديل في الصفحة الرئيسية`, severity: 'success' });
        } else {
            dispatch(adminActions.addProgram({
                id: Math.max(...programsList.map(p => p.id), 0) + 1,
                name: formData.name,
                nameEn: formData.nameEn,
                icon: formData.icon || 'fa-solid fa-folder',
                color: formData.color,
                description: formData.description,
                status: 'active',
            }));
            setSnackbar({ open: true, msg: `تم إضافة "${formData.name}" — ظهر في الصفحة الرئيسية`, severity: 'success' });
        }
        setIsModalOpen(false);
        resetForm();
    };

    const columns = [
        {
            key: 'name', label: t('admin.programsPage.program'),
            render: (_, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 1, bgcolor: alpha(row.color || theme.palette.primary.main, 0.1),
                        color: row.color || 'primary.main', fontSize: '1.25rem'
                    }}>
                        <i className={row.icon} />
                    </Box>
                    <Box>
                        <Box sx={{ fontWeight: 'medium' }}>{row.name}</Box>
                        {row.nameEn && <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.nameEn}</Box>}
                    </Box>
                </Box>
            ),
        },
        { key: 'projectCount', label: t('admin.programsPage.projectCount'), align: 'center', render: (val) => val || 0 },
        { key: 'raised', label: t('admin.programsPage.totalDonations'), align: 'right', render: (val) => formatCurrency(val || 0) },
        {
            key: 'status', label: t('admin.programsPage.status'), align: 'center',
            render: (val) => <AdminStatusChip status={val || 'active'} />,
        },
    ];

    const actions = [
        { icon: 'fa-solid fa-pen-to-square', tooltip: t('common.edit'), onClick: (row) => handleEdit(row), color: 'primary' },
        { icon: 'fa-solid fa-toggle-on', tooltip: 'تغيير الحالة / الظهور في الرئيسية', onClick: (row) => handleToggleStatus(row) },
        { icon: 'fa-solid fa-trash', tooltip: t('common.delete'), onClick: (row) => handleDelete(row), color: 'error' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.programsPage.title')}
                subtitle={t('admin.programsPage.subtitle')}
                action={{ label: t('admin.programsPage.addBtn'), icon: 'fa-solid fa-plus', onClick: handleAdd }}
            />

            <AdminDataTable columns={columns} data={programsList} actions={actions} />

            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                onSubmit={handleSubmit}
                title={selectedProgram ? t('admin.programsPage.editProgram') : t('admin.programsPage.addNew')}
                submitLabel={selectedProgram ? t('admin.programsPage.saveChanges') : t('admin.programsPage.add')}
            >
                <TextField
                    autoFocus label={t('admin.programsPage.nameLabel')} fullWidth required
                    value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <TextField
                    label="اسم البرنامج (إنجليزي)" fullWidth
                    value={formData.nameEn} onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                />
                <TextField
                    label={t('admin.programsPage.iconLabel')} fullWidth
                    value={formData.icon} onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder={t('admin.programsPage.iconPlaceholder')}
                    helperText={formData.icon && <Box sx={{ mt: 1 }}><i className={formData.icon} style={{ fontSize: 24 }} /> معاينة الأيقونة</Box>}
                />
                <TextField
                    label={t('admin.programsPage.colorLabel')} type="color" fullWidth
                    value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t('admin.programsPage.descLabel')} multiline rows={4} fullWidth
                    value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('admin.programsPage.descPlaceholder')}
                />
            </AdminFormDialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, program: null })}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من حذف برنامج "{deleteConfirm.program?.name}"؟
                        {deleteConfirm.program?.projectCount > 0 && (
                            <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
                                تحذير: هذا البرنامج يحتوي على {deleteConfirm.program.projectCount} مشاريع مرتبطة به! 
                            </Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, program: null })} color="inherit">إلغاء</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">حذف نهائياً</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminPrograms;

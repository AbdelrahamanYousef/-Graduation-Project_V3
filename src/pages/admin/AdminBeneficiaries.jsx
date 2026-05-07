import { useState, useCallback, useMemo } from 'react';
import { Box, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { beneficiariesList as initialBeneficiaries } from '../../data/adminMockData';
import { t } from '../../i18n';
import { countByStatus } from '../../utils/admin.helpers';

/**
 * Admin Beneficiaries Page — Full CRUD + filter + search
 */
function AdminBeneficiaries() {
    const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaries);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [tabFilter, setTabFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const emptyForm = { name: '', type: 'family', phone: '', nationalId: '', governorate: '', address: '', notes: '', program: '' };
    const [formData, setFormData] = useState(emptyForm);

    const filtered = useMemo(() =>
        beneficiaries
            .filter(b => tabFilter === 'all' || b.status === tabFilter)
            .filter(b => !search || b.name.includes(search)),
        [beneficiaries, tabFilter, search]
    );

    const handleAdd = () => {
        setEditItem(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((row) => {
        setEditItem(row);
        setFormData({
            name: row.name || '', type: row.type === 'أسرة' ? 'family' : 'individual',
            phone: row.phone || '', nationalId: row.nationalId || '',
            governorate: row.location || '', address: row.address || '',
            notes: row.notes || '', program: row.program || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((row) => {
        setBeneficiaries(prev => prev.filter(b => b.id !== row.id));
        setSnackbar({ open: true, msg: `تم حذف "${row.name}"`, severity: 'success' });
    }, []);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال اسم المستفيد', severity: 'error' }); return;
        }

        const typeLabel = formData.type === 'family' ? 'أسرة' : 'فرد';

        if (editItem) {
            setBeneficiaries(prev => prev.map(b =>
                b.id === editItem.id
                    ? { ...b, name: formData.name, type: typeLabel, phone: formData.phone, nationalId: formData.nationalId, location: formData.governorate, address: formData.address, notes: formData.notes }
                    : b
            ));
            setSnackbar({ open: true, msg: `تم تحديث بيانات "${formData.name}"`, severity: 'success' });
        } else {
            setBeneficiaries(prev => [...prev, {
                id: Math.max(...prev.map(b => b.id), 0) + 1,
                name: formData.name, type: typeLabel, program: formData.program || 'عام',
                status: 'pending', cases: 1, location: formData.governorate,
                phone: formData.phone, nationalId: formData.nationalId,
                address: formData.address, notes: formData.notes,
            }]);
            setSnackbar({ open: true, msg: `تم إضافة "${formData.name}" بنجاح`, severity: 'success' });
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
    };

    const kpis = [
        { label: t('admin.beneficiariesPage.totalBeneficiaries'), value: String(beneficiaries.length), icon: 'fa-solid fa-users', color: 'primary' },
        { label: t('admin.beneficiariesPage.activeCases'), value: String(countByStatus(beneficiaries, 'active')), icon: 'fa-solid fa-user-check', color: 'success' },
        { label: t('admin.beneficiariesPage.underReview'), value: String(countByStatus(beneficiaries, 'pending')), icon: 'fa-solid fa-clock', color: 'warning' },
    ];

    const tabs = [
        { label: `${t('admin.beneficiariesPage.all')} (${beneficiaries.length})`, value: 'all' },
        { label: `${t('admin.beneficiariesPage.active')} (${countByStatus(beneficiaries, 'active')})`, value: 'active' },
        { label: `${t('admin.beneficiariesPage.pending')} (${countByStatus(beneficiaries, 'pending')})`, value: 'pending' },
        { label: `${t('admin.beneficiariesPage.inactive')} (${countByStatus(beneficiaries, 'inactive')})`, value: 'inactive' },
    ];

    const columns = [
        { key: 'name', label: t('admin.beneficiariesPage.name'), fontWeight: 'medium' },
        { key: 'type', label: t('admin.beneficiariesPage.type') },
        { key: 'program', label: t('admin.beneficiariesPage.program') },
        { key: 'cases', label: t('admin.beneficiariesPage.cases'), render: (v) => `${v} ${t('admin.beneficiariesPage.caseSuffix')}` },
        { key: 'location', label: t('admin.beneficiariesPage.location') },
        { key: 'status', label: t('admin.beneficiariesPage.status'), type: 'status' },
    ];

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض', onClick: (row) => handleEdit(row) },
        { icon: 'fa-solid fa-pen', tooltip: t('common.edit'), onClick: (row) => handleEdit(row) },
        { icon: 'fa-solid fa-trash', tooltip: t('common.delete'), onClick: (row) => handleDelete(row), color: 'error' },
    ];

    const governorates = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنيا', 'أسوان', 'قنا', 'سوهاج', 'الفيوم', 'بني سويف'];
    const programOptions = ['رعاية الأيتام', 'الرعاية الصحية', 'التعليم', 'الإغاثة العاجلة', 'سقيا الماء'];
    const updateField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.beneficiariesPage.title')}
                subtitle={t('admin.beneficiariesPage.subtitle')}
                action={{ label: t('admin.beneficiariesPage.addBtn'), icon: 'fa-solid fa-plus', onClick: handleAdd }}
            />

            <AdminStatsGrid stats={kpis} columns={4} />

            <AdminFilterBar
                tabs={tabs} activeTab={tabFilter} onTabChange={(_, v) => setTabFilter(v)}
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder={t('admin.beneficiariesPage.searchPlaceholder')}
            />

            <AdminDataTable columns={columns} data={filtered} actions={actions} emptyMessage="لا يوجد مستفيدين مطابقين" />

            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleSubmit}
                title={editItem ? `تعديل: ${editItem.name}` : t('admin.beneficiariesPage.addDialog')}
                submitLabel={editItem ? t('admin.programsPage.saveChanges') : t('admin.beneficiariesPage.addBeneficiary')}
                dividers
            >
                <TextField label={t('admin.beneficiariesPage.fullName')} fullWidth required value={formData.name} onChange={updateField('name')} />
                <TextField select label={t('admin.beneficiariesPage.typeLabel')} fullWidth value={formData.type} onChange={updateField('type')}>
                    <MenuItem value="family">{t('admin.beneficiariesPage.family')}</MenuItem>
                    <MenuItem value="individual">{t('admin.beneficiariesPage.individual')}</MenuItem>
                </TextField>
                <TextField select label={t('admin.beneficiariesPage.program')} fullWidth value={formData.program} onChange={updateField('program')}>
                    {programOptions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <TextField label={t('admin.beneficiariesPage.phone')} fullWidth value={formData.phone} onChange={updateField('phone')} />
                <TextField label={t('admin.beneficiariesPage.nationalId')} fullWidth value={formData.nationalId} onChange={updateField('nationalId')} />
                <TextField select label={t('admin.beneficiariesPage.governorate')} fullWidth value={formData.governorate} onChange={updateField('governorate')}>
                    <MenuItem value="" disabled>{t('admin.beneficiariesPage.selectGovernorate')}</MenuItem>
                    {governorates.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
                <TextField label={t('admin.beneficiariesPage.address')} fullWidth value={formData.address} onChange={updateField('address')} />
                <TextField label={t('admin.beneficiariesPage.notes')} multiline rows={3} fullWidth value={formData.notes} onChange={updateField('notes')} placeholder={t('admin.beneficiariesPage.notesPlaceholder')} />
            </AdminFormDialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminBeneficiaries;

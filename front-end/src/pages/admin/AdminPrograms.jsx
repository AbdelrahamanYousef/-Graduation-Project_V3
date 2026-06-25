import { useState, useCallback, useEffect, useRef } from 'react';
import { AdminPageHeader, AdminDataTable, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { t, formatCurrency } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';
import { uploadImage } from '../../api/upload.api';

function AdminPrograms() {
    const { state, dispatch, api } = useAdminData();
    const programsList = state.programs;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [formData, setFormData] = useState({ name: '', nameEn: '', icon: '', color: '#0B6B6B', description: '', imageUrl: '' });
    const fileInputRef = useRef(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, program: null });

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const resetForm = () => setFormData({ name: '', nameEn: '', icon: '', color: '#0B6B6B', description: '', imageUrl: '' });

    const handleProgramFileSelect = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const res = await uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrl: res.url }));
            setSnackbar({ open: true, msg: 'تم رفع الصورة بنجاح', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, msg: err.message || 'فشل رفع الصورة', severity: 'error' });
        }
    };

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
            imageUrl: program.imageUrl || program.image || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((program) => {
        setDeleteConfirm({ open: true, program });
    }, []);

    const confirmDelete = async () => {
        const { program } = deleteConfirm;
        if (!program) return;
        try {
            await api.deleteProgram(program.id);
            setSnackbar({ open: true, msg: `تم حذف البرنامج "${program.name}" بنجاح`, severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, msg: e.message || 'خطأ أثناء الحذف', severity: 'error' });
        }
        setDeleteConfirm({ open: false, program: null });
    };

    const handleToggleStatus = useCallback(async (program) => {
        try {
            const nextStatus = program.status === 'active' ? 'INACTIVE' : 'ACTIVE';
            await api.updateProgram(program.id, { status: nextStatus });
            setSnackbar({
                open: true,
                msg: nextStatus === 'ACTIVE'
                    ? `تم تفعيل "${program.name}" — سيظهر في الصفحة الرئيسية`
                    : `تم إيقاف "${program.name}" — لن يظهر في الصفحة الرئيسية`,
                severity: 'info'
            });
        } catch (e) {
            setSnackbar({ open: true, msg: e.message || 'خطأ أثناء تغيير الحالة', severity: 'error' });
        }
    }, [api]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال اسم البرنامج', severity: 'error' });
            return;
        }
        if (selectedProgram) {
            try {
                await api.updateProgram(selectedProgram.id, {
                    name: formData.name,
                    nameEn: formData.nameEn,
                    icon: formData.icon,
                    color: formData.color,
                    description: formData.description,
                    imageUrl: formData.imageUrl || undefined,
                });
                setSnackbar({ open: true, msg: `تم تحديث "${formData.name}" — تم التعديل في الصفحة الرئيسية`, severity: 'success' });
            } catch (e) {
                setSnackbar({ open: true, msg: e.message || 'خطأ أثناء التحديث', severity: 'error' });
            }
        } else {
            try {
                await api.createProgram({
                    name: formData.name,
                    nameEn: formData.nameEn,
                    icon: formData.icon || 'fa-solid fa-folder',
                    color: formData.color,
                    description: formData.description,
                    imageUrl: formData.imageUrl || undefined,
                    status: 'ACTIVE',
                });
                setSnackbar({ open: true, msg: `تم إضافة "${formData.name}" — ظهر في الصفحة الرئيسية`, severity: 'success' });
            } catch (e) {
                setSnackbar({ open: true, msg: e.message || 'خطأ أثناء الإنشاء', severity: 'error' });
            }
        }
        setIsModalOpen(false);
        resetForm();
    };

    const columns = [
        {
            key: 'name', label: t('admin.programsPage.program'),
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center rounded text-xl" style={{ backgroundColor: `color-mix(in srgb, ${row.color || 'var(--color-primary-500)'} 10%, transparent)`, color: row.color || 'var(--color-primary-500)' }}>
                        <i className={row.icon} />
                    </div>
                    <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{row.name}</div>
                        {row.nameEn && <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.nameEn}</div>}
                    </div>
                </div>
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
        <div className="flex flex-col gap-3">
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
                <input
                    autoFocus
                    placeholder={t('admin.programsPage.nameLabel')}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                    placeholder="اسم البرنامج (إنجليزي)"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <div>
                    <input
                        placeholder={t('admin.programsPage.iconLabel')}
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {formData.icon && (
                        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <i className={formData.icon} style={{ fontSize: 24 }} />
                            <span>معاينة الأيقونة</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 items-center mt-2">
                    <input
                        placeholder="Image URL"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProgramFileSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md text-sm">
                        <i className="fa-solid fa-camera ml-1" /> {t('admin.programsPage.imageUpload')}
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.programsPage.colorLabel')}</label>
                    <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-10 px-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent cursor-pointer"
                    />
                </div>
                <textarea
                    placeholder={t('admin.programsPage.descLabel')}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
            </AdminFormDialog>

            {deleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, program: null })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">تأكيد الحذف</h2>
                        <div className="p-4">
                            <p className="text-neutral-700 dark:text-neutral-300">
                                هل أنت متأكد من حذف برنامج "{deleteConfirm.program?.name}"؟
                            </p>
                            {deleteConfirm.program?.projectCount > 0 && (
                                <p className="mt-2 font-bold text-error-500">
                                    تحذير: هذا البرنامج يحتوي على {deleteConfirm.program.projectCount} مشاريع مرتبطة به!
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, program: null })}
                                className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2 rounded-md font-semibold bg-error-500 text-white hover:bg-error-600 transition-colors"
                            >
                                حذف نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${
                        snackbar.severity === 'success' ? 'bg-success-500 text-white' :
                        snackbar.severity === 'error' ? 'bg-error-500 text-white' :
                        'bg-primary-500 text-white'
                    }`}>
                        <span>{snackbar.msg}</span>
                        <button className="text-white/80 hover:text-white mr-2" onClick={() => setSnackbar(s => ({ ...s, open: false }))}>
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPrograms;

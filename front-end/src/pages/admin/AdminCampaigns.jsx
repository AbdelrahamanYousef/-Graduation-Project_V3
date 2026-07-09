import { useState, useCallback, useEffect } from 'react';
import { AdminPageHeader, AdminDataTable, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { t, formatCurrency } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';
import { createCampaign, updateCampaign, deleteCampaign } from '../../api/campaigns.api';

function AdminCampaigns() {
    const { state, dispatch, api } = useAdminData();
    const campaignsList = state.campaigns || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [formData, setFormData] = useState({
        title: '', description: '', imageUrl: '', goal: '', raised: '0',
        donorsCount: 0, status: 'active', startDate: '', endDate: '',
        featured: false, category: ''
    });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, campaign: null });

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const resetForm = () => setFormData({
        title: '', description: '', imageUrl: '', goal: '', raised: '0',
        donorsCount: 0, status: 'active', startDate: '', endDate: '',
        featured: false, category: ''
    });

    const handleAdd = () => {
        setSelectedCampaign(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((campaign) => {
        setSelectedCampaign(campaign);
        setFormData({
            title: campaign.title || '',
            description: campaign.description || '',
            imageUrl: campaign.imageUrl || '',
            goal: campaign.goal?.toString() || '',
            raised: campaign.raised?.toString() || '0',
            donorsCount: campaign.donorsCount || 0,
            status: campaign.status || 'active',
            startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
            endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
            featured: campaign.featured || false,
            category: campaign.category || ''
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((campaign) => {
        setDeleteConfirm({ open: true, campaign });
    }, []);

    const confirmDelete = async () => {
        const { campaign } = deleteConfirm;
        if (!campaign) return;

        try {
            await deleteCampaign(campaign.id);
            dispatch(adminActions.deleteCampaign(campaign.id));
            setSnackbar({ open: true, msg: `تم حذف الحملة بنجاح`, severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء الحذف', severity: 'error' });
        } finally {
            setDeleteConfirm({ open: false, campaign: null });
        }
    };

    const handleToggleStatus = useCallback(async (campaign) => {
        const nextStatus = campaign.status === 'active' ? 'completed' : 'active';
        try {
            await updateCampaign(campaign.id, { status: nextStatus.toUpperCase() });
            dispatch(adminActions.toggleCampaignStatus(campaign.id));
            setSnackbar({
                open: true,
                msg: `تم تغيير حالة الحملة إلى ${nextStatus === 'active' ? 'نشطة' : 'مكتملة'}`,
                severity: 'info'
            });
            api.refreshAdminData();
        } catch (error) {
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء تغيير الحالة', severity: 'error' });
        }
    }, [dispatch, api]);

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.goal) {
            setSnackbar({ open: true, msg: 'يرجى إدخال عنوان الحملة والهدف المالي', severity: 'error' });
            return;
        }

        const payload = {
            ...formData,
            status: formData.status.toUpperCase(),
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            goal: parseFloat(formData.goal),
            raised: parseFloat(formData.raised) || 0,
            donorsCount: parseInt(formData.donorsCount) || 0,
        };

        try {
            if (selectedCampaign) {
                const updated = await updateCampaign(selectedCampaign.id, payload);
                dispatch(adminActions.updateCampaign(updated));
                setSnackbar({ open: true, msg: `تم تحديث الحملة بنجاح`, severity: 'success' });
            } else {
                const created = await createCampaign(payload);
                dispatch(adminActions.addCampaign(created));
                setSnackbar({ open: true, msg: `تم إضافة الحملة بنجاح`, severity: 'success' });
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء الحفظ', severity: 'error' });
        }
    };

    const columns = [
        {
            key: 'title', label: 'الحملة',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
                        {row.imageUrl ? (
                            <img src={row.imageUrl} alt={row.title} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-bullhorn text-neutral-400" />
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">{row.title}</div>
                        <div className="text-xs text-neutral-500">{row.category || 'بدون تصنيف'}</div>
                    </div>
                </div>
            )
        },
        { key: 'goal', label: 'الهدف', align: 'center', render: (val) => <span className="font-bold">{formatCurrency(val)}</span> },
        { key: 'raised', label: 'تم جمعه', align: 'center', render: (val) => <span className="font-bold text-primary-600">{formatCurrency(val)}</span> },
        { 
            key: 'progress', label: 'التقدم', align: 'center', 
            render: (_, row) => {
                const pct = Math.min(100, Math.round((row.raised / row.goal) * 100)) || 0;
                return (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                );
            }
        },
        {
            key: 'status', label: 'الحالة', align: 'center',
            render: (val) => <AdminStatusChip status={val} />
        },
        { key: 'endDate', label: 'تاريخ الإنتهاء', align: 'center', render: (val) => val ? new Date(val).toLocaleDateString('ar-EG') : 'مستمرة' }
    ];

    const actions = [
        { icon: 'fa-solid fa-pen-to-square', tooltip: 'تعديل', onClick: handleEdit, color: 'primary' },
        { icon: 'fa-solid fa-toggle-on', tooltip: 'تغيير الحالة', onClick: handleToggleStatus },
        { icon: 'fa-solid fa-trash', tooltip: 'حذف', onClick: handleDelete, color: 'error' }
    ];

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title="الحملات"
                subtitle="إنشاء وإدارة الحملات الخيرية المستقلة"
                action={{ label: 'إضافة حملة', icon: 'fa-solid fa-plus', onClick: handleAdd }}
            />

            <AdminDataTable columns={columns} data={campaignsList} actions={actions} />

            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                onSubmit={handleSubmit}
                title={selectedCampaign ? 'تعديل حملة' : 'إضافة حملة جديدة'}
                submitLabel={selectedCampaign ? 'حفظ التعديلات' : 'إضافة'}
            >
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">عنوان الحملة</label>
                    <input
                        placeholder="عنوان الحملة"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">الهدف المالي (جنية)</label>
                        <input
                            placeholder="الهدف المالي (جنية)"
                            type="number"
                            required
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">تم جمعه (جنية)</label>
                        <input
                            placeholder="تم جمعه (جنية)"
                            type="number"
                            value={formData.raised}
                            onChange={(e) => setFormData({ ...formData, raised: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs mb-1 text-neutral-500">تاريخ البدء</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs mb-1 text-neutral-500">تاريخ الإنتهاء (اختياري)</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">الحالة</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        >
                            <option value="active">نشطة</option>
                            <option value="completed">مكتملة</option>
                            <option value="cancelled">ملغاة</option>
                            <option value="upcoming">قادمة</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">التصنيف</label>
                        <input
                            placeholder="التصنيف (مثال: إغاثة، رمضان)"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">رابط الصورة (URL)</label>
                    <input
                        placeholder="رابط الصورة (URL)"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">وصف الحملة</label>
                    <textarea
                        placeholder="وصف الحملة"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent outline-none focus:border-primary-500 resize-none"
                    />
                </div>
            </AdminFormDialog>

            {deleteConfirm.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">تأكيد الحذف</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            هل أنت متأكد من حذف حملة "{deleteConfirm.campaign?.title}"؟
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, campaign: null })}
                                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-error-500 text-white font-medium hover:bg-error-600"
                            >
                                نعم، احذف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 text-white ${
                        snackbar.severity === 'error' ? 'bg-error-500' : 
                        snackbar.severity === 'info' ? 'bg-primary-500' : 'bg-success-500'
                    }`}>
                        <span>{snackbar.msg}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCampaigns;

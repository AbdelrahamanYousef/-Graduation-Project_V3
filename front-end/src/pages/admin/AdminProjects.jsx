import { useState, useCallback, useEffect, useRef } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { formatCurrency, t } from '../../i18n';
import { uploadImage } from '../../api/upload.api';
import { projectsApi, getPrograms, toggleProjectHighlight } from '../../api';

function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    const projectsList = projects;
    const programsList = programs;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [filter, setFilter] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [updatesModalOpen, setUpdatesModalOpen] = useState(false);
    const [updatesProject, setUpdatesProject] = useState(null);
    const [newUpdateText, setNewUpdateText] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projRes, progRes] = await Promise.all([
                projectsApi.getAll({ limit: 1000, showAll: true }),
                getPrograms()
            ]);
            setProjects(projRes?.data || []);
            setPrograms(progRes || []);
        } catch (e) {
            console.error('Failed to fetch admin projects:', e);
            setSnackbar({ open: true, msg: 'خطأ أثناء تحميل البيانات', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3500);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const emptyForm = { title: '', programId: '', goal: '', donationAmount: '', location: '', description: '', imageUrl: '', amountConfig: 'FIXED_SHARES', sharePrice: '' };
    const [formData, setFormData] = useState(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, project: null });

    const handleStatusChange = async (project, newStatus) => {
        try {
            await projectsApi.update(project.id, { status: newStatus.toUpperCase() });
            setSnackbar({ open: true, msg: `تم تغيير حالة المشروع إلى ${newStatus}`, severity: 'success' });
            fetchData();
        } catch (e) {
            setSnackbar({ open: true, msg: e.message || 'خطأ أثناء التحديث', severity: 'error' });
        }
    };

    const handleToggleHighlight = useCallback(async (project) => {
        try {
            const nextVal = !project.isHighlighted;
            await toggleProjectHighlight(project.id, nextVal);
            setSnackbar({
                open: true,
                severity: 'success',
                msg: nextVal
                    ? `تم تمييز "${project.title}" — يظهر بالبرتقالي`
                    : `تم إزالة تمييز "${project.title}"`,
            });
            fetchData();
        } catch (e) {
            setSnackbar({ open: true, msg: e.message || 'خطأ أثناء تعديل التمييز', severity: 'error' });
        }
    }, []);

    const handleAdd = () => {
        setEditProject(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((project) => {
        setEditProject(project);
        setFormData({
            title: project.title || '',
            programId: project.programId || '',
            goal: project.goal || '',
            donationAmount: project.donationAmount || '',
            location: project.location || '',
            description: project.description || '',
            imageUrl: project.image || project.imageUrl || '',
            amountConfig: project.amountConfig || 'FIXED_SHARES',
            sharePrice: project.sharePrice || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال عنوان المشروع', severity: 'error' });
            return;
        }

        const payload = {
            title: formData.title,
            programId: formData.programId,
            goal: Number(formData.goal) || 100000,
            donationAmount: Number(formData.donationAmount) || 0,
            location: formData.location,
            description: formData.description,
            imageUrl: formData.imageUrl || undefined,
            amountConfig: formData.amountConfig,
            sharePrice: formData.amountConfig === 'FIXED_SHARES' ? Number(formData.sharePrice) : null,
        };

        if (editProject) {
            try {
                await projectsApi.update(editProject.id, payload);
                setSnackbar({ open: true, msg: `تم تحديث المشروع "${formData.title}"`, severity: 'success' });
                fetchData();
            } catch (e) {
                setSnackbar({ open: true, msg: e.message || 'خطأ أثناء التحديث', severity: 'error' });
            }
        } else {
            try {
                await projectsApi.create({
                    ...payload,
                    status: 'ACTIVE',
                    featured: false,
                });
                setSnackbar({ open: true, msg: `تم إنشاء المشروع "${formData.title}"`, severity: 'success' });
                fetchData();
            } catch (e) {
                setSnackbar({ open: true, msg: e.message || 'خطأ أثناء الإنشاء', severity: 'error' });
            }
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
    };

    const handleDelete = useCallback((project) => {
        setDeleteConfirm({ open: true, project });
    }, []);

    const confirmDelete = async () => {
        const { project } = deleteConfirm;
        if (!project) return;
        try {
            await projectsApi.deleteProject(project.id);
            setSnackbar({ open: true, msg: `تم حذف المشروع "${project.title}"`, severity: 'success' });
            await fetchData();
        } catch (e) {
            console.error('Delete failed:', e);
            setSnackbar({ open: true, msg: e.message || 'خطأ أثناء الحذف', severity: 'error' });
        }
        setDeleteConfirm({ open: false, project: null });
    };

    const handleManageUpdates = (project) => {
        setUpdatesProject(project);
        setUpdatesModalOpen(true);
    };

    const handleAddUpdate = () => {
        if (!newUpdateText.trim()) return;
        const newUpdate = { id: Date.now(), text: newUpdateText, date: new Date().toLocaleDateString('ar-EG') };
        setProjects(prev => prev.map(p => p.id === updatesProject.id ? { ...p, updates: [...(p.updates || []), newUpdate] } : p));
        setUpdatesProject(prev => ({ ...prev, updates: [...(prev.updates || []), newUpdate] }));
        setNewUpdateText('');
        setSnackbar({ open: true, msg: 'تم إضافة التحديث بنجاح', severity: 'success' });
    };

    const handleDeleteUpdate = (updateId) => {
        const newUpdates = (updatesProject.updates || []).filter(u => u.id !== updateId);
        setProjects(prev => prev.map(p => p.id === updatesProject.id ? { ...p, updates: newUpdates } : p));
        setUpdatesProject(prev => ({ ...prev, updates: newUpdates }));
        setSnackbar({ open: true, msg: 'تم حذف التحديث', severity: 'success' });
    };

    const filteredProjects = filter === 'all' ? projectsList : projectsList.filter(p => String(p.status).toLowerCase() === filter.toLowerCase());

    const tabs = [
        { label: `${t('admin.projectsPage.all')} (${projectsList.length})`, value: 'all' },
        { label: `${t('admin.projectsPage.active')} (${projectsList.filter(p => String(p.status).toLowerCase() === 'active').length})`, value: 'active' },
        { label: `${t('admin.projectsPage.completed')} (${projectsList.filter(p => String(p.status).toLowerCase() === 'completed').length})`, value: 'completed' },
        { label: `${t('admin.projectsPage.pending')} (${projectsList.filter(p => String(p.status).toLowerCase() === 'pending').length})`, value: 'pending' },
    ];

    const updateField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const inputClass = "w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none";
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
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

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title={t('admin.projectsPage.title')}
                subtitle={t('admin.projectsPage.subtitle')}
                action={{ label: t('admin.projectsPage.addBtn'), icon: 'fa-solid fa-plus', onClick: handleAdd }}
            />

            <AdminFilterBar tabs={tabs} activeTab={filter} onTabChange={(_, v) => setFilter(v)} />

            <div className="grid grid-cols-12 gap-4">
                {filteredProjects.map(project => {
                    const program = programsList.find(p => p.id === project.programId);
                    const progress = Math.min(Math.round(((project.raised || 0) / (project.goal || 1)) * 100), 100);
                    return (
                        <div className="col-span-12 sm:col-span-6 lg:col-span-4" key={project.id}>
                            <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-card overflow-hidden flex flex-col h-full border ${project.isHighlighted ? 'border-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.25)]' : 'border-neutral-100 dark:border-neutral-700'}`}>
                                <div className="p-4 flex-1 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `color-mix(in srgb, ${program?.color || 'var(--color-primary-500)'} 10%, transparent)`, color: program?.color || 'var(--color-primary-500)' }}>
                                            {program?.icon && <i className={program.icon} />}
                                            {program?.name}
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <AdminStatusChip status={project.status || 'active'} />
                                        </div>
                                    </div>

                                    <h6 className="font-bold text-base text-neutral-900 dark:text-neutral-100">{project.title}</h6>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-primary-500">{formatCurrency(project.raised || 0)}</span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('admin.projectsPage.from')} {formatCurrency(project.goal)}</span>
                                        </div>
                                        <div className="w-full h-2 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                            <div className="h-full rounded transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary-500)' }} />
                                        </div>
                                        {project.donationAmount > 0 && (
                                            <div className="flex items-center gap-0.5 mt-1">
                                                <i className="fa-solid fa-hand-holding-heart text-xs" style={{ color: program?.color || 'var(--color-primary-500)' }} />
                                                <span className="text-xs font-bold text-primary-500">{formatCurrency(project.donationAmount)}</span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.65rem' }}>{t('admin.projectsPage.donationAmount')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <div className="flex items-center gap-0.5">
                                            <i className="fa-solid fa-location-dot" /> {project.location}
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <i className="fa-solid fa-users" /> {project.donors || 0} {t('admin.projectsPage.donors')}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-1 items-center">
                                    <select
                                        value={project.status || 'active'}
                                        onChange={(e) => handleStatusChange(project, e.target.value)}
                                        className="text-sm px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none min-w-[100px]"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="pending">قيد الانتظار</option>
                                    </select>
                                    <div className="flex-1" />
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400 select-none">
                                        <input
                                            type="checkbox"
                                            checked={project.isHighlighted || false}
                                            onChange={() => handleToggleHighlight(project)}
                                            className="w-3.5 h-3.5 text-amber-500 bg-neutral-100 border-neutral-300 rounded focus:ring-amber-500 cursor-pointer dark:bg-neutral-700 dark:border-neutral-600"
                                        />
                                        <span>أشد احتياجاً</span>
                                    </label>
                                    <button
                                        title="تحديثات المشروع"
                                        className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-primary-500"
                                        onClick={() => handleManageUpdates(project)}
                                    >
                                        <i className="fa-solid fa-bullhorn" style={{ fontSize: 14 }} />
                                    </button>
                                    <button
                                        title={t('admin.projectsPage.edit')}
                                        className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-primary-500"
                                        onClick={() => handleEdit(project)}
                                    >
                                        <i className="fa-solid fa-pen-to-square" style={{ fontSize: 14 }} />
                                    </button>
                                    <button
                                        title={t('common.delete')}
                                        className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-error-500"
                                        onClick={() => handleDelete(project)}
                                    >
                                        <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    <i className="fa-solid fa-folder-open" style={{ fontSize: 48, opacity: 0.3 }} />
                    <p className="mt-2">لا توجد مشاريع في هذه الفئة</p>
                </div>
            )}

            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleSubmit}
                title={editProject ? `تعديل: ${editProject.title}` : t('admin.projectsPage.addDialog')}
                submitLabel={editProject ? t('admin.programsPage.saveChanges') : t('admin.projectsPage.createBtn')}
                maxWidth="md"
            >
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.projectsPage.titleLabel')}</label>
                        <input className={inputClass} placeholder={t('admin.projectsPage.titleLabel')} required value={formData.title} onChange={updateField('title')} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.projectsPage.programLabel')}</label>
                        <select className={inputClass} value={formData.programId} onChange={updateField('programId')}>
                            <option value="">{t('admin.projectsPage.programLabel')}</option>
                            {programsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.projectsPage.goalLabel')}</label>
                        <input className={inputClass} type="number" placeholder={t('admin.projectsPage.goalLabel')} required value={formData.goal} onChange={updateField('goal')} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">نوع التبرع</label>
                        <select className={inputClass} value={formData.amountConfig} onChange={updateField('amountConfig')}>
                            <option value="FIXED_SHARES">أسهم خيرية (مبلغ سهم ثابت ومضاعفاته)</option>
                            <option value="FLEXIBLE">مبلغ مساهمة حر (متغير)</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    {formData.amountConfig === 'FIXED_SHARES' ? (
                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">سعر السهم (ج.م)</label>
                            <input className={inputClass} type="number" placeholder="مثال: 50" required value={formData.sharePrice} onChange={updateField('sharePrice')} />
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">متوسط مبلغ التبرع الافتراضي</label>
                            <input className={inputClass} type="number" placeholder="مثال: 100" value={formData.donationAmount} onChange={updateField('donationAmount')} />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.projectsPage.locationLabel')}</label>
                    <input className={inputClass} placeholder={t('admin.projectsPage.locationLabel')} value={formData.location} onChange={updateField('location')} />
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('admin.projectsPage.descLabel')}</label>
                    <textarea className={inputClass + " resize-none"} rows={4} placeholder={t('admin.projectsPage.descLabel')} value={formData.description} onChange={updateField('description')} />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image URL</label>
                        <input className={inputClass} placeholder="Image URL" value={formData.imageUrl} onChange={updateField('imageUrl')} dir="ltr" />
                        {formData.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                <img src={formData.imageUrl} alt="preview" className="w-full h-32 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md text-sm mt-5">
                        <i className="fa-solid fa-camera ml-1" /> {t('admin.projectsPage.imageUpload')}
                    </button>
                </div>
            </AdminFormDialog>

            {deleteConfirm.open && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, project: null })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">تأكيد الحذف</h2>
                        <div className="p-4">
                            <p className="text-neutral-700 dark:text-neutral-300">
                                هل أنت متأكد من حذف مشروع "{deleteConfirm.project?.title}"؟
                            </p>
                            {deleteConfirm.project?.raised > 0 && (
                                <p className="mt-2 font-bold text-error-500">
                                    تحذير: هذا المشروع يحتوي على تبرعات بقيمة {formatCurrency(deleteConfirm.project.raised)}!
                                    حذفه قد يؤدي إلى فقدان السجلات المرتبطة به.
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, project: null })}
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

            {updatesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setUpdatesModalOpen(false)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">إدارة تحديثات المشروع: {updatesProject?.title}</h2>
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            {(!updatesProject?.updates || updatesProject.updates.length === 0) ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-2">لا توجد تحديثات حالياً</p>
                            ) : (
                                <div>
                                    {updatesProject.updates.map((update, i) => (
                                        <div key={update.id}>
                                            <div className="flex items-center py-2 gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{update.text}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{update.date}</p>
                                                </div>
                                                <button
                                                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-error-500"
                                                    onClick={() => handleDeleteUpdate(update.id)}
                                                >
                                                    <i className="fa-solid fa-trash" style={{ fontSize: 12 }} />
                                                </button>
                                            </div>
                                            {i < updatesProject.updates.length - 1 && <hr className="border-t border-neutral-200 dark:border-neutral-700" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 flex gap-1">
                                <input
                                    className={inputClass}
                                    placeholder="تحديث جديد..."
                                    value={newUpdateText}
                                    onChange={(e) => setNewUpdateText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddUpdate(); }}
                                />
                                <button
                                    onClick={handleAddUpdate}
                                    className="px-4 py-2 rounded-md font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm whitespace-nowrap"
                                >
                                    إضافة
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                onClick={() => setUpdatesModalOpen(false)}
                                className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                إغلاق
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

export default AdminProjects;

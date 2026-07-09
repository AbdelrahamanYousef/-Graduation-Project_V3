import { useState, useMemo, useEffect } from 'react';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { formatCurrency, formatDate, t } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';

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

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar({ open: false, msg: '', severity: 'success' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const emptyForm = { donor: '', amount: '', project: '', method: 'Cash (Offline)', status: 'completed' };
    const [formData, setFormData] = useState(emptyForm);

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
        const completed = filteredDonations.filter(d => d.status === 'completed');
        const total = completed.reduce((sum, d) => sum + d.amount, 0);
        return {
            total,
            count: completed.length,
            avgAmount: completed.length ? Math.round(total / completed.length) : 0,
        };
    }, [filteredDonations]);

    const kpis = [
        { label: t('admin.donationsPage.totalDonations'), value: formatCurrency(stats.total), color: 'success', icon: 'fa-solid fa-coins' },
        { label: t('admin.donationsPage.donationCount'), value: String(stats.count), color: 'primary', icon: 'fa-solid fa-hashtag' },
        { label: t('admin.donationsPage.avgDonation'), value: formatCurrency(stats.avgAmount), color: 'info', icon: 'fa-solid fa-chart-simple' },
    ];

    const uniqueProjects = [...new Set(donations.map(d => d.project))];

    const columns = [
        { key: 'id', label: t('admin.donationsPage.donationId'), render: (v) => <span className="font-mono text-neutral-500 dark:text-neutral-400">#{String(v).padStart(5, '0')}</span> },
        {
            key: 'donor', label: t('admin.donationsPage.donor'),
            render: (v) => (
                <span className="cursor-pointer text-primary-500 underline text-sm font-medium hover:text-primary-600 transition-colors" onClick={() => setViewDonor(v)}>
                    {v}
                </span>
            )
        },
        { key: 'project', label: t('admin.donationsPage.project') },
        { key: 'amount', label: t('admin.donationsPage.amount'), render: (v) => <span className="font-bold text-primary-500">{formatCurrency(v)}</span> },
        { key: 'method', label: t('admin.donationsPage.paymentMethod') },
        { key: 'date', label: t('admin.donationsPage.date'), render: (v) => formatDate(v) },
        {
            key: 'status', label: t('admin.donationsPage.status'),
            render: (val, row) => (
                <select
                    value={val || 'pending'}
                    onChange={(e) => handleStatusChange(row, e.target.value)}
                    className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer"
                    style={{
                        color: val === 'completed' ? 'var(--color-success-500)' :
                               val === 'rejected' ? 'var(--color-error-500)' :
                               val === 'refunded' ? 'var(--color-error-500)' :
                               'var(--color-warning-500)'
                    }}
                >
                    <option value="pending" style={{ color: 'var(--color-warning-500)' }}>قيد المعالجة</option>
                    <option value="completed" style={{ color: 'var(--color-success-500)' }}>مكتمل</option>
                    <option value="rejected" style={{ color: 'var(--color-error-500)' }}>مرفوض</option>
                    <option value="refunded" style={{ color: 'var(--color-error-500)' }}>مسترد</option>
                </select>
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

    const selectClass = "px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";
    const snackbarClose = () => setSnackbar({ open: false, msg: '', severity: 'success' });

    return (
        <div className="flex flex-col gap-3">
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
                <select className={selectClass} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                    <option value="">{t('admin.donationsPage.allProjects')}</option>
                    {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">{t('admin.donationsPage.allStatuses')}</option>
                    <option value="completed">مكتمل</option>
                    <option value="pending">قيد المعالجة</option>
                    <option value="refunded">مسترد</option>
                </select>
                <select className={selectClass} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="all">{t('admin.donationsPage.allPeriods')}</option>
                    <option value="today">{t('admin.donationsPage.today')}</option>
                    <option value="week">{t('admin.donationsPage.thisWeek')}</option>
                    <option value="month">{t('admin.donationsPage.thisMonth')}</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable columns={columns} data={filteredDonations} actions={actions} emptyMessage="لا توجد تبرعات مطابقة للبحث" />

            <AdminFormDialog
                open={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleAddSubmit}
                title="إضافة تبرع يدوي (أوفلاين)"
                submitLabel="إضافة التبرع"
            >
                <input
                    placeholder="اسم المتبرع"
                    required
                    value={formData.donor}
                    onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                    placeholder="المبلغ (ج.م)"
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <select
                    required
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="">المشروع الموجه إليه</option>
                    {state.projects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                </select>
                <input
                    placeholder="طريقة الدفع"
                    disabled
                    value={formData.method}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent opacity-60 cursor-not-allowed outline-none"
                />
            </AdminFormDialog>

            {viewDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewDonation(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">تفاصيل التبرع #{String(viewDonation.id).padStart(5, '0')}</h2>
                        <div className="p-4">
                            <div className="grid grid-cols-12 gap-2 mt-1">
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">المتبرع</p>
                                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{viewDonation.donor}</p>
                                </div>
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">المبلغ</p>
                                    <p className="font-bold text-primary-500">{formatCurrency(viewDonation.amount)}</p>
                                </div>
                                <div className="col-span-12"><hr className="border-t border-neutral-200 dark:border-neutral-700" /></div>
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">المشروع</p>
                                    <p className="text-neutral-900 dark:text-neutral-100">{viewDonation.project}</p>
                                </div>
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">طريقة الدفع</p>
                                    <p className="text-neutral-900 dark:text-neutral-100">{viewDonation.method}</p>
                                </div>
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">التاريخ</p>
                                    <p className="text-neutral-900 dark:text-neutral-100">{formatDate(viewDonation.date)}</p>
                                </div>
                                <div className="col-span-6">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">الحالة</p>
                                    <div className="mt-0.5">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                            viewDonation.status === 'completed' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400' :
                                            viewDonation.status === 'pending' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400' :
                                            'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400'
                                        }`}>
                                            {viewDonation.status === 'completed' ? 'مكتمل' : viewDonation.status === 'pending' ? 'قيد المعالجة' : 'مسترد'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setViewDonation(null)} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إغلاق</button>
                            <button onClick={() => { setViewDonation(null); setSnackbar({ open: true, msg: 'جاري تحميل الإيصال...' }); }} className="px-5 py-2 rounded-md font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors">تحميل الإيصال</button>
                        </div>
                    </div>
                </div>
            )}

            {viewDonor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewDonor(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">سجل تبرعات: {viewDonor}</h2>
                        <div className="p-4 overflow-y-auto">
                            <AdminDataTable
                                columns={columns.filter(c => c.key !== 'donor')}
                                data={donations.filter(d => d.donor === viewDonor)}
                                actions={[]}
                                emptyMessage="لا توجد تبرعات"
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setViewDonor(null)} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, id: null })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">تأكيد الحذف</h2>
                        <div className="p-4">
                            <p className="text-neutral-700 dark:text-neutral-300">
                                هل أنت متأكد من حذف هذا التبرع بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء وسيتم خصم المبلغ من إجمالي التبرعات.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setDeleteConfirm({ open: false, id: null })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={confirmDelete} className="px-5 py-2 rounded-md font-semibold bg-error-500 text-white hover:bg-error-600 transition-colors">حذف نهائياً</button>
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
                        <button className="text-white/80 hover:text-white mr-2" onClick={snackbarClose}>
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDonations;

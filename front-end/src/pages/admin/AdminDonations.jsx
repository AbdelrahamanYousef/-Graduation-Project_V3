import { useState, useMemo, useEffect } from 'react';
import { AdminPageHeader, AdminStatsGrid, AdminFilterBar, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { formatCurrency, formatDate, t } from '../../i18n';
import {
    getDonations,
    confirmDonation,
    refundDonation,
    createOfflineDonation,
    getProjects,
    getCampaigns
} from '../../api';

function AdminDonations() {
    const [donations, setDonations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [dateRange, setDateRange] = useState('all');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [viewDonation, setViewDonation] = useState(null);
    const [viewDonor, setViewDonor] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const emptyForm = { donor: '', amount: '', targetId: '', notes: '' };
    const [formData, setFormData] = useState(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [donationsRes, projectsRes, campaignsRes] = await Promise.all([
                getDonations({ limit: 1000 }),
                getProjects({ limit: 1000 }),
                getCampaigns()
            ]);
            setDonations(donationsRes || []);
            setProjects(projectsRes?.data || []);
            setCampaigns(campaignsRes || []);
        } catch (err) {
            console.error('Error fetching admin donations:', err);
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء تحميل البيانات', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar({ open: false, msg: '', severity: 'success' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

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
        { label: t('admin.donationsPage.totalDonations') || 'إجمالي التبرعات المكتملة', value: formatCurrency(stats.total), color: 'success', icon: 'fa-solid fa-coins' },
        { label: t('admin.donationsPage.donationCount') || 'عدد التبرعات', value: String(stats.count), color: 'primary', icon: 'fa-solid fa-hashtag' },
        { label: t('admin.donationsPage.avgDonation') || 'متوسط التبرع', value: formatCurrency(stats.avgAmount), color: 'info', icon: 'fa-solid fa-chart-simple' },
    ];

    const uniqueProjects = [...new Set(donations.map(d => d.project))];

    const handleConfirmPayment = async (id) => {
        if (!window.confirm('هل أنت متأكد من تأكيد استلام هذا المبلغ؟ سيتم تحديث إجمالي التبرعات تلقائياً.')) {
            return;
        }
        try {
            await confirmDonation(id);
            setSnackbar({ open: true, msg: 'تم تأكيد التبرع واستلام المبلغ بنجاح', severity: 'success' });
            fetchData();
        } catch (err) {
            console.error('Failed to confirm donation:', err);
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء تأكيد التبرع', severity: 'error' });
        }
    };

    const handleRefundPayment = async (id) => {
        const reason = window.prompt('يرجى إدخال سبب استرداد هذا التبرع:');
        if (reason === null) return;
        if (!reason.trim()) {
            alert('سبب الاسترداد مطلوب لإتمام العملية');
            return;
        }
        try {
            await refundDonation(id, reason.trim());
            setSnackbar({ open: true, msg: 'تم استرداد التبرع بنجاح وعكس رصيد الهدف', severity: 'success' });
            fetchData();
        } catch (err) {
            console.error('Failed to refund donation:', err);
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء استرداد التبرع', severity: 'error' });
        }
    };

    const columns = [
        { key: 'id', label: t('admin.donationsPage.donationId') || 'رقم التبرع', render: (v) => <span className="font-mono text-neutral-500 dark:text-neutral-400">#{String(v).substring(0, 8)}</span> },
        {
            key: 'donor', label: t('admin.donationsPage.donor') || 'المتبرع',
            render: (v) => (
                <span className="cursor-pointer text-primary-500 underline text-sm font-medium hover:text-primary-600 transition-colors" onClick={() => setViewDonor(v)}>
                    {v}
                </span>
            )
        },
        { key: 'project', label: 'الهدف (مشروع / حملة)' },
        { key: 'amount', label: t('admin.donationsPage.amount') || 'المبلغ', render: (v) => <span className="font-bold text-primary-500">{formatCurrency(v)}</span> },
        { key: 'method', label: t('admin.donationsPage.paymentMethod') || 'طريقة الدفع' },
        { key: 'date', label: t('admin.donationsPage.date') || 'التاريخ', render: (v) => formatDate(v) },
        {
            key: 'status', label: t('admin.donationsPage.status') || 'الحالة',
            render: (val, row) => (
                <select
                    value={val || 'pending'}
                    onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === 'completed') {
                            handleConfirmPayment(row.id);
                        } else if (newStatus === 'refunded') {
                            handleRefundPayment(row.id);
                        }
                    }}
                    disabled={val === 'completed' || val === 'refunded'}
                    className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed"
                    style={{
                        color: val === 'completed' ? 'var(--color-success-500)' :
                               val === 'refunded' ? 'var(--color-error-500)' :
                               'var(--color-warning-500)'
                    }}
                >
                    <option value="pending" disabled={val !== 'pending'} style={{ color: 'var(--color-warning-500)' }}>قيد المعالجة</option>
                    <option value="completed" disabled={val === 'completed'} style={{ color: 'var(--color-success-500)' }}>مكتمل</option>
                    <option value="refunded" disabled={val === 'refunded'} style={{ color: 'var(--color-error-500)' }}>مسترد</option>
                </select>
            )
        },
    ];

    const handleAddSubmit = async () => {
        if (!formData.donor || !formData.amount || !formData.targetId) {
            setSnackbar({ open: true, msg: 'يرجى إدخال جميع الحقول الإلزامية', severity: 'warning' });
            return;
        }

        try {
            const reqData = {
                amount: Number(formData.amount),
                fullName: formData.donor,
                notes: formData.notes || null,
            };

            const [type, id] = formData.targetId.split(':');
            if (type === 'project') {
                reqData.projectId = id;
            } else {
                reqData.campaignId = id;
            }

            await createOfflineDonation(reqData);
            setSnackbar({ open: true, msg: 'تم تسجيل التبرع اليدوي بنجاح', severity: 'success' });
            setIsAddModalOpen(false);
            setFormData(emptyForm);
            fetchData();
        } catch (err) {
            console.error('Failed to create offline donation:', err);
            setSnackbar({ open: true, msg: 'حدث خطأ أثناء تسجيل التبرع', severity: 'error' });
        }
    };

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => setViewDonation(row) },
        { 
            icon: 'fa-solid fa-check text-green-600', 
            tooltip: 'تأكيد السداد وتحديث الميزانية', 
            show: (row) => row.status === 'pending',
            onClick: (row) => handleConfirmPayment(row.id) 
        }
    ];

    const handleExport = () => {
        setSnackbar({ open: true, msg: `جاري تصدير ${filteredDonations.length} تبرع إلى Excel...` });
    };

    const selectClass = "px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";
    const snackbarClose = () => setSnackbar({ open: false, msg: '', severity: 'success' });

    if (loading) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mb-2"></div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">جاري تحميل التبرعات...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3" dir="rtl">
            <AdminPageHeader
                title={t('admin.donationsPage.title') || 'سجل التبرعات'}
                subtitle={t('admin.donationsPage.subtitle') || 'إدارة ومتابعة عمليات التبرع الإلكترونية والنقدية'}
                action={{ label: 'إضافة تبرع يدوي', icon: 'fa-solid fa-plus', onClick: () => setIsAddModalOpen(true) }}
                secondaryAction={{ label: t('admin.donationsPage.exportExcel') || 'تصدير البيانات', icon: 'fa-solid fa-download', onClick: handleExport }}
            />

            <AdminStatsGrid stats={kpis} columns={3} />

            <AdminFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t('admin.donationsPage.searchPlaceholder') || 'البحث باسم المتبرع أو رقم العملية...'}
            >
                <select className={selectClass} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                    <option value="">{t('admin.donationsPage.allProjects') || 'جميع المشاريع'}</option>
                    {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">{t('admin.donationsPage.allStatuses') || 'جميع الحالات'}</option>
                    <option value="completed">مكتمل</option>
                    <option value="pending">قيد المعالجة</option>
                    <option value="refunded">مسترد</option>
                </select>
                <select className={selectClass} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="all">{t('admin.donationsPage.allPeriods') || 'جميع الفترات'}</option>
                    <option value="today">{t('admin.donationsPage.today') || 'اليوم'}</option>
                    <option value="week">{t('admin.donationsPage.thisWeek') || 'هذا الأسبوع'}</option>
                    <option value="month">{t('admin.donationsPage.thisMonth') || 'هذا الشهر'}</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable columns={columns} data={filteredDonations} actions={actions} emptyMessage="لا توجد تبرعات مطابقة للبحث" />

            <AdminFormDialog
                open={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleAddSubmit}
                title="إضافة تبرع يدوي (أوفلاين)"
                submitLabel="تسجيل التبرع"
            >
                <input
                    placeholder="اسم المتبرع الكامل"
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
                    value={formData.targetId}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                >
                    <option value="">اختر الهدف الموجه إليه (مشروع / حملة)</option>
                    <optgroup label="المشاريع النشطة">
                        {projects.map(p => (
                            <option key={p.id} value={`project:${p.id}`}>{p.title}</option>
                        ))}
                    </optgroup>
                    <optgroup label="الحملات النشطة">
                        {campaigns.map(c => (
                            <option key={c.id} value={`campaign:${c.id}`}>{c.title}</option>
                        ))}
                    </optgroup>
                </select>

                <textarea
                    placeholder="ملاحظات إضافية (اختياري)..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
            </AdminFormDialog>

            {viewDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewDonation(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto z-10">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">تفاصيل التبرع #{String(viewDonation.id).substring(0, 8)}</h2>
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
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">الهدف المالي</p>
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
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
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
                        </div>
                    </div>
                </div>
            )}

            {viewDonor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewDonor(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto z-10">
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

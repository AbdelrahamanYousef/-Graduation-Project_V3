import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatDate } from '../../i18n';
import { getVolunteers, approveVolunteer, rejectVolunteer } from '../../api/volunteers.api';

const STATUS_MAP = {
    PENDING: { label: 'قيد الانتظار', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
    APPROVED: { label: 'مقبول', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
    REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
};

const AREA_MAP = {
    MEDICAL: 'طبي', EDUCATION: 'تعليمي', COMMUNITY: 'مجتمعي',
    TECH: 'تقني', ADMIN: 'إداري', FIELD: 'ميداني',
};

function AdminVolunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [viewItem, setViewItem] = useState(null);
    const [acceptDialog, setAcceptDialog] = useState({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState({ open: false, item: null, reason: '' });
    const [acceptForm, setAcceptForm] = useState({ adminNotes: '', nextSteps: '' });
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        loadVolunteers();
    }, []);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const loadVolunteers = async () => {
        setLoading(true);
        try {
            const data = await getVolunteers();
            setVolunteers(data);
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل تحميل البيانات', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return volunteers.filter(v => {
            if (search && !v.name.includes(search) && !v.email.includes(search) && !v.phone.includes(search)) return false;
            if (statusFilter && v.status !== statusFilter) return false;
            if (dateRange !== 'all') {
                const d = new Date(v.createdAt);
                const now = new Date();
                if (dateRange === 'today' && d.toDateString() !== now.toDateString()) return false;
                if (dateRange === 'week' && (now - d) / (1000 * 60 * 60 * 24) > 7) return false;
                if (dateRange === 'month' && (now.getMonth() !== d.getMonth() || now.getFullYear() !== d.getFullYear())) return false;
            }
            return true;
        });
    }, [volunteers, search, statusFilter, dateRange]);

    const handleApprove = async () => {
        try {
            await approveVolunteer(acceptDialog.item.id, acceptForm);
            setSnackbar({ open: true, msg: 'تم قبول طلب التطوع', severity: 'success' });
            setAcceptDialog({ open: false, item: null });
            setAcceptForm({ adminNotes: '', nextSteps: '' });
            loadVolunteers();
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل قبول الطلب', severity: 'error' });
        }
    };

    const handleReject = async () => {
        try {
            await rejectVolunteer(rejectDialog.item.id, rejectDialog.reason);
            setSnackbar({ open: true, msg: 'تم رفض طلب التطوع', severity: 'success' });
            setRejectDialog({ open: false, item: null, reason: '' });
            loadVolunteers();
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل رفض الطلب', severity: 'error' });
        }
    };

    const columns = [
        { key: 'name', label: 'الاسم', render: (val, row) => (
            <div>
                <p className="text-sm font-medium">{val}</p>
                <span className="text-xs text-neutral-500">{row.email} — {row.phone}</span>
            </div>
        )},
        { key: 'area', label: 'المجال', render: (val) => AREA_MAP[val] || val },
        { key: 'createdAt', label: 'تاريخ التقديم', render: (val) => val ? formatDate(val) : '-' },
        {
            key: 'status', label: 'الحالة',
            render: (val) => {
                const s = STATUS_MAP[val] || STATUS_MAP.PENDING;
                return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s.label}</span>;
            },
        },
    ];

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => setViewItem(row) },
        {
            icon: 'fa-solid fa-check', tooltip: 'قبول', iconSize: 16,
            show: (row) => row.status === 'PENDING',
            onClick: (row) => { setAcceptDialog({ open: true, item: row }); setAcceptForm({ adminNotes: '', nextSteps: '' }); },
        },
        {
            icon: 'fa-solid fa-xmark', tooltip: 'رفض', iconSize: 16,
            show: (row) => row.status === 'PENDING',
            onClick: (row) => setRejectDialog({ open: true, item: row, reason: '' }),
        },
    ];

    const selectClass = "px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <AdminPageHeader title="إدارة طلبات التطوع" subtitle="مراجعة وإدارة طلبات المتطوعين" />
                <div className="text-center py-16 text-neutral-500">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader title="إدارة طلبات التطوع" subtitle="مراجعة وإدارة طلبات المتطوعين" />

            <AdminFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="بحث بالاسم أو البريد أو الهاتف..."
            >
                <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">جميع الحالات</option>
                    <option value="PENDING">قيد الانتظار</option>
                    <option value="APPROVED">مقبول</option>
                    <option value="REJECTED">مرفوض</option>
                </select>
                <select className={selectClass} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="all">كل الفترات</option>
                    <option value="today">اليوم</option>
                    <option value="week">آخر أسبوع</option>
                    <option value="month">هذا الشهر</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={columns}
                data={filteredData}
                actions={actions}
                emptyMessage="لا توجد طلبات تطوع مطابقة"
            />

            {/* View Details Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewItem(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-lg font-bold">تفاصيل طلب التطوع</h2>
                            <button onClick={() => setViewItem(null)} className="text-neutral-400 hover:text-neutral-600"><i className="fa-solid fa-xmark text-xl" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><p className="text-xs text-neutral-500">الاسم</p><p className="font-semibold">{viewItem.name}</p></div>
                                <div><p className="text-xs text-neutral-500">المجال</p><p className="font-semibold">{AREA_MAP[viewItem.area] || viewItem.area}</p></div>
                                <div><p className="text-xs text-neutral-500">البريد</p><p className="font-semibold">{viewItem.email}</p></div>
                                <div><p className="text-xs text-neutral-500">الهاتف</p><p className="font-semibold">{viewItem.phone}</p></div>
                                <div><p className="text-xs text-neutral-500">تاريخ التقديم</p><p className="font-semibold">{formatDate(viewItem.createdAt)}</p></div>
                                <div>
                                    <p className="text-xs text-neutral-500">الحالة</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).color}`}>
                                        {(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).label}
                                    </span>
                                </div>
                            </div>
                            {viewItem.message && (
                                <div><p className="text-xs text-neutral-500">رسالة إضافية</p><p className="text-sm mt-0.5">{viewItem.message}</p></div>
                            )}
                            {viewItem.adminNotes && <div><p className="text-xs text-neutral-500">ملاحظات الإدارة</p><p className="text-sm mt-0.5">{viewItem.adminNotes}</p></div>}
                            {viewItem.nextSteps && <div><p className="text-xs text-neutral-500">الخطوات التالية</p><p className="text-sm mt-0.5">{viewItem.nextSteps}</p></div>}
                            {viewItem.rejectionReason && <div><p className="text-xs text-neutral-500">سبب الرفض</p><p className="text-sm mt-0.5 text-error-500">{viewItem.rejectionReason}</p></div>}
                            {viewItem.reviewedBy && <div><p className="text-xs text-neutral-500">تمت المراجعة بواسطة</p><p className="text-sm mt-0.5">{viewItem.reviewedBy.name}</p></div>}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Dialog */}
            {acceptDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setAcceptDialog({ open: false, item: null })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">قبول طلب التطوع</h2>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                قبول طلب <strong>{acceptDialog.item?.name}</strong> في مجال <strong>{AREA_MAP[acceptDialog.item?.area]}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">ملاحظات الإدارة (اختياري)</label>
                                <textarea
                                    value={acceptForm.adminNotes}
                                    onChange={e => setAcceptForm(p => ({ ...p, adminNotes: e.target.value }))}
                                    rows={3}
                                    placeholder="أي ملاحظات إضافية..."
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">الخطوات التالية (اختياري)</label>
                                <textarea
                                    value={acceptForm.nextSteps}
                                    onChange={e => setAcceptForm(p => ({ ...p, nextSteps: e.target.value }))}
                                    rows={3}
                                    placeholder="مثال: التواصل مع المتطوع لتحديد موعد المقابلة..."
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setAcceptDialog({ open: false, item: null })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={handleApprove} className="px-5 py-2 rounded-md font-semibold bg-success-500 text-white hover:bg-success-600 transition-colors">قبول</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {rejectDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setRejectDialog({ open: false, item: null, reason: '' })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">رفض طلب التطوع</h2>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                رفض طلب <strong>{rejectDialog.item?.name}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">سبب الرفض (اختياري)</label>
                                <textarea
                                    value={rejectDialog.reason}
                                    onChange={e => setRejectDialog(p => ({ ...p, reason: e.target.value }))}
                                    rows={3}
                                    placeholder="اكتب سبب الرفض..."
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setRejectDialog({ open: false, item: null, reason: '' })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={handleReject} className="px-5 py-2 rounded-md font-semibold bg-error-500 text-white hover:bg-error-600 transition-colors">رفض</button>
                        </div>
                    </div>
                </div>
            )}

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${
                        snackbar.severity === 'success' ? 'bg-success-500 text-white' : 'bg-error-500 text-white'
                    }`}>
                        {snackbar.msg}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminVolunteers;

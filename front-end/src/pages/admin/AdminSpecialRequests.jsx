import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatDate } from '../../i18n';
import { getSpecialRequests, approveSpecialRequest, rejectSpecialRequest } from '../../api/specialRequests.api';

const STATUS_MAP = {
    PENDING: { label: 'قيد الانتظار', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
    APPROVED: { label: 'تمت الموافقة', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
    REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
};

const AID_TYPE_MAP = {
    CASH: 'نقدي', MONTHLY_ALLOWANCE: 'إعانة شهرية', FINANCIAL_AID: 'مساعدات مالية',
    FOOD: 'غذائي', MEDICAL: 'طبي', EDUCATIONAL: 'تعليمي', OTHER: 'أخرى',
};

const AID_TYPE_OPTIONS = [
    { value: 'CASH', label: 'نقدي' },
    { value: 'MONTHLY_ALLOWANCE', label: 'إعانة شهرية' },
    { value: 'FINANCIAL_AID', label: 'مساعدات مالية' },
    { value: 'FOOD', label: 'غذائي' },
    { value: 'MEDICAL', label: 'طبي' },
    { value: 'EDUCATIONAL', label: 'تعليمي' },
    { value: 'OTHER', label: 'أخرى' },
];

function AdminSpecialRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [aidTypeFilter, setAidTypeFilter] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [viewItem, setViewItem] = useState(null);
    const [approveDialog, setApproveDialog] = useState({ open: false, item: null });
    const [rejectDialog, setRejectDialog] = useState({ open: false, item: null, reason: '' });
    const [approveForm, setApproveForm] = useState({ aidType: 'CASH', adminNotes: '' });
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await getSpecialRequests();
            setRequests(data);
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل تحميل البيانات', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return requests.filter(r => {
            if (search && !r.name.includes(search) && !r.email.includes(search) && !r.phone.includes(search)) return false;
            if (statusFilter && r.status !== statusFilter) return false;
            if (aidTypeFilter && r.aidType !== aidTypeFilter) return false;
            if (dateRange !== 'all') {
                const d = new Date(r.createdAt);
                const now = new Date();
                if (dateRange === 'today' && d.toDateString() !== now.toDateString()) return false;
                if (dateRange === 'week' && (now - d) / (1000 * 60 * 60 * 24) > 7) return false;
                if (dateRange === 'month' && (now.getMonth() !== d.getMonth() || now.getFullYear() !== d.getFullYear())) return false;
            }
            return true;
        });
    }, [requests, search, statusFilter, aidTypeFilter, dateRange]);

    const handleApprove = async () => {
        try {
            await approveSpecialRequest(approveDialog.item.id, approveForm);
            setSnackbar({ open: true, msg: 'تمت الموافقة على الطلب', severity: 'success' });
            setApproveDialog({ open: false, item: null });
            setApproveForm({ aidType: 'CASH', adminNotes: '' });
            loadRequests();
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل الموافقة على الطلب', severity: 'error' });
        }
    };

    const handleReject = async () => {
        try {
            await rejectSpecialRequest(rejectDialog.item.id, rejectDialog.reason);
            setSnackbar({ open: true, msg: 'تم رفض الطلب', severity: 'success' });
            setRejectDialog({ open: false, item: null, reason: '' });
            loadRequests();
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
        { key: 'requestType', label: 'نوع الطلب', render: (val) => {
            const labels = { financial: 'مساعدة مالية', medical: 'مساعدة طبية', food: 'مساعدات غذائية', educational: 'دعم تعليمي', housing: 'دعم سكني', other: 'أخرى' };
            return labels[val] || val;
        }},
        { key: 'createdAt', label: 'تاريخ التقديم', render: (val) => val ? formatDate(val) : '-' },
        {
            key: 'status', label: 'الحالة',
            render: (val) => {
                const s = STATUS_MAP[val] || STATUS_MAP.PENDING;
                return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s.label}</span>;
            },
        },
        {
            key: 'aidType', label: 'نوع المساعدة',
            render: (val) => val ? <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">{AID_TYPE_MAP[val] || val}</span> : '-',
        },
    ];

    const actions = [
        { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل', onClick: (row) => setViewItem(row) },
        {
            icon: 'fa-solid fa-check', tooltip: 'موافقة',
            show: (row) => row.status === 'PENDING',
            onClick: (row) => { setApproveDialog({ open: true, item: row }); setApproveForm({ aidType: 'CASH', adminNotes: '' }); },
        },
        {
            icon: 'fa-solid fa-xmark', tooltip: 'رفض',
            show: (row) => row.status === 'PENDING',
            onClick: (row) => setRejectDialog({ open: true, item: row, reason: '' }),
        },
    ];

    const selectClass = "px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <AdminPageHeader title="إدارة الطلبات الخاصة" subtitle="مراجعة وإدارة طلبات المساعدة الخاصة" />
                <div className="text-center py-16 text-neutral-500">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader title="إدارة الطلبات الخاصة" subtitle="مراجعة وإدارة طلبات المساعدة الخاصة" />

            <AdminFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="بحث بالاسم أو البريد أو الهاتف..."
            >
                <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">جميع الحالات</option>
                    <option value="PENDING">قيد الانتظار</option>
                    <option value="APPROVED">تمت الموافقة</option>
                    <option value="REJECTED">مرفوض</option>
                </select>
                <select className={selectClass} value={aidTypeFilter} onChange={(e) => setAidTypeFilter(e.target.value)}>
                    <option value="">جميع أنواع المساعدة</option>
                    {AID_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                emptyMessage="لا توجد طلبات خاصة مطابقة"
            />

            {/* View Details Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setViewItem(null)} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-lg font-bold">تفاصيل الطلب الخاص</h2>
                            <button onClick={() => setViewItem(null)} className="text-neutral-400 hover:text-neutral-600"><i className="fa-solid fa-xmark text-xl" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><p className="text-xs text-neutral-500">الاسم</p><p className="font-semibold">{viewItem.name}</p></div>
                                <div><p className="text-xs text-neutral-500">نوع الطلب</p><p className="font-semibold">{viewItem.requestType}</p></div>
                                <div><p className="text-xs text-neutral-500">البريد</p><p className="font-semibold">{viewItem.email}</p></div>
                                <div><p className="text-xs text-neutral-500">الهاتف</p><p className="font-semibold">{viewItem.phone}</p></div>
                                <div><p className="text-xs text-neutral-500">تاريخ التقديم</p><p className="font-semibold">{formatDate(viewItem.createdAt)}</p></div>
                                <div>
                                    <p className="text-xs text-neutral-500">الحالة</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).color}`}>
                                        {(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).label}
                                    </span>
                                </div>
                                {viewItem.aidType && (
                                    <div>
                                        <p className="text-xs text-neutral-500">نوع المساعدة</p>
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                                            {AID_TYPE_MAP[viewItem.aidType] || viewItem.aidType}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div><p className="text-xs text-neutral-500">شرح الطلب</p><p className="text-sm mt-0.5">{viewItem.description}</p></div>
                            {viewItem.adminNotes && <div><p className="text-xs text-neutral-500">ملاحظات الإدارة</p><p className="text-sm mt-0.5">{viewItem.adminNotes}</p></div>}
                            {viewItem.rejectionReason && <div><p className="text-xs text-neutral-500">سبب الرفض</p><p className="text-sm mt-0.5 text-error-500">{viewItem.rejectionReason}</p></div>}
                            {viewItem.reviewedBy && <div><p className="text-xs text-neutral-500">تمت المراجعة بواسطة</p><p className="text-sm mt-0.5">{viewItem.reviewedBy.name}</p></div>}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Dialog */}
            {approveDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setApproveDialog({ open: false, item: null })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">الموافقة على الطلب</h2>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                الموافقة على طلب <strong>{approveDialog.item?.name}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">نوع المساعدة المقدمة</label>
                                <select
                                    value={approveForm.aidType}
                                    onChange={e => setApproveForm(p => ({ ...p, aidType: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                >
                                    {AID_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">ملاحظات الإدارة (اختياري)</label>
                                <textarea
                                    value={approveForm.adminNotes}
                                    onChange={e => setApproveForm(p => ({ ...p, adminNotes: e.target.value }))}
                                    rows={3}
                                    placeholder="أي ملاحظات إضافية..."
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setApproveDialog({ open: false, item: null })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={handleApprove} className="px-5 py-2 rounded-md font-semibold bg-success-500 text-white hover:bg-success-600 transition-colors">موافقة</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {rejectDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setRejectDialog({ open: false, item: null, reason: '' })} />
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">رفض الطلب</h2>
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

export default AdminSpecialRequests;

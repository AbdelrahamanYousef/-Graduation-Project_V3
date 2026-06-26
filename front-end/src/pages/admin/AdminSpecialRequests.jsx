import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatDate } from '../../i18n';
import { getSpecialRequests, updateSpecialRequestStatus, allocateSpecialRequestAid } from '../../api/specialRequests.api';

const STATUS_MAP = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  UNDER_REVIEW: { label: 'تحت الدراسة', color: 'bg-info-100 text-info-700 dark:bg-info-500/10 dark:text-info-400' },
  APPROVED: { label: 'مقبول', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
};

const DISTRIBUTION_MAP = {
  Assigned: { label: 'تم التخصيص', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  Disbursed: { label: 'تم الصرف', color: 'bg-info-100 text-info-700 dark:bg-info-500/10 dark:text-info-400' },
  Delivered: { label: 'تم التسليم', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
};

const PROCESS_ACTION_MAP = {
  SUBMITTED: { label: 'تقديم الطلب', icon: 'fa-solid fa-paper-plane' },
  UNDER_REVIEW: { label: 'بدء الدراسة والبحث', icon: 'fa-solid fa-magnifying-glass' },
  APPROVED: { label: 'الموافقة على الطلب', icon: 'fa-solid fa-check' },
  REJECTED: { label: 'رفض الطلب', icon: 'fa-solid fa-xmark' },
  AID_ALLOCATED: { label: 'تخصيص/تحديث المساعدة', icon: 'fa-solid fa-hand-holding-dollar' },
};

function AdminSpecialRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [aidTypeFilter, setAidTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [viewItem, setViewItem] = useState(null);

  const [statusDialog, setStatusDialog] = useState({ open: false, item: null, status: 'UNDER_REVIEW', notes: '' });
  const [allocateDialog, setAllocateDialog] = useState({ open: false, item: null, aidType: 'مساعدة مالية', aidAmount: '', aidQuantity: '', distributionStatus: 'Assigned' });

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
      setSnackbar({ open: true, msg: 'فشل تحميل طلبات المساعدة', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return requests.filter(r => {
      if (search && !r.name.includes(search) && !r.phone.includes(search) && !(r.email && r.email.includes(search))) return false;
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

  // Unique aid types for filtering
  const uniqueAidTypes = useMemo(() => {
    const set = new Set();
    requests.forEach(r => {
      if (r.aidType) set.add(r.aidType);
    });
    return Array.from(set);
  }, [requests]);

  const handleUpdateStatus = async () => {
    if (!statusDialog.notes.trim()) {
      setSnackbar({ open: true, msg: 'ملاحظات تغيير الحالة مطلوبة إجبارياً', severity: 'error' });
      return;
    }
    try {
      await updateSpecialRequestStatus(statusDialog.item.id, statusDialog.status, statusDialog.notes);
      setSnackbar({ open: true, msg: 'تم تحديث حالة طلب المساعدة بنجاح', severity: 'success' });
      setStatusDialog({ open: false, item: null, status: 'UNDER_REVIEW', notes: '' });
      loadRequests();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل تحديث الحالة', severity: 'error' });
    }
  };

  const handleAllocate = async () => {
    if (!allocateDialog.aidType.trim()) {
      setSnackbar({ open: true, msg: 'نوع المساعدة المخصصة مطلوب', severity: 'error' });
      return;
    }
    try {
      const payload = {
        aidType: allocateDialog.aidType,
        aidAmount: allocateDialog.aidAmount ? parseFloat(allocateDialog.aidAmount) : null,
        aidQuantity: allocateDialog.aidQuantity || null,
        distributionStatus: allocateDialog.distributionStatus,
      };
      await allocateSpecialRequestAid(allocateDialog.item.id, payload);
      setSnackbar({ open: true, msg: 'تم تخصيص المساعدات بنجاح', severity: 'success' });
      setAllocateDialog({ open: false, item: null, aidType: 'مساعدة مالية', aidAmount: '', aidQuantity: '', distributionStatus: 'Assigned' });
      loadRequests();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل تخصيص المساعدات', severity: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'المستفيد',
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{val}</p>
          <span className="text-xs text-neutral-500">{row.phone} {row.email ? `— ${row.email}` : ''}</span>
        </div>
      ),
    },
    { key: 'requestType', label: 'نوع الطلب' },
    { key: 'createdAt', label: 'تاريخ التقديم', render: (val) => (val ? formatDate(val) : '-') },
    {
      key: 'status',
      label: 'حالة الطلب',
      render: (val) => {
        const s = STATUS_MAP[val] || STATUS_MAP.PENDING;
        return <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${s.color}`}>{s.label}</span>;
      },
    },
    {
      key: 'aidType',
      label: 'المساعدة المخصصة',
      render: (val, row) => {
        if (!val) return <span className="text-neutral-400 text-xs">—</span>;
        const dist = DISTRIBUTION_MAP[row.distributionStatus] || DISTRIBUTION_MAP.Assigned;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {val} {row.aidAmount ? `(${row.aidAmount} ج.م)` : ''} {row.aidQuantity ? `(${row.aidQuantity})` : ''}
            </span>
            <span className={`inline-flex w-fit px-1.5 py-0.1 rounded text-xxs font-medium ${dist.color}`}>
              {dist.label}
            </span>
          </div>
        );
      },
    },
  ];

  const actions = [
    { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل والخط الزمني', onClick: (row) => setViewItem(row) },
    {
      icon: 'fa-solid fa-rotate',
      tooltip: 'تغيير الحالة',
      show: (row) => row.status !== 'APPROVED' && row.status !== 'REJECTED',
      onClick: (row) => setStatusDialog({ open: true, item: row, status: row.status === 'PENDING' ? 'UNDER_REVIEW' : 'APPROVED', notes: '' }),
    },
    {
      icon: 'fa-solid fa-hand-holding-dollar',
      tooltip: 'تخصيص المساعدات',
      show: (row) => row.status === 'APPROVED',
      onClick: (row) => setAllocateDialog({
        open: true,
        item: row,
        aidType: row.aidType || 'مساعدة مالية',
        aidAmount: row.aidAmount || '',
        aidQuantity: row.aidQuantity || '',
        distributionStatus: row.distributionStatus || 'Assigned'
      }),
    },
  ];

  const selectClass = "px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";
  const inputClass = "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none text-sm";
  const labelClass = "block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1";

  function renderProcessLog(logs) {
    if (!logs || logs.length === 0) return <p className="text-sm text-neutral-400">لا توجد أحداث بعد</p>;
    return (
      <div className="space-y-4 mt-2">
        {logs.map((log, i) => {
          const actionInfo = PROCESS_ACTION_MAP[log.action] || { label: log.action, icon: 'fa-solid fa-circle' };
          const actorName = log.performedBy?.name || 'النظام';
          return (
            <div key={log.id || i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: log.action === 'SUBMITTED' ? 'rgba(0,177,106,0.15)' : 'rgba(26,74,68,0.1)',
                    color: log.action === 'SUBMITTED' ? '#00b16a' : '#1a4a44',
                  }}
                >
                  <i className={actionInfo.icon}></i>
                </div>
                {i < logs.length - 1 && <div className="w-px flex-1 min-h-[20px] bg-neutral-200 dark:bg-neutral-700" />}
              </div>
              <div className="pb-2 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{actionInfo.label}</p>
                  <span className="text-xxs text-neutral-400">{log.createdAt ? formatDate(log.createdAt) : ''}</span>
                </div>
                <p className="text-xs text-neutral-500">منفذ الإجراء: {actorName}</p>
                {log.details && (
                  <div className="text-xs bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded mt-1 border border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {log.action === 'AID_ALLOCATED' && (
                      <div className="space-y-0.5">
                        <p><strong>نوع المساعدة المخصصة: </strong>{log.details.aidType}</p>
                        {log.details.aidAmount && <p><strong>القيمة المالية: </strong>{log.details.aidAmount} ج.م</p>}
                        {log.details.aidQuantity && <p><strong>الكمية/الأصناف: </strong>{log.details.aidQuantity}</p>}
                        <p><strong>حالة التوزيع: </strong>{DISTRIBUTION_MAP[log.details.distributionStatus]?.label || log.details.distributionStatus}</p>
                      </div>
                    )}
                    {log.action !== 'AID_ALLOCATED' && log.details.notes && (
                      <p><strong>ملاحظات: </strong>{log.details.notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <AdminPageHeader title="إدارة الطلبات الخاصة" subtitle="مراجعة وتخصيص المساعدات العينية والمالية العاجلة" />
        <div className="text-center py-16 text-neutral-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AdminPageHeader title="إدارة الطلبات الخاصة" subtitle="مراجعة وتخصيص المساعدات العينية والمالية العاجلة" />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث باسم المستفيد أو الهاتف..."
      >
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">جميع حالات الطلب</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="UNDER_REVIEW">تحت الدراسة</option>
          <option value="APPROVED">مقبول</option>
          <option value="REJECTED">مرفوض</option>
        </select>
        
        <select className={selectClass} value={aidTypeFilter} onChange={(e) => setAidTypeFilter(e.target.value)}>
          <option value="">جميع أنواع المساعدات</option>
          {uniqueAidTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
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
        emptyMessage="لا توجد طلبات مساعدة مطابقة"
      />

      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">تفاصيل طلب المساعدة الخاصة</h2>
              <button onClick={() => setViewItem(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">اسم المستفيد</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{viewItem.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">نوع الطلب المقدم</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{viewItem.requestType}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">رقم الهاتف</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200" dir="ltr">{viewItem.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">البريد الإلكتروني</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{viewItem.email || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">تاريخ التقديم</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatDate(viewItem.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">الحالة</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).color}`}>
                    {(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-500">تفاصيل الاحتياج والطلب</p>
                <p className="text-sm mt-1 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded border border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {viewItem.description}
                </p>
              </div>

              {/* Allocation Info (if APPROVED) */}
              {viewItem.status === 'APPROVED' && (
                <div className="bg-success-50/20 dark:bg-success-950/10 p-4 rounded-lg border border-success-100/30 space-y-3">
                  <p className="text-sm font-bold text-success-800 dark:text-success-400">تخصيص المساعدات الحالي</p>
                  {viewItem.aidType ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">نوع المساعدة المخصصة</p>
                        <p className="font-semibold text-neutral-850 dark:text-neutral-200">{viewItem.aidType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">القيمة المادية للمساعدة</p>
                        <p className="font-semibold text-neutral-850 dark:text-neutral-200">{viewItem.aidAmount ? `${viewItem.aidAmount} ج.م` : 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">حالة التوزيع والاستلام</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${(DISTRIBUTION_MAP[viewItem.distributionStatus] || DISTRIBUTION_MAP.Assigned).color}`}>
                          {(DISTRIBUTION_MAP[viewItem.distributionStatus] || DISTRIBUTION_MAP.Assigned).label}
                        </span>
                      </div>
                      {viewItem.aidQuantity && (
                        <div className="col-span-full">
                          <p className="text-xs text-neutral-500">الكمية أو الأصناف</p>
                          <p className="font-semibold text-neutral-850 dark:text-neutral-200">{viewItem.aidQuantity}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">لم يتم تخصيص أي مساعدة حتى الآن. انقر فوق زر "تخصيص المساعدات" لتسجيلها.</p>
                  )}
                </div>
              )}

              {/* Admin Fields */}
              {viewItem.adminNotes && (
                <div>
                  <p className="text-xs text-neutral-500">ملاحظات قبول الإدارة</p>
                  <p className="text-sm mt-1 text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded border border-neutral-100 dark:border-neutral-800">
                    {viewItem.adminNotes}
                  </p>
                </div>
              )}
              {viewItem.rejectionReason && (
                <div>
                  <p className="text-xs text-neutral-500">سبب رفض الإدارة</p>
                  <p className="text-sm mt-1 text-error-600 dark:text-error-400 bg-error-50/20 dark:bg-error-950/10 p-3 rounded border border-error-100/30">
                    {viewItem.rejectionReason}
                  </p>
                </div>
              )}

              {/* Process Log Timeline */}
              <div className="border-t border-neutral-100 dark:border-neutral-700 pt-4">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">الخط الزمني وسجل الإجراءات (Lineage Tracking)</p>
                {renderProcessLog(viewItem.processLogs)}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <button
                onClick={() => setViewItem(null)}
                className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setStatusDialog({ open: false, item: null, status: 'UNDER_REVIEW', notes: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">تحديث حالة طلب المساعدة</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                تحديث حالة طلب المساعدة للمستفيد <strong>{statusDialog.item?.name}</strong>.
              </p>
              
              <div>
                <label className={labelClass}>الحالة الجديدة</label>
                <select
                  value={statusDialog.status}
                  onChange={e => setStatusDialog(p => ({ ...p, status: e.target.value }))}
                  className={inputClass}
                >
                  <option value="UNDER_REVIEW">تحت الدراسة والبحث (UNDER_REVIEW)</option>
                  <option value="APPROVED">مقبول وموافق عليه (APPROVED)</option>
                  <option value="REJECTED">مرفوض (REJECTED)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>ملاحظات تغيير الحالة / مبرر الإجراء <span className="text-error-500">*</span></label>
                <textarea
                  value={statusDialog.notes}
                  onChange={e => setStatusDialog(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="يرجى كتابة المبرر أو الملاحظات إجبارياً..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setStatusDialog({ open: false, item: null, status: 'UNDER_REVIEW', notes: '' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!statusDialog.notes.trim()}
                className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  statusDialog.notes.trim() ? 'bg-primary-500 hover:bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                }`}
              >
                حفظ الحالة الجديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Dialog */}
      {allocateDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setAllocateDialog({ open: false, item: null, aidType: 'مساعدة مالية', aidAmount: '', aidQuantity: '', distributionStatus: 'Assigned' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">تخصيص المساعدات للطلب المقبول</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                تسجيل أو تحديث تفاصيل الدعم المخصص للمستفيد <strong>{allocateDialog.item?.name}</strong> وحالة التوزيع.
              </p>

              <div>
                <label className={labelClass}>نوع المساعدة المخصصة <span className="text-error-500">*</span></label>
                <select
                  value={allocateDialog.aidType}
                  onChange={e => setAllocateDialog(p => ({ ...p, aidType: e.target.value }))}
                  className={inputClass}
                >
                  <option value="مساعدة مالية">مساعدة مالية (Cash Money)</option>
                  <option value="سلة غذائية">سلة غذائية (Food Basket)</option>
                  <option value="أثاث وأجهزة منزلية">أثاث وأجهزة منزلية (Appliances)</option>
                  <option value="مستلزمات طبية">مستلزمات طبية (Medical Supplies)</option>
                  <option value="أخرى">أخرى (Other)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>القيمة المالية المخصصة (بالجنيه المصري) - اختياري</label>
                <input
                  type="number"
                  min="0"
                  value={allocateDialog.aidAmount}
                  onChange={e => setAllocateDialog(p => ({ ...p, aidAmount: e.target.value }))}
                  placeholder="مثال: 1500"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>الكمية أو تفاصيل الأصناف المخصصة - اختياري</label>
                <input
                  type="text"
                  value={allocateDialog.aidQuantity}
                  onChange={e => setAllocateDialog(p => ({ ...p, aidQuantity: e.target.value }))}
                  placeholder="مثال: كرتونة طعام عدد 2، كرسي متحرك..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>حالة التوزيع والاستلام</label>
                <select
                  value={allocateDialog.distributionStatus}
                  onChange={e => setAllocateDialog(p => ({ ...p, distributionStatus: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Assigned">مخصصة ومسجلة (Assigned)</option>
                  <option value="Disbursed">تم الصرف من الخزينة/المخزن (Disbursed)</option>
                  <option value="Delivered">تم تسليم المساعدة للمستفيد (Delivered)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setAllocateDialog({ open: false, item: null, aidType: 'مساعدة مالية', aidAmount: '', aidQuantity: '', distributionStatus: 'Assigned' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAllocate}
                disabled={!allocateDialog.aidType.trim()}
                className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  allocateDialog.aidType.trim() ? 'bg-success-500 hover:bg-success-600' : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                }`}
              >
                حفظ التخصيص
              </button>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${snackbar.severity === 'success' ? 'bg-success-500 text-white animate-bounce' : 'bg-error-500 text-white animate-pulse'}`}>
            {snackbar.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSpecialRequests;

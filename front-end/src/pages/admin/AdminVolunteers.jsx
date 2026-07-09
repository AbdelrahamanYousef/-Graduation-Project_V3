import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatDate } from '../../i18n';
import { getVolunteers, approveVolunteer, rejectVolunteer, logVolunteerCall, requestVolunteerInfo } from '../../api/volunteers.api';

const STATUS_MAP = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  APPROVED: { label: 'مقبول', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
  NEEDS_INFO: { label: 'بحاجة معلومات إضافية', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  'Accepted - Onboarding': { label: 'مقبول - قيد التوجيه', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  'Withdrawn by Applicant': { label: 'منسحب من قبل المتقدم', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-600/10 dark:text-neutral-400' },
  'No Answer - Try Later': { label: 'لا يوجد رد - المحاولة لاحقاً', color: 'bg-info-100 text-info-700 dark:bg-info-500/10 dark:text-info-400' },
};

const AREA_MAP = {
  MEDICAL: 'طبي',
  EDUCATION: 'تعليمي',
  COMMUNITY: 'مجتمعي',
  TECH: 'تقني',
  ADMIN: 'إداري',
  FIELD: 'ميداني',
};

const PROCESS_ACTION_MAP = {
  SUBMITTED: { label: 'تقديم الطلب', icon: 'fa-solid fa-paper-plane' },
  APPROVED: { label: 'قبول الطلب', icon: 'fa-solid fa-check' },
  REJECTED: { label: 'رفض الطلب', icon: 'fa-solid fa-xmark' },
  NEEDS_INFO: { label: 'طلب معلومات إضافية', icon: 'fa-solid fa-circle-exclamation' },
  PHONE_CALL: { label: 'مكالمة هاتفية', icon: 'fa-solid fa-phone' },
};

function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [viewItem, setViewItem] = useState(null);
  
  const [acceptDialog, setAcceptDialog] = useState({ open: false, item: null, adminNotes: '' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, item: null, reason: '' });
  const [callDialog, setCallDialog] = useState({ open: false, item: null, outcome: 'Call Successful - Onboarding Initiated', notes: '' });
  const [requestInfoDialog, setRequestInfoDialog] = useState({ open: false, item: null, message: '' });
  
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
    if (!acceptDialog.adminNotes.trim()) {
      setSnackbar({ open: true, msg: 'ملاحظات القبول مطلوبة إجبارياً', severity: 'error' });
      return;
    }
    try {
      await approveVolunteer(acceptDialog.item.id, { notes: acceptDialog.adminNotes });
      setSnackbar({ open: true, msg: 'تم قبول طلب التطوع وإرسال البريد الإلكتروني بنجاح', severity: 'success' });
      setAcceptDialog({ open: false, item: null, adminNotes: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل قبول الطلب', severity: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.reason.trim()) {
      setSnackbar({ open: true, msg: 'سبب الرفض مطلوب إجبارياً', severity: 'error' });
      return;
    }
    try {
      await rejectVolunteer(rejectDialog.item.id, rejectDialog.reason);
      setSnackbar({ open: true, msg: 'تم رفض طلب التطوع بنجاح', severity: 'success' });
      setRejectDialog({ open: false, item: null, reason: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل رفض الطلب', severity: 'error' });
    }
  };

  const handleRequestInfo = async () => {
    if (!requestInfoDialog.message.trim()) {
      setSnackbar({ open: true, msg: 'الرسالة مطلوبة إجبارياً', severity: 'error' });
      return;
    }
    try {
      await requestVolunteerInfo(requestInfoDialog.item.id, requestInfoDialog.message);
      setSnackbar({ open: true, msg: 'تم إرسال طلب المعلومات الإضافية للمتطوع', severity: 'success' });
      setRequestInfoDialog({ open: false, item: null, message: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل إرسال طلب المعلومات', severity: 'error' });
    }
  };

  const handleLogCall = async () => {
    try {
      await logVolunteerCall(callDialog.item.id, callDialog.outcome, callDialog.notes);
      setSnackbar({ open: true, msg: 'تم تسجيل المكالمة وتحديث الحالة بنجاح', severity: 'success' });
      setCallDialog({ open: false, item: null, outcome: 'Call Successful - Onboarding Initiated', notes: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || 'فشل تسجيل المكالمة', severity: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'الاسم',
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{val}</p>
          <span className="text-xs text-neutral-500">{row.email} — {row.phone}</span>
        </div>
      ),
    },
    { key: 'area', label: 'المجال', render: (val) => AREA_MAP[val] || val },
    { key: 'createdAt', label: 'تاريخ التقديم', render: (val) => (val ? formatDate(val) : '-') },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => {
        const s = STATUS_MAP[val] || STATUS_MAP.PENDING;
        return <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${s.color}`}>{s.label}</span>;
      },
    },
  ];

  const actions = [
    { icon: 'fa-solid fa-eye', tooltip: 'عرض التفاصيل والخط الزمني', onClick: (row) => setViewItem(row) },
    {
      icon: 'fa-solid fa-check',
      tooltip: 'قبول',
      show: (row) => row.status === 'PENDING',
      onClick: (row) => setAcceptDialog({ open: true, item: row, adminNotes: '' }),
    },
    {
      icon: 'fa-solid fa-xmark',
      tooltip: 'رفض',
      show: (row) => row.status === 'PENDING',
      onClick: (row) => setRejectDialog({ open: true, item: row, reason: '' }),
    },
    {
      icon: 'fa-solid fa-phone',
      tooltip: 'تسجيل مكالمة هاتفية',
      show: (row) => ['APPROVED', 'NEEDS_INFO', 'Accepted - Onboarding', 'No Answer - Try Later'].includes(row.status),
      onClick: (row) => setCallDialog({ open: true, item: row, outcome: 'Call Successful - Onboarding Initiated', notes: '' }),
    },
    {
      icon: 'fa-solid fa-circle-exclamation',
      tooltip: 'طلب معلومات إضافية',
      show: (row) => row.status === 'PENDING',
      onClick: (row) => setRequestInfoDialog({ open: true, item: row, message: '' }),
      color: 'warning',
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
                    {log.action === 'PHONE_CALL' && (
                      <p className="mb-1">
                        <strong>النتيجة: </strong>
                        {log.details.outcome === 'Call Successful - Onboarding Initiated' ? 'اتصال ناجح - بدء الإعداد والتوجيه' :
                         log.details.outcome === 'Candidate Refused / Changed their Mind' ? 'المتقدم اعتذر / غير رأيه' :
                         log.details.outcome === 'No Answer / Try Again Later' ? 'لم يرد / المحاولة لاحقاً' : log.details.outcome}
                      </p>
                    )}
                    {log.details.notes && <p><strong>ملاحظات: </strong>{log.details.notes}</p>}
                    {log.action === 'REJECTED' && log.details.notes && <p><strong>السبب: </strong>{log.details.notes}</p>}
                    {log.action === 'APPROVED' && log.details.notes && <p><strong>ملاحظات القبول: </strong>{log.details.notes}</p>}
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
          <option value="NEEDS_INFO">بحاجة معلومات إضافية</option>
          <option value="APPROVED">مقبول</option>
          <option value="REJECTED">مرفوض</option>
          <option value="Accepted - Onboarding">مقبول - قيد التوجيه</option>
          <option value="Withdrawn by Applicant">منسحب من قبل المتقدم</option>
          <option value="No Answer - Try Later">لا يوجد رد - المحاولة لاحقاً</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">تفاصيل طلب التطوع</h2>
              <button onClick={() => setViewItem(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">الاسم</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{viewItem.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">المجال المهتم به</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{AREA_MAP[viewItem.area] || viewItem.area}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">البريد الإلكتروني</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{viewItem.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">رقم الهاتف</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200" dir="ltr">{viewItem.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">تاريخ التقديم</p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatDate(viewItem.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">الحالة الحالية</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).color}`}>
                    {(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).label}
                  </span>
                </div>
              </div>

              {viewItem.message && (
                <div>
                  <p className="text-xs text-neutral-500">رسالة إضافية من المتقدم</p>
                  <p className="text-sm mt-1 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded border border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {viewItem.message}
                  </p>
                </div>
              )}

              {/* CV Section */}
              {(viewItem.cvFile || viewItem.cvUrl) && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-2">السيرة الذاتية (CV)</p>
                  <div className="flex gap-2">
                    {viewItem.cvFile && (
                      <a
                        href={`http://localhost:5000${viewItem.cvFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 hover:bg-primary-100 transition-colors border border-primary-100 dark:border-primary-900"
                      >
                        <i className="fa-solid fa-file-pdf text-sm"></i>
                        تحميل / عرض ملف الـ PDF
                      </a>
                    )}
                    {viewItem.cvUrl && (
                      <a
                        href={viewItem.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-400 hover:bg-info-100 transition-colors border border-info-100 dark:border-info-900"
                      >
                        <i className="fa-solid fa-link text-sm"></i>
                        رابط السيرة الذاتية الخارجي
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Fields */}
              {viewItem.adminNotes && (
                <div>
                  <p className="text-xs text-neutral-500">ملاحظات قبول الإدارة</p>
                  <p className="text-sm mt-1 text-neutral-800 dark:text-neutral-200 bg-success-50/20 dark:bg-success-950/10 p-3 rounded border border-success-100/30">
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

      {/* Accept Dialog */}
      {acceptDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setAcceptDialog({ open: false, item: null, adminNotes: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">قبول طلب التطوع</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                أنت على وشك قبول طلب المتطوع <strong>{acceptDialog.item?.name}</strong> في مجال <strong>{AREA_MAP[acceptDialog.item?.area]}</strong>. سيتم إرسال بريد إلكتروني تلقائي له بالقبول.
              </p>
              <div>
                <label className={labelClass}>ملاحظات القبول والخطوات القادمة <span className="text-error-500">*</span></label>
                <textarea
                  value={acceptDialog.adminNotes}
                  onChange={e => setAcceptDialog(p => ({ ...p, adminNotes: e.target.value }))}
                  rows={3}
                  placeholder="مثال: يرجى كتابة ملاحظات القبول والتوجيه..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setAcceptDialog({ open: false, item: null, adminNotes: '' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleApprove}
                disabled={!acceptDialog.adminNotes.trim()}
                className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  acceptDialog.adminNotes.trim() ? 'bg-success-500 hover:bg-success-600' : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                }`}
              >
                قبول الطلب وتأكيده
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setRejectDialog({ open: false, item: null, reason: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-error-600 dark:text-error-400">رفض طلب التطوع</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                هل أنت متأكد من رفض طلب المتطوع <strong>{rejectDialog.item?.name}</strong>؟
              </p>
              <div>
                <label className={labelClass}>سبب الرفض بالتفصيل <span className="text-error-500">*</span></label>
                <textarea
                  value={rejectDialog.reason}
                  onChange={e => setRejectDialog(p => ({ ...p, reason: e.target.value }))}
                  rows={3}
                  placeholder="الرجاء كتابة سبب الرفض إجبارياً..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setRejectDialog({ open: false, item: null, reason: '' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectDialog.reason.trim()}
                className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  rejectDialog.reason.trim() ? 'bg-error-500 hover:bg-error-600' : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                }`}
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Dialog */}
      {requestInfoDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setRequestInfoDialog({ open: false, item: null, message: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-warning-600 dark:text-warning-400">طلب معلومات إضافية</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                أنت على وشك طلب معلومات إضافية من المتطوع <strong>{requestInfoDialog.item?.name}</strong>. سيتم إرسال بريد إلكتروني له.
              </p>
              <div>
                <label className={labelClass}>الرسالة المطلوبة للمتطوع <span className="text-error-500">*</span></label>
                <textarea
                  value={requestInfoDialog.message}
                  onChange={e => setRequestInfoDialog(p => ({ ...p, message: e.target.value }))}
                  rows={3}
                  placeholder="مثال: يرجى إرسال صورة من المؤهل الدراسي..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setRequestInfoDialog({ open: false, item: null, message: '' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleRequestInfo}
                disabled={!requestInfoDialog.message.trim()}
                className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  requestInfoDialog.message.trim() ? 'bg-warning-500 hover:bg-warning-600' : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                }`}
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Call Dialog */}
      {callDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setCallDialog({ open: false, item: null, outcome: 'Call Successful - Onboarding Initiated', notes: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-lg w-full border border-neutral-100 dark:border-neutral-700">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">تسجيل مكالمة هاتفية للمتطوع</h2>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                تسجيل نتائج الاتصال بالمتطوع <strong>{callDialog.item?.name}</strong> لتحديث حالة التوظيف ومسار المتابعة.
              </p>
              <div>
                <label className={labelClass}>نتيجة الاتصال</label>
                <select
                  value={callDialog.outcome}
                  onChange={e => setCallDialog(p => ({ ...p, outcome: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Call Successful - Onboarding Initiated">اتصال ناجح - بدء الإعداد والتوجيه (Accepted - Onboarding)</option>
                  <option value="Candidate Refused / Changed their Mind">المتقدم اعتذر / غير رأيه (Withdrawn by Applicant)</option>
                  <option value="No Answer / Try Again Later">لا يوجد رد / المحاولة لاحقاً (No Answer - Try Later)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ملاحظات المكالمة الهاتفية (اختياري)</label>
                <textarea
                  value={callDialog.notes}
                  onChange={e => setCallDialog(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="أي تفاصيل أو ملاحظات تم الاتفاق عليها خلال المكالمة..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
              <button
                onClick={() => setCallDialog({ open: false, item: null, outcome: 'Call Successful - Onboarding Initiated', notes: '' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-255 dark:hover:bg-neutral-750 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogCall}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                حفظ وتسجيل المكالمة
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

export default AdminVolunteers;

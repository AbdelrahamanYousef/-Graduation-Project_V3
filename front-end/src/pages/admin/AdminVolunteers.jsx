import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable } from '../../components/admin';
import { formatDate } from '../../i18n';
import { getVolunteers, approveVolunteer, rejectVolunteer, contactVolunteer, respondVolunteer } from '../../api/volunteers.api';

const STATUS_MAP = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  APPROVED: { label: 'مقبول', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
  CONTACTED: { label: 'تم الاتصال', color: 'bg-info-100 text-info-700 dark:bg-info-500/10 dark:text-info-400' },
  CONFIRMED: { label: 'مؤكد', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  WITHDRAWN: { label: 'منسحب', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-600/10 dark:text-neutral-400' },
};

const AREA_MAP = {
  MEDICAL: 'طبي', EDUCATION: 'تعليمي', COMMUNITY: 'مجتمعي',
  TECH: 'تقني', ADMIN: 'إداري', FIELD: 'ميداني',
};

const CONTACT_METHOD_MAP = { EMAIL: 'بريد إلكتروني', PHONE: 'اتصال هاتفي', WHATSAPP: 'واتساب' };

const PROCESS_ACTION_MAP = {
  SUBMITTED: { label: 'تقديم الطلب', icon: 'fa-solid fa-paper-plane' },
  APPROVED: { label: 'قبول الطلب', icon: 'fa-solid fa-check' },
  REJECTED: { label: 'رفض الطلب', icon: 'fa-solid fa-xmark' },
  CONTACTED: { label: 'تم الاتصال', icon: 'fa-solid fa-phone' },
  RESPONDED: { label: 'استجابة المتقدم', icon: 'fa-solid fa-reply' },
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
  const [contactDialog, setContactDialog] = useState({ open: false, item: null, method: 'EMAIL', notes: '' });
  const [respondDialog, setRespondDialog] = useState({ open: false, item: null, response: 'ACCEPTED', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { loadVolunteers(); }, []);
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const data = await getVolunteers({ includeLogs: true });
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

  const handleContact = async () => {
    try {
      await contactVolunteer(contactDialog.item.id, {
        contactMethod: contactDialog.method,
        notes: contactDialog.notes,
      });
      setSnackbar({ open: true, msg: 'تم تسجيل الاتصال', severity: 'success' });
      setContactDialog({ open: false, item: null, method: 'EMAIL', notes: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تسجيل الاتصال', severity: 'error' });
    }
  };

  const handleRespond = async () => {
    try {
      await respondVolunteer(respondDialog.item.id, {
        response: respondDialog.response,
        notes: respondDialog.notes,
      });
      setSnackbar({ open: true, msg: 'تم تسجيل استجابة المتقدم', severity: 'success' });
      setRespondDialog({ open: false, item: null, response: 'ACCEPTED', notes: '' });
      loadVolunteers();
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تسجيل الاستجابة', severity: 'error' });
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
      icon: 'fa-solid fa-check', tooltip: 'قبول',
      show: (row) => row.status === 'PENDING',
      onClick: (row) => { setAcceptDialog({ open: true, item: row }); setAcceptForm({ adminNotes: '', nextSteps: '' }); },
    },
    {
      icon: 'fa-solid fa-xmark', tooltip: 'رفض',
      show: (row) => row.status === 'PENDING',
      onClick: (row) => setRejectDialog({ open: true, item: row, reason: '' }),
    },
    {
      icon: 'fa-solid fa-phone', tooltip: 'تسجيل اتصال',
      show: (row) => row.status === 'APPROVED',
      onClick: (row) => setContactDialog({ open: true, item: row, method: 'EMAIL', notes: '' }),
    },
    {
      icon: 'fa-solid fa-reply', tooltip: 'تسجيل استجابة',
      show: (row) => row.status === 'CONTACTED',
      onClick: (row) => setRespondDialog({ open: true, item: row, response: 'ACCEPTED', notes: '' }),
    },
  ];

  const selectClass = "px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[150px]";
  const inputClass = "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-sm";
  const labelClass = "block text-xs font-medium text-neutral-500 mb-1";

  function renderProcessLog(logs) {
    if (!logs || logs.length === 0) return <p className="text-sm text-neutral-400">لا توجد أحداث بعد</p>;
    return (
      <div className="space-y-0">
        {logs.map((log, i) => {
          const actionInfo = PROCESS_ACTION_MAP[log.action] || { label: log.action, icon: 'fa-solid fa-circle' };
          const actorName = log.performedBy?.name || 'النظام';
          return (
            <div key={log.id || i} className="flex gap-2">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{
                  background: log.action === 'SUBMITTED' ? 'rgba(0,177,106,0.15)' : 'rgba(26,74,68,0.1)',
                  color: log.action === 'SUBMITTED' ? '#00b16a' : '#1a4a44',
                }}>
                  <i className={actionInfo.icon}></i>
                </div>
                {i < logs.length - 1 && <div className="w-px flex-1 min-h-[16px]" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />}
              </div>
              <div className="pb-2 flex-1">
                <p className="text-sm font-medium">{actionInfo.label}</p>
                <p className="text-xs text-neutral-500">
                  {actorName} — {log.createdAt ? formatDate(log.createdAt) : ''}
                </p>
                {log.details && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {log.action === 'CONTACTED' && `طريقة الاتصال: ${CONTACT_METHOD_MAP[log.details.contactMethod] || log.details.contactMethod}`}
                    {log.action === 'RESPONDED' && `الاستجابة: ${log.details.response === 'ACCEPTED' ? 'قبول' : log.details.response === 'DECLINED' ? 'رفض' : log.details.response === 'WITHDRAWN' ? 'انسحاب' : log.details.response === 'CHANGED_MIND' ? 'غير رأيه' : log.details.response}`}
                    {log.details.notes && ` — ${log.details.notes}`}
                    {log.action === 'REJECTED' && log.details.reason ? `السبب: ${log.details.reason}` : ''}
                  </p>
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
          <option value="APPROVED">مقبول</option>
          <option value="REJECTED">مرفوض</option>
          <option value="CONTACTED">تم الاتصال</option>
          <option value="CONFIRMED">مؤكد</option>
          <option value="WITHDRAWN">منسحب</option>
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
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-bold">تفاصيل طلب التطوع</h2>
              <button onClick={() => setViewItem(null)} className="text-neutral-400 hover:text-neutral-600"><i className="fa-solid fa-xmark text-xl" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Main Info */}
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-neutral-500">الاسم</p><p className="font-semibold">{viewItem.name}</p></div>
                <div><p className="text-xs text-neutral-500">المجال</p><p className="font-semibold">{AREA_MAP[viewItem.area] || viewItem.area}</p></div>
                <div><p className="text-xs text-neutral-500">البريد</p><p className="font-semibold">{viewItem.email}</p></div>
                <div><p className="text-xs text-neutral-500">الهاتف</p><p className="font-semibold" dir="ltr">{viewItem.phone}</p></div>
                <div><p className="text-xs text-neutral-500">تاريخ التقديم</p><p className="font-semibold">{formatDate(viewItem.createdAt)}</p></div>
                <div>
                  <p className="text-xs text-neutral-500">الحالة</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).color}`}>
                    {(STATUS_MAP[viewItem.status] || STATUS_MAP.PENDING).label}
                  </span>
                </div>
              </div>

              {viewItem.message && <div><p className="text-xs text-neutral-500">رسالة إضافية</p><p className="text-sm mt-0.5">{viewItem.message}</p></div>}

              {/* CV Section */}
              {(viewItem.cvFile || viewItem.cvUrl) && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-1">السيرة الذاتية</p>
                  <div className="flex gap-2">
                    {viewItem.cvFile && (
                      <a href={viewItem.cvFile} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 hover:bg-primary-100 transition-colors">
                        <i className="fa-solid fa-file-lines"></i>
                        عرض المرفق
                      </a>
                    )}
                    {viewItem.cvUrl && (
                      <a href={viewItem.cvUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-400 hover:bg-info-100 transition-colors">
                        <i className="fa-solid fa-link"></i>
                        الرابط الخارجي
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Fields */}
              {viewItem.adminNotes && <div><p className="text-xs text-neutral-500">ملاحظات الإدارة</p><p className="text-sm mt-0.5">{viewItem.adminNotes}</p></div>}
              {viewItem.nextSteps && <div><p className="text-xs text-neutral-500">الخطوات التالية</p><p className="text-sm mt-0.5">{viewItem.nextSteps}</p></div>}
              {viewItem.rejectionReason && <div><p className="text-xs text-neutral-500">سبب الرفض</p><p className="text-sm mt-0.5 text-error-500">{viewItem.rejectionReason}</p></div>}
              {viewItem.reviewedBy && <div><p className="text-xs text-neutral-500">تمت المراجعة بواسطة</p><p className="text-sm mt-0.5">{viewItem.reviewedBy.name}</p></div>}
              {viewItem.contactMethod && <div><p className="text-xs text-neutral-500">طريقة الاتصال</p><p className="text-sm mt-0.5">{CONTACT_METHOD_MAP[viewItem.contactMethod] || viewItem.contactMethod}</p></div>}
              {viewItem.applicantResponse && (
                <div>
                  <p className="text-xs text-neutral-500">استجابة المتقدم</p>
                  <p className="text-sm mt-0.5">
                    {viewItem.applicantResponse === 'ACCEPTED' ? 'قبول' : viewItem.applicantResponse === 'DECLINED' ? 'رفض' : viewItem.applicantResponse === 'WITHDRAWN' ? 'انسحاب' : viewItem.applicantResponse === 'CHANGED_MIND' ? 'غير رأيه' : viewItem.applicantResponse}
                    {viewItem.respondedAt ? ` (${formatDate(viewItem.respondedAt)})` : ''}
                  </p>
                </div>
              )}
              {viewItem.responseNotes && <div><p className="text-xs text-neutral-500">ملاحظات الاستجابة</p><p className="text-sm mt-0.5">{viewItem.responseNotes}</p></div>}

              {/* Process Log Timeline */}
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-2">سجل الإجراءات</p>
                {renderProcessLog(viewItem.processLogs)}
              </div>
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
                <label className={labelClass}>ملاحظات الإدارة (اختياري)</label>
                <textarea value={acceptForm.adminNotes} onChange={e => setAcceptForm(p => ({ ...p, adminNotes: e.target.value }))} rows={3} placeholder="أي ملاحظات إضافية..." className={inputClass + " resize-none"} />
              </div>
              <div>
                <label className={labelClass}>الخطوات التالية (اختياري)</label>
                <textarea value={acceptForm.nextSteps} onChange={e => setAcceptForm(p => ({ ...p, nextSteps: e.target.value }))} rows={3} placeholder="مثال: التواصل مع المتطوع لتحديد موعد المقابلة..." className={inputClass + " resize-none"} />
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
              <p className="text-sm text-neutral-600 dark:text-neutral-400">رفض طلب <strong>{rejectDialog.item?.name}</strong></p>
              <div>
                <label className={labelClass}>سبب الرفض (اختياري)</label>
                <textarea value={rejectDialog.reason} onChange={e => setRejectDialog(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="اكتب سبب الرفض..." className={inputClass + " resize-none"} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setRejectDialog({ open: false, item: null, reason: '' })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
              <button onClick={handleReject} className="px-5 py-2 rounded-md font-semibold bg-error-500 text-white hover:bg-error-600 transition-colors">رفض</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Dialog */}
      {contactDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setContactDialog({ open: false, item: null, method: 'EMAIL', notes: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">تسجيل الاتصال بالمتطوع</h2>
            <div className="p-4 space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                الاتصال بـ <strong>{contactDialog.item?.name}</strong>
              </p>
              <div>
                <label className={labelClass}>طريقة الاتصال</label>
                <select value={contactDialog.method} onChange={e => setContactDialog(p => ({ ...p, method: e.target.value }))} className={inputClass}>
                  <option value="EMAIL">بريد إلكتروني</option>
                  <option value="PHONE">اتصال هاتفي</option>
                  <option value="WHATSAPP">واتساب</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ملاحظات (اختياري)</label>
                <textarea value={contactDialog.notes} onChange={e => setContactDialog(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="أي ملاحظات حول الاتصال..." className={inputClass + " resize-none"} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setContactDialog({ open: false, item: null, method: 'EMAIL', notes: '' })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
              <button onClick={handleContact} className="px-5 py-2 rounded-md font-semibold bg-info-500 text-white hover:bg-info-600 transition-colors">تسجيل الاتصال</button>
            </div>
          </div>
        </div>
      )}

      {/* Respond Dialog */}
      {respondDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRespondDialog({ open: false, item: null, response: 'ACCEPTED', notes: '' })} />
          <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4">
            <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700">تسجيل استجابة المتقدم</h2>
            <div className="p-4 space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                تسجيل استجابة <strong>{respondDialog.item?.name}</strong>
              </p>
              <div>
                <label className={labelClass}>الاستجابة</label>
                <select value={respondDialog.response} onChange={e => setRespondDialog(p => ({ ...p, response: e.target.value }))} className={inputClass}>
                  <option value="ACCEPTED">قبول — تأكيد المشاركة</option>
                  <option value="DECLINED">رفض — اعتذار عن المشاركة</option>
                  <option value="WITHDRAWN">انسحاب — انسحاب بعد القبول</option>
                  <option value="CHANGED_MIND">غير رأيه — العودة للقيد الانتظار</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ملاحظات (اختياري)</label>
                <textarea value={respondDialog.notes} onChange={e => setRespondDialog(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="أي ملاحظات حول استجابة المتقدم..." className={inputClass + " resize-none"} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setRespondDialog({ open: false, item: null, response: 'ACCEPTED', notes: '' })} className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
              <button onClick={handleRespond} className="px-5 py-2 rounded-md font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors">تسجيل الاستجابة</button>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${snackbar.severity === 'success' ? 'bg-success-500 text-white' : 'bg-error-500 text-white'}`}>
            {snackbar.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVolunteers;

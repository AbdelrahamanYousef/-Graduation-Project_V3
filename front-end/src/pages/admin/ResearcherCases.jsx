import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAssignedRequests, getSpecialRequestById, uploadRequestDocument, submitFieldReport, setPendingDocs, uploadDocument } from '../../api';
import { formatDate } from '../../i18n';

const STATUS_MAP = {
  NEW: { label: 'جديد', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400' },
  PENDING_DOCS: { label: 'بانتظار المستندات', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  FIELD_RESEARCH: { label: 'دراسة ميدانية', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  REVIEW: { label: 'مراجعة الإدارة', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  APPROVED: { label: 'مقبول', color: 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  REJECTED: { label: 'مرفوض', color: 'bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-400' },
};

function ResearcherCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('info'); // info, docs, report
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Document upload form state
  const [docForm, setDocForm] = useState({ docType: 'ID', file: null });

  // Field report form state
  const [reportForm, setReportForm] = useState({
    visitDate: '',
    housingCondition: 'جيد',
    incomeEstimate: '',
    researcherNotes: '',
    recommendation: 'APPROVE'
  });

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignedRequests();
      setCases(data);
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تحميل الحالات المعينة', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCaseDetail = useCallback(async (id) => {
    try {
      const data = await getSpecialRequestById(id);
      setCaseDetail(data);
      // Pre-fill report form if not yet submitted
      if (!data.fieldReports || data.fieldReports.length === 0) {
        setReportForm({
          visitDate: new Date().toISOString().split('T')[0],
          housingCondition: 'جيد',
          incomeEstimate: '',
          researcherNotes: '',
          recommendation: 'APPROVE'
        });
      }
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تحميل تفاصيل الحالة', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetail(selectedCaseId);
    } else {
      setCaseDetail(null);
    }
  }, [selectedCaseId, loadCaseDetail]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const filteredCases = useMemo(() => {
    if (activeFilter === 'ALL') return cases;
    return cases.filter(c => c.status === activeFilter);
  }, [cases, activeFilter]);

  const handleSetPendingDocs = async () => {
    if (!caseDetail) return;
    try {
      await setPendingDocs(caseDetail.id);
      setSnackbar({ open: true, msg: 'تم تغيير حالة الطلب بنجاح إلى بانتظار المستندات', severity: 'success' });
      loadCaseDetail(caseDetail.id);
      loadCases();
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تغيير الحالة: ' + err.message, severity: 'error' });
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!caseDetail || !docForm.file) {
      setSnackbar({ open: true, msg: 'يرجى اختيار ملف لرفعه أولاً', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Upload file to server storage
      const uploadResult = await uploadDocument(docForm.file);
      // 2. Register document relation in special request
      await uploadRequestDocument(caseDetail.id, docForm.docType, uploadResult.url);
      setSnackbar({ open: true, msg: 'تم رفع المستند وتحديث الملف بنجاح', severity: 'success' });
      setDocForm({ docType: 'ID', file: null });
      // Reset input element
      const fileInput = document.getElementById('request-file-input');
      if (fileInput) fileInput.value = '';
      loadCaseDetail(caseDetail.id);
      loadCases();
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل رفع المستند: ' + err.message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!caseDetail) return;
    if (!reportForm.visitDate || !reportForm.researcherNotes.trim() || !reportForm.incomeEstimate) {
      setSnackbar({ open: true, msg: 'يرجى إكمال جميع حقول التقرير الميداني', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...reportForm,
        incomeEstimate: parseFloat(reportForm.incomeEstimate)
      };
      await submitFieldReport(caseDetail.id, payload);
      setSnackbar({ open: true, msg: 'تم تقديم التقرير الميداني بنجاح وتحويل الطلب للمراجعة', severity: 'success' });
      loadCaseDetail(caseDetail.id);
      loadCases();
      setDetailTab('info');
    } catch (err) {
      setSnackbar({ open: true, msg: 'فشل تقديم التقرير: ' + err.message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const isTerminalState = caseDetail?.status === 'APPROVED' || caseDetail?.status === 'REJECTED';

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto min-h-[85vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white font-arabic">دراسة الحالات الميدانية</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-1">
            البحث والتقصي للحالات المعينة وإعداد التقارير واستلام المرفقات.
          </p>
        </div>
      </div>

      {/* Main Grid: Cases List (Left/Right depending on selection) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cases List */}
        <div className={`lg:col-span-1 flex flex-col gap-4 ${selectedCaseId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-150 dark:border-gray-700 shadow-sm">
            <h2 className="text-base font-bold text-gray-950 dark:text-white font-arabic mb-3">فلترة الحالات</h2>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'FIELD_RESEARCH', 'PENDING_DOCS', 'REVIEW', 'APPROVED', 'REJECTED'].map(filter => {
                const labels = { ALL: 'الكل', FIELD_RESEARCH: 'دراسة ميدانية', PENDING_DOCS: 'نقص مستندات', REVIEW: 'مراجعة', APPROVED: 'مقبول', REJECTED: 'مرفوض' };
                const active = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-arabic font-semibold transition-all duration-150 ${active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
            {loading ? (
              <div className="text-center py-8 text-sm text-gray-400">جاري تحميل الحالات المعينة...</div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 bg-white dark:bg-gray-800 border border-dashed rounded-xl">لا توجد حالات حالياً.</div>
            ) : (
              filteredCases.map(c => {
                const name = c.name || c.offlineName || 'مستفيد غير معروف';
                const active = selectedCaseId === c.id;
                const statusInfo = STATUS_MAP[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-800' };
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCaseId(c.id); setDetailTab('info'); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${active ? 'bg-white dark:bg-gray-800 border-primary-500 ring-2 ring-primary-500/20 shadow-md' : 'bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white font-arabic">{name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-arabic ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-arabic mt-1 line-clamp-2">{c.description}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400">
                      <span>{c.requestType}</span>
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Case Details Dashboard */}
        <div className={`lg:col-span-2 flex flex-col gap-6 ${selectedCaseId ? 'flex' : 'hidden lg:flex items-center justify-center bg-white dark:bg-gray-800 border border-dashed rounded-xl min-h-[400px]'}`}>
          {!selectedCaseId ? (
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400 text-2xl">📋</div>
              <p className="text-sm font-semibold text-neutral-500">يرجى اختيار حالة من القائمة الجانبية لعرض تفاصيلها ودراستها.</p>
            </div>
          ) : !caseDetail ? (
            <div className="text-center py-12 text-sm text-gray-400">جاري تحميل تفاصيل الحالة...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
              
              {/* Detail Header */}
              <div className="p-4 md:p-6 border-b border-gray-150 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedCaseId(null)} className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <i className="fa-solid fa-arrow-right text-lg" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white font-arabic">
                      {caseDetail.name || caseDetail.offlineName}
                    </h2>
                    <span className="text-xs text-gray-400 font-arabic">{caseDetail.requestType} — حالة رقم #{caseDetail.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold font-arabic ${(STATUS_MAP[caseDetail.status] || STATUS_MAP.NEW).color}`}>
                    {(STATUS_MAP[caseDetail.status] || STATUS_MAP.NEW).label}
                  </span>
                  {!isTerminalState && caseDetail.status !== 'PENDING_DOCS' && (
                    <button
                      onClick={handleSetPendingDocs}
                      className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-arabic font-semibold transition-colors"
                    >
                      طلب وثائق إضافية
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-150 dark:border-gray-700 px-4 md:px-6 bg-gray-50/20">
                {[
                  { id: 'info', label: 'تفاصيل الطلب', icon: 'fa-solid fa-circle-info' },
                  { id: 'docs', label: `المستندات (${caseDetail.documents?.length || 0})`, icon: 'fa-solid fa-file' },
                  { id: 'report', label: 'التقرير الميداني', icon: 'fa-solid fa-pen-to-square' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-semibold border-b-2 font-arabic transition-all duration-150 ${detailTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <i className={tab.icon} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Panel Content */}
              <div className="p-4 md:p-6 space-y-6">

                {/* Tab 1: Info */}
                {detailTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-neutral-400 font-arabic">نوع التسجيل</p>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 font-arabic text-sm">
                          {caseDetail.source === 'OFFLINE' ? 'تسجيل ورقي / مكتبي (OFFLINE)' : 'تقديم أونلاين (ONLINE)'}
                        </p>
                      </div>
                      {caseDetail.source === 'OFFLINE' ? (
                        <>
                          <div>
                            <p className="text-xs text-neutral-400 font-arabic">رقم الهاتف للمستفيد</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm" dir="ltr">{caseDetail.offlinePhone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 font-arabic">الرقم القومي للمستفيد</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{caseDetail.offlineNationalId || 'غير متوفر'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs text-neutral-400 font-arabic">رقم الهاتف للباحث</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm" dir="ltr">{caseDetail.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 font-arabic">البريد الإلكتروني للباحث</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{caseDetail.email || 'غير متوفر'}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-xs text-neutral-400 font-arabic">تاريخ التسجيل</p>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{formatDate(caseDetail.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400 font-arabic">تفاصيل الطلب والاحتياج</p>
                      <p className="text-sm mt-1 bg-gray-50 dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800 text-neutral-700 dark:text-neutral-300 leading-relaxed font-arabic">
                        {caseDetail.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <h4 className="text-sm font-bold text-gray-850 dark:text-neutral-200 font-arabic mb-3">الخط الزمني للحالة وسجل الإجراءات</h4>
                      <div className="space-y-4">
                        {caseDetail.processLogs?.map((log, i) => (
                          <div key={log.id || i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs">
                              <i className="fa-solid fa-clock-rotate-left" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-arabic">{log.action}</p>
                              <p className="text-[10px] text-neutral-500 font-arabic mt-0.5">{log.details}</p>
                              <span className="text-[9px] text-neutral-400">{formatDate(log.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Docs */}
                {detailTab === 'docs' && (
                  <div className="space-y-6">
                    {/* List */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-850 dark:text-neutral-200 font-arabic mb-3">المستندات المرفوعة حالياً</h4>
                      {caseDetail.documents && caseDetail.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {caseDetail.documents.map(doc => {
                            const docLabels = { ID: 'بطاقة الرقم القومي', MEDICAL: 'تقرير طبي', OTHER: 'مستند آخر' };
                            return (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <div>
                                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-arabic">{docLabels[doc.docType] || doc.docType}</p>
                                  <span className="text-[9px] text-neutral-400">{formatDate(doc.createdAt)}</span>
                                </div>
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-500 font-arabic font-semibold hover:underline">
                                  عرض المرفق <i className="fa-solid fa-up-right-from-square mr-1 text-[10px]" />
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 font-arabic bg-gray-50 dark:bg-gray-900/10 p-4 border border-dashed rounded-lg text-center">لا توجد مستندات مرفقة بهذه الحالة بعد.</p>
                      )}
                    </div>

                    {/* Form */}
                    {!isTerminalState && (
                      <form onSubmit={handleUploadDoc} className="border-t border-gray-150 dark:border-gray-700 pt-4 space-y-4">
                        <h4 className="text-sm font-bold text-gray-850 dark:text-neutral-200 font-arabic">إرفاق مستند جديد</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">نوع المستند</label>
                            <select
                              value={docForm.docType}
                              onChange={e => setDocForm(p => ({ ...p, docType: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                            >
                              <option value="ID">بطاقة الرقم القومي للمستفيد</option>
                              <option value="MEDICAL">تقارير وتقييمات طبية</option>
                              <option value="OTHER">أوراق أو وثائق إثباتية أخرى</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">الملف المرفق</label>
                            <input
                              type="file"
                              id="request-file-input"
                              onChange={e => setDocForm(p => ({ ...p, file: e.target.files?.[0] || null }))}
                              className="w-full text-xs text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submitting || !docForm.file}
                          className="bg-primary-500 text-white font-arabic text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-600 disabled:bg-neutral-300 disabled:dark:bg-neutral-700 disabled:cursor-not-allowed transition-all duration-150 inline-flex items-center gap-2"
                        >
                          {submitting ? 'جاري الرفع...' : 'رفع وحفظ المرفق'}
                          <i className="fa-solid fa-cloud-arrow-up" />
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab 3: Report */}
                {detailTab === 'report' && (
                  <div className="space-y-6">
                    {caseDetail.fieldReports && caseDetail.fieldReports.length > 0 ? (
                      (() => {
                        const report = caseDetail.fieldReports[0];
                        return (
                          <div className="space-y-4">
                            <div className="bg-success-50/20 dark:bg-success-950/10 p-4 rounded-lg border border-success-100/30">
                              <p className="text-xs text-success-700 dark:text-success-400 font-bold font-arabic mb-3">✓ تم تقديم تقرير الزيارة الميدانية بنجاح</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-neutral-500 font-arabic">تاريخ الزيارة</p>
                                  <p className="font-semibold text-neutral-800 dark:text-neutral-250 text-sm">{formatDate(report.visitDate)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-500 font-arabic font-arabic">الباحث القائم بالزيارة</p>
                                  <p className="font-semibold text-neutral-800 dark:text-neutral-250 text-sm">{report.researcher?.name || 'غير معروف'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-500 font-arabic">حالة السكن والمعيشة للمستفيد</p>
                                  <p className="font-semibold text-neutral-800 dark:text-neutral-250 text-sm font-arabic">{report.housingCondition}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-500 font-arabic">الدخل الشهري المقدر للمستفيد</p>
                                  <p className="font-semibold text-neutral-800 dark:text-neutral-250 text-sm">{report.incomeEstimate} ج.م</p>
                                </div>
                                <div className="col-span-full">
                                  <p className="text-xs text-neutral-500 font-arabic">توصية الباحث</p>
                                  <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold font-arabic ${report.recommendation === 'APPROVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {report.recommendation === 'APPROVE' ? 'توصية بالموافقة على الدعم' : 'توصية برفض الدعم'}
                                  </span>
                                </div>
                                <div className="col-span-full">
                                  <p className="text-xs text-neutral-500 font-arabic">ملاحظات ومرئيات تفصيلية</p>
                                  <p className="text-xs mt-1 bg-white dark:bg-neutral-800 p-3 rounded border border-neutral-200/50 text-neutral-700 dark:text-neutral-300 font-arabic leading-relaxed">
                                    {report.researcherNotes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : isTerminalState ? (
                      <p className="text-xs text-neutral-400 font-arabic text-center py-6">تم البت في هذا الطلب نهائياً ولا يمكن تعبئة تقرير جديد.</p>
                    ) : (
                      <form onSubmit={handleSubmitReport} className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-855 dark:text-neutral-200 font-arabic">تعبئة وتقديم التقرير الميداني</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">تاريخ الزيارة الميدانية</label>
                            <input
                              type="date"
                              required
                              value={reportForm.visitDate}
                              onChange={e => setReportForm(p => ({ ...p, visitDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">تقدير الدخل الشهري للمستفيد (ج.م)</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={reportForm.incomeEstimate}
                              onChange={e => setReportForm(p => ({ ...p, incomeEstimate: e.target.value }))}
                              placeholder="مثال: 1500"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">حالة سكن ومعيشة الأسرة</label>
                            <select
                              value={reportForm.housingCondition}
                              onChange={e => setReportForm(p => ({ ...p, housingCondition: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                            >
                              <option value="ممتاز">ممتاز (Good Conditions)</option>
                              <option value="جيد">جيد (Acceptable)</option>
                              <option value="متوسط">متوسط (Requires minor repair)</option>
                              <option value="سيء">سيء (Critical structure)</option>
                              <option value="متهالك جداً">متهالك جداً / مهدد بالسقوط</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">توصية الباحث النهائية</label>
                            <select
                              value={reportForm.recommendation}
                              onChange={e => setReportForm(p => ({ ...p, recommendation: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                            >
                              <option value="APPROVE">توصية بالموافقة وتسهيل الدعم</option>
                              <option value="REJECT">توصية بالرفض لعدم استيفاء الشروط</option>
                            </select>
                          </div>
                          <div className="col-span-full">
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 font-arabic">مرئيات الباحث وملاحظات تفصيلية</label>
                            <textarea
                              required
                              value={reportForm.researcherNotes}
                              onChange={e => setReportForm(p => ({ ...p, researcherNotes: e.target.value }))}
                              rows={4}
                              placeholder="يرجى كتابة الملاحظات التفصيلية حول الزيارة الميدانية وأوضاع الأسرة المعيشية..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-xs resize-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all duration-150"
                        >
                          {submitting ? 'جاري تقديم التقرير...' : 'إرسال وتقديم التقرير الميداني'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

      </div>

      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${snackbar.severity === 'success' ? 'bg-success-500 text-white animate-bounce' : 'bg-error-500 text-white'}`}>
            {snackbar.msg}
          </div>
        </div>
      )}

    </div>
  );
}

export default ResearcherCases;

import { useState, useEffect } from 'react';
import { getMyVolunteerApplications, getMyRequests, submitVolunteerInfo } from '../../api';
import { formatDate } from '../../i18n';
import { useToast } from '../../components/common/Toast';

export default function SubmissionsTab() {
    const toast = useToast();
    const [volunteers, setVolunteers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedItem, setExpandedItem] = useState({ type: null, id: null });
    const [responseText, setResponseText] = useState({});
    const [submitting, setSubmitting] = useState({});

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError('');
            try {
                const [vData, rData] = await Promise.all([
                    getMyVolunteerApplications(),
                    getMyRequests()
                ]);
                setVolunteers(vData);
                setRequests(rData);
            } catch (err) {
                console.error(err);
                setError('فشل في تحميل بيانات الطلبات. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const toggleExpand = (type, id) => {
        if (expandedItem.type === type && expandedItem.id === id) {
            setExpandedItem({ type: null, id: null });
        } else {
            setExpandedItem({ type, id });
        }
    };

    const parseDetails = (details) => {
        if (!details) return null;
        try { return typeof details === 'string' ? JSON.parse(details) : details; }
        catch { return { notes: details }; }
    };

    const handleSubmitInfo = async (id) => {
        const msg = responseText[id]?.trim();
        if (!msg) { toast.error('الرجاء كتابة المعلومات المطلوبة'); return; }
        setSubmitting((prev) => ({ ...prev, [id]: true }));
        try {
            await submitVolunteerInfo(id, msg);
            toast.success('تم إرسال المعلومات بنجاح');
            setResponseText((prev) => ({ ...prev, [id]: '' }));
            const [vData, rData] = await Promise.all([
                getMyVolunteerApplications(),
                getMyRequests()
            ]);
            setVolunteers(vData);
            setRequests(rData);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'فشل في إرسال المعلومات');
        } finally {
            setSubmitting((prev) => ({ ...prev, [id]: false }));
        }
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('approved') || s.includes('accept')) {
            return 'bg-success-50 dark:bg-success-50 text-success-600 dark:text-success-500 border border-success-200 dark:border-success-500/30';
        }
        if (s.includes('reject')) {
            return 'bg-error-50 dark:bg-error-50 text-error-600 dark:text-error-600 border border-error-200 dark:border-error-500/30';
        }
        if (s.includes('pending')) {
            return 'bg-warning-50 dark:bg-warning-50 text-warning-600 dark:text-warning-500 border border-warning-200 dark:border-warning-500/30';
        }
        if (s.includes('needs_info')) {
            return 'bg-warning-50 dark:bg-warning-50 text-warning-600 dark:text-warning-500 border border-warning-200 dark:border-warning-500/30';
        }
        if (s.includes('review')) {
            return 'bg-accent-50 dark:bg-accent-50 text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-400/30';
        }
        return 'bg-primary-50 dark:bg-primary-50 text-primary-600 dark:text-primary-500 border border-primary-200 dark:border-primary-500/30';
    };

    const getStatusTextArabic = (status) => {
        const s = status || 'PENDING';
        switch (s) {
            case 'PENDING': return 'قيد الانتظار';
            case 'NEEDS_INFO': return 'بحاجة معلومات إضافية';
            case 'UNDER_REVIEW': return 'قيد المراجعة والبحث';
            case 'APPROVED': return 'مقبول';
            case 'REJECTED': return 'مرفوض';
            case 'Accepted - Onboarding': return 'مقبول - بدء التعيين';
            case 'Withdrawn by Applicant': return 'ملغى برغبة المتقدم';
            case 'No Answer - Try Later': return 'لا رد - يعاد الاتصال';
            default: return s;
        }
    };

    const getAreaTextArabic = (area) => {
        switch (area) {
            case 'MEDICAL': return 'طبي';
            case 'EDUCATION': return 'تعليمي';
            case 'COMMUNITY': return 'مجتمعي';
            case 'TECH': return 'تقني';
            case 'ADMIN': return 'إداري';
            case 'FIELD': return 'ميداني';
            default: return area;
        }
    };

    const getRequestTypeTextArabic = (type) => {
        switch (type) {
            case 'financial': return 'مساعدات مالية ونقدية';
            case 'medical': return 'رعاية صحية ومستلزمات طبية';
            case 'food': return 'سلة غذائية وتأمين طعام';
            case 'education': return 'كفالة تعليمية ومصاريف دراسة';
            case 'general': return 'مساعدات عينية أخرى';
            default: return type;
        }
    };

    const getLogActionTextArabic = (action) => {
        switch (action) {
            case 'SUBMITTED': return 'تم إرسال الطلب بنجاح';
            case 'NEEDS_INFO': return 'تم طلب معلومات إضافية';
            case 'UNDER_REVIEW': return 'بدأ البحث الاجتماعي والمراجعة';
            case 'APPROVED': return 'تمت الموافقة وقبول الطلب';
            case 'REJECTED': return 'تم رفض الطلب لعدم استيفاء الشروط';
            case 'PHONE_CALL': return 'تم تسجيل مكالمة هاتفية مع الحالة';
            case 'AID_ALLOCATED': return 'تم تخصيص قيمة ونوع المساعدة للطلب';
            default: return action;
        }
    };

    if (loading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-neutral-500 text-sm">جاري تحميل طلباتك...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-error-50 dark:bg-error-900/10 text-error-600 rounded-xl text-center border border-error-100 dark:border-error-800">
                <i className="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
                <p className="text-sm font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* VOLUNTEER SECTION */}
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-card border border-neutral-100 dark:border-neutral-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-neutral-200 dark:bg-neutral-100 dark:border-neutral-200 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm">
                        <i className="fa-solid fa-handshake"></i>
                    </div>
                    <h5 className="text-base font-bold dark:text-white">طلبات التطوع الخاصة بك</h5>
                </div>
                <div className="p-4 md:p-6">
                    {volunteers.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            <i className="fa-regular fa-handshake text-3xl mb-2 opacity-50"></i>
                            <p className="text-sm">لم تقم بتقديم أي طلبات تطوع بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {volunteers.map(v => (
                                <div key={v.id} className="border border-neutral-100 dark:border-neutral-100 rounded-xl p-4 transition-all hover:bg-neutral-50/50 dark:hover:bg-neutral-200/30">
                                    <div className="flex justify-between items-start flex-wrap gap-3">
                                        <div>
                                            <h6 className="font-bold text-[0.95rem] dark:text-white">طلب تطوع في المجال الـ {getAreaTextArabic(v.area)}</h6>
                                            <p className="text-xs text-neutral-500 mt-1">تاريخ التقديم: {formatDate(v.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(v.status)}`}>
                                                {getStatusTextArabic(v.status)}
                                            </span>
                                            <button
                                                onClick={() => toggleExpand('volunteer', v.id)}
                                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-500 dark:text-neutral-600 transition-colors"
                                            >
                                                <i className={`fa-solid ${expandedItem.type === 'volunteer' && expandedItem.id === v.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedItem.type === 'volunteer' && expandedItem.id === v.id && (
                                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-100 space-y-4 animate-slideDown">
                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-xs text-neutral-500">الاسم المسجل:</span>
                                                    <span className="font-semibold dark:text-white">{v.name}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-neutral-500">رقم الهاتف:</span>
                                                    <span className="font-semibold dark:text-white" dir="ltr">{v.phone}</span>
                                                </div>
                                                {v.message && (
                                                    <div className="col-span-1 md:col-span-2">
                                                        <span className="block text-xs text-neutral-500">رسالتك:</span>
                                                        <p className="text-neutral-600 dark:text-neutral-700 bg-neutral-50 dark:bg-neutral-50 p-2.5 rounded-lg mt-1 text-xs">
                                                            {v.message}
                                                        </p>
                                                    </div>
                                                )}
                                                {(v.cvFile || v.cvUrl) && (
                                                    <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                                                        <span className="text-xs text-neutral-500">السيرة الذاتية:</span>
                                                        {v.cvFile ? (
                                                            <a href={v.cvFile} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                                                                <i className="fa-solid fa-file-pdf"></i> تحميل الملف المرفوع
                                                            </a>
                                                        ) : (
                                                            <a href={v.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                                                                <i className="fa-solid fa-link"></i> رابط السيرة الذاتية
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* NEEDS_INFO Response UI */}
                                            {v.status === 'NEEDS_INFO' && (
                                                <div className="p-3 bg-warning-50 dark:bg-warning-50/10 border border-warning-200 dark:border-warning-500/30 rounded-xl">
                                                    <h6 className="font-bold text-xs text-warning-700 dark:text-warning-500 mb-2 flex items-center gap-1">
                                                        <i className="fa-solid fa-circle-info"></i> طلب معلومات إضافية
                                                    </h6>
                                                    <p className="text-xs text-neutral-600 dark:text-neutral-700 mb-2">
                                                        يرجى كتابة المعلومات المطلوبة لإكمال طلبك:
                                                    </p>
                                                    <textarea
                                                        value={responseText[v.id] || ''}
                                                        onChange={(e) => setResponseText((prev) => ({ ...prev, [v.id]: e.target.value }))}
                                                        className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-200 bg-white dark:bg-neutral-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                                        rows="3"
                                                        placeholder="اكتب المعلومات المطلوبة هنا..."
                                                    />
                                                    <button
                                                        onClick={() => handleSubmitInfo(v.id)}
                                                        disabled={submitting[v.id]}
                                                        className="mt-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white text-xs font-bold rounded-lg transition-colors"
                                                    >
                                                        {submitting[v.id] ? 'جاري الإرسال...' : 'إرسال المعلومات'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Status Timeline */}
                                            <div className="pt-2">
                                                <span className="block text-xs text-neutral-500 mb-2.5">الجدول الزمني للطلب:</span>
                                                <div className="relative border-r-2 border-neutral-100 dark:border-neutral-100 mr-2.5 pr-4 space-y-4">
                                                    {v.processLogs?.map((log) => {
                                                        const d = parseDetails(log.details);
                                                        return (
                                                        <div key={log.id} className="relative">
                                                            {/* Point dot */}
                                                            <span className="absolute right-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-white dark:ring-neutral-100"></span>
                                                            <div className="text-xs">
                                                                <span className="font-bold dark:text-neutral-200">{getLogActionTextArabic(log.action)}</span>
                                                                <span className="text-neutral-500 mr-2">{formatDate(log.createdAt)}</span>
                                                                {d?.notes && (
                                                                    <p className="text-neutral-500 dark:text-neutral-700 bg-neutral-50 dark:bg-neutral-50 p-2 rounded-md mt-1 font-medium">{d.notes}</p>
                                                                )}
                                                                {d?.outcome && (
                                                                    <p className="text-neutral-500 mt-1">
                                                                        <strong className="text-primary-500">نتيجة المكالمة: </strong>{getStatusTextArabic(d.outcome)}
                                                                        {d.notes && <span> ({d.notes})</span>}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SPECIAL REQUESTS SECTION */}
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-card border border-neutral-100 dark:border-neutral-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-neutral-200 dark:bg-neutral-100 dark:border-neutral-200 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-500 flex items-center justify-center text-sm">
                        <i className="fa-solid fa-hand-holding-heart"></i>
                    </div>
                    <h5 className="text-base font-bold dark:text-white">طلبات المساعدات الخاصة بك</h5>
                </div>
                <div className="p-4 md:p-6">
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            <i className="fa-regular fa-file-lines text-3xl mb-2 opacity-50"></i>
                            <p className="text-sm">لم تقم بتقديم أي طلبات مساعدة خاصة بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(r => (
                                <div key={r.id} className="border border-neutral-100 dark:border-neutral-100 rounded-xl p-4 transition-all hover:bg-neutral-50/50 dark:hover:bg-neutral-200/30">
                                    <div className="flex justify-between items-start flex-wrap gap-3">
                                        <div>
                                            <h6 className="font-bold text-[0.95rem] dark:text-white">طلب {getRequestTypeTextArabic(r.requestType)}</h6>
                                            <p className="text-xs text-neutral-500 mt-1">تاريخ التقديم: {formatDate(r.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(r.status)}`}>
                                                {getStatusTextArabic(r.status)}
                                            </span>
                                            <button
                                                onClick={() => toggleExpand('request', r.id)}
                                                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-500 dark:text-neutral-600 transition-colors"
                                            >
                                                <i className={`fa-solid ${expandedItem.type === 'request' && expandedItem.id === r.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedItem.type === 'request' && expandedItem.id === r.id && (
                                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-100 space-y-4 animate-slideDown">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-xs text-neutral-500">الاسم المسجل:</span>
                                                    <span className="font-semibold dark:text-white">{r.name}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-neutral-500">رقم الهاتف:</span>
                                                    <span className="font-semibold dark:text-white" dir="ltr">{r.phone}</span>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <span className="block text-xs text-neutral-500">تفاصيل الاحتياجات:</span>
                                                    <p className="text-neutral-600 dark:text-neutral-700 bg-neutral-50 dark:bg-neutral-50 p-2.5 rounded-lg mt-1 text-xs">
                                                        {r.description}
                                                    </p>
                                                </div>

                                                {/* Aid Allocation details (For Approved Requests) */}
                                                {r.status === 'APPROVED' && r.aidType && (
                                                    <div className="col-span-1 md:col-span-2 p-3 bg-success-50/50 dark:bg-success-50/20 border border-success-100/50 dark:border-success-100/20 rounded-xl">
                                                        <h6 className="font-bold text-xs text-success-700 dark:text-success-500 mb-2 flex items-center gap-1">
                                                            <i className="fa-solid fa-gift"></i> المساعدات المخصصة للطلب:
                                                        </h6>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                            <div>
                                                                <span className="text-neutral-500">نوع الدعم: </span>
                                                                <span className="font-bold dark:text-white">{r.aidType}</span>
                                                            </div>
                                                            {(r.aidAmount || r.aidQuantity) && (
                                                                <div>
                                                                    <span className="text-neutral-500">القيمة / الكمية: </span>
                                                                    <span className="font-bold text-success-600 dark:text-success-500">
                                                                        {r.aidAmount ? `${r.aidAmount} ج.م` : r.aidQuantity}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-neutral-500">حالة التوزيع: </span>
                                                                <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-100 text-primary-700 dark:text-primary-400 font-bold">
                                                                    {r.distributionStatus === 'Assigned' ? 'تم التخصيص' : r.distributionStatus === 'Disbursed' ? 'تم الصرف' : 'تم التسليم'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Timeline */}
                                            <div className="pt-2">
                                                <span className="block text-xs text-neutral-400 mb-2.5">الجدول الزمني للطلب:</span>
                                                <div className="relative border-r-2 border-neutral-100 dark:border-neutral-700 mr-2.5 pr-4 space-y-4">
                                                    {r.processLogs?.map((log) => {
                                                        const d = parseDetails(log.details);
                                                        return (
                                                        <div key={log.id} className="relative">
                                                            <span className="absolute right-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary-500 ring-4 ring-white dark:ring-neutral-800"></span>
                                                            <div className="text-xs">
                                                                <span className="font-bold dark:text-neutral-200">{getLogActionTextArabic(log.action)}</span>
                                                                <span className="text-neutral-400 mr-2">{formatDate(log.createdAt)}</span>
                                                                {d?.notes && (
                                                                    <p className="text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 p-2 rounded-md mt-1 font-medium">{d.notes}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

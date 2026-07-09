import { useState, useCallback, useEffect } from 'react';
import { AdminPageHeader, AdminDataTable, AdminFormDialog } from '../../components/admin';
import { formatDate, t } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { getContactMessages, updateContactStatus, replyToContactMessage } from '../../api/contact.api';

const STATUS_MAP = {
    'NEW': 'جديد',
    'IN_PROGRESS': 'قيد المعالجة',
    'RESOLVED': 'تم الرد'
};

const REV_STATUS_MAP = {
    'جديد': 'NEW',
    'قيد المعالجة': 'IN_PROGRESS',
    'تم الرد': 'RESOLVED'
};

function AdminContactMessages() {
    const { state, dispatch } = useAdminData();
    const messages = state.contactMessages || [];
    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleOpenReply = (msg) => {
        setSelectedMessage(msg);
        setReplyText('');
        setReplyModalOpen(true);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setIsSending(true);
        try {
            await replyToContactMessage(selectedMessage.id, replyText.trim());
            await fetchMessages();
            setReplyModalOpen(false);
            setSnackbar({ open: true, msg: 'تم إرسال الرد وتحديث حالة الرسالة بنجاح', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, msg: err.message || 'فشل إرسال الرد', severity: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getContactMessages();
            dispatch({ type: 'SYNC_STATE', payload: { contactMessages: data } });
        } catch (err) {
            setSnackbar({ open: true, msg: err.message || 'فشل تحميل الرسائل', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const updateStatus = async (msg, newStatus) => {
        const backendStatus = REV_STATUS_MAP[newStatus];
        if (!backendStatus) return;

        try {
            await updateContactStatus(msg.id, backendStatus);
            dispatch({ type: 'UPDATE_CONTACT_MESSAGE', payload: { ...msg, status: backendStatus } });
            setSnackbar({ open: true, msg: `تم تحديث الحالة إلى "${newStatus}"`, severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, msg: err.message || 'فشل تحديث الحالة', severity: 'error' });
        }
    };

    const columns = [
        { key: 'name', label: 'الاسم', render: (val, row) => (
            <div>
                <p className="text-sm font-medium">{val}</p>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {row.email}
                    {row.phone ? ` — ${row.phone}` : ''}
                    {row.contactMethod ? ` (طريقة التواصل: ${t ? t(`contact.form.contact${row.contactMethod.charAt(0).toUpperCase() + row.contactMethod.slice(1)}`) || row.contactMethod : row.contactMethod})` : ''}
                </span>
            </div>
        )},
        { key: 'subject', label: 'الموضوع' },
        { key: 'message', label: 'الرسالة', render: (val) => (
            <p className="text-sm max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">{val}</p>
        )},
        { key: 'createdAt', label: 'التاريخ', render: (val) => val ? formatDate(val) : '-' },
        { key: 'status', label: 'الحالة', render: (val) => {
            const displayVal = STATUS_MAP[val] || val || 'جديد';
            const chipColors = { 'جديد': 'bg-error-100 text-error-700', 'قيد المعالجة': 'bg-warning-100 text-warning-700', 'تم الرد': 'bg-success-100 text-success-700' };
            return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${chipColors[displayVal] || 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'}`}>{displayVal}</span>;
        }},
    ];

    const actions = [
        { icon: 'fa-solid fa-reply', tooltip: 'الرد على الرسالة', onClick: (row) => handleOpenReply(row) },
        { icon: 'fa-solid fa-spinner', tooltip: 'قيد المعالجة', onClick: (row) => updateStatus(row, 'قيد المعالجة') },
    ];

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader title="رسائل التواصل" subtitle="إدارة رسائل الزوار من صفحة اتصل بنا" />

            {messages.length === 0 ? (
                <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
                    <i className="fa-regular fa-message" style={{ fontSize: 48, opacity: 0.3 }} />
                    <p className="mt-4">لا توجد رسائل بعد</p>
                </div>
            ) : (
                <AdminDataTable columns={columns} data={messages} actions={actions} />
            )}
            <AdminFormDialog
                open={replyModalOpen}
                onClose={() => setReplyModalOpen(false)}
                title="الرد على رسالة تواصل"
                onSubmit={handleSendReply}
                submitLabel="إرسال الرد"
                cancelLabel="إلغاء"
                loading={isSending}
                loadingLabel="جاري الإرسال..."
                maxWidth="sm"
            >
                {selectedMessage && (
                    <div className="flex flex-col gap-4 text-right" dir="rtl">
                        {/* Original Message Preview */}
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-1">
                                الرسالة الأصلية من: {selectedMessage.name} ({selectedMessage.email})
                            </p>
                            <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">
                                الموضوع: {selectedMessage.subject}
                            </p>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 max-h-[150px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                {selectedMessage.message}
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                نص الرد
                            </label>
                            <textarea
                                placeholder="اكتب ردك هنا..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none border-neutral-200 dark:border-neutral-700"
                                required
                            />
                        </div>
                    </div>
                )}
            </AdminFormDialog>

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${
                        snackbar.severity === 'success' ? 'bg-success-500 text-white' :
                        snackbar.severity === 'error' ? 'bg-error-500 text-white' :
                        snackbar.severity === 'warning' ? 'bg-warning-500 text-white' :
                        'bg-primary-500 text-white'
                    }`}>
                        {snackbar.msg}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminContactMessages;

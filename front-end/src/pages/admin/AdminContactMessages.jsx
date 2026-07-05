import { useState, useCallback, useEffect } from 'react';
import { AdminPageHeader, AdminDataTable, AdminStatusChip } from '../../components/admin';
import { formatDate, t } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { getContactMessages, updateContactStatus } from '../../api/contact.api';

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
        { icon: 'fa-solid fa-check', tooltip: 'تم الرد', onClick: (row) => updateStatus(row, 'تم الرد') },
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

import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { submitSpecialRequest } from '../../api/specialRequests.api';
import SpecialRequestForm from './SpecialRequestForm';

const pageStyles = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
`;

function SpecialRequest() {
    const { isDark } = useTheme();
    useInjectStyles(pageStyles, 'special-request-styles');

    const [form, setForm] = useState({
        name: '', email: '', phone: '', requestType: '', description: '',
    });
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };

    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'requestType') return !form.requestType;
        if (field === 'description') return !form.description || form.description.trim().length < 10;
        return false;
    };

    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name' && form.name && form.name.trim().length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        if (field === 'email' && form.email) return 'أدخل بريدًا صالحًا';
        if (field === 'phone' && form.phone) return 'أدخل رقمًا صالحًا (10–15 رقم)';
        if (field === 'description') return 'يرجى كتابة شرح وافي للطلب (10 أحرف على الأقل)';
        return 'هذا الحقل مطلوب';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, phone: true, requestType: true, description: true });
        const hasErrors = ['name', 'email', 'phone', 'requestType'].some(f => {
            if (f === 'name') return !form.name || form.name.trim().length < 3;
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            return !form[f];
        }) || (!form.description || form.description.trim().length < 10);
        if (hasErrors) return;

        setSubmitting(true);
        try {
            await submitSpecialRequest({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                requestType: form.requestType,
                description: form.description.trim(),
            });
            setSubmitted(true);
            setSnackbar({ open: true, severity: 'success', message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.' });
            setForm({ name: '', email: '', phone: '', requestType: '', description: '' });
            setTouched({});
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            setSnackbar({ open: true, severity: 'error', message: err.response?.data?.error?.message || 'حدث خطأ أثناء الإرسال' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pb-12">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 md:mt-10">
                <div className="text-center mb-6 md:mb-10" style={{ opacity: 0, animation: 'fadeInUp 0.5s ease forwards' }}>
                    <h2 className="font-extrabold text-[1.3rem] md:text-[1.6rem]" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                        طلب مساعدة خاصة
                    </h2>
                    <p className="max-w-[480px] mx-auto leading-relaxed mt-1" style={{ color: isDark ? 'rgba(226,232,240,0.6)' : '#64748b' }}>
                        إذا كنت بحاجة إلى مساعدة خاصة، يرجى ملء النموذج وسنقوم بمراجعة طلبك
                    </p>
                </div>

                <SpecialRequestForm
                    isDark={isDark}
                    form={form}
                    setForm={setForm}
                    touched={touched}
                    setTouched={setTouched}
                    submitted={submitted}
                    submitting={submitting}
                    handleSubmit={handleSubmit}
                    handleBlur={handleBlur}
                    getError={getError}
                    getHelper={getHelper}
                />
            </div>

            {snackbar.open && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] text-white font-semibold text-[0.95rem] min-w-[320px]" style={{
                        backgroundColor: snackbar.severity === 'success' ? '#00b16a' : '#e57373',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    }}>
                        <span className="flex-1">{snackbar.message}</span>
                        <button onClick={() => setSnackbar(s => ({ ...s, open: false }))} className="text-white/80 hover:text-white">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SpecialRequest;

import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { applyAsVolunteer } from '../../api/volunteers.api';
import VolunteerHero from './VolunteerHero';
import VolunteerStatsStrip from './VolunteerStatsStrip';
import VolunteerReasons from './VolunteerReasons';
import VolunteerOpportunities from './VolunteerOpportunities';
import VolunteerSignupForm from './VolunteerSignupForm';

const EGYPTIAN_PHONE = /^(?:\+20|20|0)?1[0-2]\d{8}$/;
const NAME_REGEX = /^[\u0600-\u06FF\s]{3,}$/;

function Volunteer() {
    const containerRef = useRef(null);
    const { isDark } = useTheme();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', area: '', message: '', cvFile: null, cvUrl: '',
    });
    const [cvMode, setCvMode] = useState('file');
    const [cvError, setCvError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone) => !phone || EGYPTIAN_PHONE.test(phone.replace(/\s/g, ''));
    const isNameValid = (name) => NAME_REGEX.test(name.trim());
    const isUrlValid = (url) => {
        if (!url) return false;
        try { new URL(url); return /^https?:\/\//i.test(url); } catch { return false; }
    };
    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || !isNameValid(form.name);
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'area') return !form[field];
        if (field === 'cvUrl') return cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        return false;
    };
    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name' && form.name && !isNameValid(form.name)) return 'يرجى إدخال الاسم بالعربية (3 أحرف على الأقل)';
        if (field === 'email' && form.email) return 'أدخل بريدًا صالحًا';
        if (field === 'phone' && form.phone) return 'أدخل رقم مصري صالح (مثال: 010xxxxxxx)';
        if (field === 'cvUrl') return 'أدخل رابطًا صالحًا يبدأ بـ http(s)';
        return 'هذا الحقل مطلوب';
    };

    const handleCvFile = (file) => {
        setCvError('');
        if (!file) return;
        const ALLOWED_CV_EXT = ['pdf', 'doc', 'docx'];
        const MAX_CV_MB = 5;
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_CV_EXT.includes(ext)) {
            setCvError(`صيغة غير مدعومة. المسموح: ${ALLOWED_CV_EXT.join(', ').toUpperCase()}`);
            return;
        }
        if (file.size > MAX_CV_MB * 1024 * 1024) {
            setCvError(`الحد الأقصى لحجم الملف ${MAX_CV_MB}MB`);
            return;
        }
        setForm(p => ({ ...p, cvFile: file, cvUrl: '' }));
    };
    const clearCv = () => {
        setForm(p => ({ ...p, cvFile: null, cvUrl: '' }));
        setCvError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const volunteerAreas = [
        { id: 'medical', icon: 'fa-solid fa-hospital', label: 'طبي', desc: 'المشاركة في القوافل الطبية والتوعية الصحية' },
        { id: 'education', icon: 'fa-solid fa-book-open', label: 'تعليمي', desc: 'تعليم الأطفال ومحو الأمية والدروس الخصوصية' },
        { id: 'community', icon: 'fa-solid fa-people-roof', label: 'مجتمعي', desc: 'تنمية المجتمعات المحلية والمبادرات الاجتماعية' },
        { id: 'tech', icon: 'fa-solid fa-laptop-code', label: 'تقني', desc: 'التصميم والبرمجة ودعم البنية التحتية الرقمية' },
        { id: 'admin', icon: 'fa-solid fa-clipboard-list', label: 'إداري', desc: 'التنظيم والإدارة والتخطيط للمشاريع' },
        { id: 'field', icon: 'fa-solid fa-truck', label: 'ميداني', desc: 'التوزيع والإغاثة والعمل الميداني المباشر' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const allTouched = { name: true, email: true, phone: true, area: true, cvUrl: true };
        setTouched(allTouched);
        const hasErrors = ['name', 'email', 'phone', 'area'].some(f => {
            if (f === 'name') return !form.name || !isNameValid(form.name);
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            return !form[f];
        });
        const cvInvalid = cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        if (hasErrors || cvInvalid) return;

        setSubmitting(true);
        try {
            let cvFileUrl = null;
            if (form.cvFile) {
                const formData = new FormData();
                formData.append('cv', form.cvFile);
                const uploadRes = await fetch('/api/upload/cv-public', { method: 'POST', body: formData });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    cvFileUrl = uploadData.url;
                }
            }

            await applyAsVolunteer({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                area: form.area.toUpperCase(),
                message: form.message.trim() || undefined,
                cvFile: cvFileUrl || undefined,
                cvUrl: form.cvUrl?.trim() || undefined,
            });
            setSubmitted(true);
            setSnackbar({ open: true, severity: 'success', message: 'تم إرسال طلب التطوع بنجاح! سنتواصل معك قريبًا.' });
            setForm({ name: '', email: '', phone: '', area: '', message: '', cvFile: null, cvUrl: '' });
            setTouched({});
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setSubmitted(false), 4000);
        } catch (err) {
            setSnackbar({ open: true, severity: 'error', message: err.response?.data?.error?.message || 'حدث خطأ أثناء الإرسال' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div ref={containerRef} className="pb-12">
                <VolunteerHero isDark={isDark} />
                <VolunteerStatsStrip isDark={isDark} />
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 md:mt-10">
                    <VolunteerReasons isDark={isDark} />
                    <VolunteerOpportunities isDark={isDark} />
                    <VolunteerSignupForm
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
                        cvMode={cvMode}
                        setCvMode={setCvMode}
                        cvError={cvError}
                        fileInputRef={fileInputRef}
                        handleCvFile={handleCvFile}
                        clearCv={clearCv}
                        volunteerAreas={volunteerAreas}
                    />
                </div>
            </div>

            {snackbar.open && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
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
        </>
    );
}

export default Volunteer;

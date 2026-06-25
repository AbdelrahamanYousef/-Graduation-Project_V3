import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { applyAsVolunteer } from '../../api/volunteers.api';
import VolunteerHero from './VolunteerHero';
import VolunteerStatsStrip from './VolunteerStatsStrip';
import VolunteerReasons from './VolunteerReasons';
import VolunteerOpportunities from './VolunteerOpportunities';
import VolunteerSignupForm from './VolunteerSignupForm';

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

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };
    const isUrlValid = (url) => {
        if (!url) return false;
        try { new URL(url); return /^https?:\/\//i.test(url); } catch { return false; }
    };
    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'area') return !form[field];
        if (field === 'cvUrl') return cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        return false;
    };
    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name' && form.name && form.name.trim().length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        if (field === 'email' && form.email) return 'أدخل بريدًا صالحًا';
        if (field === 'phone' && form.phone) return 'أدخل رقمًا صالحًا (10–15 رقم)';
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
            if (f === 'name') return !form.name || form.name.trim().length < 3;
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            return !form[f];
        });
        const cvInvalid = cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        if (hasErrors || cvInvalid) return;

        setSubmitting(true);
        try {
            await applyAsVolunteer({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                area: form.area.toUpperCase(),
                message: form.message.trim() || undefined,
            });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            setForm({ name: '', email: '', phone: '', area: '', message: '', cvFile: null, cvUrl: '' });
            setTouched({});
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Failed to submit volunteer application:', err);
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
        </>
    );
}

export default Volunteer;

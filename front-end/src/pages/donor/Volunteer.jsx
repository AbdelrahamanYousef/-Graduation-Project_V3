import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useInjectStyles } from '../../utils/injectStyles';
import VolunteerHero from './VolunteerHero';
import VolunteerStatsStrip from './VolunteerStatsStrip';
import VolunteerReasons from './VolunteerReasons';
import VolunteerOpportunities from './VolunteerOpportunities';
import VolunteerSignupForm from './VolunteerSignupForm';
import { applyAsVolunteer, uploadCv } from '../../api';

function Volunteer() {
    const containerRef = useRef(null);
    const { isDark } = useTheme();
    const { isDonorLoggedIn, donorUser } = useAuth();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', area: '', message: '', cvFile: null, cvUrl: '',
    });
    const [cvMode, setCvMode] = useState('file');
    const [cvError, setCvError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [touched, setTouched] = useState({});

    // Autofill logged in user details
    useEffect(() => {
        if (isDonorLoggedIn && donorUser) {
            setForm(prev => ({
                ...prev,
                name: donorUser.name || '',
                email: donorUser.email || '',
                phone: donorUser.phone || '',
            }));
        }
    }, [isDonorLoggedIn, donorUser]);

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    // Name validation: letters and spaces only, min 3 chars
    const isNameValid = (name) => {
        if (!name) return false;
        return /^[a-zA-Z\u0600-\u06FF\s]+$/.test(name.trim()) && name.trim().length >= 3;
    };

    // Phone validation: Egyptian number formats (starts with 010, 011, 012, 015 and is 11 digits long)
    const isPhoneValid = (phone) => {
        if (!phone) return false;
        const cleanPhone = phone.trim();
        return /^01[0125]\d{8}$/.test(cleanPhone);
    };

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
        if (field === 'name') {
            if (!form.name) return 'الاسم مطلوب';
            return 'الاسم يجب أن يحتوي على أحرف ومسافات فقط ولا يقل عن 3 أحرف';
        }
        if (field === 'email') return 'أدخل بريداً إلكترونياً صالحاً';
        if (field === 'phone') {
            if (!form.phone) return 'رقم الهاتف مطلوب';
            return 'يجب أن يكون رقم هاتف مصري صالح مكون من 11 رقماً (مثال: 01012345678)';
        }
        if (field === 'cvUrl') return 'أدخل رابطاً صالحاً يبدأ بـ http(s)';
        return 'هذا الحقل مطلوب';
    };

    const handleCvFile = (file) => {
        setCvError('');
        if (!file) return;
        const ALLOWED_CV_EXT = ['pdf'];
        const MAX_CV_MB = 5;
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_CV_EXT.includes(ext)) {
            setCvError(`صيغة غير مدعومة. المسموح: PDF فقط`);
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
        setSubmitError('');

        try {
            let uploadedCvPath = null;
            if (cvMode === 'file' && form.cvFile) {
                const uploadRes = await uploadCv(form.cvFile);
                uploadedCvPath = uploadRes.url;
            }

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                area: form.area.toUpperCase(), // Match Zod backend Enum: MEDICAL, TECH, etc.
                message: form.message?.trim() || '',
                cvFile: uploadedCvPath,
                cvUrl: cvMode === 'url' ? form.cvUrl.trim() : null,
                userId: donorUser?.id || null
            };

            await applyAsVolunteer(payload);
            
            setShowSuccessModal(true);
            setForm({
                name: isDonorLoggedIn ? donorUser.name : '',
                email: isDonorLoggedIn ? donorUser.email : '',
                phone: isDonorLoggedIn ? donorUser.phone : '',
                area: '',
                message: '',
                cvFile: null,
                cvUrl: ''
            });
            setTouched({});
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            setSubmitError(err.response?.data?.error || err.message || 'حدث خطأ أثناء تقديم الطلب');
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
                        submitted={false} // Disable old button success layout
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

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center animate-fadeInScale" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                        <div className="w-20 h-20 rounded-full mx-auto bg-success-50 dark:bg-success-900/20 text-success-500 flex items-center justify-center text-4xl mb-4 shadow-inner">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-3 dark:text-white">تم تقديم طلبك بنجاح!</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed">
                            شكراً لاهتمامك بالتطوع مع جمعية نور الخيرية. لقد تم تسجيل طلبك في نظامنا بنجاح، وسوف يقوم منسق التطوع بالتواصل معك عبر الهاتف أو البريد الإلكتروني لمناقشة فرص التطوع المتاحة.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-success-500 text-white font-bold rounded-xl hover:bg-success-600 transition-colors shadow-lg shadow-success-500/20"
                        >
                            حسناً، فهمت
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message Alert */}
            {submitError && (
                <div className="fixed bottom-4 left-4 z-50 p-4 bg-error-500 text-white rounded-xl shadow-lg max-w-sm flex items-center gap-3 animate-slideUp">
                    <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                    <div className="flex-1 text-sm font-medium">{submitError}</div>
                    <button onClick={() => setSubmitError('')} className="opacity-80 hover:opacity-100">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}
        </>
    );
}

export default Volunteer;

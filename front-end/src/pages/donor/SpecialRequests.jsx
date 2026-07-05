import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { submitSpecialRequest } from '../../api';
import { paths } from '../../constants/paths';
import { t } from '../../i18n';
import { HeroBanner } from '../../components/common';
import { HeartHandshake, FileText, ShieldCheck, PhoneCall } from 'lucide-react';

const TEAL = '#1a4a44';
const TEAL_DARK = '#0a1f1c';
const G_GREEN = '#00b16a';
const G_GREEN_DK = '#009659';
const DARK_BG = '#0f172a';
const CONTENT_BG = '#f8fafc';
const CARD_RADIUS = 24;

const pageStyles = `
    @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
`;

function SpecialRequests() {
    const containerRef = useRef(null);
    const { isDark } = useTheme();
    const { isDonorLoggedIn, donorUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useInjectStyles(pageStyles, 'special-requests-styles');

    const [form, setForm] = useState({
        name: '', email: '', phone: '', requestType: 'general', description: '',
    });
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Autofill profile data if logged in
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
    
    const isNameValid = (name) => {
        if (!name) return false;
        return /^[a-zA-Z\u0600-\u06FF\s]+$/.test(name.trim()) && name.trim().length >= 3;
    };

    const isPhoneValid = (phone) => {
        if (!phone) return false;
        return /^01[0125]\d{8}$/.test(phone.trim());
    };

    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || !isNameValid(form.name);
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'description') return !form.description || form.description.trim().length < 10;
        return false;
    };

    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name') {
            if (!form.name) return 'الاسم بالكامل مطلوب';
            return 'الاسم يجب أن يحتوي على أحرف ومسافات فقط ولا يقل عن 3 أحرف';
        }
        if (field === 'email') return 'البريد الإلكتروني غير صالح';
        if (field === 'phone') {
            if (!form.phone) return 'رقم الهاتف مطلوب';
            return 'يجب أن يكون رقم هاتف مصري صالح مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
        }
        if (field === 'description') {
            if (!form.description) return 'تفاصيل الطلب مطلوبة';
            return 'يرجى كتابة تفاصيل واضحة لا تقل عن 10 أحرف لتسريع دراسة الحالة';
        }
        return 'هذا الحقل مطلوب';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, phone: true, description: true });

        const hasErrors = ['name', 'email', 'phone', 'description'].some(f => {
            if (f === 'name') return !form.name || !isNameValid(form.name);
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            if (f === 'description') return !form.description || form.description.trim().length < 10;
            return false;
        });

        if (hasErrors) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                name: form.name.trim(),
                email: form.email?.trim() || null,
                phone: form.phone.trim(),
                requestType: form.requestType,
                description: form.description.trim(),
                userId: donorUser?.id || null
            };

            await submitSpecialRequest(payload);

            setShowSuccessModal(true);
            setForm({
                name: isDonorLoggedIn ? donorUser.name : '',
                email: isDonorLoggedIn ? donorUser.email : '',
                phone: isDonorLoggedIn ? donorUser.phone : '',
                requestType: 'general',
                description: '',
            });
            setTouched({});
        } catch (err) {
            console.error(err);
            setSubmitError(err.response?.data?.error || err.message || 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.');
        } finally {
            setSubmitting(false);
        }
    };

    const aidCategories = [
        { val: 'financial', label: 'مساعدات مالية ونقدية' },
        { val: 'medical', label: 'رعاية صحية ومستلزمات طبية' },
        { val: 'food', label: 'سلة غذائية وتأمين طعام' },
        { val: 'education', label: 'كفالة تعليمية ومصاريف دراسة' },
        { val: 'general', label: 'مساعدات عينية أخرى' },
    ];

    const contentBg = isDark ? DARK_BG : CONTENT_BG;

    return (
        <div ref={containerRef} className="min-h-screen pb-12" style={{ backgroundColor: contentBg }}>
            {/* Hero Section */}
            <HeroBanner 
                themeVariant="programs"
                badgeText="نحن هنا لدعمك"
                headline="الطلبات الخاصة ومساعدات الحالات"
                highlightedWord="مساعدات"
                subtext="نحن هنا لنقف بجانبكم. في حال كنتم بحاجة إلى مساعدة خاصة أو عينية، يرجى ملء هذا النموذج بدقة وسيقوم فريقنا المختص ببحث الحالة والتواصل معكم."
                primaryCtaText="تعبئة النموذج"
                primaryCtaLink="#help-form"
                stats={[
                    { number: "24/7", label: "استقبال الطلبات" },
                    { number: "سرية", label: "تامة للمعلومات" }
                ]}
                floatingIcons={[
                    <HeartHandshake key="heart" size={24} />,
                    <FileText key="file" size={24} />,
                    <ShieldCheck key="shield" size={24} />,
                    <PhoneCall key="phone" size={24} />
                ]}
            />

            {/* Form Section */}
            <div id="help-form" className="relative overflow-hidden py-10 md:py-16">
                <div className="max-w-[800px] mx-auto px-4 relative z-10">
                    <div className="p-4 sm:p-6 md:p-8" style={{
                        borderRadius: `${CARD_RADIUS}px`,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                        backgroundColor: isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.82)',
                        backdropFilter: isDark ? 'saturate(1.2) blur(20px)' : 'saturate(1.4) blur(24px)',
                        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.06)',
                        opacity: 0,
                        animation: 'fadeInScale 0.6s ease forwards 0.2s',
                    }}>
                        {!isDonorLoggedIn ? (
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center font-sans" dir="rtl">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                    <i className="fa-solid fa-lock text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">تسجيل الدخول مطلوب</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                                    يرجى تسجيل الدخول لتتمكن من إرسال طلبك ومتابعته من حسابك.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate(paths.auth.login, { state: { from: location.pathname } })}
                                    className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    تسجيل الدخول الآن
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Personal Info Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shrink-0" style={{
                                    background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, #0d7c65)`,
                                    boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`,
                                }}>
                                    <i className="fa-solid fa-user-circle"></i>
                                </div>
                                <h3 className="font-bold text-lg dark:text-white" style={{ color: isDark ? '#fff' : TEAL_DARK }}>
                                    بيانات مقدم الطلب
                                </h3>
                                <div className="flex-grow h-px bg-neutral-200 dark:bg-neutral-700 ml-2" />
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 dark:text-neutral-200">الاسم بالكامل (ثلاثي على الأقل) *</label>
                                <div className="relative">
                                    <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400" />
                                    <input
                                        placeholder="محمد أحمد محمود"
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        onBlur={() => handleBlur('name')}
                                        required
                                        className="w-full px-4 py-3 pl-10 border rounded-xl bg-transparent text-inherit outline-none transition-all dark:focus:border-primary-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                        style={{
                                            borderColor: getError('name') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
                                            minHeight: 52
                                        }}
                                    />
                                </div>
                                {getError('name') && (
                                    <p className="mt-1 text-xs font-medium" style={{ color: '#e57373' }}>
                                        {getHelper('name')}
                                    </p>
                                )}
                            </div>

                            {/* Phone and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 dark:text-neutral-200">رقم الهاتف (موبايل مصري) *</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400" />
                                        <input
                                            type="text"
                                            inputMode="tel"
                                            dir="ltr"
                                            placeholder="01012345678"
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            onBlur={() => handleBlur('phone')}
                                            required
                                            className="w-full px-4 py-3 pl-10 border rounded-xl bg-transparent text-inherit outline-none transition-all dark:focus:border-primary-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                            style={{
                                                borderColor: getError('phone') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'),
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
                                                minHeight: 52
                                            }}
                                        />
                                    </div>
                                    {getError('phone') && (
                                        <p className="mt-1 text-xs font-medium" style={{ color: '#e57373' }}>
                                            {getHelper('phone')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 dark:text-neutral-200">البريد الإلكتروني (اختياري)</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400" />
                                        <input
                                            type="email"
                                            placeholder="example@mail.com"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            onBlur={() => handleBlur('email')}
                                            className="w-full px-4 py-3 pl-10 border rounded-xl bg-transparent text-inherit outline-none transition-all dark:focus:border-primary-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                            style={{
                                                borderColor: getError('email') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'),
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
                                                minHeight: 52
                                            }}
                                        />
                                    </div>
                                    {getError('email') && (
                                        <p className="mt-1 text-xs font-medium" style={{ color: '#e57373' }}>
                                            {getHelper('email')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Request Details Header */}
                            <div className="flex items-center gap-2 mb-2 pt-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shrink-0" style={{
                                    background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, #0d7c65)`,
                                    boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`,
                                }}>
                                    <i className="fa-solid fa-hand-holding-heart"></i>
                                </div>
                                <h3 className="font-bold text-lg dark:text-white" style={{ color: isDark ? '#fff' : TEAL_DARK }}>
                                    تفاصيل طلب المساعدة
                                </h3>
                                <div className="flex-grow h-px bg-neutral-200 dark:bg-neutral-700 ml-2" />
                            </div>

                            {/* Request Type */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 dark:text-neutral-200">نوع المساعدة المطلوبة *</label>
                                <select
                                    value={form.requestType}
                                    onChange={e => setForm(p => ({ ...p, requestType: e.target.value }))}
                                    className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-neutral-800 text-inherit outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                    style={{
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                                        minHeight: 52
                                    }}
                                >
                                    {aidCategories.map(cat => (
                                        <option key={cat.val} value={cat.val} className="dark:bg-neutral-800">{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Request Description */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 dark:text-neutral-200">شرح تفصيلي للحالة والاحتياجات *</label>
                                <div className="relative">
                                    <textarea
                                        placeholder="اكتب شرحاً مفصلاً لظروف الحالة، ونوع الدعم المطلوب تحديداً ومبررات الطلب..."
                                        value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        onBlur={() => handleBlur('description')}
                                        required
                                        rows={5}
                                        className="w-full p-4 border rounded-xl bg-transparent text-inherit outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                                        style={{
                                            borderColor: getError('description') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
                                        }}
                                    />
                                </div>
                                {getError('description') && (
                                    <p className="mt-1 text-xs font-medium" style={{ color: '#e57373' }}>
                                        {getHelper('description')}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-14 rounded-xl font-bold text-[1.05rem] text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                                    style={{
                                        background: submitting 
                                            ? 'rgba(0,177,106,0.5)' 
                                            : (isDark ? `linear-gradient(135deg, ${G_GREEN} 0%, #059669 100%)` : `linear-gradient(135deg, ${TEAL} 0%, #0d7c65 100%)`),
                                        boxShadow: submitting ? 'none' : `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`,
                                        cursor: submitting ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${isDark ? 'rgba(0,177,106,0.45)' : 'rgba(26,74,68,0.45)'}`; }}}
                                    onMouseLeave={e => { if (!submitting) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`; }}}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            جاري إرسال الطلب...
                                        </>
                                    ) : (
                                        <>
                                            إرسال طلب المساعدة
                                            <i className="fa-solid fa-paper-plane"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center animate-fadeInScale" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                        <div className="w-20 h-20 rounded-full mx-auto bg-success-50 dark:bg-success-900/20 text-success-500 flex items-center justify-center text-4xl mb-4 shadow-inner">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-3 dark:text-white">تم إرسال طلبك بنجاح</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed">
                            تم تسجيل طلب المساعدة الخاص بكم في قاعدة البيانات بنجاح. سيقوم الأخصائي الاجتماعي واللجنة الاجتماعية بجمعية نور بدراسة الطلب والمستندات، وسنتواصل معكم هاتفياً لاستكمال البحث الاجتماعي في أقرب وقت.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-success-500 text-white font-bold rounded-xl hover:bg-success-600 transition-colors shadow-lg"
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
        </div>
    );
}

export default SpecialRequests;

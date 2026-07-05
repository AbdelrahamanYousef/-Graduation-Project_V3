import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { submitContactMessage } from '../../api/contact.api';
import { HeroBanner, useToast } from '../../components/common';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paths } from '../../constants/paths';

import ContactInfoCard from './ContactInfoCard';
import ContactSocialCard from './ContactSocialCard';
import ContactForm from './ContactForm';

const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const DARK_BG = '#0f172a';
const CONTENT_BG = '#f8fafc';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (v) => !v || EMAIL_RE.test(v);
const isPhoneValid = (v) => { const s = v.trim(); return !s || /^\d{10,15}$/.test(s); };

const pageStyles = `
    @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
`;

function Contact() {
    const { isDonorLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const { isDark, language } = useTheme();
    useInjectStyles(pageStyles, 'contact-page-styles');
    const isRTL = language === 'ar';
    const { state, dispatch } = useAdminData();
    const orgInfo = state?.settings?.organization || {};
    const socialLinks = state?.settings?.social || {};

    const toast = useToast();
    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: '', preferredContact: '',
    });
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleBlur = (f) => setTouched(p => ({ ...p, [f]: true }));
    const getError = (f) => {
        if (!touched[f]) return false;
        if (f === 'name') return !form.name || form.name.trim().length < 3;
        if (f === 'email') return !form.email || !isEmailValid(form.email);
        if (f === 'phone') return form.phone.trim() !== '' && !isPhoneValid(form.phone);
        if (f === 'subject') return !form.subject || form.subject.trim().length < 3;
        if (f === 'message') return !form.message || form.message.trim().length < 10;
        return false;
    };
    const getHelper = (f) => {
        if (!getError(f)) return ' ';
        if (f === 'name') return !form.name.trim() ? t('contact.form.errors.nameRequired') : t('contact.form.errors.nameMin');
        if (f === 'email') return !form.email.trim() ? t('contact.form.errors.emailRequired') : t('contact.form.errors.emailInvalid');
        if (f === 'phone') return t('contact.form.errors.phoneInvalid');
        if (f === 'subject') return !form.subject.trim() ? t('contact.form.errors.subjectRequired') : t('contact.form.errors.subjectMin');
        if (f === 'message') return !form.message.trim() ? t('contact.form.errors.messageRequired') : t('contact.form.errors.messageMin');
        return ' ';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, phone: true, subject: true, message: true });
        const hasErr = [
            !form.name || form.name.trim().length < 3,
            !form.email || !isEmailValid(form.email),
            (form.phone || '').trim() !== '' && !isPhoneValid(form.phone),
            !form.subject || form.subject.trim().length < 3,
            !form.message || form.message.trim().length < 10,
        ].some(Boolean);
        if (hasErr) return;
        setIsLoading(true);
        try {
            await submitContactMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: (form.phone || '').trim() || undefined,
                subject: form.subject.trim(),
                message: form.message.trim(),
                preferredContact: form.preferredContact || undefined,
            });
            setForm({ name: '', email: '', phone: '', subject: '', message: '', preferredContact: '' });
            setTouched({});
            toast.success("تم إرسال رسالتك بنجاح");
        } catch (err) {
            toast.error(err.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setIsLoading(false);
        }
    };

    const contactInfo = [
        { icon: 'fa-solid fa-location-dot', label: t('contact.addressLabel'), value: orgInfo.address || t('contact.info.address'), gradient: `linear-gradient(135deg, ${TEAL}, #0d7c65)` },
        { icon: 'fa-solid fa-phone', label: t('contact.phoneLabel'), value: orgInfo.phone || t('contact.info.phone'), gradient: `linear-gradient(135deg, #12355B, #1a5a96)` },
        { icon: 'fa-solid fa-envelope', label: t('contact.emailLabel'), value: orgInfo.email || t('contact.info.email'), gradient: `linear-gradient(135deg, #00b16a, #059669)` },
        { icon: 'fa-solid fa-clock', label: t('contact.workHoursLabel'), value: t('contact.info.workHours'), gradient: `linear-gradient(135deg, ${TEAL_MID}, ${TEAL})` },
    ];

    const contentBg = isDark ? DARK_BG : CONTENT_BG;

    return (
        <>
            <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: contentBg }}>
                <HeroBanner 
                    themeVariant="programs"
                    badgeText="تواصل معنا"
                    headline="نسعد بتواصلكم معنا لأي استفسار أو اقتراح"
                    highlightedWord="بتواصلكم"
                    subtext="فريقنا متواجد دائماً للرد على أسئلتكم، استقبال مقترحاتكم، وتقديم الدعم اللازم لتسهيل رحلة عطائكم."
                    primaryCtaText="أرسل رسالة"
                    primaryCtaLink="#contact-form"
                    stats={[
                        { number: "24/7", label: "استقبل الرسائل" },
                        { number: "سريع", label: "معدل الاستجابة" }
                    ]}
                    floatingIcons={[
                        <Phone key="phone" size={24} />,
                        <Mail key="mail" size={24} />,
                        <MapPin key="map" size={24} />,
                        <MessageSquare key="msg" size={24} />
                    ]}
                />

                <div className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="absolute top-[60px] left-[3%] w-[300px] h-[300px] rounded-full pointer-events-none z-0" style={{
                        background: isDark ? 'radial-gradient(circle, rgba(0,177,106,0.06) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(26,74,68,0.05) 0%, transparent 70%)',
                        animation: 'float 9s ease-in-out infinite',
                    }} />
                    <div className="absolute bottom-10 right-[6%] w-[220px] h-[220px] rounded-full pointer-events-none z-0" style={{
                        background: isDark ? 'radial-gradient(circle, rgba(0,177,106,0.04) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(26,74,68,0.04) 0%, transparent 70%)',
                        animation: 'float 11s ease-in-out infinite 3s',
                    }} />
                    <div className="absolute top-[45%] right-[25%] w-[160px] h-[160px] rounded-[30%] pointer-events-none z-0" style={{
                        transform: 'rotate(45deg)',
                        background: isDark ? 'radial-gradient(circle, rgba(0,177,106,0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(26,74,68,0.03) 0%, transparent 70%)',
                        animation: 'float 13s ease-in-out infinite 5s',
                    }} />

                    <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start">
                            <div className="flex-[0_0_100%] md:flex-[0_0_38%] w-full md:w-[38%] order-2 md:order-1">
                                <div className="flex flex-col gap-2 md:sticky md:top-[88px]">
                                    {contactInfo.map((info, i) => (
                                        <ContactInfoCard
                                            key={i}
                                            icon={info.icon}
                                            label={info.label}
                                            value={info.value}
                                            gradient={info.gradient}
                                            isDark={isDark}
                                            index={i}
                                            isRTL={isRTL}
                                        />
                                    ))}
                                    <ContactSocialCard socialLinks={socialLinks} isDark={isDark} />
                                </div>
                            </div>

                            <div id="contact-form" className="flex-[1_1_100%] md:flex-[1_1_0%] w-full md:w-auto order-1 md:order-2">
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
                                    <ContactForm
                                        isDark={isDark}
                                        isRTL={isRTL}
                                        onSubmit={handleSubmit}
                                        form={form}
                                        setForm={setForm}
                                        touched={touched}
                                        setTouched={setTouched}
                                        submitting={isLoading}
                                        errors={getError}
                                        handleBlur={handleBlur}
                                        getHelper={getHelper}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Contact;

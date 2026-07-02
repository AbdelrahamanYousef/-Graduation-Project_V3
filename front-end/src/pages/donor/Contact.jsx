import { useState, useRef } from 'react';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useInjectStyles } from '../../utils/injectStyles';
import { submitContactMessage } from '../../api/contact.api';
import { HeroBanner } from '../../components/common';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
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
    const containerRef = useRef(null);
    const { isDark, language } = useTheme();
    useInjectStyles(pageStyles, 'contact-page-styles');
    const isRTL = language === 'ar';
    const { state, dispatch } = useAdminData();
    const orgInfo = state?.settings?.organization || {};
    const socialLinks = state?.settings?.social || {};

    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: '', preferredContact: '',
    });
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
    const handleSnackbarClose = () => setSnackbar(p => ({ ...p, open: false }));

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
            form.phone.trim() !== '' && !isPhoneValid(form.phone),
            !form.subject || form.subject.trim().length < 3,
            !form.message || form.message.trim().length < 10,
        ].some(Boolean);
        if (hasErr) return;
        setSubmitting(true);
        try {
            await submitContactMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                subject: form.subject.trim(),
                message: form.message.trim(),
            });
            setForm({ name: '', email: '', phone: '', subject: '', message: '', preferredContact: '' });
            setTouched({});
            setSnackbar({ open: true, severity: 'success', message: t('contact.messageSent') });
        } catch (err) {
            setSnackbar({ open: true, severity: 'error', message: err.response?.data?.error?.message || 'حدث خطأ أثناء الإرسال' });
        } finally {
            setSubmitting(false);
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
                                <ContactForm
                                    isDark={isDark}
                                    isRTL={isRTL}
                                    onSubmit={handleSubmit}
                                    form={form}
                                    setForm={setForm}
                                    touched={touched}
                                    setTouched={setTouched}
                                    submitting={submitting}
                                    errors={getError}
                                    handleBlur={handleBlur}
                                    getHelper={getHelper}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {snackbar.open && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] text-white font-semibold text-[0.95rem] min-w-[320px]" style={{
                            backgroundColor: snackbar.severity === 'success' ? '#00b16a' : snackbar.severity === 'error' ? '#e57373' : '#ff9800',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                            animation: 'fadeInUp 0.3s ease both',
                        }}>
                            <span className="flex-1">{snackbar.message}</span>
                            <button onClick={handleSnackbarClose} className="text-white/80 hover:text-white">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Contact;

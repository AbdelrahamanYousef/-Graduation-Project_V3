import { useInjectStyles } from '../../utils/injectStyles';
import { t } from '../../i18n';

const TEAL = '#1a4a44';
const G_GREEN = '#00b16a';
const G_GREEN_DK = '#009659';
const CARD_RADIUS = 24;

const formStyles = `
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
`;

function ContactForm({ isDark, isRTL, onSubmit, form, setForm, touched, setTouched, submitting, errors, handleBlur, getHelper }) {
    useInjectStyles(formStyles, 'contact-form-styles');

    return (
        <div className="p-3 sm:p-4 md:p-5" style={{
            borderRadius: `${CARD_RADIUS}px`,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            backgroundColor: isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.82)',
            backdropFilter: isDark ? 'saturate(1.2) blur(20px)' : 'saturate(1.4) blur(24px)',
            boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.06)',
            opacity: 0,
            animation: 'fadeInScale 0.6s ease forwards 0.25s',
            transition: 'box-shadow 400ms cubic-bezier(0.22,1,0.36,1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = isDark ? '0 16px 56px rgba(0,0,0,0.45)' : '0 12px 44px rgba(0,0,0,0.10)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = isDark ? '0 8px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.06)'; }}>
            <form onSubmit={onSubmit} noValidate>
                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                        background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? '#059669' : '#0d7c65'})`,
                        boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                    }}>
                        <i className="fa-solid fa-user-circle"></i>
                    </div>
                    <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(0,177,106,0.85)' : TEAL }}>
                        {t('contact.form.personalInfo')}
                    </p>
                    <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                </div>

                <div className="mb-2">
                    <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-sm z-10" style={{ color: isDark ? 'rgba(0,177,106,0.6)' : 'rgba(26,74,68,0.5)' }} />
                        <input
                            placeholder={t('contact.form.name')}
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            onBlur={() => handleBlur('name')}
                            required
                            className="w-full px-3 py-2.5 pl-9 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            style={{
                                borderColor: errors('name') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.10)' : '#e0e0e0'),
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                                minHeight: 52,
                                boxShadow: errors('name') ? '0 0 0 3px rgba(229,115,115,0.08)' : undefined,
                            }}
                        />
                    </div>
                    {getHelper('name') !== ' ' && (
                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                            {getHelper('name')}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <div className="flex-1">
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-sm z-10" style={{ color: isDark ? 'rgba(0,177,106,0.6)' : 'rgba(26,74,68,0.5)' }} />
                            <input
                                type="email"
                                placeholder={t('contact.form.email')}
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                onBlur={() => handleBlur('email')}
                                required
                                className="w-full px-3 py-2.5 pl-9 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                style={{
                                    borderColor: errors('email') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.10)' : '#e0e0e0'),
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                                    minHeight: 52,
                                    boxShadow: errors('email') ? '0 0 0 3px rgba(229,115,115,0.08)' : undefined,
                                }}
                            />
                        </div>
                        {getHelper('email') !== ' ' && (
                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                                {getHelper('email')}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-sm z-10" style={{ color: isDark ? 'rgba(0,177,106,0.6)' : 'rgba(26,74,68,0.5)' }} />
                            <input
                                type="text"
                                inputMode="tel"
                                dir="ltr"
                                placeholder={t('contact.form.phone')}
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                onBlur={() => handleBlur('phone')}
                                className="w-full px-3 py-2.5 pl-9 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                style={{
                                    borderColor: errors('phone') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.10)' : '#e0e0e0'),
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                                    minHeight: 52,
                                    boxShadow: errors('phone') ? '0 0 0 3px rgba(229,115,115,0.08)' : undefined,
                                }}
                            />
                        </div>
                        <p className="mt-0.5 text-xs min-h-[1.25em]" style={{ color: errors('phone') ? '#e57373' : ((form.phone || '').trim() === '' ? '#aaa' : 'transparent') }}>
                            {errors('phone') ? getHelper('phone') : ((form.phone || '').trim() === '' ? t('contact.form.optional') : '')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                        background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? '#059669' : '#0d7c65'})`,
                        boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                    }}>
                        <i className="fa-solid fa-headset"></i>
                    </div>
                    <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(0,177,106,0.85)' : TEAL }}>
                        {t('contact.form.preferredContact')}
                    </p>
                    <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                </div>

                <div className="p-2 mb-3 rounded-[14px]" style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(26,74,68,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,74,68,0.08)'}`,
                }}>
                    <span className="block mb-1 font-medium text-[0.75rem]" style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.38)' }}>
                        ({t('contact.form.optional')})
                    </span>
                    <div className="flex gap-0.5 sm:gap-2">
                        {[
                            { val: 'email', icon: 'fa-solid fa-envelope', label: t('contact.form.contactEmail') },
                            { val: 'phone', icon: 'fa-solid fa-phone', label: t('contact.form.contactPhone') },
                            { val: 'whatsapp', icon: 'fa-brands fa-whatsapp', label: t('contact.form.contactWhatsapp') },
                        ].map(opt => (
                            <label key={opt.val} className="flex items-center gap-1.5 text-[0.85rem] font-medium cursor-pointer" style={{ color: isDark ? '#e2e8f0' : '#333' }}>
                                <input
                                    type="radio"
                                    name="preferredContact"
                                    value={opt.val}
                                    checked={form.preferredContact === opt.val}
                                    onChange={(e) => setForm(p => ({ ...p, preferredContact: e.target.value }))}
                                    className="appearance-none w-4 h-4 rounded-full border-2 cursor-pointer"
                                    style={{
                                        borderColor: form.preferredContact === opt.val ? G_GREEN : 'rgba(0,177,106,0.4)',
                                        backgroundColor: form.preferredContact === opt.val ? G_GREEN : 'transparent',
                                    }}
                                />
                                <i className={opt.icon} style={{ fontSize: 13, opacity: 0.7 }}></i>
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                        background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? '#059669' : '#0d7c65'})`,
                        boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                    }}>
                        <i className="fa-solid fa-comment-dots"></i>
                    </div>
                    <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(0,177,106,0.85)' : TEAL }}>
                        {t('contact.form.messageInfo')}
                    </p>
                    <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                </div>

                <div className="mb-2">
                    <div className="relative">
                        <i className="fa-solid fa-bookmark absolute left-3 top-1/2 -translate-y-1/2 text-sm z-10" style={{ color: isDark ? 'rgba(0,177,106,0.6)' : 'rgba(26,74,68,0.5)' }} />
                        <input
                            placeholder={t('contact.form.subject')}
                            value={form.subject}
                            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                            onBlur={() => handleBlur('subject')}
                            required
                            className="w-full px-3 py-2.5 pl-9 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            style={{
                                borderColor: errors('subject') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.10)' : '#e0e0e0'),
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                                minHeight: 52,
                                boxShadow: errors('subject') ? '0 0 0 3px rgba(229,115,115,0.08)' : undefined,
                            }}
                        />
                    </div>
                    {getHelper('subject') !== ' ' && (
                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                            {getHelper('subject')}
                        </p>
                    )}
                </div>

                <div className="mb-3">
                    <div className="relative">
                        <i className="fa-solid fa-comment-dots absolute left-3 top-4 text-sm z-10" style={{ color: isDark ? 'rgba(0,177,106,0.6)' : 'rgba(26,74,68,0.5)' }} />
                        <textarea
                            placeholder={t('contact.form.message')}
                            value={form.message}
                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                            onBlur={() => handleBlur('message')}
                            required
                            rows={5}
                            className="w-full px-3 py-2.5 pl-9 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                            style={{
                                borderColor: errors('message') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.10)' : '#e0e0e0'),
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                                boxShadow: errors('message') ? '0 0 0 3px rgba(229,115,115,0.08)' : undefined,
                            }}
                        />
                    </div>
                    {getHelper('message') !== ' ' && (
                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                            {getHelper('message')}
                        </p>
                    )}
                </div>

                <div className="flex justify-stretch md:justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="font-bold text-base rounded-[14px] px-5 text-white w-full md:w-auto min-w-[240px] h-14"
                        style={{
                            backgroundColor: submitting ? 'rgba(0,177,106,0.5)' : G_GREEN,
                            boxShadow: submitting ? 'none' : `0 6px 20px rgba(0,177,106,0.30)`,
                            transition: 'all 0.3s ease',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = G_GREEN_DK; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px rgba(0,177,106,0.45)`; }}}
                        onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = G_GREEN; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,177,106,0.30)`; }}}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                {t('contact.form.sending')}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {t('contact.form.send')}
                                <i className="fa-solid fa-paper-plane"></i>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ContactForm;

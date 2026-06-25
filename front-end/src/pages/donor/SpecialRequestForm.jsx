import { useState } from 'react';

const TEAL = '#1a4a44';
const TEAL_DARK = '#0a1f1c';
const G_GREEN = '#00b16a';

const REQUEST_TYPES = [
    { value: 'financial', label: 'مساعدة مالية', icon: 'fa-solid fa-hand-holding-dollar' },
    { value: 'medical', label: 'مساعدة طبية', icon: 'fa-solid fa-kit-medical' },
    { value: 'food', label: 'مساعدات غذائية', icon: 'fa-solid fa-basket-shopping' },
    { value: 'educational', label: 'دعم تعليمي', icon: 'fa-solid fa-graduation-cap' },
    { value: 'housing', label: 'دعم سكني', icon: 'fa-solid fa-house' },
    { value: 'other', label: 'أخرى', icon: 'fa-solid fa-ellipsis' },
];

export default function SpecialRequestForm({
    isDark, form, setForm, touched, setTouched, submitted, submitting,
    handleSubmit, handleBlur, getError, getHelper,
}) {
    return (
        <div className="relative py-5 md:py-8 mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start">
                <div className="flex-[0_0_100%] md:flex-[0_0_38%] w-full md:w-[38%] order-2 md:order-1">
                    <div className="flex flex-col gap-2 md:sticky md:top-[88px]">
                        <div className="p-3 md:p-4 rounded-2xl text-center backdrop-blur" style={{
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            backgroundColor: isDark ? 'rgba(15,22,35,0.6)' : 'rgba(255,255,255,0.7)',
                        }}>
                            <div className="w-16 h-16 rounded-[16px] mx-auto mb-3 flex items-center justify-center text-white text-2xl" style={{
                                background: isDark ? `linear-gradient(135deg, ${G_GREEN}, #059669)` : `linear-gradient(135deg, ${TEAL}, #0d7c65)`,
                                boxShadow: `0 4px 16px rgba(26,74,68,0.25)`,
                            }}>
                                <i className="fa-solid fa-paper-plane"></i>
                            </div>
                            <h3 className="font-extrabold mb-2 text-lg" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                                طلب خاص
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                سنقوم بمراجعة طلبك والتواصل معك في أقرب وقت.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-[1_1_100%] md:flex-[1_1_0%] w-full md:w-auto order-1 md:order-2">
                    <div className="p-3 sm:p-4 md:p-5 rounded-2xl backdrop-blur" style={{
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
                        backgroundColor: isDark ? 'rgba(20,28,40,0.9)' : 'rgba(255,255,255,0.95)',
                    }}>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                                    background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? '#22d3ee' : TEAL_DARK})`,
                                    boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                                }}>
                                    <i className="fa-solid fa-user-circle"></i>
                                </div>
                                <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : TEAL_DARK }}>
                                    معلومات الطلب
                                </p>
                                <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <div>
                                    <input
                                        placeholder="الاسم الكامل"
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        onBlur={() => handleBlur('name')}
                                        required
                                        className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        style={{
                                            borderColor: getError('name') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                            minHeight: 52,
                                        }}
                                    />
                                    {getHelper('name') !== ' ' && (
                                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373' }}>{getHelper('name')}</p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5">
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            placeholder="البريد الإلكتروني"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            onBlur={() => handleBlur('email')}
                                            required
                                            className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            style={{
                                                borderColor: getError('email') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                minHeight: 52,
                                            }}
                                        />
                                        {getHelper('email') !== ' ' && (
                                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373' }}>{getHelper('email')}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="tel"
                                            placeholder="رقم الهاتف"
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            onBlur={() => handleBlur('phone')}
                                            required
                                            className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            style={{
                                                borderColor: getError('phone') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                minHeight: 52,
                                            }}
                                        />
                                        {getHelper('phone') !== ' ' && (
                                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373' }}>{getHelper('phone')}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <select
                                        value={form.requestType}
                                        onChange={e => setForm(p => ({ ...p, requestType: e.target.value }))}
                                        onBlur={() => handleBlur('requestType')}
                                        required
                                        className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        style={{
                                            borderColor: getError('requestType') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                            minHeight: 52,
                                        }}
                                    >
                                        <option value="">اختر نوع الطلب</option>
                                        {REQUEST_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    {getError('requestType') && (
                                        <p className="mt-0.5 text-xs" style={{ color: '#e57373' }}>هذا الحقل مطلوب</p>
                                    )}
                                </div>

                                <div>
                                    <textarea
                                        placeholder="اشرح طلبك بالتفصيل ..."
                                        rows={5}
                                        value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        onBlur={() => handleBlur('description')}
                                        required
                                        className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                        style={{
                                            borderColor: getError('description') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                        }}
                                    />
                                    {getHelper('description') !== ' ' && (
                                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373' }}>{getHelper('description')}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting || submitted}
                                        className="w-full h-[52px] rounded-xl font-bold text-[1.05rem] text-white transition-all"
                                        style={{
                                            background: isDark ? `linear-gradient(135deg, ${G_GREEN} 0%, #059669 100%)` : `linear-gradient(135deg, ${TEAL} 0%, #0d7c65 100%)`,
                                            boxShadow: `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`,
                                            opacity: (submitting || submitted) ? 0.7 : 1,
                                            cursor: (submitting || submitted) ? 'not-allowed' : 'pointer',
                                        }}
                                        onMouseEnter={e => { if (!submitting && !submitted) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${isDark ? 'rgba(0,177,106,0.45)' : 'rgba(26,74,68,0.45)'}`; }}}
                                        onMouseLeave={e => { if (!submitting && !submitted) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`; }}}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-1">
                                                جاري الإرسال... <i className="fa-solid fa-spinner fa-spin"></i>
                                            </span>
                                        ) : submitted ? (
                                            <span className="flex items-center justify-center gap-1">
                                                تم الإرسال بنجاح! <i className="fa-solid fa-check"></i>
                                            </span>
                                        ) : 'إرسال الطلب'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

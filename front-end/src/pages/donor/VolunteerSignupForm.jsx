import { t } from '../../i18n';

const TEAL = '#1a4a44';
const TEAL_DARK = '#0a1f1c';
const G_GREEN = '#00b16a';
const ACCENT_CYAN = '#22d3ee';
const MAX_CV_MB = 5;
const ALLOWED_CV_EXT = ['pdf', 'doc', 'docx'];

export default function VolunteerSignupForm({
    isDark, form, setForm, touched, setTouched, submitted, submitting, handleSubmit, handleBlur,
    getError, getHelper, cvMode, setCvMode, cvError, fileInputRef, handleCvFile, clearCv, volunteerAreas,
}) {
    return (
        <div id="volunteer-form" className="relative py-5 md:py-8 mb-4 scroll-mt-20">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start">
                {/* COL A — Info */}
                <div className="flex-[0_0_100%] md:flex-[0_0_38%] w-full md:w-[38%] order-2 md:order-1">
                    <div className="flex flex-col gap-2 md:sticky md:top-[88px]">
                        <div className="p-3 md:p-4 rounded-2xl text-center backdrop-blur" style={{
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            backgroundColor: isDark ? 'rgba(15,22,35,0.6)' : 'rgba(255,255,255,0.7)',
                            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.3)' : '0 12px 32px rgba(0,0,0,0.03)',
                        }}>
                            <div className="w-16 h-16 rounded-[16px] mx-auto mb-3 flex items-center justify-center text-white text-2xl" style={{
                                background: isDark ? `linear-gradient(135deg, ${G_GREEN}, #059669)` : `linear-gradient(135deg, ${TEAL}, #0d7c65)`,
                                boxShadow: `0 4px 16px rgba(26,74,68,0.25)`,
                            }}>
                                <i className="fa-solid fa-handshake-angle"></i>
                            </div>
                            <h3 className="font-extrabold mb-2 text-lg" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                                {t('volunteer.signUp')}
                            </h3>
                            <div className="max-w-[320px] mx-auto">
                                <p className="font-bold mb-1 text-base leading-tight tracking-tight" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : '#1a1a2e' }}>
                                    انضم إلينا واصنع الفرق
                                </p>
                                <hr className="my-1.5 w-2/5 mx-auto" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', opacity: 0.5 }} />
                                <p className="text-sm leading-relaxed text-[0.88rem]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                    سنتواصل معك لتحديد أنسب مجال ووقت للتطوع.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL B — Form */}
                <div className="flex-[1_1_100%] md:flex-[1_1_0%] w-full md:w-auto order-1 md:order-2">
                    <div className="p-3 sm:p-4 md:p-5 rounded-2xl backdrop-blur" style={{
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
                        backgroundColor: isDark ? 'rgba(20,28,40,0.9)' : 'rgba(255,255,255,0.95)',
                        boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.4)' : '0 24px 64px rgba(0,0,0,0.06)',
                    }}>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                                    background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? ACCENT_CYAN : TEAL_DARK})`,
                                    boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                                }}>
                                    <i className="fa-solid fa-user-circle"></i>
                                </div>
                                <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : TEAL_DARK }}>
                                    {t('volunteer.signUp')}
                                </p>
                                <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <div>
                                    <input
                                        placeholder={t('volunteer.name')}
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
                                        <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                                            {getHelper('name')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5">
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            placeholder={t('volunteer.email')}
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
                                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                                                {getHelper('email')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="tel"
                                            placeholder={t('volunteer.phone')}
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
                                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                                                {getHelper('phone')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <select
                                        value={form.area}
                                        onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                                        onBlur={() => handleBlur('area')}
                                        required
                                        className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        style={{
                                            borderColor: getError('area') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                            minHeight: 52,
                                        }}
                                    >
                                        <option value="">{t('volunteer.areaPlaceholder')}</option>
                                        {volunteerAreas.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.label}
                                            </option>
                                        ))}
                                    </select>
                                    {getError('area') && (
                                        <p className="mt-0.5 text-xs" style={{ color: '#e57373', marginLeft: '1.75rem', marginRight: '1.75rem' }}>
                                            {getHelper('area')}
                                        </p>
                                    )}
                                </div>

                                {/* CV Section */}
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                                        background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? ACCENT_CYAN : TEAL_DARK})`,
                                        boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                                    }}>
                                        <i className="fa-solid fa-file-lines"></i>
                                    </div>
                                    <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : TEAL_DARK }}>
                                        السيرة الذاتية (اختياري)
                                    </p>
                                    <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                </div>

                                <div className="flex" style={{ gap: '1.25rem' }}>
                                    <button type="button"
                                        className={`flex-1 py-1.25 rounded-xl text-sm font-semibold border transition-all ${cvMode === 'file' ? 'text-white' : ''}`}
                                        style={{
                                            background: cvMode === 'file' ? `linear-gradient(135deg, rgba(0,177,106,0.15), rgba(34,211,238,0.08))` : 'transparent',
                                            color: cvMode === 'file' ? (isDark ? '#fff' : TEAL_DARK) : (isDark ? 'rgba(255,255,255,0.7)' : '#64748b'),
                                            borderColor: cvMode === 'file' ? 'rgba(0,177,106,0.4)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                        }}
                                        onClick={() => setCvMode('file')}>
                                        <i className="fa-solid fa-cloud-arrow-up ml-1"></i>
                                        رفع ملف
                                    </button>
                                    <button type="button"
                                        className={`flex-1 py-1.25 rounded-xl text-sm font-semibold border transition-all ${cvMode === 'url' ? 'text-white' : ''}`}
                                        style={{
                                            background: cvMode === 'url' ? `linear-gradient(135deg, rgba(0,177,106,0.15), rgba(34,211,238,0.08))` : 'transparent',
                                            color: cvMode === 'url' ? (isDark ? '#fff' : TEAL_DARK) : (isDark ? 'rgba(255,255,255,0.7)' : '#64748b'),
                                            borderColor: cvMode === 'url' ? 'rgba(0,177,106,0.4)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                        }}
                                        onClick={() => setCvMode('url')}>
                                        <i className="fa-solid fa-link ml-1"></i>
                                        لينك
                                    </button>
                                </div>

                                {cvMode === 'file' ? (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            id="cv-file-input"
                                            type="file"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(e) => handleCvFile(e.target.files?.[0])}
                                            className="hidden"
                                        />
                                        {!form.cvFile ? (
                                            <label htmlFor="cv-file-input"
                                                className="flex flex-col items-center justify-center gap-1 cursor-pointer py-4 px-2 rounded-[14px] border-2 border-dashed transition-all"
                                                style={{
                                                    borderColor: cvError ? '#e57373' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => { e.preventDefault(); handleCvFile(e.dataTransfer.files?.[0]); }}
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{
                                                    background: `linear-gradient(135deg, rgba(0,177,106,0.15), rgba(34,211,238,0.1))`,
                                                    color: isDark ? G_GREEN : TEAL,
                                                }}>
                                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                                </div>
                                                <p className="font-bold text-[0.95rem]" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                                                    اسحب وأفلت الملف هنا، أو اضغط للاختيار
                                                </p>
                                                <p className="text-[0.78rem]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    PDF, DOC, DOCX &bull; حتى {MAX_CV_MB}MB
                                                </p>
                                            </label>
                                        ) : (
                                            <div className="flex items-center gap-1.5 p-2 rounded-xl" style={{
                                                border: `1px solid rgba(0,177,106,0.3)`,
                                                backgroundColor: 'rgba(0,177,106,0.06)',
                                            }}>
                                                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-base shrink-0" style={{
                                                    background: `linear-gradient(135deg, ${G_GREEN}, #059669)`,
                                                }}>
                                                    <i className="fa-solid fa-file-lines"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[0.9rem] truncate" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                                                        {form.cvFile.name}
                                                    </p>
                                                    <p className="text-[0.75rem]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                        {(form.cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button type="button" onClick={clearCv} aria-label="حذف الملف"
                                                    className="p-2 rounded-md transition-colors hover:text-[#e57373]"
                                                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    <i className="fa-solid fa-xmark" style={{ fontSize: 14 }} />
                                                </button>
                                            </div>
                                        )}
                                        {cvError && (
                                            <p className="mt-1 text-xs font-medium" style={{ color: '#e57373', marginLeft: '1.75rem', marginRight: '1.75rem' }}>
                                                {cvError}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={form.cvUrl}
                                            onChange={e => setForm(p => ({ ...p, cvUrl: e.target.value, cvFile: null }))}
                                            onBlur={() => handleBlur('cvUrl')}
                                            className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            style={{
                                                borderColor: getError('cvUrl') ? '#e57373' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                minHeight: 52,
                                            }}
                                        />
                                        {getHelper('cvUrl') !== ' ' && (
                                            <p className="mt-0.5 text-xs font-medium" style={{ color: '#e57373', minHeight: '1.25em' }}>
                                                {getHelper('cvUrl')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[14px] shrink-0" style={{
                                        background: `linear-gradient(135deg, ${isDark ? G_GREEN : TEAL}, ${isDark ? ACCENT_CYAN : TEAL_DARK})`,
                                        boxShadow: `0 3px 10px ${isDark ? 'rgba(0,177,106,0.30)' : 'rgba(26,74,68,0.30)'}`,
                                    }}>
                                        <i className="fa-solid fa-comment-dots"></i>
                                    </div>
                                    <p className="font-bold text-[0.95rem] tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : TEAL_DARK }}>
                                        {t('volunteer.message')}
                                    </p>
                                    <div className="flex-1 h-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                </div>

                                <textarea
                                    placeholder={t('volunteer.message')}
                                    rows={4}
                                    value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-transparent text-inherit focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                    style={{
                                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                    }}
                                />

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitted || submitting}
                                        className="w-full h-[52px] rounded-xl font-bold text-[1.05rem] text-white transition-all"
                                        style={{
                                            background: isDark ? `linear-gradient(135deg, ${G_GREEN} 0%, #059669 100%)` : `linear-gradient(135deg, ${TEAL} 0%, #0d7c65 100%)`,
                                            boxShadow: `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`,
                                            opacity: (submitted || submitting) ? 0.7 : 1,
                                            cursor: (submitted || submitting) ? 'not-allowed' : 'pointer',
                                        }}
                                        onMouseEnter={e => { if (!submitted && !submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${isDark ? 'rgba(0,177,106,0.45)' : 'rgba(26,74,68,0.45)'}`; }}}
                                        onMouseLeave={e => { if (!submitted && !submitting) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 16px ${isDark ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.3)'}`; }}}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                جاري التقديم...
                                            </span>
                                        ) : submitted ? (
                                            <span className="flex items-center justify-center gap-1">
                                                تم التسجيل بنجاح! <i className="fa-solid fa-check"></i>
                                            </span>
                                        ) : t('common.joinNow')}
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

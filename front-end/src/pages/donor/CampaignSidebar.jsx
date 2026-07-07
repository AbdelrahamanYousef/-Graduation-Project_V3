import { formatCurrency, formatNumber, getLanguage } from '../../i18n';

const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";
const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

const AMOUNT_STEP = 50;
const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

function safeNumber(val) {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
}

export default function CampaignSidebar({ campaign, amount, setAmount, isDark, onDonate }) {
    const lang = getLanguage() === 'en';
    const font = lang ? LATIN_FONT : ARABIC_FONT;

    const raised = safeNumber(campaign.raised);
    const goal = safeNumber(campaign.goal);
    const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
    const donorsCount = safeNumber(campaign.donorsCount || campaign.donors);
    const daysLeft = safeNumber(campaign.daysLeft);
    const title = loc(campaign.title, campaign.titleEn);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title, url: window.location.href });
        }
    };

    return (
        <div style={{ position: 'sticky', top: 88, fontFamily: font }}>
            {/* Main Sidebar Card */}
            <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-slate-800 border-slate-700/50 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/60'}`}>

                {/* Card Header — gradient banner */}
                <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #0d4a3a 0%, #0B6B6B 100%)' }}>
                    <p className="font-extrabold text-base text-white mb-0.5" style={{ fontFamily: font }}>
                        {loc('ساهم في هذه الحملة', 'Contribute to This Campaign')}
                    </p>
                    <p className="text-xs text-teal-200/70" style={{ fontFamily: font }}>
                        {loc('كل تبرع يُحدث فارقاً حقيقياً', 'Every donation makes a real difference')}
                    </p>
                </div>

                {/* Progress Section */}
                <div className="px-6 pt-5 pb-4">
                    {/* Amounts row */}
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5" style={{ fontFamily: font }}>
                                {loc('تم جمع', 'Collected')}
                            </p>
                            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none" style={{ fontFamily: LATIN_FONT }}>
                                {formatCurrency(raised)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5" style={{ fontFamily: font }}>
                                {loc('الهدف', 'Goal')}
                            </p>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300" style={{ fontFamily: LATIN_FONT }}>
                                {formatCurrency(goal)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-emerald-50'}`}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    background: 'linear-gradient(90deg, #10b981 0%, #0d9488 100%)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Percentage + label */}
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${isDark ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                            style={{ fontFamily: LATIN_FONT }}>
                            {pct}% {loc('مكتمل', 'funded')}
                        </span>
                        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: font }}>
                            {formatNumber(raised)} {loc('من', 'of')} {formatNumber(goal)}
                        </span>
                    </div>

                    {/* Stat Pills */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        {[
                            { icon: 'fa-chart-simple', value: `${pct}%`, label: loc('مكتمل', 'Funded') },
                            { icon: 'fa-users', value: donorsCount > 0 ? formatNumber(donorsCount) : '—', label: loc('متبرع', 'Donors') },
                            {
                                icon: 'fa-clock',
                                value: daysLeft > 0 ? daysLeft : loc('الحملة مستمرة', 'Campaign Ongoing'),
                                label: daysLeft > 0 ? loc('يوم متبقي', 'Days Left') : '',
                            },
                        ].map((s, i) => (
                            <div key={i} className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center ${isDark ? 'bg-slate-700/40 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <i className={`fa-solid ${s.icon} text-emerald-500 text-xs`} />
                                <span className="font-extrabold text-sm leading-none" style={{ fontFamily: LATIN_FONT }}>{s.value}</span>
                                {s.label && (
                                    <span className="text-[9px] font-semibold opacity-60" style={{ fontFamily: font }}>
                                        {s.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className={`border-t mb-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />

                    {/* Amount selector label */}
                    <p className={`font-bold text-sm mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontFamily: font }}>
                        {loc('اختر مبلغ التبرع', 'Choose Donation Amount')}
                    </p>

                    {/* Quick amount chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {QUICK_AMOUNTS.map(a => {
                            const active = amount === a;
                            return (
                                <button
                                    key={a}
                                    onClick={() => setAmount(a)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 border cursor-pointer ${active
                                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                                            : isDark
                                                ? 'bg-transparent text-slate-300 border-slate-600 hover:border-emerald-600 hover:text-emerald-400'
                                                : 'bg-transparent text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                                        }`}
                                    style={{ fontFamily: LATIN_FONT }}
                                >
                                    {a} {loc('ج.م', 'EGP')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom amount stepper */}
                    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border mb-5 ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <button
                            onClick={() => setAmount(Math.max(AMOUNT_STEP, amount - AMOUNT_STEP))}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'}`}
                        >
                            <i className="fa-solid fa-minus text-[10px]" />
                        </button>

                        <div className="flex flex-col items-center flex-1">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value) || 0;
                                    setAmount(Math.max(0, v));
                                }}
                                className="border-none outline-none bg-transparent font-extrabold text-xl text-emerald-500 text-center w-full"
                                style={{ fontFamily: LATIN_FONT, direction: 'ltr' }}
                            />
                            <span className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: font }}>
                                {loc('جنيه مصري', 'EGP')}
                            </span>
                        </div>

                        <button
                            onClick={() => setAmount(amount + AMOUNT_STEP)}
                            className="w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200 bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                        >
                            <i className="fa-solid fa-plus text-[10px]" />
                        </button>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={onDonate}
                        className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white border-none cursor-pointer flex items-center justify-center gap-2 mb-3 transition-all duration-300 hover:brightness-110 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                            boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                            fontFamily: font
                        }}
                    >
                        <i className="fa-solid fa-heart text-xs" />
                        <span>{loc('تبرع الآن', 'Donate Now')}</span>
                        <span className="px-2 py-0.5 rounded-lg font-bold text-xs bg-white/20 flex items-center gap-1" style={{ fontFamily: LATIN_FONT }}>
                            {formatNumber(amount)}
                            <span className="font-medium opacity-80 text-[9px]">{loc('ج.م', 'EGP')}</span>
                        </span>
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm border cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 ${isDark ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300' : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                        style={{ fontFamily: font }}
                    >
                        <i className="fa-solid fa-share-nodes text-xs" />
                        {loc('مشاركة الحملة', 'Share Campaign')}
                    </button>
                </div>
            </div>

            {/* Trust Badge */}
            <div className={`mt-3 px-4 py-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-shield-halved text-emerald-500 text-xs" />
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: font }}>
                    {loc('تبرعاتك آمنة ومضمونة وتصل مباشرة إلى المستفيدين', 'Your donations are secure and go directly to beneficiaries')}
                </p>
            </div>
        </div>
    );
}

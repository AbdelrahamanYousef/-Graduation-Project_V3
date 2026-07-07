import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber, getLanguage } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import QuickDonateModal from './QuickDonateModal';
import { useInjectStyles } from '../../utils/injectStyles';
import CampaignSidebar from './CampaignSidebar';

const EMERALD = '#10b981';
const DARK_BG = '#0f172a';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

const campaignDetailStyles = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .cd-slide-up { animation: slideUp 0.55s ease-out both; }
    .cd-slide-up-2 { animation: slideUp 0.55s ease-out 0.1s both; }
    .cd-slide-up-3 { animation: slideUp 0.55s ease-out 0.2s both; }
`;

const STATUS_CONFIG = {
    active:    { label: 'نشطة',    labelEn: 'Active',    cls: 'bg-emerald-500/90 text-white', icon: 'fa-circle-play' },
    completed: { label: 'مكتملة',  labelEn: 'Completed', cls: 'bg-blue-500/90 text-white',    icon: 'fa-circle-check' },
    upcoming:  { label: 'قادمة',   labelEn: 'Upcoming',  cls: 'bg-amber-500/90 text-white',   icon: 'fa-calendar' },
    cancelled: { label: 'ملغاة',   labelEn: 'Cancelled', cls: 'bg-rose-500/90 text-white',    icon: 'fa-circle-xmark' },
};

function SectionCard({ children, isDark, className = '' }) {
    return (
        <div className={`rounded-2xl p-7 border ${isDark ? 'bg-slate-800 border-slate-700/50 shadow-lg shadow-black/20' : 'bg-white border-slate-100 shadow-sm shadow-slate-100/60'} ${className}`}>
            {children}
        </div>
    );
}

function SectionHeading({ icon, title, isDark }) {
    return (
        <h2 className={`flex items-center gap-3 font-extrabold text-xl mb-5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
            style={{ fontFamily: ARABIC_FONT }}>
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 shrink-0">
                <i className={`fa-solid ${icon} text-emerald-500 text-sm`} />
            </span>
            {title}
        </h2>
    );
}

export default function CampaignDetail() {
    const { id } = useParams();
    const { isDark } = useTheme();
    const lang = getLanguage() === 'en';

    const [donateCampaign, setDonateCampaign] = useState(null);
    const [donationAmount, setDonationAmount] = useState(200);

    useInjectStyles(campaignDetailStyles, 'campaign-detail-styles');
    const { state } = useAdminData();
    const campaigns = state.campaigns || [];
    const campaign = campaigns.find(c => String(c.id) === String(id));

    /* ── Not Found ─────────────────────────────────── */
    if (!campaign) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16 px-4"
                style={{ backgroundColor: isDark ? DARK_BG : '#f8fafc' }}>
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-magnifying-glass text-3xl text-emerald-500" />
                </div>
                <p className="font-extrabold text-xl mb-2 text-slate-800 dark:text-slate-100" style={{ fontFamily: ARABIC_FONT }}>
                    {loc('لم يتم العثور على الحملة', 'Campaign Not Found')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6" style={{ fontFamily: ARABIC_FONT }}>
                    {loc('عذراً، لم نتمكن من العثور على هذه الحملة.', 'Sorry, we could not find this campaign.')}
                </p>
                <Link to="/campaigns"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all duration-200"
                    style={{ fontFamily: ARABIC_FONT, textDecoration: 'none' }}>
                    <i className={`fa-solid fa-arrow-${lang ? 'left' : 'right'}`} />
                    {loc('العودة إلى الحملات', 'Back to Campaigns')}
                </Link>
            </div>
        );
    }

    /* ── Derived data ────────────────────────────────── */
    const title    = campaign.title || '';
    const desc     = campaign.description || '';
    const category = campaign.category || 'عام';
    const status   = campaign.status || 'active';
    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
    const pct = campaign.goal > 0 ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;

    const GOALS = [
        { icon: 'fa-heart',                title: loc('توفير الإغاثة الفورية',    'Immediate Relief')     },
        { icon: 'fa-hand-holding-dollar',   title: loc('دعم الفئات المحتاجة',      'Support Needy Families')},
        { icon: 'fa-seedling',              title: loc('بناء مستقبل مستدام',       'Sustainable Future')   },
    ];

    /* ── Render ─────────────────────────────────────── */
    return (
        <div style={{ backgroundColor: isDark ? DARK_BG : '#f8fafc', minHeight: '100vh', direction: lang ? 'ltr' : 'rtl' }}>

            {/* ── HERO ─────────────────────────────────── */}
            <div
                className="relative flex items-end"
                style={{
                    height: '46vh', minHeight: 320, maxHeight: 460,
                    paddingBottom: 48,
                    backgroundImage: campaign.imageUrl ? `url(${campaign.imageUrl})` : 'none',
                    backgroundColor: isDark ? '#0d2d22' : '#0d4a3a',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Directional overlay — transparent top, progressively dark toward text */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.78) 100%)' }} />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 cd-slide-up">
                    {/* Back + Category row */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            to="/campaigns"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-200"
                            style={{ textDecoration: 'none' }}
                        >
                            <i className={`fa-solid fa-arrow-${lang ? 'left' : 'right'} text-xs`} />
                        </Link>

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                            <i className={`fa-solid ${statusCfg.icon} text-[9px]`} />
                            {loc(statusCfg.label, statusCfg.labelEn)}
                        </span>

                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md text-emerald-300 border border-white/10">
                            <i className="fa-solid fa-tag text-[9px]" />
                            {category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1
                        className="font-black text-white mb-4 leading-snug"
                        style={{ fontFamily: ARABIC_FONT, fontSize: 'clamp(1.5rem, 4vw, 2.6rem)', maxWidth: 760 }}
                    >
                        {title}
                    </h1>

                    {/* Meta info chips */}
                    <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold"
                            style={{ fontFamily: ARABIC_FONT }}>
                            <i className="fa-solid fa-bullseye text-emerald-400 text-[10px]" />
                            {loc('الهدف:', 'Goal:')}
                            <strong className="font-extrabold">{formatCurrency(campaign.goal)}</strong>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold"
                            style={{ fontFamily: ARABIC_FONT }}>
                            <i className="fa-solid fa-users text-emerald-400 text-[10px]" />
                            <strong className="font-extrabold">{formatNumber(campaign.donorsCount || 0)}</strong>
                            {loc('متبرع', 'Donors')}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold"
                            style={{ fontFamily: ARABIC_FONT }}>
                            <i className="fa-solid fa-chart-simple text-emerald-400 text-[10px]" />
                            <strong className="font-extrabold">{pct}%</strong>
                            {loc('مكتمل', 'Funded')}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ─────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 pb-20" style={{ marginTop: -28, position: 'relative', zIndex: 20 }}>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* ── LEFT: Main Content ─────────────── */}
                    <div className="flex flex-col gap-6 cd-slide-up-2">

                        {/* About Card */}
                        <SectionCard isDark={isDark}>
                            <SectionHeading icon="fa-circle-info" title={loc('عن الحملة', 'About the Campaign')} isDark={isDark} />
                            {desc ? (
                                <p
                                    className={`text-sm md:text-base leading-[2] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                                    style={{ fontFamily: ARABIC_FONT, whiteSpace: 'pre-line' }}
                                >
                                    {desc}
                                </p>
                            ) : (
                                <div className={`flex flex-col items-center justify-center text-center py-6 gap-3 rounded-xl ${isDark ? 'bg-slate-700/20' : 'bg-slate-50'}`}>
                                    <i className="fa-regular fa-file-lines text-2xl text-emerald-400 opacity-60" />
                                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: ARABIC_FONT }}>
                                        {loc('لم يتم إضافة وصف تفصيلي لهذه الحملة بعد، يمكنك التواصل معنا للاستفسار.', 'No detailed description has been added yet. Feel free to contact us for more information.')}
                                    </p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Goals Card */}
                        <SectionCard isDark={isDark}>
                            <SectionHeading icon="fa-flag" title={loc('أهدافنا', 'Our Goals')} isDark={isDark} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {GOALS.map((g, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col items-center text-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                                            <i className={`fa-solid ${g.icon} text-emerald-500 text-lg`} />
                                        </div>
                                        <span
                                            className={`font-bold text-sm leading-snug ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                                            style={{ fontFamily: ARABIC_FONT }}
                                        >
                                            {g.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* Impact Card — rendered only when valid data exists */}
                        {(campaign.raised > 0 || (campaign.donorsCount || 0) > 0) && (
                            <SectionCard isDark={isDark}>
                                <SectionHeading icon="fa-hands-holding-child" title={loc('أثر مساهمتك', 'Your Impact')} isDark={isDark} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        {
                                            icon: 'fa-hand-holding-heart',
                                            value: formatCurrency(campaign.raised),
                                            label: loc('تم جمعها حتى الآن', 'Raised So Far'),
                                        },
                                        {
                                            icon: 'fa-users',
                                            value: formatNumber(campaign.donorsCount || 0),
                                            label: loc('متبرع شارك', 'Donors Joined'),
                                        },
                                        {
                                            icon: 'fa-chart-pie',
                                            value: `${pct}%`,
                                            label: loc('من الهدف مكتمل', 'of Goal Achieved'),
                                        },
                                    ].map((stat, i) => (
                                        <div
                                            key={i}
                                            className={`flex flex-col items-center text-center gap-2 p-5 rounded-xl border ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-100/60'}`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                                                <i className={`fa-solid ${stat.icon} text-emerald-500 text-sm`} />
                                            </div>
                                            <span
                                                className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400"
                                                style={{ fontFamily: "'Inter','Manrope',sans-serif" }}
                                            >
                                                {stat.value}
                                            </span>
                                            <span
                                                className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                                                style={{ fontFamily: ARABIC_FONT }}
                                            >
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* ── RIGHT: Sidebar ─────────────────── */}
                    <div className="cd-slide-up-3">
                        <CampaignSidebar
                            campaign={campaign}
                            amount={donationAmount}
                            setAmount={setDonationAmount}
                            isDark={isDark}
                            onDonate={() => setDonateCampaign(campaign)}
                        />
                    </div>
                </div>
            </div>

            <QuickDonateModal
                project={donateCampaign}
                isOpen={!!donateCampaign}
                onClose={() => setDonateCampaign(null)}
                defaultAmount={donationAmount}
            />
        </div>
    );
}

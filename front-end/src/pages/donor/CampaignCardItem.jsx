import { useTheme } from '../../contexts/ThemeContext';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { useInjectStyles } from '../../utils/injectStyles';
import SafeImage from './SafeImage';

const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

const cfadeUpStyles = `@keyframes cfadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }`;

const STATUS_LABELS = {
    active: 'نشطة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    upcoming: 'قادمة'
};

const STATUS_CONFIG = {
    active: {
        bg: 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white',
        icon: 'fa-circle-play',
        dot: true
    },
    completed: {
        bg: 'bg-blue-500/90 dark:bg-blue-600/90 text-white',
        icon: 'fa-circle-check',
        dot: false
    },
    upcoming: {
        bg: 'bg-amber-500/90 dark:bg-amber-600/90 text-white',
        icon: 'fa-calendar',
        dot: false
    },
    cancelled: {
        bg: 'bg-rose-500/90 dark:bg-rose-600/90 text-white',
        icon: 'fa-circle-xmark',
        dot: false
    }
};

function CampaignCardItem({ campaign, project, index, onClick, onDonate }) {
    const { isDark } = useTheme();
    useInjectStyles(cfadeUpStyles, 'cfade-up');

    const campaignData = campaign || project || {};
    const pct = campaignData.goal > 0 ? Math.min(100, Math.round((campaignData.raised / campaignData.goal) * 100)) : 0;
    const title = campaignData.title || '';
    const desc = campaignData.description || '';
    const category = campaignData.category || 'عام';
    const cleanStatus = String(campaignData.status || '').toLowerCase();
    const statusLabel = STATUS_LABELS[cleanStatus] || 'نشطة';
    const statusInfo = STATUS_CONFIG[cleanStatus] || STATUS_CONFIG.active;

    const daysLeft = campaignData.endDate 
        ? Math.max(0, Math.ceil((new Date(campaignData.endDate) - new Date()) / 86400000))
        : null;

    return (
        <div
            onClick={() => onClick(campaignData)}
            className="group flex flex-col w-full max-w-[320px] mx-auto rounded-[24px] overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm shadow-slate-100/50 hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer relative"
            style={{
                animation: `cfadeUp 0.5s ease both`,
                animationDelay: `${index * 0.06}s`,
            }}
        >
            {/* Image section */}
            <div className="relative h-48 overflow-hidden shrink-0">
                <SafeImage 
                    src={campaignData.imageUrl || campaignData.image} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    style={{ filter: `brightness(${isDark ? 0.85 : 0.95})` }} 
                />
                
                {/* Subtle dark gradient overlay on image bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[2]" />

                {/* Category Badge - Top Right in RTL */}
                <span className="absolute z-10 top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/75 backdrop-blur-md text-emerald-400 dark:text-emerald-300 border border-white/10 dark:border-emerald-500/20 shadow-sm font-arabic">
                    <i className="fa-solid fa-tag text-[9px]" />
                    {category}
                </span>

                {/* Status Badge - Top Left in RTL */}
                <span className={`absolute z-10 top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusInfo.bg} shadow-sm font-arabic`}>
                    {statusInfo.dot && (
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                    )}
                    <i className={`fa-solid ${statusInfo.icon} text-[9px]`} />
                    {statusLabel}
                </span>

                {/* View Details Overlay on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center bg-teal-950/40 backdrop-blur-[2px]">
                    <span className="px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all duration-300 group-hover:scale-105 shadow-sm font-arabic">
                        <i className="fa-solid fa-eye text-[10px]" />
                        {loc('التفاصيل', 'Details')}
                    </span>
                </div>
            </div>

            {/* Content section */}
            <div className="flex-1 flex flex-col p-5 pb-6 direction-rtl text-right">
                {/* Title */}
                <h3 
                    className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-arabic leading-snug mb-2 line-clamp-2 h-11"
                    style={{ fontFamily: ARABIC_FONT }}
                >
                    {title}
                </h3>

                {/* Description */}
                <p 
                    className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-arabic leading-relaxed mb-4 line-clamp-2 h-10"
                    style={{ fontFamily: ARABIC_FONT }}
                >
                    {desc}
                </p>

                <div className="mt-auto">
                    {/* Raised & Target Amounts */}
                    <div className="flex justify-between items-baseline mb-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-arabic">{loc('تم جمع', 'Collected')}</span>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-arabic">
                                {formatCurrency(campaignData.raised)}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-arabic">{loc('الهدف', 'Goal')}</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-arabic">
                                {formatCurrency(campaignData.goal)}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar & Percentage Badge */}
                    <div className="mb-3.5">
                        <div className="flex justify-between items-center mb-1.5 text-[11px]">
                            <span className="font-bold text-slate-400 dark:text-slate-500 font-arabic">{loc('نسبة الاكتمال', 'Completion')}</span>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-md border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-latin" style={{ fontFamily: LATIN_FONT }}>
                                {pct}%
                            </span>
                        </div>
                        <div className="relative w-full h-3 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }} 
                            />
                        </div>
                    </div>

                    {/* Donor Count & Days Left */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3 mb-4 font-arabic">
                        <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-users text-emerald-500 dark:text-emerald-400 text-xs" />
                            <span className="font-bold">
                                {formatNumber(campaignData.donorsCount || 0)} {loc('متبرع', 'donors')}
                            </span>
                        </div>
                        {daysLeft !== null && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-solid fa-clock text-emerald-500 dark:text-emerald-400 text-xs" />
                                <span className="font-bold">
                                    {daysLeft} {loc('يوم متبقي', 'days left')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Button / Completed State */}
                    {cleanStatus === 'completed' ? (
                        <div className="w-full py-2.5 px-4 rounded-xl font-arabic font-bold text-xs bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 text-center border border-emerald-100 dark:border-emerald-900/30 select-none flex items-center justify-center gap-1.5">
                            <i className="fa-solid fa-circle-check text-emerald-500 dark:text-emerald-400" />
                            <span>{loc('تم اكتمال الحملة بنجاح', 'Campaign Completed')}</span>
                        </div>
                    ) : cleanStatus === 'cancelled' ? (
                        <div className="w-full py-2.5 px-4 rounded-xl font-arabic font-bold text-xs bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 text-center border border-rose-100 dark:border-rose-900/30 select-none flex items-center justify-center gap-1.5">
                            <i className="fa-solid fa-circle-xmark text-rose-500" />
                            <span>{loc('تم إلغاء الحملة', 'Campaign Cancelled')}</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDonate(campaignData); }}
                            className="w-full py-2.5 px-4 rounded-xl font-arabic font-bold text-sm bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/20 dark:hover:shadow-emerald-900/30 transition-all duration-300 active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-heart" />
                            <span>{loc('تبرع الآن', 'Donate Now')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CampaignCardItem;

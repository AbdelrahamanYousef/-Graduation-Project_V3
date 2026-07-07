import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getLanguage, formatNumber } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import CampaignCardItem from './CampaignCardItem';
import QuickDonateModal from './QuickDonateModal';
import { HeroBanner } from '../../components/common';
import { paths } from '../../constants/paths';
import { Megaphone, HeartHandshake, Flame, Globe } from 'lucide-react';
import { getTransparencyStats } from '../../api/transparency.api';

const EMERALD = '#10b981';
const DARK_BG = '#0f172a';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

function Campaigns() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { state } = useAdminData();
    const campaigns = useMemo(() => state.campaigns || [], [state.campaigns]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [donateCampaign, setDonateCampaign] = useState(null);
    const [beneficiaryCount, setBeneficiaryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function fetchStats() {
            try {
                const transData = await getTransparencyStats();
                if (isMounted && transData?.financialData?.beneficiaries !== undefined) {
                    setBeneficiaryCount(transData.financialData.beneficiaries);
                }
            } catch (err) {
                console.warn('Could not fetch transparency stats', err);
            }
        }
        fetchStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const activeCampaignsCount = useMemo(() => {
        return campaigns.filter(c => c.status === 'active').length;
    }, [campaigns]);

    const totalBeneficiaries = beneficiaryCount || state.beneficiaries?.length || 0;

    const governoratesCount = useMemo(() => {
        const bLocations = (state.beneficiaries || []).map(b => b.location || b.governorate);
        const pLocations = (state.projects || []).map(p => p.location || p.governorate);
        const allLocations = [...bLocations, [...pLocations]]
            .flat()
            .filter(Boolean)
            .map(loc => loc.trim());
        const unique = new Set(allLocations);
        return unique.size;
    }, [state.beneficiaries, state.projects]);

    const filteredCampaigns = useMemo(() => {
        return campaigns
            .filter((c) => activeFilter === 'all' || c.status === activeFilter)
            .sort((a, b) => {
                if (sortBy === 'mostFunded') {
                    const aPct = a.goal > 0 ? a.raised / a.goal : 0;
                    const bPct = b.goal > 0 ? b.raised / b.goal : 0;
                    return bPct - aPct;
                }
                if (sortBy === 'endingSoon') {
                    const aDays = a.endDate ? new Date(a.endDate).getTime() : Infinity;
                    const bDays = b.endDate ? new Date(b.endDate).getTime() : Infinity;
                    return aDays - bDays;
                }
                // default newest
                const aTime = new Date(a.createdAt || a.startDate || 0).getTime();
                const bTime = new Date(b.createdAt || b.startDate || 0).getTime();
                return bTime - aTime;
            });
    }, [campaigns, activeFilter, sortBy]);

    return (
        <div className="pb-12 min-h-screen transition-colors duration-300" style={{ backgroundColor: isDark ? DARK_BG : '#f8fafc' }}>
            <HeroBanner 
                themeVariant="campaigns"
                badgeText="حملاتنا الإغاثية والموسمية"
                headline="ساهم في حملاتنا العاجلة لتوفير الدعم الفوري للفئات الأكثر احتياجاً"
                highlightedWord="العاجلة"
                subtext="تبرعك الآن يصنع فارقاً حقيقياً في أوقات الأزمات والمواسم الخيرية. كن جزءاً من الاستجابة السريعة."
                primaryCtaText="تبرع الآن"
                primaryCtaLink={paths.donor.donate}
                secondaryCtaText="استكشف الحملات"
                secondaryCtaLink="#campaigns-list"
                stats={[
                    { number: activeCampaignsCount > 0 ? `${activeCampaignsCount}+` : "0", label: "حملة نشطة" },
                    { number: totalBeneficiaries > 0 ? `${formatNumber(totalBeneficiaries)}+` : "0", label: "مستفيد" },
                    { number: governoratesCount > 0 ? `${governoratesCount}+` : "0", label: "محافظة" }
                ]}
                floatingIcons={[
                    <Megaphone key="megaphone" size={24} />,
                    <HeartHandshake key="heart" size={24} />,
                    <Flame key="flame" size={24} />,
                    <Globe key="globe" size={24} />
                ]}
            />

            {/* Filter and Sort Bar */}
            <div id="campaigns-list" className="relative z-10 -mt-8 mb-6 max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/95 dark:bg-slate-800/90 backdrop-blur-md py-4 px-6 rounded-[24px] border border-slate-100 dark:border-slate-700/50 shadow-md shadow-slate-100/40 dark:shadow-none">
                    {/* Categories filters */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none" style={{ direction: 'rtl' }}>
                        {[
                            { id: 'all', name: loc('الكل', 'All') },
                            { id: 'active', name: loc('نشطة', 'Active') },
                            { id: 'upcoming', name: loc('قادمة', 'Upcoming') },
                            { id: 'completed', name: loc('مكتملة', 'Completed') }
                        ].map(f => {
                            const active = activeFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`px-5 py-2 rounded-full font-arabic font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-300 border-none cursor-pointer ${
                                        active 
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 dark:shadow-emerald-500/10' 
                                            : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    {f.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sorting dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-700/50 pt-3 md:pt-0">
                        <span className="font-arabic font-bold text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {loc('ترتيب حسب:', 'Sort by:')}
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-arabic font-bold text-xs md:text-sm outline-none cursor-pointer transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', 
                                backgroundPosition: getLanguage() === 'en' ? 'right 12px center' : 'left 12px center',
                                backgroundSize: '16px',
                                paddingInlineEnd: '36px',
                                paddingInlineStart: '16px',
                                appearance: 'none',
                                WebkitAppearance: 'none'
                            }}
                        >
                            <option value="newest">{loc('الأحدث', 'Newest')}</option>
                            <option value="mostFunded">{loc('الأكثر تمويلاً', 'Most Funded')}</option>
                            <option value="endingSoon">{loc('ينتهي قريباً', 'Ending Soon')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid display of campaigns */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {/* Section Title */}
                <div className="text-center mb-8">
                    <h2 
                        className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-arabic mb-2"
                        style={{ fontFamily: ARABIC_FONT }}
                    >
                        {loc('الحملات المتاحة', 'Available Campaigns')}
                    </h2>
                    <p 
                        className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-arabic max-w-lg mx-auto leading-relaxed"
                        style={{ fontFamily: ARABIC_FONT }}
                    >
                        {loc('شارك في دعم مشاريعنا الخيرية المستمرة وساهم بصدقتك لتغيير حياة المحتاجين للأفضل', 'Participate in supporting our ongoing charity projects and contribute with your donation to change lives for the better')}
                    </p>
                </div>

                {filteredCampaigns.length > 0 ? (
                    <div 
                        className={
                            filteredCampaigns.length === 1 
                                ? "grid grid-cols-1 max-w-[320px] mx-auto gap-8 justify-center justify-items-center w-full" 
                                : filteredCampaigns.length === 2 
                                    ? "grid grid-cols-1 md:grid-cols-2 max-w-[680px] mx-auto gap-8 justify-center justify-items-center w-full" 
                                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-8 justify-center justify-items-center w-full"
                        }
                    >
                        {filteredCampaigns.map((c, i) => (
                            <CampaignCardItem
                                key={c.id}
                                campaign={c}
                                index={i}
                                onClick={() => navigate(`/campaigns/${c.id}`)}
                                onDonate={() => setDonateCampaign(c)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                            <i className="fa-solid fa-folder-open text-3xl text-emerald-500" />
                        </div>
                        <h3 
                            className="font-extrabold text-lg mb-2 text-slate-800 dark:text-slate-100"
                            style={{ fontFamily: ARABIC_FONT }}
                        >
                            {loc('لا توجد حملات', 'No Campaigns Found')}
                        </h3>
                        <p 
                            className="text-slate-500 dark:text-slate-400"
                            style={{ fontFamily: ARABIC_FONT }}
                        >
                            {loc('عذراً، لم نتمكن من العثور على أي حملات تطابق بحثك حالياً.', 'Sorry, we couldn\'t find any campaigns matching your search right now.')}
                        </p>
                    </div>
                )}
            </div>

            <QuickDonateModal
                project={donateCampaign}
                isOpen={!!donateCampaign}
                onClose={() => setDonateCampaign(null)}
            />
        </div>
    );
}

export default Campaigns;

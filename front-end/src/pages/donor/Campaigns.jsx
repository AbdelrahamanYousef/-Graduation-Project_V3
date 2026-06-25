import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getLanguage } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import CampaignCardItem from './CampaignCardItem';
import QuickDonateModal from './QuickDonateModal';

const EMERALD = '#10b981';
const DARK_BG = '#0f172a';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

function Campaigns() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { state } = useAdminData();
    const campaigns = state.campaigns || [];

    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [donateCampaign, setDonateCampaign] = useState(null);

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
        <div style={{ paddingBottom: 24, backgroundColor: isDark ? DARK_BG : '#f8fafc', minHeight: '100vh' }}>
            <div style={{
                paddingTop: 100, paddingBottom: 100, textAlign: 'center', position: 'relative', overflow: 'hidden', color: '#fff',
                background: isDark
                    ? `linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(15,23,42,1) 100%)`
                    : `linear-gradient(135deg, ${EMERALD} 0%, #059669 100%)`
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.05 : 0.1, backgroundImage: `radial-gradient(circle at 20px 20px, #ffffff 2px, transparent 0)`, backgroundSize: '40px 40px' }} />
                <div className="container relative z-10 mx-auto px-4">
                    <span style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: 999,
                        backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                        fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, fontFamily: ARABIC_FONT,
                        color: isDark ? EMERALD : '#fff', border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.3)'}`
                    }}>
                        {loc('شارك في التغيير', 'Join the Change')}
                    </span>
                    <h1 style={{ fontFamily: ARABIC_FONT, fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 16, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {loc('حملاتنا الخيرية', 'Our Charity Campaigns')}
                    </h1>
                    <p style={{ fontFamily: ARABIC_FONT, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
                        {loc('اكتشف الحملات المستقلة التي نطلقها لتلبية الاحتياجات العاجلة والموسمية.', 'Discover our independent campaigns launched to meet urgent and seasonal needs.')}
                    </p>
                </div>

                <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60, fill: isDark ? DARK_BG : '#f8fafc' }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,120.22,192.39,109.1,236.4,101.27,279.16,81.18,321.39,56.44Z" />
                    </svg>
                </div>
            </div>

            <div className="container mx-auto px-4" style={{ marginTop: -20, position: 'relative', zIndex: 10, marginBottom: 32 }}>
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    padding: '12px 20px', borderRadius: '20px',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)'}`
                }}>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }} className="hide-scroll">
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
                                    style={{
                                        padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                                        fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: active ? EMERALD : 'transparent',
                                        color: active ? '#fff' : (isDark ? DARK_TEXT : '#475569'),
                                        boxShadow: active ? `0 4px 12px rgba(16,185,129,0.3)` : 'none',
                                    }}
                                >
                                    {f.name}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: ARABIC_FONT, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                            {loc('ترتيب حسب:', 'Sort by:')}
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '8px 16px', paddingInlineEnd: 32, borderRadius: '12px',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : '#f8fafc',
                                color: isDark ? DARK_TEXT : '#334155',
                                fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.85rem',
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: getLanguage() === 'en' ? 'right 10px center' : 'left 10px center',
                                backgroundSize: '16px'
                            }}
                        >
                            <option value="newest">{loc('الأحدث', 'Newest')}</option>
                            <option value="mostFunded">{loc('الأكثر تمويلاً', 'Most Funded')}</option>
                            <option value="endingSoon">{loc('ينتهي قريباً', 'Ending Soon')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4" style={{ paddingBottom: 60 }}>
                {filteredCampaigns.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 24, justifyItems: 'center'
                    }}>
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
                        <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-folder-open" style={{ fontSize: '2rem', color: EMERALD }} />
                        </div>
                        <h3 style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.2rem', marginBottom: 8, color: isDark ? DARK_HEAD : '#1e293b' }}>
                            {loc('لا توجد حملات', 'No Campaigns Found')}
                        </h3>
                        <p style={{ fontFamily: ARABIC_FONT, color: isDark ? '#94a3b8' : '#64748b' }}>
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

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber, getLanguage } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { paths } from '../../constants/paths';
import { useInjectStyles } from '../../utils/injectStyles';
import CampaignSidebar from './CampaignSidebar';

const G_GREEN = '#00b16a';
const EMERALD = '#10b981';
const TEAL = '#1a4a44';
const DARK_BG = '#0f172a';
const DARK_CARD = '#1e293b';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

const campaignDetailStyles = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
`;

export default function CampaignDetail() {
    const { id } = useParams();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const lang = getLanguage() === 'en';

    const [donationAmount, setDonationAmount] = useState(200);

    useInjectStyles(campaignDetailStyles, 'campaign-detail-styles');
    const { state } = useAdminData();
    const campaigns = state.campaigns || [];

    const campaign = campaigns.find(c => String(c.id) === String(id));

    if (!campaign) {
        return (
            <div className="text-center py-12 min-h-[60vh] flex flex-col items-center justify-center" style={{ backgroundColor: isDark ? DARK_BG : '#f8fafc' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px', backgroundColor: 'rgba(0,177,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-search" style={{ fontSize: '2rem', color: G_GREEN }} />
                </div>
                <p style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.3rem', marginBottom: 8, color: isDark ? DARK_HEAD : '#2d3436' }}>
                    {loc('لم يتم العثور على الحملة', 'Campaign Not Found')}
                </p>
                <Link to="/campaigns" style={{
                    color: G_GREEN, textDecoration: 'none', fontWeight: 700, fontFamily: ARABIC_FONT,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                    <i className="fa-solid fa-arrow-right" />
                    {loc('العودة إلى الحملات', 'Back to Campaigns')}
                </Link>
            </div>
        );
    }

    const title = campaign.title;
    const desc = campaign.description;
    const category = campaign.category || 'عام';

    const pct = campaign.goal > 0 ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;

    return (
        <div style={{ backgroundColor: isDark ? DARK_BG : '#fafcfb', minHeight: '100vh', direction: lang ? 'ltr' : 'rtl' }}>
            {/* Hero Section */}
            <div style={{
                position: 'relative', height: '55vh', minHeight: 450, maxHeight: 650,
                display: 'flex', alignItems: 'flex-end', paddingBottom: 60,
                backgroundImage: `url(${campaign.imageUrl})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }} />
                <div className="container mx-auto px-4 relative z-10" style={{ animation: 'slideUp 0.6s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Link to="/campaigns" style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 40, height: 40, borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            color: '#fff', textDecoration: 'none', transition: 'all 0.2s',
                        }}>
                            <i className={`fa-solid fa-arrow-${lang ? 'left' : 'right'}`} />
                        </Link>
                        <span style={{
                            backgroundColor: EMERALD, color: '#fff',
                            padding: '4px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                            fontFamily: ARABIC_FONT, letterSpacing: '0.5px'
                        }}>
                            {category}
                        </span>
                    </div>

                    <h1 style={{ fontFamily: ARABIC_FONT, fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', color: '#fff', marginBottom: 16, lineHeight: 1.3, maxWidth: 800 }}>
                        {title}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px', alignItems: 'center', color: 'rgba(255,255,255,0.85)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-bullseye" style={{ color: EMERALD, fontSize: '1.1rem' }} />
                            <span style={{ fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.95rem' }}>
                                {loc('الهدف:', 'Goal:')} <strong style={{ color: '#fff' }}>{formatCurrency(campaign.goal)}</strong>
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-users" style={{ color: EMERALD, fontSize: '1.1rem' }} />
                            <span style={{ fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.95rem' }}>
                                <strong style={{ color: '#fff' }}>{formatNumber(campaign.donorsCount || 0)}</strong> {loc('متبرع', 'Donors')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4" style={{ marginTop: -30, position: 'relative', zIndex: 20, paddingBottom: 60 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }} className="lg:grid-cols-[1fr_340px] grid-cols-1">
                    
                    {/* Left Column (Details) */}
                    <div style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>
                        <div style={{
                            backgroundColor: isDark ? DARK_CARD : '#fff', borderRadius: '24px', padding: '32px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#eef2f7'}`,
                            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.03)',
                            marginBottom: 24,
                        }}>
                            <h2 style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.4rem', color: isDark ? DARK_HEAD : '#1a1a1a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 4, height: 24, backgroundColor: EMERALD, borderRadius: 2 }} />
                                {loc('عن الحملة', 'About the Campaign')}
                            </h2>
                            <div style={{
                                fontFamily: ARABIC_FONT, fontSize: '1.05rem', lineHeight: 1.8,
                                color: isDark ? DARK_TEXT : '#4a5568', whiteSpace: 'pre-line',
                            }}>
                                {desc}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: isDark ? DARK_CARD : '#fff', borderRadius: '24px', padding: '32px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#eef2f7'}`,
                            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.03)',
                        }}>
                            <h2 style={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.4rem', color: isDark ? DARK_HEAD : '#1a1a1a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 4, height: 24, backgroundColor: EMERALD, borderRadius: 2 }} />
                                {loc('أهدافنا', 'Our Goals')}
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                {[
                                    { icon: 'fa-heart', title: loc('توفير الإغاثة', 'Provide Relief') },
                                    { icon: 'fa-hand-holding-dollar', title: loc('دعم المحتاجين', 'Support Needy') },
                                    { icon: 'fa-seedling', title: loc('تنمية مستدامة', 'Sustainable Growth') }
                                ].map((g, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                                        borderRadius: '16px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`
                                    }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: '12px',
                                            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                                            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                                        }}>
                                            <i className={`fa-solid ${g.icon}`} style={{ fontSize: '1.2rem', color: EMERALD }} />
                                        </div>
                                        <span style={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '1.05rem', color: isDark ? DARK_TEXT : '#334155' }}>
                                            {g.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
                        <CampaignSidebar
                            campaign={campaign}
                            amount={donationAmount}
                            setAmount={setDonationAmount}
                            isDark={isDark}
                            onDonate={() => navigate(`${paths.donor.donate}?project=${campaign.id}&amount=${donationAmount}`)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

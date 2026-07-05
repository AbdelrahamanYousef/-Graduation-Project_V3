import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { categoryColors } from '../../data/mockData';
import { useAdminData } from '../../contexts/AdminDataContext';
import { paths } from '../../constants/paths';

import { useInjectStyles } from '../../utils/injectStyles';
const GREEN = '#00b16a';
const GREEN_DK = '#009659';

const donationCategoriesStyles = `
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

function DonationCategoriesSection() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const gridRef = useRef(null);

    const { state } = useAdminData();
    const donationCategories = state.donationCategories || [];

    useEffect(() => {
        setAnimKey(prev => prev + 1);
    }, [tabIndex]);
    useInjectStyles(donationCategoriesStyles, 'donation-categories-styles');

    const currentCategory = donationCategories[tabIndex] || donationCategories[0];
    const items = currentCategory?.items || [];

    const handleDonate = (item) => {
        navigate(paths.getProjectDetails(currentCategory.id, item.id));
    };

    return (
        <>
            <div className="relative overflow-hidden py-10" style={{
                background: isDark
                    ? 'linear-gradient(180deg, #04100e 0%, #0a1f1c 50%, #04100e 100%)'
                    : 'linear-gradient(180deg, #f8fcf9 0%, #ffffff 30%, #f0faf5 70%, #e8f5ef 100%)',
            }}>
                {/* Decorative spheres */}
                <div className="absolute top-[-100px] right-[15%] w-[350px] h-[350px] rounded-full pointer-events-none" style={{
                    background: `radial-gradient(circle, rgba(0,177,106,0.07) 0%, transparent 70%)`,
                    filter: 'blur(70px)',
                }} />
                <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none" style={{
                    background: `radial-gradient(circle, rgba(0,177,106,0.05) 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                }} />
                <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] rounded-full pointer-events-none" style={{
                    background: `radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)`,
                    filter: 'blur(50px)',
                }} />

                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="text-center mb-3 md:mb-5">
                        <p className="text-[1.6rem] leading-none mb-2 tracking-widest select-none" style={{ color: 'rgba(0,177,106,0.25)' }}>
                            ✦ ◈ ✦
                        </p>
                        <h2 className="font-black text-[1.6rem] sm:text-[2rem] md:text-[2.4rem] mb-0.5 tracking-wide" style={{
                            color: isDark ? '#f1f5f9' : '#0d2b2a',
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                        }}>
                            تبرع الأن
                        </h2>
                        <p className="text-[0.85rem] md:text-[1rem] max-w-[480px] mx-auto leading-relaxed" style={{
                            color: isDark ? '#94a3b8' : '#5a7a78',
                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                        }}>
                            اختر مشروع الخير الذي تريد المساهمة فيه وكن جزءًا من صناعة الأمل
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center mb-2.5 md:mb-5" style={{gap:'0.6rem'}}>
                        {donationCategories.map((cat, idx) => (
                            <button key={cat.id}
                                onClick={() => setTabIndex(idx)}
                                className="flex items-center gap-0.5 px-[9px] h-8 rounded-full text-[0.68rem] font-semibold whitespace-nowrap border transition-all"
                                style={{
                                    color: tabIndex === idx ? '#fff' : (isDark ? '#94a3b8' : '#5a6a6a'),
                                    backgroundColor: tabIndex === idx ? GREEN : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,177,106,0.04)'),
                                    borderColor: tabIndex === idx ? GREEN : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.08)'),
                                    boxShadow: tabIndex === idx ? `0 4px 16px rgba(0,177,106,0.35)` : 'none',
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                }}
                                onMouseEnter={e => {
                                    if (tabIndex !== idx) { e.currentTarget.style.backgroundColor = isDark ? 'rgba(0,177,106,0.12)' : 'rgba(0,177,106,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,177,106,0.3)'; }
                                }}
                                onMouseLeave={e => {
                                    if (tabIndex !== idx) { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,177,106,0.04)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.08)'; }
                                }}
                            >
                                <i className={cat.icon} style={{ fontSize: '0.72rem' }} />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid */}
                    {currentCategory && (
                        <div key={animKey} style={{ animation: 'scaleIn 0.4s ease both' }}>
                            <div ref={gridRef} className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-5 md:gap-[22px] lg:gap-6">
                                {items.slice(0, 6).map((item, idx) => (
                                    <div key={item.id} onClick={() => handleDonate(item)}
                                        className="rounded-xl overflow-hidden relative cursor-pointer transition-all"
                                        style={{
                                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,177,106,0.12)'}`,
                                            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,177,106,0.06)',
                                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            animation: `fadeUp 0.5s ease both ${idx * 0.06}s`,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                    >
                                        {/* Background */}
                                        <div className="h-[110px] sm:h-[130px] relative overflow-hidden transition-transform duration-[0.6s]">
                                            {(item.image || item.imageUrl) ? (
                                                <img 
                                                    src={item.image || item.imageUrl || '/vite.svg'} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/vite.svg'; }}
                                                />
                                            ) : (
                                                <div 
                                                    className="w-full h-full flex items-center justify-center"
                                                    style={{
                                                        background: (() => {
                                                            const colors = categoryColors[currentCategory.id] || ['#e8f5e9', '#4caf50'];
                                                            return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
                                                        })(),
                                                    }}
                                                >
                                                    <i className={currentCategory.icon} style={{
                                                        fontSize: '2.4rem',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        textShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="text-center" style={{ direction: 'rtl', padding: '1.2rem' }}>
                                            <p className="font-bold text-[0.82rem] md:text-[0.88rem] leading-tight min-h-[36px] md:min-h-10 overflow-hidden line-clamp-2" style={{
                                                marginBottom: '0.8rem',
                                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                color: isDark ? '#e2e8f0' : '#2d3436',
                                            }}>
                                                {item.title}
                                            </p>

                                            {/* Price row */}
                                            <div className="flex items-center justify-center gap-0.5 mb-1.5 rounded-[10px] px-1" style={{
                                                backgroundColor: isDark ? 'rgba(0,177,106,0.08)' : 'rgba(0,177,106,0.06)',
                                                paddingTop: '0.7rem',
                                                paddingBottom: '0.7rem',
                                            }}>
                                                <i className="fa-solid fa-coins" style={{ fontSize: '0.78rem', color: GREEN }} />
                                                <span className="font-extrabold text-[0.95rem] md:text-[1.05rem] leading-none" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: GREEN }}>
                                                    {item.price.toLocaleString()}
                                                </span>
                                                <span className="text-[0.65rem] font-semibold leading-none" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif", color: isDark ? '#94a3b8' : '#889a98' }}>
                                                    ج.م
                                                </span>
                                            </div>

                                            {/* Donate button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDonate(item); }}
                                                className="w-full rounded-xl font-bold text-[0.78rem] text-white relative overflow-hidden"
                                                style={{
                                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                                    backgroundColor: GREEN,
                                                    boxShadow: `0 3px 12px rgba(0,177,106,0.25)`,
                                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                    paddingTop: '0.7rem',
                                                    paddingBottom: '0.7rem',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = GREEN_DK; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,177,106,0.4)`; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 3px 12px rgba(0,177,106,0.25)`; }}
                                            >
                                                <span className="flex items-center justify-center gap-1">
                                                    <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: '0.72rem' }} />
                                                    تبرع
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View All */}
                            <div className="text-center mt-3.5 md:mt-5">
                                    <button
                                        onClick={() => navigate('/donate')}
                                        className="inline-flex items-center gap-1 px-3 md:px-5 rounded-full font-bold text-[0.85rem] md:text-[0.95rem] border-2 transition-all"
                                        style={{
                                            borderColor: GREEN,
                                            color: GREEN,
                                            fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                            backgroundColor: isDark ? 'rgba(0,177,106,0.04)' : 'transparent',
                                            paddingTop: '0.9rem',
                                            paddingBottom: '0.9rem',
                                        }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,177,106,0.3)`; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(0,177,106,0.04)' : 'transparent'; e.currentTarget.style.color = GREEN; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                                >
                                    عرض جميع المشاريع
                                    <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.85rem' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default DonationCategoriesSection;

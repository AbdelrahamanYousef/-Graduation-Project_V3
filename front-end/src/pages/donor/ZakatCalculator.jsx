import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import useGoldPrice from '../../hooks/useGoldPrice';
import useZakatCalculation from '../../hooks/useZakatCalculation';
import CashCalculator from '../../components/zakat/CashCalculator';
import GoldSilverCalculator from '../../components/zakat/GoldSilverCalculator';
import CropsCalculator from '../../components/zakat/CropsCalculator';
import ZakatSummaryCard from '../../components/zakat/ZakatSummaryCard';
import { useInjectStyles } from '../../utils/injectStyles';
import ZakatInfoModal from './ZakatInfoModal';
import { HeroBanner } from '../../components/common';
import { Calculator, Coins, Scale, Wallet } from 'lucide-react';

const DARK_BG = '#0f172a';
const DARK_TEXT = '#e2e8f0';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";

const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);

const zakatStyles = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes bounceXEn { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    @keyframes bounceXAr { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
`;

export default function ZakatCalculator() {
    const { isDark } = useTheme();
    useInjectStyles(zakatStyles, 'zakat-styles');
    const dk = isDark;
    const font = ARABIC_FONT;
    const dir = 'rtl';
    const lang = getLanguage();
    const bounceAnim = lang === 'en' ? 'bounceXEn' : 'bounceXAr';

    const G_GREEN = '#00b16a';
    const G_GREEN_DK = '#009659';
    const TEAL = '#1a4a44';

    const { prices, loading, error, isLive, lastUpdated, source, refetch, nisab } = useGoldPrice();

    const gold24Price = prices?.gold24k ? formatCurrency(prices.gold24k) : '...';
    const gold21Price = prices?.gold21k ? formatCurrency(prices.gold21k) : '...';
    const silverPrice = prices?.silver ? formatCurrency(prices.silver) : '...';

    const {
        cash, setCash,
        goldEntries, addGoldEntry, removeGoldEntry, updateGoldEntry,
        silverGrams, setSilverGrams,
        cropWeight, setCropWeight,
        irrigationMode, setIrrigationMode,
        expandedSections, toggleSection,
        zakatDue,
    } = useZakatCalculation({ prices, nisab });

    const [showInfoModal, setShowInfoModal] = useState(false);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center" style={{ backgroundColor: dk ? DARK_BG : '#f5f7f9' }}>
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: G_GREEN, marginBottom: 12 }} />
                    <p style={{ fontFamily: font, color: dk ? DARK_TEXT : '#555' }}>
                        {loc('جاري تحميل الأسعار...', 'Loading prices...')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="pb-10 min-h-screen" style={{ backgroundColor: dk ? DARK_BG : '#f5f7f9', direction: dir }}>
                <HeroBanner 
                    themeVariant="zakat"
                    badgeText="ركن الإسلام الثالث"
                    headline="حاسبة الزكاة المتقدمة لتطهير مالك"
                    highlightedWord="تطهير"
                    subtext="﴿ إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ ﴾ - سورة التوبة: 60"
                    primaryCtaText="ابدأ الحساب"
                    primaryCtaLink="#calculator"
                    secondaryCtaText="أحكام الزكاة"
                    secondaryCtaLink="#rules"
                    stats={[
                        { number: gold24Price, label: 'ذهب عيار 24' },
                        { number: gold21Price, label: 'ذهب عيار 21' },
                        { number: silverPrice, label: 'فضة' }
                    ]}
                    floatingIcons={[
                        <Calculator key="calc" size={24} />,
                        <Coins key="coins" size={24} />,
                        <Scale key="scale" size={24} />,
                        <Wallet key="wallet" size={24} />
                    ]}
                />

                <div id="calculator" className="max-w-[992px] mx-auto px-4 -mt-3.5 relative z-10">
                    <div className="flex flex-col md:flex-row gap-3.5 items-start">
                        <div className="flex-[1_1_auto] md:flex-[0_0_calc(33.333%-14px)] w-full md:w-[calc(33.333%-14px)] order-2 md:order-1">
                            <div className="sticky top-[85px]">
                                <ZakatSummaryCard
                                    zakatDue={zakatDue} nisab={nisab} prices={prices}
                                    isLive={isLive} lastUpdated={lastUpdated} source={source}
                                    onRefresh={refetch} showInfoModal={() => setShowInfoModal(true)}
                                />
                            </div>
                        </div>
                        <div className="flex-[1_1_auto] md:flex-[0_0_calc(66.666%-14px)] w-full md:w-[calc(66.666%-14px)] order-1 md:order-2">
                            <div className="flex flex-col gap-2.5">
                                <div id="rules" onClick={() => setShowInfoModal(true)}
                                    className="flex items-center gap-2 px-3 rounded-[16px] cursor-pointer transition-all"
                                    style={{
                                        paddingTop: '1.8rem', paddingBottom: '1.8rem',
                                        background: dk ? `linear-gradient(135deg, rgba(26,74,68,0.25) 0%, rgba(0,177,106,0.15) 100%)`
                                            : `linear-gradient(135deg, rgba(26,74,68,0.08) 0%, rgba(0,177,106,0.06) 100%)`,
                                        border: `1.5px solid ${dk ? 'rgba(0,177,106,0.25)' : 'rgba(26,74,68,0.18)'}`,
                                        animation: 'fadeInUp 0.5s ease 0.2s both',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = G_GREEN; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                >
                                    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" style={{
                                        background: `linear-gradient(135deg, ${TEAL} 0%, ${G_GREEN} 100%)`,
                                        boxShadow: `0 4px 12px rgba(0,177,106,0.3)`,
                                    }}>
                                        <i className="fa-solid fa-book-quran" style={{ fontSize: '1.1rem', color: '#fff' }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-extrabold text-[0.92rem]" style={{ fontFamily: font, color: dk ? G_GREEN : TEAL }}>
                                            {loc('أحكام الزكاة', 'Zakat Rules & Guidelines')}
                                        </p>
                                        <p className="text-[0.75rem]" style={{ marginTop: '0.2rem', fontFamily: font, color: dk ? 'rgba(226,232,240,0.6)' : '#777' }}>
                                            {loc('تعرف على النصاب والنسب الشرعية لكل نوع — اضغط هنا', 'Learn about Nisab thresholds & rates — Click here')}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-[1rem]" style={{ color: G_GREEN, animation: `${bounceAnim} 1.5s ease infinite` }}>
                                        <i className={`fa-solid ${loc('fa-arrow-left', 'fa-arrow-right')}`} />
                                    </div>
                                </div>

                                <CashCalculator value={cash} onChange={setCash}
                                    zakatAmount={zakatDue.cash}
                                    expanded={expandedSections.cash} onToggle={() => toggleSection('cash')}
                                />
                                <GoldSilverCalculator
                                    goldEntries={goldEntries} onGoldChange={updateGoldEntry}
                                    onAddGold={addGoldEntry} onRemoveGold={removeGoldEntry}
                                    silverGrams={silverGrams} onSilverChange={setSilverGrams}
                                    prices={prices} goldZakat={zakatDue.gold} silverZakat={zakatDue.silver}
                                    expanded={expandedSections.gold} onToggle={() => toggleSection('gold')}
                                />
                                <CropsCalculator cropWeight={cropWeight} onCropChange={setCropWeight}
                                    irrigationMode={irrigationMode} onIrrigationChange={setIrrigationMode}
                                    cropsZakat={zakatDue.cropsWeightDue}
                                    expanded={expandedSections.crops} onToggle={() => toggleSection('crops')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ZakatInfoModal show={showInfoModal} onClose={() => setShowInfoModal(false)}
                    dk={dk} font={font} dir={dir} nisab={nisab}
                    formatCurrency={formatCurrency} loc={loc}
                />
            </div>
        </>
    );
}

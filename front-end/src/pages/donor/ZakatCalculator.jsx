import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import useGoldPrice from '../../hooks/useGoldPrice';
import CashCalculator from '../../components/zakat/CashCalculator';
import GoldSilverCalculator from '../../components/zakat/GoldSilverCalculator';
import CropsCalculator from '../../components/zakat/CropsCalculator';
import ZakatSummaryCard from '../../components/zakat/ZakatSummaryCard';

// ─── Design Tokens ───────────────────────────────────────────────

const DARK_BG = '#0f172a';
const DARK_CARD = '#1e293b';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

// ─── Animations ──────────────────────────────────────────────────

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
`;

const bounceXEn = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(4px); }
`;

const bounceXAr = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-4px); }
`;

// ─── Styled ──────────────────────────────────────────────────────

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: '#fff',
    padding: '48px 0 68px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
}));

// ─── Helpers ─────────────────────────────────────────────────────

const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);
const num = (v) => parseFloat(v) || 0;

let nextGoldId = 2;

// ═════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════

export default function ZakatCalculator() {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const font = ARABIC_FONT;
    const dir = 'rtl';
    const bounceAnim = getLanguage() === 'en' ? bounceXEn : bounceXAr;

    // ── Dynamic Color Tokens from Theme ──
    const G_GREEN = theme.palette.primary.main;
    const G_GREEN_DK = theme.palette.primary.dark;
    const TEAL = theme.palette.primary.main;
    const TEAL_MID = theme.palette.primary.dark;

    // ── Price Hook ──
    const {
        prices, loading, error, isLive, lastUpdated, source, refetch, nisab
    } = useGoldPrice();

    // ── Form State ──
    const [cash, setCash] = useState('');
    const [goldEntries, setGoldEntries] = useState([{ id: 1, grams: '', karat: '24' }]);
    const [silverGrams, setSilverGrams] = useState('');
    const [cropWeight, setCropWeight] = useState('');
    const [irrigationMode, setIrrigationMode] = useState('natural');

    // ── Accordion State ──
    const [expandedSections, setExpandedSections] = useState({
        cash: true, gold: true, crops: true,
    });
    const toggleSection = (key) =>
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

    // ── Info Modal ──
    const [showInfoModal, setShowInfoModal] = useState(false);

    // ── Gold Helpers ──
    const addGoldEntry = () =>
        setGoldEntries(prev => [...prev, { id: nextGoldId++, grams: '', karat: '24' }]);
    const removeGoldEntry = (id) => {
        if (goldEntries.length > 1)
            setGoldEntries(prev => prev.filter(e => e.id !== id));
    };
    const updateGoldEntry = (id, field, value) =>
        setGoldEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

    // ── Zakat Calculation (debounced) ──
    const [zakatDue, setZakatDue] = useState({
        cash: 0, gold: 0, silver: 0, totalCurrency: 0, zakatableWealth: 0, cropsWeightDue: 0,
    });

    useEffect(() => {
        if (!prices) return;
        const timer = setTimeout(() => {
            const cashVal = num(cash);
            const silverVal = num(silverGrams);
            const cropVal = num(cropWeight);

            let totalGoldValue = 0;
            goldEntries.forEach(e => {
                totalGoldValue += num(e.grams) * (prices[`gold${e.karat}k`] || 0);
            });

            const silverValue = silverVal * prices.silver;
            const totalWealth = cashVal + totalGoldValue + silverValue;

            let cZ = 0, gZ = 0, sZ = 0;
            if (totalWealth >= nisab) {
                cZ = cashVal * 0.025;
                gZ = totalGoldValue * 0.025;
                sZ = silverValue * 0.025;
            }

            // Crops: 10% natural, 5% artificial, 7.5% mixed
            const cropRates = { natural: 0.10, irrigated: 0.05, mixed: 0.075 };
            const cropsZW = cropVal * (cropRates[irrigationMode] || 0.10);

            setZakatDue({
                cash: cZ,
                gold: gZ,
                silver: sZ,
                cropsWeightDue: cropsZW,
                totalCurrency: cZ + gZ + sZ,
                zakatableWealth: totalWealth,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [cash, goldEntries, silverGrams, cropWeight, irrigationMode, prices, nisab]);

    // ── Loading State ──
    if (loading) {
        return (
            <Box sx={{
                minHeight: '80vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', bgcolor: dk ? DARK_BG : '#f5f7f9'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <i className="fa-solid fa-spinner fa-spin"
                        style={{ fontSize: '2rem', color: G_GREEN, marginBottom: 12 }} />
                    <Typography sx={{ fontFamily: font, color: dk ? DARK_TEXT : '#555' }}>
                        {loc('جاري تحميل الأسعار...', 'Loading prices...')}
                    </Typography>
                </Box>
            </Box>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <Box sx={{ pb: 10, bgcolor: dk ? DARK_BG : '#f5f7f9', minHeight: '100vh', direction: dir }}>

            {/* ═══ HERO ═══ */}
            <HeroSection>
                <Container maxWidth="md">
                    <Box sx={{
                        fontSize: 38, mb: 1,
                        animation: `${fadeInUp} 0.5s ease forwards`,
                        color: 'rgba(255,255,255,0.85)'
                    }}>
                        <i className="fa-solid fa-calculator" />
                    </Box>
                    <Typography sx={{
                        fontWeight: 900, fontFamily: font,
                        fontSize: { xs: '1.6rem', md: '2.1rem' },
                        animation: `${fadeInUp} 0.5s ease 0.1s both`,
                    }}>
                        {loc('حاسبة الزكاة', 'Zakat Calculator')}
                    </Typography>

                    {/* Quranic Verse */}
                    <Box sx={{
                        maxWidth: 700, mx: 'auto', mt: 1.5, px: 2.5, py: 1.5,
                        borderRadius: '14px',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        animation: `${fadeInUp} 0.5s ease 0.15s both`,
                    }}>
                        <Typography sx={{
                            fontFamily: ARABIC_FONT, fontSize: { xs: '0.72rem', md: '0.82rem' },
                            color: 'rgba(255,255,255,0.85)', lineHeight: 2, textAlign: 'center',
                            direction: 'rtl',
                        }}>
                            ﴿ إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ فَرِيضَةً مِنَ اللَّهِ وَاللَّهُ عَلِيمٌ حَكِيمٌ ﴾
                        </Typography>
                        <Typography sx={{
                            fontFamily: font, fontSize: '0.65rem',
                            color: 'rgba(255,255,255,0.45)', mt: 0.5, textAlign: 'center'
                        }}>
                            {loc('سورة التوبة : 60', 'At-Tawbah : 60')}
                        </Typography>
                    </Box>

                    {/* ── Live Price Ticker Bar ── */}
                    {prices && (
                        <Box sx={{
                            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                            gap: { xs: 1, md: 2 }, mt: 2.5,
                            animation: `${fadeInUp} 0.5s ease 0.25s both`,
                        }}>
                            {[
                                { label: loc('ذهب 24', '24K'), value: prices.gold24k, color: '#f59e0b' },
                                { label: loc('ذهب 21', '21K'), value: prices.gold21k, color: '#f59e0b' },
                                { label: loc('ذهب 18', '18K'), value: prices.gold18k, color: '#f59e0b' },
                                { label: loc('فضة', 'Silver'), value: prices.silver, color: '#94a3b8' },
                            ].map((item, i) => (
                                <Box key={i} sx={{
                                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                                    px: 1.5, py: 0.5, borderRadius: '12px',
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    <Typography sx={{
                                        fontFamily: font, fontSize: '0.68rem',
                                        color: 'rgba(255,255,255,0.6)', fontWeight: 600,
                                    }}>
                                        {item.label}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: LATIN_FONT, fontSize: '0.75rem',
                                        fontWeight: 800, color: item.color,
                                    }}>
                                        {formatCurrency(item.value)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Source Badge */}
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        mt: 1.5, px: 2, py: 0.5, borderRadius: '20px',
                        bgcolor: source === 'fallback' ? 'rgba(255,193,7,0.2)' : 'rgba(0,177,106,0.2)',
                        border: `1px solid ${source === 'fallback' ? 'rgba(255,193,7,0.4)' : 'rgba(0,177,106,0.4)'}`,
                        animation: `${fadeInUp} 0.5s ease 0.35s both`,
                    }}>
                        <Box sx={{
                            width: 7, height: 7, borderRadius: '50%',
                            bgcolor: source === 'fallback' ? '#ffc107' : '#00e676',
                            animation: `${pulse} 2s ease infinite`,
                        }} />
                        <Typography sx={{ fontFamily: font, fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>
                            {source === 'admin'
                                ? loc('أسعار معتمدة من الإدارة', 'Admin verified prices')
                                : source === 'api'
                                    ? loc('أسعار حية من goldapi.io', 'Live prices from goldapi.io')
                                    : loc('أسعار تقديرية', 'Estimated prices')}
                        </Typography>
                    </Box>
                </Container>
            </HeroSection>

            {/* ═══ MAIN CONTENT ═══ */}
            <Container maxWidth="lg" sx={{ mt: -3.5, position: 'relative', zIndex: 2 }}>

                {/* ═══ TWO COLUMNS: Summary + Categories ═══ */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3.5,
                    alignItems: 'flex-start',
                }}>

                    {/* ════ LEFT: SUMMARY SIDEBAR (1/3) ════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(33.333% - 14px)' },
                        width: { xs: '100%', md: 'calc(33.333% - 14px)' },
                        order: { xs: 2, md: 1 },
                    }}>
                        <Box sx={{ position: 'sticky', top: 85 }}>
                            <ZakatSummaryCard
                                zakatDue={zakatDue}
                                nisab={nisab}
                                prices={prices}
                                isLive={isLive}
                                lastUpdated={lastUpdated}
                                source={source}
                                onRefresh={refetch}
                                showInfoModal={() => setShowInfoModal(true)}
                            />
                        </Box>
                    </Box>

                    {/* ════ RIGHT: ALL CATEGORY CARDS (2/3) ════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(66.666% - 14px)' },
                        width: { xs: '100%', md: 'calc(66.666% - 14px)' },
                        order: { xs: 1, md: 2 },
                    }}>
                        <Stack spacing={2.5}>
                            {/* ═══ ZAKAT RULES BANNER ═══ */}
                            <Box
                                onClick={() => setShowInfoModal(true)}
                                sx={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    px: 3,
                                    py: 1.8,
                                    borderRadius: '16px',
                                    background: dk
                                        ? `linear-gradient(135deg, ${alpha(TEAL, 0.25)} 0%, ${alpha(G_GREEN, 0.15)} 100%)`
                                        : `linear-gradient(135deg, ${alpha(TEAL, 0.08)} 0%, ${alpha(G_GREEN, 0.06)} 100%)`,
                                    border: `1.5px solid ${dk ? alpha(G_GREEN, 0.25) : alpha(TEAL, 0.18)}`,
                                    boxShadow: dk ? `0 4px 20px ${alpha(G_GREEN, 0.12)}` : `0 2px 16px ${alpha(TEAL, 0.08)}`,
                                    transition: 'all 0.3s ease',
                                    animation: `${fadeInUp} 0.5s ease 0.2s both`,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: dk ? `0 6px 28px ${alpha(G_GREEN, 0.2)}` : `0 4px 24px ${alpha(TEAL, 0.14)}`,
                                        borderColor: G_GREEN,
                                    },
                                }}
                            >
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                                    background: `linear-gradient(135deg, ${TEAL} 0%, ${G_GREEN} 100%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 12px ${alpha(G_GREEN, 0.3)}`,
                                }}>
                                    <i className="fa-solid fa-book-quran" style={{ fontSize: '1.1rem', color: '#fff' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontFamily: font, fontWeight: 800, fontSize: '0.92rem',
                                        color: dk ? theme.palette.primary.light : theme.palette.primary.dark,
                                    }}>
                                        {loc('أحكام الزكاة', 'Zakat Rules & Guidelines')}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: font, fontSize: '0.75rem',
                                        color: dk ? alpha(DARK_TEXT, 0.6) : '#777', mt: 0.2,
                                    }}>
                                        {loc('تعرف على النصاب والنسب الشرعية لكل نوع — اضغط هنا', 'Learn about Nisab thresholds & rates — Click here')}
                                    </Typography>
                                </Box>
                                <Box sx={{ flexShrink: 0, animation: `${bounceAnim} 1.5s ease infinite`, color: G_GREEN, fontSize: '1rem' }}>
                                    <i className={`fa-solid ${loc('fa-arrow-left', 'fa-arrow-right')}`} />
                                </Box>
                            </Box>

                            {/* Cash */}
                            <CashCalculator
                                value={cash}
                                onChange={setCash}
                                zakatAmount={zakatDue.cash}
                                expanded={expandedSections.cash}
                                onToggle={() => toggleSection('cash')}
                            />

                            {/* Gold & Silver */}
                            <GoldSilverCalculator
                                goldEntries={goldEntries}
                                onGoldChange={updateGoldEntry}
                                onAddGold={addGoldEntry}
                                onRemoveGold={removeGoldEntry}
                                silverGrams={silverGrams}
                                onSilverChange={setSilverGrams}
                                prices={prices}
                                goldZakat={zakatDue.gold}
                                silverZakat={zakatDue.silver}
                                expanded={expandedSections.gold}
                                onToggle={() => toggleSection('gold')}
                            />

                            {/* Crops */}
                            <CropsCalculator
                                cropWeight={cropWeight}
                                onCropChange={setCropWeight}
                                irrigationMode={irrigationMode}
                                onIrrigationChange={setIrrigationMode}
                                cropsZakat={zakatDue.cropsWeightDue}
                                expanded={expandedSections.crops}
                                onToggle={() => toggleSection('crops')}
                            />
                        </Stack>
                    </Box>

                </Box>
            </Container>

            {/* ═══ CALCULATION INFO MODAL ═══ */}
            <Dialog
                open={showInfoModal} onClose={() => setShowInfoModal(false)}
                maxWidth="sm" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px', direction: dir,
                        bgcolor: dk ? DARK_CARD : '#fff',
                        border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : '#eef2f7'}`,
                    },
                }}
            >
                <DialogTitle sx={{
                    fontFamily: font, fontWeight: 800, fontSize: '1.1rem',
                    color: dk ? DARK_HEAD : '#1a1a1a',
                    borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8'}`,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        bgcolor: alpha(G_GREEN, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <i className="fa-solid fa-book-open" style={{ fontSize: '0.9rem', color: G_GREEN }} />
                    </Box>
                    {loc('شرح طريقة حساب الزكاة', 'How Zakat is Calculated')}
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important', pb: 1 }}>
                    {/* Nisab */}
                    <ModalSection icon="fa-scale-balanced" color={TEAL}
                        title={loc('النِّصاب (الحد الأدنى)', 'Nisab (Minimum Threshold)')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'النصاب هو الحد الأدنى من المال الذي تجب فيه الزكاة، ويعادل قيمة 85 جرام من الذهب عيار 24. إذا بلغت أموالك (نقد + ذهب + فضة) هذا الحد وحال عليها الحول، وجبت فيها الزكاة.',
                                'Nisab is the minimum amount of wealth a Muslim must have before Zakat becomes obligatory. It equals the value of 85 grams of 24K gold. If your total wealth reaches or exceeds this threshold and has been held for a full lunar year, Zakat is due.'
                            )}
                        </Typography>
                        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8faf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>
                                {loc('النصاب الحالي:', 'Current Nisab:')}
                            </Typography>
                            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '0.9rem', color: TEAL }}>
                                {formatCurrency(nisab)}
                            </Typography>
                        </Box>
                    </ModalSection>

                    {/* Cash */}
                    <ModalSection icon="fa-money-bill-wave" color={G_GREEN}
                        title={loc('زكاة النقود والأموال', 'Cash & Savings Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من إجمالي المبالغ النقدية والمدخرات البنكية التي بلغت النصاب وحال عليها الحول.',
                                'Calculated at 2.5% of total cash and bank savings that have reached the Nisab and been held for a full lunar year.'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = إجمالي النقود × 2.5%', 'Zakat = Total Cash × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Gold */}
                    <ModalSection icon="fa-coins" color="#f59e0b"
                        title={loc('زكاة الذهب', 'Gold Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من القيمة السوقية الحالية للذهب. يتم ضرب الوزن بالجرامات في سعر الجرام حسب العيار (24، 21، أو 18).',
                                'Calculated at 2.5% of the current market value. Weight in grams is multiplied by the price per gram based on karat.'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = (الوزن × سعر الجرام) × 2.5%', 'Zakat = (Weight × Price/g) × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Silver */}
                    <ModalSection icon="fa-medal" color="#94a3b8"
                        title={loc('زكاة الفضة', 'Silver Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من القيمة السوقية الحالية للفضة.',
                                'Calculated at 2.5% of the current market value of silver.'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = (الوزن × سعر الجرام) × 2.5%', 'Zakat = (Weight × Price/g) × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Crops */}
                    <ModalSection icon="fa-wheat-awn" color="#22c55e"
                        title={loc('زكاة الزروع والثمار', 'Agriculture & Crops Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8, mb: 1.5 }}>
                            {loc(
                                'تُحسب حسب طريقة الري. زكاة الزروع تُخرج من المحصول نفسه (بالكيلوجرامات) وليس بالنقود.',
                                'Calculated based on the irrigation method. Crops Zakat is paid from the harvest itself (in kilograms), not in currency.'
                            )}
                        </Typography>
                        <Stack spacing={1}>
                            <CropRateRow icon="fa-cloud-rain" color="#3b82f6" rate="10%"
                                label={loc('ري طبيعي (بالأمطار)', 'Natural (Rain-fed)')}
                                desc={loc('بدون تكلفة ري', 'No irrigation cost')} font={font} dk={dk} />
                            <CropRateRow icon="fa-droplet" color="#8b5cf6" rate="7.5%"
                                label={loc('ري مشترك', 'Mixed Irrigation')}
                                desc={loc('جزئياً بالأمطار وجزئياً بالآلات', 'Part rain, part machine')} font={font} dk={dk} />
                            <CropRateRow icon="fa-faucet-drip" color="#f59e0b" rate="5%"
                                label={loc('ري صناعي (بالآلات)', 'Artificial (Machines)')}
                                desc={loc('بتكلفة ري كاملة', 'Full irrigation cost')} font={font} dk={dk} />
                        </Stack>
                    </ModalSection>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                    <Button onClick={() => setShowInfoModal(false)} fullWidth variant="contained"
                        sx={{
                            borderRadius: '12px', py: 1.2, textTransform: 'none',
                            fontFamily: font, fontWeight: 700,
                            bgcolor: G_GREEN, '&:hover': { bgcolor: G_GREEN_DK }
                        }}>
                        {loc('فهمت', 'Got it')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── Sub-Components (Modal helpers) ──────────────────────────────

function ModalSection({ icon, color, title, children, font, dk }) {
    return (
        <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{
                    width: 30, height: 30, borderRadius: '8px',
                    bgcolor: alpha(color, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: '0.8rem', color }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontFamily: font, fontSize: '0.95rem', color: dk ? DARK_HEAD : '#1a1a1a' }}>
                    {title}
                </Typography>
            </Box>
            {children}
        </Box>
    );
}

function FormulaBox({ dk, formula, font }) {
    return (
        <Box sx={{
            mt: 1.5, p: 1.2, borderRadius: '10px',
            bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8f9fb',
            border: `1px dashed ${dk ? 'rgba(255,255,255,0.08)' : '#e0e3e8'}`,
            textAlign: 'center'
        }}>
            <Typography sx={{
                fontFamily: font, fontSize: '0.8rem', fontWeight: 700,
                color: dk ? alpha(DARK_TEXT, 0.8) : '#555', letterSpacing: 0.3
            }}>
                {formula}
            </Typography>
        </Box>
    );
}

function CropRateRow({ icon, color, rate, label, desc, font, dk }) {
    return (
        <Box sx={{
            p: 1.2, borderRadius: '10px',
            bgcolor: dk ? 'rgba(255,255,255,0.02)' : '#fafbfc',
            border: `1px solid ${dk ? 'rgba(255,255,255,0.04)' : '#f0f4f8'}`,
            display: 'flex', alignItems: 'center', gap: 1.5
        }}>
            <Box sx={{
                width: 30, height: 30, borderRadius: '8px',
                bgcolor: alpha(color, 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '0.75rem', color }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: font, fontSize: '0.78rem', fontWeight: 700, color: dk ? DARK_HEAD : '#333' }}>
                    {label}
                </Typography>
                <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>
                    {desc}
                </Typography>
            </Box>
            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 900, fontSize: '0.95rem', color, flexShrink: 0 }}>
                {rate}
            </Typography>
        </Box>
    );
}

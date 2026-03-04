import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    TextField,
    InputAdornment,
    Divider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    IconButton,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    alpha
} from '@mui/material';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { getMetalPrices, calculateNisab } from '../../services/goldPriceService';

// ─── Design Tokens ───────────────────────────────────────────────

const G_GREEN = '#00b16a';
const G_GREEN_DK = '#009659';
const TEAL = '#0d6b58';
const TEAL_MID = '#1a4a44';
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

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const bounceX = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(4px); }
`;

// ─── Styled ──────────────────────────────────────────────────────

const HeroSection = styled(Box)(() => ({
    background: `linear-gradient(135deg, ${TEAL_MID} 0%, ${TEAL} 50%, ${G_GREEN_DK} 100%)`,
    color: '#fff',
    padding: '52px 0 72px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
}));

// Hide number input spinners
const noSpinnerSx = {
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none', margin: 0,
    },
};

// ─── Helpers ─────────────────────────────────────────────────────

const loc = (ar, en) => (getLanguage() === 'en' ? en : ar);
const num = (v) => parseFloat(v) || 0;

let nextGoldId = 2;

// ─── Tab Data ────────────────────────────────────────────────────

const TABS = [
    { key: 'cash', icon: 'fa-money-bill-wave', labelAr: 'النقود', labelEn: 'Cash', color: G_GREEN },
    { key: 'gold', icon: 'fa-coins', labelAr: 'الذهب', labelEn: 'Gold', color: '#f59e0b' },
    { key: 'silver', icon: 'fa-medal', labelAr: 'الفضة', labelEn: 'Silver', color: '#94a3b8' },
    { key: 'crops', icon: 'fa-wheat-awn', labelAr: 'الزروع', labelEn: 'Crops', color: '#22c55e' },
];

// ═════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════

export default function ZakatCalculator() {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const isEn = getLanguage() === 'en';
    const font = isEn ? LATIN_FONT : ARABIC_FONT;
    const dir = isEn ? 'ltr' : 'rtl';

    // ── State ──
    const [activeTab, setActiveTab] = useState('cash');
    const [prices, setPrices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const [cash, setCash] = useState('');
    const [goldEntries, setGoldEntries] = useState([{ id: 1, grams: '', karat: '24' }]);
    const [silverGrams, setSilverGrams] = useState('');
    const [cropWeight, setCropWeight] = useState('');
    const [irrigationMode, setIrrigationMode] = useState('natural');

    const [zakatDue, setZakatDue] = useState({
        cash: 0, gold: 0, silver: 0, totalCurrency: 0, zakatableWealth: 0, cropsWeightDue: 0,
    });

    // ── Gold Helpers ──
    const addGoldEntry = () => setGoldEntries(prev => [...prev, { id: nextGoldId++, grams: '', karat: '24' }]);
    const removeGoldEntry = (id) => { if (goldEntries.length > 1) setGoldEntries(prev => prev.filter(e => e.id !== id)); };
    const updateGoldEntry = (id, field, value) => setGoldEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

    // ── Fetch Prices ──
    useEffect(() => { (async () => { setPrices(await getMetalPrices()); setLoading(false); })(); }, []);

    // ── Debounced Calculation ──
    useEffect(() => {
        if (!prices) return;
        const timer = setTimeout(() => {
            const cashVal = num(cash), silverVal = num(silverGrams), cropVal = num(cropWeight);
            let totalGoldValue = 0;
            goldEntries.forEach(e => { totalGoldValue += num(e.grams) * (prices[`gold${e.karat}k`] || 0); });
            const silverValue = silverVal * prices.silver;
            const totalWealth = cashVal + totalGoldValue + silverValue;
            const currentNisab = calculateNisab(prices.gold24k);

            let cZ = 0, gZ = 0, sZ = 0;
            if (totalWealth >= currentNisab) { cZ = cashVal * 0.025; gZ = totalGoldValue * 0.025; sZ = silverValue * 0.025; }

            // Crops: 10% natural, 5% artificial, 7.5% mixed
            const cropRates = { natural: 0.10, irrigated: 0.05, mixed: 0.075 };
            const cropsZW = cropVal * (cropRates[irrigationMode] || 0.10);

            setZakatDue({ cash: cZ, gold: gZ, silver: sZ, cropsWeightDue: cropsZW, totalCurrency: cZ + gZ + sZ, zakatableWealth: totalWealth });
        }, 300);
        return () => clearTimeout(timer);
    }, [cash, goldEntries, silverGrams, cropWeight, irrigationMode, prices]);

    // ── Loading ──
    if (loading) {
        return (
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: dk ? DARK_BG : '#f5f7f9' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: G_GREEN, marginBottom: 12 }} />
                    <Typography sx={{ fontFamily: font, color: dk ? DARK_TEXT : '#555' }}>
                        {loc('جاري تحميل الأسعار...', 'Loading prices...')}
                    </Typography>
                </Box>
            </Box>
        );
    }

    const currentNisab = calculateNisab(prices?.gold24k || 0);
    const belowNisab = zakatDue.zakatableWealth > 0 && zakatDue.zakatableWealth < currentNisab;

    // ── Shared Styles ──
    const inputSx = {
        ...noSpinnerSx,
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px', fontFamily: LATIN_FONT,
            bgcolor: dk ? 'rgba(255,255,255,0.04)' : '#fafafa',
            '& fieldset': { borderColor: dk ? 'rgba(255,255,255,0.10)' : '#e0e0e0' },
            '&:hover fieldset': { borderColor: alpha(G_GREEN, 0.4) },
            '&.Mui-focused fieldset': { borderColor: G_GREEN },
        },
        '& .MuiInputLabel-root': { fontFamily: font },
    };

    const cardSx = {
        borderRadius: '20px', p: { xs: 2.5, md: 3.5 },
        bgcolor: dk ? DARK_CARD : '#fff',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
        boxShadow: dk ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.05)',
        direction: dir,
        animation: `${fadeInUp} 0.35s ease both`,
    };

    // ═══════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <Box sx={{ pb: 10, bgcolor: dk ? DARK_BG : '#f5f7f9', minHeight: '100vh', direction: dir }}>

            {/* ═══ HERO ═══ */}
            <HeroSection>
                <Container maxWidth="md">
                    <Box sx={{ fontSize: 38, mb: 1, animation: `${fadeInUp} 0.5s ease forwards`, color: 'rgba(255,255,255,0.85)' }}>
                        <i className="fa-solid fa-calculator" />
                    </Box>
                    <Typography sx={{
                        fontWeight: 900, fontFamily: font,
                        fontSize: { xs: '1.6rem', md: '2.1rem' },
                        animation: `${fadeInUp} 0.5s ease 0.1s both`,
                    }}>
                        {loc('حاسبة الزكاة', 'Zakat Calculator')}
                    </Typography>

                    {/* ── Quranic Verse ── */}
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
                        <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', mt: 0.5, textAlign: 'center' }}>
                            {loc('سورة التوبة : 60', 'At-Tawbah : 60')}
                        </Typography>
                    </Box>

                    {/* Live Price Badge */}
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        mt: 2, px: 2, py: 0.5, borderRadius: '20px',
                        bgcolor: prices?.isLive ? 'rgba(0,177,106,0.2)' : 'rgba(255,193,7,0.2)',
                        border: `1px solid ${prices?.isLive ? 'rgba(0,177,106,0.4)' : 'rgba(255,193,7,0.4)'}`,
                        animation: `${fadeInUp} 0.5s ease 0.25s both`,
                    }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: prices?.isLive ? '#00e676' : '#ffc107', animation: `${pulse} 2s ease infinite` }} />
                        <Typography sx={{ fontFamily: font, fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>
                            {prices?.isLive ? loc('أسعار حية من goldapi.io', 'Live prices from goldapi.io') : loc('أسعار تقديرية', 'Estimated prices')}
                        </Typography>
                    </Box>
                </Container>
            </HeroSection>

            {/* ═══ MAIN CONTENT ═══ */}
            <Container maxWidth="lg" sx={{ mt: -3.5, position: 'relative', zIndex: 2 }}>

                {/* ═══ TABS ═══ */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0.8, md: 2 }, mb: 3, flexWrap: 'wrap', animation: `${fadeInUp} 0.4s ease 0.1s both` }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab.key;
                        return (
                            <Button key={tab.key} onClick={() => setActiveTab(tab.key)} sx={{
                                minWidth: { xs: 68, md: 140 }, px: { xs: 1.2, md: 3 }, py: { xs: 1, md: 1.4 },
                                borderRadius: '16px', textTransform: 'none', fontFamily: font,
                                fontWeight: active ? 800 : 600, fontSize: { xs: '0.72rem', md: '0.88rem' },
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                                bgcolor: active ? (dk ? alpha(tab.color, 0.15) : '#fff') : (dk ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'),
                                color: active ? tab.color : (dk ? alpha(DARK_TEXT, 0.6) : '#888'),
                                border: `2px solid ${active ? tab.color : 'transparent'}`,
                                boxShadow: active ? `0 4px 18px ${alpha(tab.color, 0.2)}` : (dk ? 'none' : '0 1px 6px rgba(0,0,0,0.04)'),
                                transition: 'all 0.25s ease',
                                '&:hover': { bgcolor: active ? (dk ? alpha(tab.color, 0.18) : '#fff') : (dk ? 'rgba(255,255,255,0.06)' : '#fff'), boxShadow: `0 4px 14px ${alpha(tab.color, 0.15)}` },
                            }}>
                                <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '1.05rem' }} />
                                {isEn ? tab.labelEn : tab.labelAr}
                            </Button>
                        );
                    })}
                </Box>

                {/* ═══ ZAKAT RULES BANNER (eye-catching CTA) ═══ */}
                <Box
                    onClick={() => setShowInfoModal(true)}
                    sx={{
                        mb: 3, mx: 'auto', maxWidth: 650, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 2,
                        px: 3, py: 1.8, borderRadius: '16px',
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
                    {/* Icon */}
                    <Box sx={{
                        width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${TEAL} 0%, ${G_GREEN} 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(G_GREEN, 0.3)}`,
                    }}>
                        <i className="fa-solid fa-book-quran" style={{ fontSize: '1.1rem', color: '#fff' }} />
                    </Box>
                    {/* Text */}
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{
                            fontFamily: font, fontWeight: 800, fontSize: '0.92rem',
                            color: dk ? DARK_HEAD : '#1a1a1a',
                            backgroundImage: dk
                                ? `linear-gradient(90deg, ${DARK_HEAD}, ${alpha(G_GREEN, 0.9)}, ${DARK_HEAD})`
                                : `linear-gradient(90deg, #1a1a1a, ${TEAL}, #1a1a1a)`,
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: `${shimmer} 3s linear infinite`,
                        }}>
                            {loc('أحكام الزكاة', 'Zakat Rules & Guidelines')}
                        </Typography>
                        <Typography sx={{
                            fontFamily: font, fontSize: '0.75rem',
                            color: dk ? alpha(DARK_TEXT, 0.6) : '#777', mt: 0.2,
                        }}>
                            {loc('تعرف على النصاب والنسب الشرعية لكل نوع — اضغط هنا', 'Learn about Nisab thresholds & rates for each category — Click here')}
                        </Typography>
                    </Box>
                    {/* Arrow */}
                    <Box sx={{ flexShrink: 0, animation: `${bounceX} 1.5s ease infinite`, color: G_GREEN, fontSize: '1rem' }}>
                        <i className={`fa-solid ${isEn ? 'fa-arrow-right' : 'fa-arrow-left'}`} />
                    </Box>
                </Box>

                {/* ═══ TWO COLUMNS ═══ */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3.5, alignItems: 'flex-start' }}>

                    {/* ════ LEFT: INPUT (2/3) ════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(66.666% - 14px)' },
                        width: { xs: '100%', md: 'calc(66.666% - 14px)' },
                        order: { xs: 1, md: isEn ? 1 : 2 },
                    }}>

                        {/* ── CASH ── */}
                        {activeTab === 'cash' && (
                            <Paper elevation={0} sx={cardSx} key="cash">
                                <SectionHeader icon="fa-money-bill-wave" color={G_GREEN} title={loc('النقود والأموال السائلة', 'Cash & Liquid Assets')} font={font} dk={dk} />
                                <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888', mb: 3, lineHeight: 1.7 }}>
                                    {loc('أدخل إجمالي المبالغ النقدية، المدخرات البنكية، والأموال السائلة التي حال عليها الحول.',
                                        'Enter the total of cash, bank savings, and liquid assets held for a full lunar year.')}
                                </Typography>
                                <TextField
                                    placeholder={loc('أدخل المبلغ', 'Enter amount')}
                                    type="number" fullWidth value={cash}
                                    onChange={(e) => setCash(e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: font, fontSize: '0.85rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>{loc('ج.م', 'EGP')}</Typography></InputAdornment> }}
                                    sx={{ ...inputSx, maxWidth: 500 }}
                                />
                            </Paper>
                        )}

                        {/* ── GOLD ── */}
                        {activeTab === 'gold' && (
                            <Paper elevation={0} sx={cardSx} key="gold">
                                <SectionHeader icon="fa-coins" color="#f59e0b" title={loc('الذهب', 'Gold')} font={font} dk={dk} />
                                <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888', mb: 3, lineHeight: 1.7 }}>
                                    {loc('أدخل وزن الذهب الذي تملكه وحدد عياره. يمكنك إضافة أكثر من نوع.',
                                        'Enter the weight and karat of your gold. You can add multiple entries.')}
                                </Typography>

                                {goldEntries.map((entry, idx) => (
                                    <Box key={entry.id} sx={{
                                        p: 2, mb: 1.5, borderRadius: '14px',
                                        bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafbfc',
                                        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8'}`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography sx={{ fontFamily: font, fontWeight: 700, fontSize: '0.82rem', color: dk ? alpha(DARK_TEXT, 0.7) : '#666' }}>
                                                {loc(`ذهب ${idx + 1}`, `Gold ${idx + 1}`)}
                                            </Typography>
                                            {goldEntries.length > 1 && (
                                                <IconButton size="small" onClick={() => removeGoldEntry(entry.id)}
                                                    sx={{ color: '#ef4444', width: 28, height: 28, '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}>
                                                    <i className="fa-solid fa-trash-can" style={{ fontSize: '0.7rem' }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <TextField
                                                placeholder={loc('الوزن', 'Weight')}
                                                type="number" value={entry.grams}
                                                onChange={(e) => updateGoldEntry(entry.id, 'grams', e.target.value)}
                                                InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>{loc('جرام', 'g')}</Typography></InputAdornment> }}
                                                sx={{ ...inputSx, flex: 1, minWidth: 160 }}
                                                size="small"
                                            />
                                            <ToggleButtonGroup
                                                color="primary" value={entry.karat} exclusive size="small"
                                                onChange={(e, val) => { if (val) updateGoldEntry(entry.id, 'karat', val); }}
                                                sx={{ '& .MuiToggleButton-root': { fontWeight: 700, fontFamily: LATIN_FONT, fontSize: '0.8rem', borderColor: dk ? 'rgba(255,255,255,0.12)' : '#e0e0e0', color: dk ? DARK_TEXT : '#555', px: 2, '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', borderColor: alpha('#f59e0b', 0.4) } } }}
                                            >
                                                <ToggleButton value="24">24K</ToggleButton>
                                                <ToggleButton value="21">21K</ToggleButton>
                                                <ToggleButton value="18">18K</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                    </Box>
                                ))}

                                <Button onClick={addGoldEntry} startIcon={<i className="fa-solid fa-plus" style={{ fontSize: '0.7rem' }} />}
                                    sx={{ mt: 1, textTransform: 'none', fontFamily: font, fontWeight: 700, fontSize: '0.82rem', color: '#f59e0b', borderRadius: '12px', border: `1.5px dashed ${alpha('#f59e0b', 0.4)}`, px: 2, py: 0.8, '&:hover': { bgcolor: alpha('#f59e0b', 0.06), borderColor: '#f59e0b' } }}>
                                    {loc('إضافة ذهب آخر', '+ Add More Gold')}
                                </Button>

                                <Box sx={{ mt: 2.5, p: 1.5, borderRadius: '12px', bgcolor: dk ? 'rgba(245,158,11,0.06)' : alpha('#f59e0b', 0.05), border: `1px solid ${dk ? 'rgba(245,158,11,0.15)' : alpha('#f59e0b', 0.15)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>
                                        {loc('سعر عيار 24 الحي:', 'Live 24K Price:')}
                                    </Typography>
                                    <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '0.85rem', color: '#f59e0b' }}>
                                        {formatCurrency(prices.gold24k)} / {loc('جرام', 'g')}
                                    </Typography>
                                </Box>
                            </Paper>
                        )}

                        {/* ── SILVER ── */}
                        {activeTab === 'silver' && (
                            <Paper elevation={0} sx={cardSx} key="silver">
                                <SectionHeader icon="fa-medal" color="#94a3b8" title={loc('الفضة', 'Silver')} font={font} dk={dk} />
                                <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888', mb: 3, lineHeight: 1.7 }}>
                                    {loc('أدخل وزن الفضة التي تملكها بالجرامات.', 'Enter the weight of silver you own in grams.')}
                                </Typography>
                                <TextField
                                    placeholder={loc('الوزن', 'Weight')}
                                    type="number" fullWidth value={silverGrams}
                                    onChange={(e) => setSilverGrams(e.target.value)}
                                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>{loc('جرام', 'g')}</Typography></InputAdornment> }}
                                    sx={{ ...inputSx, maxWidth: 400 }}
                                />
                                <Box sx={{ mt: 2.5, p: 1.5, borderRadius: '12px', bgcolor: dk ? 'rgba(148,163,184,0.06)' : alpha('#94a3b8', 0.06), border: `1px solid ${dk ? 'rgba(148,163,184,0.15)' : alpha('#94a3b8', 0.15)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>
                                        {loc('سعر الفضة الحي:', 'Live Silver Price:')}
                                    </Typography>
                                    <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {formatCurrency(prices.silver)} / {loc('جرام', 'g')}
                                    </Typography>
                                </Box>
                            </Paper>
                        )}

                        {/* ── CROPS (3 tiers) ── */}
                        {activeTab === 'crops' && (
                            <Paper elevation={0} sx={cardSx} key="crops">
                                <SectionHeader icon="fa-wheat-awn" color="#22c55e" title={loc('الزروع والثمار', 'Agriculture & Crops')} font={font} dk={dk} />
                                <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888', mb: 3, lineHeight: 1.7 }}>
                                    {loc('أدخل وزن المحصول واختر طريقة الري المناسبة لحساب زكاة الزروع.',
                                        'Enter the harvest weight and select the irrigation method to calculate your crops Zakat.')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <TextField
                                        placeholder={loc('وزن المحصول', 'Harvest weight')}
                                        type="number" value={cropWeight}
                                        onChange={(e) => setCropWeight(e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>{loc('كجم', 'kg')}</Typography></InputAdornment> }}
                                        sx={{ ...inputSx, flex: 1, minWidth: 180 }}
                                    />
                                    <Box sx={{ minWidth: 240, flex: 1 }}>
                                        <Typography sx={{ fontFamily: font, fontSize: '0.78rem', fontWeight: 600, color: dk ? alpha(DARK_TEXT, 0.6) : '#888', mb: 1 }}>
                                            {loc('طريقة الري', 'Irrigation Method')}
                                        </Typography>
                                        <ToggleButtonGroup
                                            color="primary" value={irrigationMode} exclusive fullWidth
                                            orientation="vertical"
                                            onChange={(e, val) => { if (val) setIrrigationMode(val); }}
                                            sx={{ '& .MuiToggleButton-root': { justifyContent: isEn ? 'flex-start' : 'flex-end', px: 2, py: 1.2, textTransform: 'none', borderColor: dk ? 'rgba(255,255,255,0.08)' : '#e8e8e8', color: dk ? DARK_TEXT : '#555', '&.Mui-selected': { bgcolor: alpha(G_GREEN, 0.1), color: G_GREEN, borderColor: alpha(G_GREEN, 0.3) } } }}
                                        >
                                            <ToggleButton value="natural">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                    <i className="fa-solid fa-cloud-rain" style={{ fontSize: '0.95rem', color: '#3b82f6', flexShrink: 0 }} />
                                                    <Box sx={{ textAlign: isEn ? 'left' : 'right', flex: 1 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: font }}>
                                                            {loc('ري طبيعي (بالأمطار)', 'Natural (Rain-fed)')}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.65rem', fontFamily: font, color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>
                                                            {loc('يستحق 10% زكاة — بدون تكلفة ري', '10% Zakat — No irrigation cost')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </ToggleButton>
                                            <ToggleButton value="mixed">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                    <i className="fa-solid fa-droplet" style={{ fontSize: '0.95rem', color: '#8b5cf6', flexShrink: 0 }} />
                                                    <Box sx={{ textAlign: isEn ? 'left' : 'right', flex: 1 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: font }}>
                                                            {loc('ري مشترك (طبيعي + صناعي)', 'Mixed (Rain + Machine)')}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.65rem', fontFamily: font, color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>
                                                            {loc('يستحق 7.5% زكاة', '7.5% Zakat')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </ToggleButton>
                                            <ToggleButton value="irrigated">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                    <i className="fa-solid fa-faucet-drip" style={{ fontSize: '0.95rem', color: '#f59e0b', flexShrink: 0 }} />
                                                    <Box sx={{ textAlign: isEn ? 'left' : 'right', flex: 1 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: font }}>
                                                            {loc('ري صناعي (بالآلات بتكلفة)', 'Artificial (Irrigated/Machines)')}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.65rem', fontFamily: font, color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>
                                                            {loc('يستحق 5% زكاة — تكلفة ري', '5% Zakat — Irrigation cost')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                    </Box>

                    {/* ════ RIGHT: RESULTS (1/3) ════ */}
                    <Box sx={{
                        flex: { xs: '1 1 auto', md: '0 0 calc(33.333% - 14px)' },
                        width: { xs: '100%', md: 'calc(33.333% - 14px)' },
                        order: { xs: 2, md: isEn ? 2 : 1 },
                    }}>
                        <Box sx={{ position: 'sticky', top: 85 }}>
                            <Card elevation={0} sx={{
                                borderRadius: '20px', overflow: 'hidden',
                                boxShadow: dk ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 24px rgba(0,0,0,0.07)',
                                border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                                animation: `${fadeInUp} 0.5s ease 0.15s both`,
                                direction: dir,
                            }}>
                                {/* Header */}
                                <Box sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 100%)`, p: 2.5, pb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: '0.9rem', color: '#fff', mb: 0.3 }}>
                                                {loc('إجمالي الزكاة المستحقة', 'Total Zakat Due')}
                                            </Typography>
                                            <Typography sx={{ fontFamily: font, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {loc('يتم حسابها تلقائياً', 'Calculated automatically')}
                                            </Typography>
                                        </Box>
                                        {/* Info Button */}
                                        <IconButton onClick={() => setShowInfoModal(true)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                            <i className="fa-solid fa-circle-info" style={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2.5 }}>
                                    {/* Main Total */}
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Typography sx={{ fontWeight: 900, fontFamily: LATIN_FONT, fontSize: '2.2rem', color: G_GREEN, lineHeight: 1.2 }}>
                                            {formatNumber(Math.round(zakatDue.totalCurrency))}
                                        </Typography>
                                        <Typography sx={{ fontFamily: font, fontWeight: 600, fontSize: '0.75rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>
                                            {loc('جنيه مصري', 'Egyptian Pounds')}
                                        </Typography>
                                    </Box>

                                    {/* Crops Zakat */}
                                    {zakatDue.cropsWeightDue > 0 && (
                                        <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha(G_GREEN, 0.08), border: `1px solid ${alpha(G_GREEN, 0.2)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <i className="fa-solid fa-wheat-awn" style={{ fontSize: '0.75rem', color: G_GREEN }} />
                                                <Typography sx={{ fontFamily: font, fontWeight: 700, fontSize: '0.8rem', color: dk ? DARK_HEAD : '#333' }}>
                                                    {loc('زكاة الزروع:', 'Crops Zakat:')}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '0.9rem', color: G_GREEN }}>
                                                {zakatDue.cropsWeightDue.toFixed(1)} {loc('كجم', 'kg')}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Below Nisab Warning */}
                                    {belowNisab && (
                                        <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha('#f59e0b', 0.08), border: `1px solid ${alpha('#f59e0b', 0.25)}`, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: 3 }} />
                                            <Typography sx={{ fontFamily: font, fontSize: '0.75rem', lineHeight: 1.6, color: dk ? DARK_TEXT : '#666' }}>
                                                {loc('أموالك لم تبلغ حد النصاب. لا تجب فيها الزكاة.', 'Your assets are below the Nisab. No Zakat is due.')}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 2, borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8' }} />

                                    <Stack spacing={1.5}>
                                        <InfoRow label={loc('النصاب الحالي', 'Current Nisab')} value={formatCurrency(currentNisab)} font={font} dk={dk} />
                                        <InfoRow label={loc('إجمالي أموالك', 'Your Wealth')} value={formatCurrency(zakatDue.zakatableWealth)} font={font} dk={dk} />
                                    </Stack>

                                    {zakatDue.totalCurrency > 0 && (
                                        <>
                                            <Divider sx={{ my: 2, borderColor: dk ? 'rgba(255,255,255,0.06)' : '#f0f4f8' }} />
                                            <Typography sx={{ fontFamily: font, fontWeight: 700, fontSize: '0.72rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#aaa', mb: 1.2, letterSpacing: 0.5 }}>
                                                {loc('التفاصيل', 'BREAKDOWN')}
                                            </Typography>
                                            <Stack spacing={1}>
                                                {zakatDue.cash > 0 && <BreakdownRow icon="fa-money-bill-wave" color={G_GREEN} label={loc('زكاة النقود', 'Cash')} value={formatCurrency(zakatDue.cash)} font={font} dk={dk} />}
                                                {zakatDue.gold > 0 && <BreakdownRow icon="fa-coins" color="#f59e0b" label={loc('زكاة الذهب', 'Gold')} value={formatCurrency(zakatDue.gold)} font={font} dk={dk} />}
                                                {zakatDue.silver > 0 && <BreakdownRow icon="fa-medal" color="#94a3b8" label={loc('زكاة الفضة', 'Silver')} value={formatCurrency(zakatDue.silver)} font={font} dk={dk} />}
                                            </Stack>
                                        </>
                                    )}

                                    <Button fullWidth variant="contained" size="large"
                                        disabled={zakatDue.totalCurrency === 0 && zakatDue.cropsWeightDue === 0}
                                        sx={{
                                            mt: 3, py: 1.4, borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem',
                                            textTransform: 'none', fontFamily: font, bgcolor: G_GREEN, color: '#fff',
                                            boxShadow: `0 6px 24px ${alpha(G_GREEN, 0.35)}`, transition: 'all 0.3s ease',
                                            '&:hover': { bgcolor: G_GREEN_DK, transform: 'translateY(-1px)' },
                                            '&.Mui-disabled': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#e8e8e8', color: dk ? 'rgba(255,255,255,0.25)' : '#bbb' },
                                        }}>
                                        <i className="fa-solid fa-heart" style={{ marginInlineEnd: 8, fontSize: '0.85rem' }} />
                                        {loc('أخرج زكاتك الآن', 'Pay Zakat Now')}
                                    </Button>

                                    {prices?.lastUpdated && (
                                        <Typography sx={{ mt: 2, fontFamily: font, fontSize: '0.68rem', color: dk ? alpha(DARK_TEXT, 0.35) : '#bbb', textAlign: 'center' }}>
                                            {loc('آخر تحديث: ', 'Updated: ')}
                                            {prices.lastUpdated.toLocaleTimeString(isEn ? 'en' : 'ar', { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        </Box>
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
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(G_GREEN, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-book-open" style={{ fontSize: '0.9rem', color: G_GREEN }} />
                    </Box>
                    {loc('شرح طريقة حساب الزكاة', 'How Zakat is Calculated')}
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important', pb: 1 }}>
                    {/* Nisab */}
                    <ModalSection
                        icon="fa-scale-balanced" color={TEAL}
                        title={loc('النِّصاب (الحد الأدنى)', 'Nisab (Minimum Threshold)')}
                        font={font} dk={dk}
                    >
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'النصاب هو الحد الأدنى من المال الذي تجب فيه الزكاة، ويعادل قيمة 85 جرام من الذهب عيار 24. إذا بلغت أموالك (نقد + ذهب + فضة) هذا الحد وحال عليها الحول، وجبت فيها الزكاة.',
                                'Nisab is the minimum amount of wealth a Muslim must have before Zakat becomes obligatory. It equals the value of 85 grams of 24K gold. If your total wealth (cash + gold + silver) reaches or exceeds this threshold and has been held for a full lunar year, Zakat is due.'
                            )}
                        </Typography>
                        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8faf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>
                                {loc('النصاب الحالي:', 'Current Nisab:')}
                            </Typography>
                            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '0.9rem', color: TEAL }}>
                                {formatCurrency(currentNisab)}
                            </Typography>
                        </Box>
                    </ModalSection>

                    {/* Cash */}
                    <ModalSection icon="fa-money-bill-wave" color={G_GREEN} title={loc('زكاة النقود والأموال', 'Cash & Savings Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من إجمالي المبالغ النقدية والمدخرات البنكية التي بلغت النصاب وحال عليها الحول.',
                                'Calculated at 2.5% of total cash and bank savings that have reached the Nisab and been held for a full lunar year.'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = إجمالي النقود × 2.5%', 'Zakat = Total Cash × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Gold */}
                    <ModalSection icon="fa-coins" color="#f59e0b" title={loc('زكاة الذهب', 'Gold Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من القيمة السوقية الحالية للذهب. يتم ضرب الوزن بالجرامات في سعر الجرام حسب العيار (24، 21، أو 18).',
                                'Calculated at 2.5% of the current market value. Weight in grams is multiplied by the price per gram based on karat (24K, 21K, or 18K).'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = (الوزن × سعر الجرام) × 2.5%', 'Zakat = (Weight × Price/g) × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Silver */}
                    <ModalSection icon="fa-medal" color="#94a3b8" title={loc('زكاة الفضة', 'Silver Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8 }}>
                            {loc(
                                'تُحسب بنسبة 2.5% من القيمة السوقية الحالية للفضة. يتم ضرب الوزن بالجرامات في سعر الجرام الحالي.',
                                'Calculated at 2.5% of the current market value. Weight in grams is multiplied by the current price per gram.'
                            )}
                        </Typography>
                        <FormulaBox dk={dk} formula={loc('الزكاة = (الوزن × سعر الجرام) × 2.5%', 'Zakat = (Weight × Price/g) × 2.5%')} font={font} />
                    </ModalSection>

                    {/* Crops */}
                    <ModalSection icon="fa-wheat-awn" color="#22c55e" title={loc('زكاة الزروع والثمار', 'Agriculture & Crops Zakat')} font={font} dk={dk}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: dk ? DARK_TEXT : '#555', lineHeight: 1.8, mb: 1.5 }}>
                            {loc(
                                'تُحسب حسب طريقة الري. زكاة الزروع تُخرج من المحصول نفسه (بالكيلوجرامات) وليس بالنقود.',
                                'Calculated based on the irrigation method. Crops Zakat is paid from the harvest itself (in kilograms), not in currency.'
                            )}
                        </Typography>
                        <Stack spacing={1}>
                            <CropRateRow icon="fa-cloud-rain" color="#3b82f6" rate="10%" label={loc('ري طبيعي (بالأمطار)', 'Natural (Rain-fed)')} desc={loc('بدون تكلفة ري', 'No irrigation cost')} font={font} dk={dk} />
                            <CropRateRow icon="fa-droplet" color="#8b5cf6" rate="7.5%" label={loc('ري مشترك', 'Mixed Irrigation')} desc={loc('جزئياً بالأمطار وجزئياً بالآلات', 'Part rain, part machine')} font={font} dk={dk} />
                            <CropRateRow icon="fa-faucet-drip" color="#f59e0b" rate="5%" label={loc('ري صناعي (بالآلات)', 'Artificial (Machines)')} desc={loc('بتكلفة ري كاملة', 'Full irrigation cost')} font={font} dk={dk} />
                        </Stack>
                    </ModalSection>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                    <Button onClick={() => setShowInfoModal(false)} fullWidth variant="contained"
                        sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontFamily: font, fontWeight: 700, bgcolor: G_GREEN, '&:hover': { bgcolor: G_GREEN_DK } }}>
                        {loc('فهمت', 'Got it')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── Sub-Components ──────────────────────────────────────────────

function SectionHeader({ icon, color, title, font, dk }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '1rem', color }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontFamily: font, fontSize: '1.1rem', color: dk ? DARK_HEAD : '#1a1a1a' }}>
                {title}
            </Typography>
        </Box>
    );
}

function InfoRow({ label, value, font, dk }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: dk ? alpha(DARK_TEXT, 0.6) : '#888' }}>{label}</Typography>
            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 700, fontSize: '0.78rem', color: dk ? DARK_HEAD : '#333' }}>{value}</Typography>
        </Box>
    );
}

function BreakdownRow({ icon, color, label, value, font, dk }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '0.65rem', color }} />
                <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: dk ? DARK_TEXT : '#555' }}>{label}</Typography>
            </Box>
            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 700, fontSize: '0.8rem', color: dk ? DARK_HEAD : '#333' }}>{value}</Typography>
        </Box>
    );
}

function ModalSection({ icon, color, title, children, font, dk }) {
    return (
        <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: '0.8rem', color }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontFamily: font, fontSize: '0.95rem', color: dk ? DARK_HEAD : '#1a1a1a' }}>{title}</Typography>
            </Box>
            {children}
        </Box>
    );
}

function FormulaBox({ dk, formula, font }) {
    return (
        <Box sx={{ mt: 1.5, p: 1.2, borderRadius: '10px', bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#f8f9fb', border: `1px dashed ${dk ? 'rgba(255,255,255,0.08)' : '#e0e3e8'}`, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: font, fontSize: '0.8rem', fontWeight: 700, color: dk ? alpha(DARK_TEXT, 0.8) : '#555', letterSpacing: 0.3 }}>
                {formula}
            </Typography>
        </Box>
    );
}

function CropRateRow({ icon, color, rate, label, desc, font, dk }) {
    return (
        <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: dk ? 'rgba(255,255,255,0.02)' : '#fafbfc', border: `1px solid ${dk ? 'rgba(255,255,255,0.04)' : '#f0f4f8'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '0.75rem', color }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: font, fontSize: '0.78rem', fontWeight: 700, color: dk ? DARK_HEAD : '#333' }}>{label}</Typography>
                <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }}>{desc}</Typography>
            </Box>
            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 900, fontSize: '0.95rem', color, flexShrink: 0 }}>{rate}</Typography>
        </Box>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Chip,
    LinearProgress,
    IconButton,
    Dialog,
    DialogContent,
    Backdrop,
    useTheme,
    alpha
} from '@mui/material';
import { getLanguage, formatCurrency, formatNumber } from '../../i18n';
import { projects, programs } from '../../data/mockData';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const TEAL_DARK = '#0a1f1c';
const EMERALD = '#10b981';
const EMERALD_DK = '#059669';

// ─── Green brand tokens (per design spec) ─────────────────────
const G_GREEN = '#00b16a';   // primary CTA, progress, icons
const G_GREEN_DK = '#009659'; // button hover darken
const G_LIGHT = '#f0f9f5'; // donation box background
const G_BORDER = '#d1f2e4'; // donation box border

const DARK_BG = '#0f172a';
const DARK_CARD = '#1e293b';
const DARK_TEXT = '#e2e8f0';
const DARK_HEAD = '#f8fafc';

const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop';

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);
const isLatin = (txt) => {
    if (!txt) return false;
    const l = txt.replace(/[^a-zA-Z]/g, '').length;
    const a = txt.replace(/[^a-zA-Z\u0600-\u06FF]/g, '').length;
    return a > 0 && l / a > 0.5;
};

// ═══════════════════════════════════════════════════════════════
//  KEYFRAMES
// ═══════════════════════════════════════════════════════════════

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ═══════════════════════════════════════════════════════════════
//  STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════

/* ──── Hero — no pseudo-elements, no top margin ──── */
const HeroSection = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        paddingTop: 100,
        paddingBottom: 100,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        background: dk
            ? `radial-gradient(ellipse at 30% 20%, ${TEAL_DARK} 0%, #04100e 70%, #020a09 100%)`
            : `radial-gradient(ellipse at 35% 25%, ${TEAL} 0%, ${TEAL_MID} 55%, ${TEAL_DARK} 100%)`,
        [theme.breakpoints.down('md')]: {
            paddingTop: 28,
            paddingBottom: 44,
        },
    };
});

/* ──── Wave ──── */
const WaveDivider = styled(Box)(({ theme }) => ({
    marginTop: -1,
    lineHeight: 0,
    '& svg': {
        display: 'block',
        width: '100%',
        height: 36,
        fill: theme.palette.mode === 'dark' ? DARK_BG : '#f8fafc',
    },
}));

/* ──── Filter Bar — fluid floating pill row ──── */
const FilterBar = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'sticky',
        top: 72,          // sticks just below the navbar
        zIndex: 20,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        /* fluid glass look */
        background: dk
            ? 'rgba(15,23,42,0.75)'
            : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        padding: theme.spacing(1.2, 0),
        marginLeft: theme.spacing(-2),
        marginRight: theme.spacing(-2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    };
});

/* ──── Campaign Card — 24px, green-glow hover with nuclear !important ──── */
const CampaignCard = styled(Card)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        width: '100%',
        maxWidth: 320,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px !important',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: dk ? DARK_CARD : '#fff',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : '#eaf3ef'}`,
        /* Default shadow — visible around the whole card */
        boxShadow: dk
            ? '0 8px 30px rgba(0, 19, 11, 0.35), 0 2px 8px rgba(0, 0, 0, 0.20) !important'
            : '0 8px 30px rgba(1, 31, 19, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08) !important',
        /*
         * NUCLEAR: override transition everywhere — the root, MuiPaper,
         * and any CSS class. Using both the styled root AND &&& triple-ampersand
         * to guarantee the highest Emotion specificity.
         */
        '&&&': {
            transition: 'all 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) !important',
        },
        willChange: 'transform, box-shadow',
        transition: 'all 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) !important',
        /* ── Sliding accent bar ── */
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, ${G_GREEN}, ${EMERALD}, ${G_GREEN_DK})`,
            borderRadius: '0 0 24px 24px',
            transform: 'translateX(-101%)',
            transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        /* Hover: subtle lift + deep green glow + bar slides in */
        '&:hover': {
            transform: 'translateY(-6px) !important',
            boxShadow: '0 50px 100px rgba(0, 177, 106, 0.40), 0 20px 40px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 177, 106, 0.20) !important',
        },
        '&:hover::after': {
            transform: 'translateX(0)',
        },
    };
});

/* ──── Image Wrapper — overlay triggers on IMAGE hover, not card ──── */
const ImageWrap = styled(Box)(() => ({
    position: 'relative',
    height: 160,
    overflow: 'hidden',
    flexShrink: 0,
    /* Trigger overlay + zoom only when the image area is hovered */
    '&:hover .hover-overlay': { opacity: 1 },
    '&:hover .card-image': { transform: 'scale(1.08) translateY(-2px)' },
}));

/* ──── Hover Overlay — dark veil with centered "التفاصيل" label ──── */
const HoverOverlay = styled(Box)(() => ({
    position: 'absolute',
    inset: 0,
    background: 'rgba(10,31,28,0.62)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 300ms ease',
    zIndex: 3,
}));

/* ──── Glassmorphism Badge ──── */
const GlassBadge = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'absolute',
        zIndex: 4,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: '0.65rem',
        fontWeight: 700,
        color: dk ? DARK_TEXT : '#fff',
        background: dk ? 'rgba(15,23,42,0.6)' : 'rgba(26,74,68,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${dk ? 'rgba(16,185,129,0.30)' : 'rgba(255,255,255,0.25)'}`,
    };
});

// ═══════════════════════════════════════════════════════════════
//  ANIMATED PROGRESS BAR
// ═══════════════════════════════════════════════════════════════

function AnimatedProgress({ value }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const c = Math.min(value, 100);
    return (
        <Box ref={ref} sx={{
            height: 6, borderRadius: 3,
            bgcolor: dk ? 'rgba(255,255,255,0.07)' : alpha(EMERALD, 0.10),
            overflow: 'hidden', mb: 0.8,
        }}>
            <Box sx={{
                height: '100%', borderRadius: 3, bgcolor: EMERALD,
                width: vis ? `${c}%` : '0%',
                transition: vis ? 'width 1s cubic-bezier(.4,0,.2,1)' : 'none',
                ...(dk && { boxShadow: `0 0 6px ${alpha(EMERALD, 0.5)}, 0 0 14px ${alpha(EMERALD, 0.2)}` }),
            }} />
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════
//  SAFE IMAGE
// ═══════════════════════════════════════════════════════════════

function SafeImage({ src, alt, className, sx }) {
    const [s, setS] = useState(src);
    return (
        <Box
            component="img"
            className={className}
            src={s}
            alt={alt}
            onError={() => setS(FALLBACK_IMG)}
            loading="lazy"
            sx={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 1.2s cubic-bezier(.4,0,.2,1)',
                ...sx,
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════
//  CAMPAIGN CARD ITEM
// ═══════════════════════════════════════════════════════════════

function CampaignCardItem({ project, index, onClick, onDonate }) {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const isEn = getLanguage() === 'en';

    const pct = Math.min(100, Math.round((project.raised / project.goal) * 100));
    const title = loc(project.title, project.titleEn);
    const desc = loc(project.description, project.descriptionEn);
    const prog = loc(project.program, project.programEn);

    return (
        <CampaignCard
            elevation={0}
            onClick={() => onClick(project)}
            sx={{ animation: `${fadeInUp} 0.5s ease both`, animationDelay: `${index * 0.06}s`, width: '100%', cursor: 'pointer' }}
        >
            {/* ── Image ── */}
            <ImageWrap>
                <SafeImage src={project.image} alt={title} className="card-image"
                    sx={{ filter: `brightness(${dk ? 0.85 : 0.93})` }}
                />
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.4) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Badges */}
                <GlassBadge sx={{ top: 10, ...(isEn ? { left: 10 } : { right: 10 }) }}>
                    <i className="fa-solid fa-tag" style={{ fontSize: '0.75rem' }} />
                    {prog}
                </GlassBadge>
                <GlassBadge sx={{ top: 10, ...(isEn ? { right: 10 } : { left: 10 }) }}>
                    <i className="fa-solid fa-hourglass-half" style={{ fontSize: '0.75rem' }} />
                    {project.daysLeft} {loc('يوم', 'days')}
                </GlassBadge>

                {/* Hover overlay — fade in on image hover only */}
                <HoverOverlay className="hover-overlay">
                    <Box sx={{
                        px: 2.5, py: 0.8,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.35)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        letterSpacing: '0.03em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        userSelect: 'none',
                    }}>
                        <i className="fa-solid fa-eye" style={{ fontSize: '0.8rem' }} />
                        {loc('التفاصيل', 'Details')}
                    </Box>
                </HoverOverlay>
            </ImageWrap>

            {/* ── Body ── */}
            <CardContent sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                p: '18px !important',
                '&:last-child': { pb: '18px !important' },
                direction: isEn ? 'ltr' : 'rtl',
            }}>
                {/* Title */}
                <Typography sx={{
                    fontWeight: 800, fontSize: '1.05rem',
                    fontFamily: ARABIC_FONT,
                    color: dk ? DARK_HEAD : '#2d3436',
                    lineHeight: 1.45, mb: 0.6,
                    height: 50, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                    {title}
                </Typography>

                {/* Description */}
                <Typography sx={{
                    fontFamily: ARABIC_FONT,
                    fontSize: '0.85rem', lineHeight: 1.65,
                    color: dk ? alpha(DARK_TEXT, 0.65) : '#636e72',
                    mb: 1.4,
                    height: 42, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                    {desc}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                    {/* Donation amount badge */}
                    {project.donationAmount && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 0.8, mb: 1.2,
                            py: 0.8, px: 1.5,
                            borderRadius: '12px',
                            bgcolor: dk ? 'rgba(0,177,106,0.10)' : '#f0faf5',
                            border: `1px solid ${dk ? 'rgba(0,177,106,0.20)' : '#d1f2e4'}`,
                        }}>
                            <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: '0.85rem', color: G_GREEN }} />
                            <Typography sx={{
                                fontFamily: ARABIC_FONT, fontWeight: 800,
                                fontSize: '0.95rem', color: G_GREEN,
                            }}>
                                {formatNumber(project.donationAmount)}
                            </Typography>
                            <Typography sx={{
                                fontFamily: ARABIC_FONT, fontWeight: 500,
                                fontSize: '0.7rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#636e72',
                            }}>
                                {loc('جنية مصري', 'EGP')}
                            </Typography>
                        </Box>
                    )}

                    {/* Raised / Goal row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                        <Typography sx={{ fontWeight: 800, color: G_GREEN, fontSize: '0.95rem', fontFamily: ARABIC_FONT }}>
                            {formatCurrency(project.raised)}
                        </Typography>
                        {/* % badge */}
                        <Box sx={{
                            bgcolor: dk ? 'rgba(0,177,106,0.15)' : '#e6f7ef',
                            color: G_GREEN,
                            fontWeight: 800, fontSize: '0.72rem',
                            borderRadius: '999px',
                            px: 1, py: 0.25,
                            fontFamily: LATIN_FONT,
                        }}>
                            {pct}%
                        </Box>
                        <Typography sx={{ color: dk ? alpha(DARK_TEXT, 0.5) : '#636e72', fontSize: '0.75rem', fontFamily: ARABIC_FONT }}>
                            {loc('الهدف:', 'Goal:')} {formatCurrency(project.goal)}
                        </Typography>
                    </Box>

                    {/* LinearProgress — 8px, #00b16a */}
                    <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                            height: 8, borderRadius: 4, mb: 1.8,
                            bgcolor: dk ? 'rgba(255,255,255,0.07)' : '#e6f7ef',
                            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: G_GREEN },
                        }}
                    />

                    {/* Stats row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <i className="fa-solid fa-users" style={{ fontSize: '0.78rem', color: G_GREEN }} />
                            <Typography sx={{ fontFamily: ARABIC_FONT, color: dk ? '#94a3b8' : '#636e72', fontSize: '0.8rem' }}>
                                {formatNumber(project.donors)} {loc('متبرع', 'donors')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <i className="fa-solid fa-clock" style={{ fontSize: '0.78rem', color: G_GREEN }} />
                            <Typography sx={{ fontFamily: ARABIC_FONT, color: dk ? '#94a3b8' : '#636e72', fontSize: '0.8rem' }}>
                                {project.daysLeft} {loc('يوم', 'days left')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Footer: donate */}
                    <Button
                        variant="contained"
                        fullWidth
                        className="donate-btn"
                        onClick={(e) => { e.stopPropagation(); onDonate(project); }}
                        sx={{
                            borderRadius: '12px !important', py: 1,
                            fontFamily: ARABIC_FONT,
                            fontWeight: 700, fontSize: '0.9rem',
                            textTransform: 'none',
                            bgcolor: G_GREEN, color: '#fff',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: `0 4px 14px ${alpha(G_GREEN, 0.30)}`,
                            transition: 'all 0.3s ease-out',
                            '&:hover': {
                                bgcolor: G_GREEN_DK,
                                transform: 'scale(1.03)',
                                boxShadow: `0 8px 22px ${alpha(G_GREEN, 0.42)}`,
                            },
                            '&:active': { transform: 'scale(0.97)' },
                            '& .btn-default': {
                                transition: 'opacity 700ms ease, transform 700ms ease',
                                opacity: 1, transform: 'translateY(0)', display: 'block',
                            },
                            '&:hover .btn-default': { opacity: 0, transform: 'translateY(-7px)' },
                            '& .btn-hover': {
                                position: 'absolute',
                                top: '50%', left: '50%',
                                transform: 'translate(-50%, calc(-50% + 7px))',
                                transition: 'opacity 700ms ease, transform 700ms ease',
                                opacity: 0, whiteSpace: 'nowrap',
                            },
                            '&:hover .btn-hover': {
                                opacity: 1,
                                transform: 'translate(-50%, -50%)',
                            },
                        }}
                    >
                        <span className="btn-default">{loc('تبرع الآن', 'Donate Now')}</span>
                        <span className="btn-hover">{loc('ساهم بالخير', 'Contribute Good')}</span>
                    </Button>
                </Box>
            </CardContent>
        </CampaignCard>
    );
}

// ═══════════════════════════════════════════════════════════════
//  WALLET DATA
// ═══════════════════════════════════════════════════════════════

const WALLETS = [
    { id: 'vodafone', name: 'فودافون كاش', nameEn: 'Vodafone Cash', color: '#e60000', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/vodafone.svg' },
    { id: 'orange', name: 'أورانج كاش', nameEn: 'Orange Cash', color: '#ff6600', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/orange.svg' },
    { id: 'etisalat', name: 'اتصالات كاش', nameEn: 'Etisalat Cash', color: '#00a651', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/etisalat.svg' },
    { id: 'we', name: 'وي كاش', nameEn: 'WE Cash', color: '#7b2d8e', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/we.svg' },
];

// ═══════════════════════════════════════════════════════════════
//  QUICK DONATE MODAL (Multi-step)
// ═══════════════════════════════════════════════════════════════

function QuickDonateModal({ open, onClose, project }) {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const isEn = getLanguage() === 'en';

    // Step: 'info' → 'method' → 'card' | 'wallet' → 'success'
    const [step, setStep] = useState('info');
    const [quantity, setQuantity] = useState(1);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Payment
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [walletPhone, setWalletPhone] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Errors
    const [errors, setErrors] = useState({});

    const amount = project?.donationAmount || 0;
    const total = amount * quantity;

    const handleClose = () => {
        setStep('info');
        setQuantity(1);
        setName('');
        setPhone('');
        setSelectedWallet(null);
        setWalletPhone('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardHolder('');
        setErrors({});
        onClose();
    };

    // ── Validation ──
    const validateInfo = () => {
        const e = {};
        if (!name.trim()) e.name = loc('الاسم مطلوب', 'Name is required');
        if (!phone.trim()) e.phone = loc('رقم الهاتف مطلوب', 'Phone is required');
        else if (!/^01[0-9]{9}$/.test(phone.trim())) e.phone = loc('رقم هاتف غير صحيح', 'Invalid phone number');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateCard = () => {
        const e = {};
        if (!cardHolder.trim()) e.cardHolder = loc('اسم حامل البطاقة مطلوب', 'Cardholder name is required');
        if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) e.cardNumber = loc('رقم بطاقة غير صحيح (16 رقم)', 'Invalid card number (16 digits)');
        if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) e.cardExpiry = loc('تاريخ غير صحيح (MM/YY)', 'Invalid date (MM/YY)');
        if (!cardCvv.match(/^\d{3,4}$/)) e.cardCvv = loc('CVV غير صحيح', 'Invalid CVV');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateWallet = () => {
        const e = {};
        if (!selectedWallet) e.wallet = loc('اختر المحفظة', 'Select a wallet');
        if (!walletPhone.trim()) e.walletPhone = loc('رقم المحفظة مطلوب', 'Wallet number required');
        else if (!/^01[0-9]{9}$/.test(walletPhone.trim())) e.walletPhone = loc('رقم غير صحيح', 'Invalid number');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    if (!project) return null;

    const title = loc(project.title, project.titleEn);

    // ── Shared input styles with smooth error transitions ──
    const fieldSx = {
        mb: 1.5,
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            fontFamily: ARABIC_FONT,
            bgcolor: dk ? 'rgba(255,255,255,0.04)' : '#fafafa',
            transition: 'all 0.4s ease',
            '& fieldset': { borderColor: dk ? 'rgba(255,255,255,0.10)' : '#e0e0e0', transition: 'border-color 0.4s ease' },
            '&:hover fieldset': { borderColor: alpha(G_GREEN, 0.4) },
            '&.Mui-focused fieldset': { borderColor: G_GREEN },
            '&.Mui-error fieldset': { borderColor: '#e57373', transition: 'border-color 0.4s ease' },
        },
        '& .MuiFormHelperText-root': {
            fontFamily: ARABIC_FONT,
            fontSize: '0.72rem',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            opacity: 1,
            transform: 'translateY(0)',
            animation: `${fadeInUp} 0.35s ease both`,
        },
    };

    // ── Header titles per step ──
    const stepTitles = {
        info: loc('تبرع سريع', 'Quick Donate'),
        method: loc('اختار طريقة الدفع', 'Choose Payment Method'),
        card: loc('بطاقة بنكية', 'Bank Card'),
        wallet: loc('المحفظة الإلكترونية', 'Mobile Wallet'),
        success: loc('تم بنجاح!', 'Success!'),
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                    bgcolor: dk ? DARK_CARD : '#fff',
                    direction: isEn ? 'ltr' : 'rtl',
                },
            }}
            BackdropProps={{
                sx: {
                    bgcolor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(6px)',
                },
            }}
        >
            {/* ── Header ── */}
            <Box sx={{
                background: step === 'success'
                    ? `linear-gradient(135deg, ${G_GREEN} 0%, ${EMERALD_DK} 100%)`
                    : `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 100%)`,
                px: 2, py: 2,
                transition: 'background 0.4s ease',
            }}>
                {/* Top row: back / close buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    {/* Back button (or empty spacer) */}
                    {step !== 'info' && step !== 'success' ? (
                        <IconButton
                            onClick={() => {
                                setErrors({});
                                if (step === 'method') setStep('info');
                                else if (step === 'card' || step === 'wallet') setStep('method');
                            }}
                            size="small"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                width: 32, height: 32,
                                transition: 'all 0.25s ease',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.1)' },
                            }}
                        >
                            <i className={`fa-solid fa-arrow-${isEn ? 'left' : 'right'}`} style={{ fontSize: '0.8rem' }} />
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 32 }} />
                    )}

                    {/* Close button */}
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            color: '#fff',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            width: 32, height: 32,
                            transition: 'all 0.25s ease',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.30)', transform: 'scale(1.1)' },
                        }}
                    >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.9rem' }} />
                    </IconButton>
                </Box>

                {/* Title */}
                <Typography sx={{
                    color: '#fff', fontFamily: ARABIC_FONT,
                    fontWeight: 800, fontSize: '1.1rem', mb: 0.3,
                }}>
                    {stepTitles[step]}
                </Typography>
                <Typography sx={{
                    color: 'rgba(255,255,255,0.65)', fontFamily: ARABIC_FONT,
                    fontSize: '0.8rem', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {step === 'success' ? loc('شكراً لتبرعك', 'Thank you for your donation') : title}
                </Typography>
            </Box>

            <DialogContent sx={{ p: 2.5, pt: 2.5 }}>

                {/* ════════════════════════════════════════════════ */}
                {/* STEP: INFO                                      */}
                {/* ════════════════════════════════════════════════ */}
                {step === 'info' && (
                    <>
                        {/* Donation Amount */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 1, mb: 2.5, py: 1.5, px: 2,
                            borderRadius: '16px',
                            bgcolor: dk ? 'rgba(0,177,106,0.08)' : '#f0faf5',
                            border: `1.5px solid ${dk ? 'rgba(0,177,106,0.20)' : '#d1f2e4'}`,
                        }}>
                            <i className="fa-solid fa-coins" style={{ fontSize: '1.2rem', color: G_GREEN }} />
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.4rem', color: G_GREEN }}>
                                {formatNumber(amount)}
                            </Typography>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.75rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#636e72' }}>
                                {loc('جنية مصري', 'EGP')}
                            </Typography>
                        </Box>

                        {/* Quantity */}
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.85rem', color: dk ? DARK_HEAD : '#2d3436', mb: 1 }}>
                            {loc('الكمية', 'Quantity')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2.5 }}>
                            <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{
                                width: 40, height: 40, borderRadius: '12px',
                                border: `1.5px solid ${dk ? 'rgba(255,255,255,0.12)' : '#e0e0e0'}`,
                                bgcolor: dk ? 'rgba(255,255,255,0.04)' : '#fafafa', color: dk ? DARK_TEXT : '#333',
                                '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f0f0f0' },
                            }}>
                                <i className="fa-solid fa-minus" style={{ fontSize: '0.8rem' }} />
                            </IconButton>
                            <Typography sx={{ fontFamily: LATIN_FONT, fontWeight: 800, fontSize: '1.5rem', color: dk ? DARK_HEAD : '#2d3436', minWidth: 50, textAlign: 'center' }}>
                                {quantity}
                            </Typography>
                            <IconButton onClick={() => setQuantity(quantity + 1)} sx={{
                                width: 40, height: 40, borderRadius: '12px',
                                border: `1.5px solid ${dk ? 'rgba(0,177,106,0.30)' : '#d1f2e4'}`,
                                bgcolor: dk ? 'rgba(0,177,106,0.08)' : '#f0faf5', color: G_GREEN,
                                '&:hover': { bgcolor: dk ? 'rgba(0,177,106,0.15)' : '#e0f5ec' },
                            }}>
                                <i className="fa-solid fa-plus" style={{ fontSize: '0.8rem' }} />
                            </IconButton>
                        </Box>

                        {/* Contact Info */}
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.85rem', color: dk ? DARK_HEAD : '#2d3436', mb: 1 }}>
                            {loc('بيانات التواصل', 'Contact Information')}
                        </Typography>
                        <TextField
                            placeholder={loc('الاسم الكامل', 'Full Name')} fullWidth value={name}
                            onChange={(e) => setName(e.target.value)} size="small"
                            error={!!errors.name} helperText={errors.name}
                            InputProps={{ startAdornment: <InputAdornment position="start"><i className="fa-solid fa-user" style={{ fontSize: '0.8rem', color: G_GREEN }} /></InputAdornment> }}
                            sx={fieldSx}
                        />
                        <TextField
                            placeholder={loc('رقم الهاتف', 'Phone Number')} fullWidth value={phone}
                            onChange={(e) => setPhone(e.target.value)} size="small"
                            error={!!errors.phone} helperText={errors.phone}
                            InputProps={{ startAdornment: <InputAdornment position="start"><i className="fa-solid fa-phone" style={{ fontSize: '0.8rem', color: G_GREEN }} /></InputAdornment> }}
                            sx={{ ...fieldSx, mb: 2.5 }}
                        />

                        {/* Payment Button */}
                        <Button variant="contained" fullWidth onClick={() => { if (validateInfo()) setStep('method'); }}
                            sx={{
                                borderRadius: '14px', py: 1.4, fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.95rem',
                                textTransform: 'none', bgcolor: G_GREEN, color: '#fff',
                                boxShadow: `0 6px 20px ${alpha(G_GREEN, 0.35)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': { bgcolor: G_GREEN_DK, boxShadow: `0 10px 28px ${alpha(G_GREEN, 0.45)}`, transform: 'translateY(-1px)' },
                                '&:active': { transform: 'scale(0.98)' },
                            }}
                        >
                            <span>{loc('اختار طريقة الدفع', 'Choose Payment Method')}</span>
                            <Box component="span" sx={{
                                bgcolor: 'rgba(255,255,255,0.20)', borderRadius: '10px', px: 1.2, py: 0.3,
                                fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            }}>
                                {formatNumber(total)}
                                <Typography component="span" sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.6rem', opacity: 0.85 }}>
                                    {loc('جنية مصري', 'EGP')}
                                </Typography>
                            </Box>
                        </Button>
                    </>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* STEP: METHOD SELECTION                          */}
                {/* ════════════════════════════════════════════════ */}
                {step === 'method' && (
                    <>
                        {/* Total summary */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 1, mb: 3, py: 1, px: 2, borderRadius: '12px',
                            bgcolor: dk ? 'rgba(0,177,106,0.06)' : '#f5fcf8',
                            border: `1px solid ${dk ? 'rgba(0,177,106,0.15)' : '#e0f5ec'}`,
                        }}>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.85rem', color: dk ? DARK_TEXT : '#555' }}>
                                {loc('المبلغ الإجمالي:', 'Total:')}
                            </Typography>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.1rem', color: G_GREEN }}>
                                {formatNumber(total)}
                            </Typography>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.65rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#888' }}>
                                {loc('جنية مصري', 'EGP')}
                            </Typography>
                        </Box>

                        {/* Bank Card Option */}
                        <Box
                            onClick={() => { setErrors({}); setStep('card'); }}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 2,
                                p: 2, mb: 1.5, borderRadius: '16px', cursor: 'pointer',
                                border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e8e8e8'}`,
                                bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fff',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    borderColor: G_GREEN,
                                    bgcolor: dk ? 'rgba(0,177,106,0.06)' : '#f0faf5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${alpha(G_GREEN, 0.12)}`,
                                },
                            }}
                        >
                            <Box sx={{
                                width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #1a237e, #283593)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <i className="fa-solid fa-credit-card" style={{ fontSize: '1.3rem', color: '#fff' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.95rem', color: dk ? DARK_HEAD : '#2d3436' }}>
                                    {loc('بطاقة بنكية', 'Bank Card')}
                                </Typography>
                                <Typography sx={{ fontFamily: ARABIC_FONT, fontSize: '0.72rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#888' }}>
                                    {loc('فيزا، ماستركارد، ميزة', 'Visa, Mastercard, Meeza')}
                                </Typography>
                            </Box>
                            <i className={`fa-solid fa-chevron-${isEn ? 'right' : 'left'}`} style={{ fontSize: '0.75rem', color: dk ? alpha(DARK_TEXT, 0.3) : '#bbb' }} />
                        </Box>

                        {/* Mobile Wallet Option */}
                        <Box
                            onClick={() => { setErrors({}); setStep('wallet'); }}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 2,
                                p: 2, borderRadius: '16px', cursor: 'pointer',
                                border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e8e8e8'}`,
                                bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fff',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    borderColor: G_GREEN,
                                    bgcolor: dk ? 'rgba(0,177,106,0.06)' : '#f0faf5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${alpha(G_GREEN, 0.12)}`,
                                },
                            }}
                        >
                            <Box sx={{
                                width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #e65100, #f57c00)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <i className="fa-solid fa-wallet" style={{ fontSize: '1.3rem', color: '#fff' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.95rem', color: dk ? DARK_HEAD : '#2d3436' }}>
                                    {loc('المحفظة الإلكترونية', 'Mobile Wallet')}
                                </Typography>
                                <Typography sx={{ fontFamily: ARABIC_FONT, fontSize: '0.72rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#888' }}>
                                    {loc('فودافون، أورانج، اتصالات، وي', 'Vodafone, Orange, Etisalat, WE')}
                                </Typography>
                            </Box>
                            <i className={`fa-solid fa-chevron-${isEn ? 'right' : 'left'}`} style={{ fontSize: '0.75rem', color: dk ? alpha(DARK_TEXT, 0.3) : '#bbb' }} />
                        </Box>
                    </>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* STEP: BANK CARD FORM                            */}
                {/* ════════════════════════════════════════════════ */}
                {step === 'card' && (
                    <>
                        {/* Card icons */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2.5 }}>
                            {['fa-cc-visa', 'fa-cc-mastercard', 'fa-cc-amex'].map((icon) => (
                                <i key={icon} className={`fa-brands ${icon}`} style={{ fontSize: '2rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#999' }} />
                            ))}
                        </Box>

                        <TextField
                            placeholder={loc('اسم حامل البطاقة', 'Cardholder Name')} fullWidth value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)} size="small"
                            error={!!errors.cardHolder} helperText={errors.cardHolder}
                            InputProps={{ startAdornment: <InputAdornment position="start"><i className="fa-solid fa-user" style={{ fontSize: '0.8rem', color: '#1a237e' }} /></InputAdornment> }}
                            sx={fieldSx}
                        />
                        <TextField
                            placeholder={loc('رقم البطاقة', 'Card Number')} fullWidth value={cardNumber}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                            }}
                            size="small" error={!!errors.cardNumber} helperText={errors.cardNumber}
                            InputProps={{ startAdornment: <InputAdornment position="start"><i className="fa-solid fa-credit-card" style={{ fontSize: '0.8rem', color: '#1a237e' }} /></InputAdornment> }}
                            sx={{ ...fieldSx, '& input': { letterSpacing: '0.15em', fontFamily: LATIN_FONT, direction: 'ltr' } }}
                        />
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                                placeholder="MM/YY" fullWidth value={cardExpiry}
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                    setCardExpiry(v);
                                }}
                                size="small" error={!!errors.cardExpiry} helperText={errors.cardExpiry}
                                sx={{ ...fieldSx, '& input': { textAlign: 'center', fontFamily: LATIN_FONT, direction: 'ltr' } }}
                            />
                            <TextField
                                placeholder="CVV" fullWidth value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                type="password" size="small" error={!!errors.cardCvv} helperText={errors.cardCvv}
                                sx={{ ...fieldSx, '& input': { textAlign: 'center', fontFamily: LATIN_FONT, direction: 'ltr' } }}
                            />
                        </Box>

                        <Button variant="contained" fullWidth
                            onClick={() => { if (validateCard()) setStep('success'); }}
                            sx={{
                                mt: 1, borderRadius: '14px', py: 1.4, fontFamily: ARABIC_FONT, fontWeight: 700,
                                fontSize: '0.95rem', textTransform: 'none',
                                bgcolor: '#1a237e', color: '#fff',
                                boxShadow: '0 6px 20px rgba(26,35,126,0.30)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': { bgcolor: '#0d1451', transform: 'translateY(-1px)' },
                            }}
                        >
                            <i className="fa-solid fa-lock" style={{ fontSize: '0.8rem' }} />
                            <span>{loc('ادفع الآن', 'Pay Now')}</span>
                            <Box component="span" sx={{
                                bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '10px', px: 1.2, py: 0.3,
                                fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            }}>
                                {formatNumber(total)}
                                <Typography component="span" sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.6rem', opacity: 0.85 }}>
                                    {loc('جنية مصري', 'EGP')}
                                </Typography>
                            </Box>
                        </Button>
                    </>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* STEP: MOBILE WALLET                             */}
                {/* ════════════════════════════════════════════════ */}
                {step === 'wallet' && (
                    <>
                        {/* Wallet selection */}
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.85rem', color: dk ? DARK_HEAD : '#2d3436', mb: 1.5 }}>
                            {loc('اختر المحفظة', 'Select Wallet')}
                        </Typography>
                        {errors.wallet && (
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontSize: '0.75rem', color: '#d32f2f', mb: 1 }}>
                                {errors.wallet}
                            </Typography>
                        )}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mb: 2.5 }}>
                            {WALLETS.map((w) => {
                                const sel = selectedWallet === w.id;
                                return (
                                    <Box
                                        key={w.id}
                                        onClick={() => { setSelectedWallet(w.id); setErrors({}); }}
                                        sx={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            gap: 0.8, p: 1.5, borderRadius: '14px', cursor: 'pointer',
                                            border: `2px solid ${sel ? w.color : (dk ? 'rgba(255,255,255,0.08)' : '#e8e8e8')}`,
                                            bgcolor: sel ? alpha(w.color, dk ? 0.12 : 0.06) : (dk ? 'rgba(255,255,255,0.02)' : '#fff'),
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: w.color,
                                                bgcolor: alpha(w.color, dk ? 0.08 : 0.04),
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={w.logoUrl}
                                            alt={w.nameEn}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                            sx={{
                                                width: 36, height: 36,
                                                objectFit: 'contain',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Typography sx={{
                                            fontFamily: ARABIC_FONT, fontWeight: 700,
                                            fontSize: '0.72rem', color: sel ? w.color : (dk ? DARK_TEXT : '#555'),
                                            textAlign: 'center',
                                        }}>
                                            {loc(w.name, w.nameEn)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Wallet phone number */}
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.85rem', color: dk ? DARK_HEAD : '#2d3436', mb: 1 }}>
                            {loc('رقم المحفظة', 'Wallet Number')}
                        </Typography>
                        <TextField
                            placeholder={loc('مثال: 01xxxxxxxxx', 'e.g. 01xxxxxxxxx')} fullWidth value={walletPhone}
                            onChange={(e) => setWalletPhone(e.target.value)} size="small"
                            error={!!errors.walletPhone} helperText={errors.walletPhone}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="fa-solid fa-mobile-screen" style={{
                                            fontSize: '0.9rem',
                                            color: selectedWallet ? WALLETS.find(w => w.id === selectedWallet)?.color : G_GREEN,
                                        }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ ...fieldSx, mb: 2.5, '& input': { fontFamily: LATIN_FONT, direction: 'ltr' } }}
                        />

                        <Button variant="contained" fullWidth
                            onClick={() => { if (validateWallet()) setStep('success'); }}
                            sx={{
                                borderRadius: '14px', py: 1.4, fontFamily: ARABIC_FONT, fontWeight: 700,
                                fontSize: '0.95rem', textTransform: 'none',
                                bgcolor: selectedWallet ? WALLETS.find(w => w.id === selectedWallet)?.color : G_GREEN,
                                color: '#fff',
                                boxShadow: `0 6px 20px ${alpha(selectedWallet ? WALLETS.find(w => w.id === selectedWallet)?.color || G_GREEN : G_GREEN, 0.30)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': { filter: 'brightness(0.9)', transform: 'translateY(-1px)' },
                            }}
                        >
                            <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.8rem' }} />
                            <span>{loc('تأكيد الدفع', 'Confirm Payment')}</span>
                            <Box component="span" sx={{
                                bgcolor: 'rgba(255,255,255,0.20)', borderRadius: '10px', px: 1.2, py: 0.3,
                                fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            }}>
                                {formatNumber(total)}
                                <Typography component="span" sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.6rem', opacity: 0.85 }}>
                                    {loc('جنية مصري', 'EGP')}
                                </Typography>
                            </Box>
                        </Button>
                    </>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* STEP: SUCCESS                                   */}
                {/* ════════════════════════════════════════════════ */}
                {step === 'success' && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Box sx={{
                            width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2,
                            bgcolor: alpha(G_GREEN, 0.12),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <i className="fa-solid fa-check" style={{ fontSize: '2rem', color: G_GREEN }} />
                        </Box>
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.2rem', color: dk ? DARK_HEAD : '#2d3436', mb: 1 }}>
                            {loc('تم استلام تبرعك', 'Donation Received')}
                        </Typography>
                        <Typography sx={{ fontFamily: ARABIC_FONT, fontSize: '0.85rem', color: dk ? alpha(DARK_TEXT, 0.65) : '#636e72', mb: 0.5, lineHeight: 1.7 }}>
                            {loc('شكراً لك يا', 'Thank you,')} <strong>{name}</strong>
                        </Typography>
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.8,
                            bgcolor: dk ? 'rgba(0,177,106,0.10)' : '#f0faf5',
                            border: `1px solid ${dk ? 'rgba(0,177,106,0.20)' : '#d1f2e4'}`,
                            borderRadius: '12px', px: 2, py: 1, mb: 3,
                        }}>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.2rem', color: G_GREEN }}>
                                {formatNumber(total)}
                            </Typography>
                            <Typography sx={{ fontFamily: ARABIC_FONT, fontWeight: 500, fontSize: '0.7rem', color: dk ? alpha(DARK_TEXT, 0.5) : '#636e72' }}>
                                {loc('جنية مصري', 'EGP')}
                            </Typography>
                        </Box>
                        <br />
                        <Button variant="contained" onClick={handleClose}
                            sx={{
                                borderRadius: '14px', py: 1.2, px: 4, fontFamily: ARABIC_FONT, fontWeight: 700,
                                fontSize: '0.9rem', textTransform: 'none', bgcolor: G_GREEN, color: '#fff',
                                boxShadow: `0 6px 20px ${alpha(G_GREEN, 0.35)}`,
                                '&:hover': { bgcolor: G_GREEN_DK },
                            }}
                        >
                            {loc('إغلاق', 'Close')}
                        </Button>
                    </Box>
                )}

            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

function Campaigns() {
    const theme = useTheme();
    const dk = theme.palette.mode === 'dark';
    const isEn = getLanguage() === 'en';
    const navigate = useNavigate();

    const [activeProgram, setActiveProgram] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [donateProject, setDonateProject] = useState(null);

    const filteredProjects = projects
        .filter((p) => activeProgram === 'all' || p.programId === parseInt(activeProgram))
        .sort((a, b) => {
            if (sortBy === 'mostFunded') return (b.raised / b.goal) - (a.raised / a.goal);
            if (sortBy === 'endingSoon') return a.daysLeft - b.daysLeft;
            return b.id - a.id;
        });

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px !important',
            bgcolor: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            '& fieldset': { borderColor: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)' },
            '&:hover fieldset': { borderColor: alpha(EMERALD, 0.3) },
            '&.Mui-focused fieldset': { borderColor: EMERALD },
        },
    };

    return (
        <Box sx={{ pb: 6, bgcolor: dk ? DARK_BG : '#f8fafc', minHeight: '100vh' }}>

            {/* ════════ HERO ════════ */}
            <HeroSection>
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600, mx: 'auto', px: 2 }}>
                    <Box sx={{ width: 40, height: 3, borderRadius: 2, bgcolor: alpha('#fff', 0.3), mx: 'auto', mb: 2 }} />
                    <Typography sx={{
                        fontWeight: 900,
                        fontFamily: isEn ? LATIN_FONT : ARABIC_FONT,
                        animation: `${fadeInUp} 0.5s ease both`,
                        letterSpacing: isEn ? '-0.02em' : 0,
                        mb: 1,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        color: '#fff',
                    }}>
                        {loc('الحملات الخيرية', 'Charity Campaigns')}
                    </Typography>
                    <Typography sx={{
                        fontFamily: isEn ? LATIN_FONT : ARABIC_FONT,
                        color: alpha('#fff', 0.65),
                        lineHeight: 1.7,
                        fontSize: { xs: '0.82rem', md: '0.9rem' },
                        animation: `${fadeInUp} 0.5s ease both 0.1s`,
                    }}>
                        {loc(
                            'ساهم في دعم الحملات الخيرية وكن جزءًا من التغيير',
                            'Contribute to charitable campaigns and be part of the change'
                        )}
                    </Typography>
                </Box>
            </HeroSection>

            {/* ════════ WAVE ════════ */}
            <WaveDivider>
                <svg viewBox="0 0 1200 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,0 C300,36 900,0 1200,36 L1200,36 L0,36 Z" />
                </svg>
            </WaveDivider>

            {/* ════════ FILTER BAR ════════ */}
            <Container maxWidth="lg" disableGutters={false} sx={{ px: { xs: 2, md: 3 } }}>
                <FilterBar>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0 }}>
                        {/* Sort dropdown — right side */}
                        <TextField select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            size="small" sx={{ minWidth: 140, ...inputSx }}
                        >
                            <MenuItem value="newest">{loc('الأحدث', 'Newest')}</MenuItem>
                            <MenuItem value="mostFunded">{loc('الأكثر تمويلاً', 'Most Funded')}</MenuItem>
                            <MenuItem value="endingSoon">{loc('ينتهي قريباً', 'Ending Soon')}</MenuItem>
                        </TextField>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        <Chip
                            label={loc('الكل', 'All')}
                            icon={<i className="fa-solid fa-layer-group" style={{ fontSize: '0.72rem' }} />}
                            onClick={() => setActiveProgram('all')}
                            size="small"
                            sx={{
                                fontWeight: 700, borderRadius: '999px !important', fontSize: '0.82rem',
                                px: 0.5,
                                bgcolor: activeProgram === 'all' ? EMERALD : (dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                                color: activeProgram === 'all' ? '#fff' : (dk ? DARK_TEXT : '#374151'),
                                border: 'none', transition: 'all 200ms ease',
                                '&:hover': { bgcolor: activeProgram === 'all' ? EMERALD_DK : alpha(EMERALD, 0.12) },
                            }}
                        />
                        {programs.map((prog) => (
                            <Chip
                                key={prog.id}
                                label={loc(prog.name, prog.nameEn)}
                                icon={<i className={prog.icon} style={{ fontSize: '0.72rem' }} />}
                                onClick={() => setActiveProgram(String(prog.id))}
                                size="small"
                                sx={{
                                    fontWeight: 600, borderRadius: '999px !important', fontSize: '0.82rem',
                                    px: 0.5,
                                    bgcolor: activeProgram === String(prog.id) ? EMERALD : (dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                                    color: activeProgram === String(prog.id) ? '#fff' : (dk ? DARK_TEXT : '#374151'),
                                    border: 'none', transition: 'all 200ms ease',
                                    '&:hover': { bgcolor: activeProgram === String(prog.id) ? EMERALD_DK : alpha(EMERALD, 0.12) },
                                }}
                            />
                        ))}
                    </Box>
                </FilterBar>
            </Container>

            {/* ════════ CAMPAIGN CARDS ════════ */}
            <Container maxWidth="lg" sx={{ mt: 6, px: { xs: 2, md: 3 } }}>
                {filteredProjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography sx={{ fontSize: '3rem', mb: 1 }}>🔍</Typography>
                        <Typography sx={{ fontWeight: 700, color: dk ? DARK_HEAD : 'text.primary', mb: 0.5 }}>
                            {loc('لا توجد نتائج', 'No results found')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: dk ? DARK_TEXT : 'text.secondary', mb: 2 }}>
                            {loc('جرّب تغيير كلمات البحث أو الفلاتر', 'Try changing your search or filters')}
                        </Typography>
                        <Button variant="outlined" size="small" onClick={() => setActiveProgram('all')}
                            sx={{ borderRadius: 999, px: 3, borderColor: EMERALD, color: EMERALD }}>
                            {loc('عرض الكل', 'Show All')}
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: { xs: 2, md: 3 },
                        overflow: 'visible',
                        pb: 4,
                    }}>
                        {filteredProjects.map((project, i) => (
                            <Box key={project.id} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                overflow: 'visible',
                            }}>
                                <CampaignCardItem
                                    project={project}
                                    index={i}
                                    onClick={(p) => navigate(`/campaigns/${p.id}`)}
                                    onDonate={(p) => setDonateProject(p)}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>

            {/* ════════ QUICK DONATE MODAL ════════ */}
            <QuickDonateModal
                open={!!donateProject}
                onClose={() => setDonateProject(null)}
                project={donateProject}
            />
        </Box>
    );
}

export default Campaigns;
export { QuickDonateModal, CampaignCardItem };

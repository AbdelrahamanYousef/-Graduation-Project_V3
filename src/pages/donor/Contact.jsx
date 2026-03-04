import { useState, useRef } from 'react';
import { t, getLanguage } from '../../i18n';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    Stack,
    Paper,
    IconButton,
    alpha,
    CircularProgress,
    Snackbar,
    Alert,
    Slide,
    RadioGroup,
    FormControlLabel,
    Radio,
    InputAdornment,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS  (matching Campaigns page tokens)
   ═══════════════════════════════════════════════════════════════ */
const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const TEAL_DARK = '#0a1f1c';
const G_GREEN = '#00b16a';
const G_GREEN_DK = '#009659';

const DARK_BG = '#0f172a';
const CONTENT_BG = '#f8fafc';

/* ═══════════════════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
`;
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-14px) rotate(2deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
`;

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const CARD_RADIUS = 24;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TRANSITION = `transform 350ms ${EASE}, box-shadow 350ms ${EASE}, border-color 250ms ease, background-color 250ms ease`;

const tokens = (theme) => {
    const dk = theme.palette.mode === 'dark';
    return {
        contentBg: dk ? DARK_BG : CONTENT_BG,
        cardBg: dk ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.82)',
        cardBorder: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        cardShadow: dk
            ? `0 8px 40px rgba(0,0,0,0.35)`
            : `0 4px 32px rgba(0,0,0,0.06)`,
        cardHoverShadow: dk
            ? `0 16px 56px rgba(0,0,0,0.45)`
            : `0 12px 44px rgba(0,0,0,0.10)`,
        infoBg: dk ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255,255,255,0.80)',
        infoBorder: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        infoHoverShadow: dk
            ? `0 12px 36px rgba(0,0,0,0.40)`
            : `0 10px 32px rgba(0,0,0,0.10)`,
        inputBg: dk ? 'rgba(255,255,255,0.04)' : '#fafafa',
        inputBorder: dk ? 'rgba(255,255,255,0.10)' : '#e0e0e0',
        sectionLabel: dk ? alpha(G_GREEN, 0.85) : TEAL,
        iconGradient1: dk ? G_GREEN : TEAL,
        iconGradient2: dk ? '#059669' : '#0d7c65',
        glass: dk ? 'saturate(1.2) blur(20px)' : 'saturate(1.4) blur(24px)',
    };
};

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════════════════════ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (v) => !v || EMAIL_RE.test(v);
const isPhoneValid = (v) => { const s = v.trim(); return !s || /^\d{10,15}$/.test(s); };

/* ═══════════════════════════════════════════════════════════════
   STYLED: HERO  (mirrors Campaigns HeroSection)
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   STYLED: WAVE DIVIDER  (mirrors Campaigns WaveDivider)
   ═══════════════════════════════════════════════════════════════ */
const WaveDivider = styled(Box)(({ theme }) => ({
    marginTop: -1,
    lineHeight: 0,
    '& svg': {
        display: 'block',
        width: '100%',
        height: 36,
        fill: theme.palette.mode === 'dark' ? DARK_BG : CONTENT_BG,
    },
}));

/* ═══════════════════════════════════════════════════════════════
   STYLED: SOCIAL ICON
   ═══════════════════════════════════════════════════════════════ */
const SocialLink = styled(IconButton)(({ theme, color }) => ({
    width: 48, height: 48, fontSize: '1.15rem',
    color: theme.palette.common.white,
    backgroundColor: color,
    transition: TRANSITION,
    '&:hover': {
        backgroundColor: color,
        transform: 'translateY(-3px) scale(1.08)',
        boxShadow: `0 8px 22px ${alpha(color || '#333', 0.45)}`,
    },
    '&:active': { transform: 'translateY(-1px) scale(1.02)' },
}));

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADING  (icon badge + label + line)
   ═══════════════════════════════════════════════════════════════ */
const SectionHeading = ({ icon, label, tk, delay = 0 }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5,
        opacity: 0, animation: `${fadeInUp} 0.5s ease forwards ${delay}s`,
        animationFillMode: 'forwards',
    }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: (t) => `linear-gradient(135deg, ${tk.iconGradient1}, ${tk.iconGradient2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, flexShrink: 0,
            boxShadow: `0 3px 10px ${alpha(tk.iconGradient1, 0.30)}`,
        }}>
            <i className={icon}></i>
        </Box>
        <Typography variant="subtitle1" sx={{
            fontWeight: 700, color: tk.sectionLabel,
            fontSize: '0.95rem', letterSpacing: '0.01em',
        }}>
            {label}
        </Typography>
        <Box sx={{ flex: 1, height: 1, backgroundColor: tk.infoBorder, borderRadius: 1 }} />
    </Box>
);

/* ═══════════════════════════════════════════════════════════════
   CONTACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function Contact() {
    const containerRef = useRef(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isRTL = theme.direction === 'rtl';
    const tk = tokens(theme);

    /* ─── State ──────────────────────────────────────────── */
    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: '', preferredContact: '',
    });
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
    const handleSnackbarClose = (_, r) => { if (r !== 'clickaway') setSnackbar(p => ({ ...p, open: false })); };

    /* ─── Validation ─────────────────────────────────────── */
    const handleBlur = (f) => setTouched(p => ({ ...p, [f]: true }));
    const getError = (f) => {
        if (!touched[f]) return false;
        if (f === 'name') return !form.name || form.name.trim().length < 3;
        if (f === 'email') return !form.email || !isEmailValid(form.email);
        if (f === 'phone') return form.phone.trim() !== '' && !isPhoneValid(form.phone);
        if (f === 'subject') return !form.subject || form.subject.trim().length < 3;
        if (f === 'message') return !form.message || form.message.trim().length < 10;
        return false;
    };
    const getHelper = (f) => {
        if (!getError(f)) return ' ';
        if (f === 'name') return !form.name.trim() ? t('contact.form.errors.nameRequired') : t('contact.form.errors.nameMin');
        if (f === 'email') return !form.email.trim() ? t('contact.form.errors.emailRequired') : t('contact.form.errors.emailInvalid');
        if (f === 'phone') return t('contact.form.errors.phoneInvalid');
        if (f === 'subject') return !form.subject.trim() ? t('contact.form.errors.subjectRequired') : t('contact.form.errors.subjectMin');
        if (f === 'message') return !form.message.trim() ? t('contact.form.errors.messageRequired') : t('contact.form.errors.messageMin');
        return ' ';
    };

    /* ─── Submit ──────────────────────────────────────────── */
    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, phone: true, subject: true, message: true });
        const hasErr = [
            !form.name || form.name.trim().length < 3,
            !form.email || !isEmailValid(form.email),
            form.phone.trim() !== '' && !isPhoneValid(form.phone),
            !form.subject || form.subject.trim().length < 3,
            !form.message || form.message.trim().length < 10,
        ].some(Boolean);
        if (hasErr) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setForm({ name: '', email: '', phone: '', subject: '', message: '', preferredContact: '' });
            setTouched({});
            setSnackbar({ open: true, severity: 'success', message: t('contact.messageSent') });
        }, 1200);
    };

    /* ─── Data ────────────────────────────────────────────── */
    const contactInfo = [
        { icon: 'fa-solid fa-location-dot', label: t('contact.addressLabel'), value: t('contact.info.address'), gradient: `linear-gradient(135deg, ${TEAL}, #0d7c65)` },
        { icon: 'fa-solid fa-phone', label: t('contact.phoneLabel'), value: t('contact.info.phone'), gradient: `linear-gradient(135deg, #12355B, #1a5a96)` },
        { icon: 'fa-solid fa-envelope', label: t('contact.emailLabel'), value: t('contact.info.email'), gradient: `linear-gradient(135deg, ${G_GREEN}, #059669)` },
        { icon: 'fa-solid fa-clock', label: t('contact.workHoursLabel'), value: t('contact.info.workHours'), gradient: `linear-gradient(135deg, ${TEAL_MID}, ${TEAL})` },
    ];
    const socialColors = {
        facebook: '#1877F2', twitter: '#1DA1F2',
        instagram: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
        whatsapp: '#25D366',
    };

    /* ─── Input shared sx ────────────────────────────────── */
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: tk.inputBg, borderRadius: '12px', minHeight: 52,
            transition: 'all 0.3s ease',
            '& fieldset': { borderColor: tk.inputBorder, transition: 'border-color 0.3s ease' },
            '&:hover fieldset': { borderColor: alpha(G_GREEN, 0.4) },
            '&.Mui-focused fieldset': { borderColor: G_GREEN, boxShadow: `0 0 0 3px ${alpha(G_GREEN, 0.10)}` },
            '&.Mui-error fieldset': { borderWidth: '1px', boxShadow: `0 0 0 3px ${alpha('#e57373', 0.08)}` },
        },
        '& .MuiInputAdornment-root': {
            color: isDark ? alpha(G_GREEN, 0.6) : alpha(TEAL, 0.5),
        },
        '& .MuiFormHelperText-root': { minHeight: '1.25em', mt: 0.5, lineHeight: 1.4 },
        '& .MuiFormHelperText-root.Mui-error': { fontSize: '0.75rem', fontWeight: 500 },
    };
    const iconAdornment = (ic) => (
        <InputAdornment position="start">
            <i className={ic} style={{ fontSize: 15 }}></i>
        </InputAdornment>
    );

    /* ═══════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════ */
    return (
        <Box ref={containerRef} sx={{ backgroundColor: tk.contentBg, minHeight: '100vh' }}>

            {/* ═══════ HERO  (matches Campaigns exactly) ═══════ */}
            <HeroSection>
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600, mx: 'auto', px: 2 }}>
                    {/* Decorative line — above title (same as Campaigns) */}
                    <Box sx={{ width: 40, height: 3, borderRadius: 2, bgcolor: alpha('#fff', 0.3), mx: 'auto', mb: 2 }} />
                    <Typography sx={{
                        fontWeight: 900, mb: 1, color: '#fff',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        animation: `${fadeInUp} 0.5s ease both`,
                    }}>
                        {t('contact.title')}
                    </Typography>
                    <Typography sx={{
                        color: alpha('#fff', 0.65),
                        lineHeight: 1.7,
                        fontSize: { xs: '0.82rem', md: '0.9rem' },
                        animation: `${fadeInUp} 0.5s ease both 0.1s`,
                    }}>
                        {t('contact.subtitle')}
                    </Typography>
                </Box>
            </HeroSection>

            {/* Wave transition (same SVG as Campaigns) */}
            <WaveDivider>
                <svg viewBox="0 0 1200 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,0 C300,36 900,0 1200,36 L1200,36 L0,36 Z" />
                </svg>
            </WaveDivider>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 5, md: 8 } }}>

                {/* ── Decorative background shapes ── */}
                <Box sx={{
                    position: 'absolute', top: 60, left: '3%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: isDark
                        ? `radial-gradient(circle, ${alpha(G_GREEN, 0.06)} 0%, transparent 70%)`
                        : `radial-gradient(circle, ${alpha(TEAL, 0.05)} 0%, transparent 70%)`,
                    animation: `${float} 9s ease-in-out infinite`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
                <Box sx={{
                    position: 'absolute', bottom: 40, right: '6%',
                    width: 220, height: 220, borderRadius: '50%',
                    background: isDark
                        ? `radial-gradient(circle, ${alpha(G_GREEN, 0.04)} 0%, transparent 70%)`
                        : `radial-gradient(circle, ${alpha(TEAL, 0.04)} 0%, transparent 70%)`,
                    animation: `${float} 11s ease-in-out infinite 3s`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
                <Box sx={{
                    position: 'absolute', top: '45%', right: '25%',
                    width: 160, height: 160, borderRadius: '30%',
                    transform: 'rotate(45deg)',
                    background: isDark
                        ? `radial-gradient(circle, ${alpha(G_GREEN, 0.03)} 0%, transparent 70%)`
                        : `radial-gradient(circle, ${alpha(TEAL, 0.03)} 0%, transparent 70%)`,
                    animation: `${float} 13s ease-in-out infinite 5s`,
                    pointerEvents: 'none', zIndex: 0,
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

                    {/* Section intro text */}
                    <Box sx={{
                        textAlign: 'center', mb: { xs: 4, md: 6 },
                        opacity: 0, animation: `${fadeInUp} 0.5s ease forwards 0.2s`,
                        animationFillMode: 'forwards',
                    }}>
                        <Typography variant="h4" sx={{
                            fontWeight: 800, color: 'text.primary', mb: 1.5,
                            fontSize: { xs: '1.3rem', md: '1.6rem' },
                        }}>
                            {t('contact.description')}
                        </Typography>
                        <Typography variant="body1" sx={{
                            color: isDark ? 'rgba(226,232,240,0.6)' : 'text.secondary',
                            maxWidth: 480, mx: 'auto', lineHeight: 1.7,
                        }}>
                            {t('contact.subtitle')}
                        </Typography>
                    </Box>

                    {/* ═══════ TWO-COLUMN LAYOUT ═══════ */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 4 },
                        alignItems: 'flex-start',
                    }}>

                        {/* ══════════════════════════════════
                            COLUMN A — CONTACT INFO CARDS
                            In RTL → RIGHT side. In LTR → LEFT.
                        ══════════════════════════════════ */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '0 0 38%' },
                            width: { xs: '100%', md: '38%' },
                            order: { xs: 2, md: 1 },
                        }}>
                            <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
                                {contactInfo.map((info, i) => (
                                    <Paper
                                        key={i} elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: `${CARD_RADIUS}px`,
                                            border: `1px solid ${tk.infoBorder}`,
                                            backgroundColor: tk.infoBg,
                                            backdropFilter: tk.glass,
                                            WebkitBackdropFilter: tk.glass,
                                            boxShadow: tk.cardShadow,
                                            display: 'flex', alignItems: 'center', gap: 2.5,
                                            cursor: 'default',
                                            opacity: 0,
                                            animation: `${isRTL ? slideInRight : slideInLeft} 0.5s ease forwards ${0.35 + i * 0.1}s`,
                                            animationFillMode: 'forwards',
                                            transition: TRANSITION,
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: tk.infoHoverShadow,
                                                borderColor: alpha(G_GREEN, 0.20),
                                                '& .info-icon': { animation: `${pulse} 0.6s ease` },
                                            },
                                        }}
                                    >
                                        <Box
                                            className="info-icon"
                                            sx={{
                                                width: 54, height: 54, borderRadius: '16px',
                                                background: info.gradient,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: 21, flexShrink: 0,
                                                boxShadow: `0 4px 16px ${alpha(TEAL, 0.25)}`,
                                            }}
                                        >
                                            <i className={info.icon}></i>
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="caption" display="block" sx={{
                                                mb: 0.3, fontWeight: 600, letterSpacing: '0.04em',
                                                textTransform: 'uppercase', fontSize: '0.68rem',
                                                color: isDark ? 'rgba(226,232,240,0.50)' : 'text.secondary',
                                            }}>
                                                {info.label}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700, color: 'text.primary',
                                                wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.92rem',
                                            }}>
                                                {info.value}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}

                                {/* Social Links Card */}
                                <Paper elevation={0} sx={{
                                    p: 3, borderRadius: `${CARD_RADIUS}px`,
                                    border: `1px solid ${tk.infoBorder}`,
                                    backgroundColor: tk.infoBg,
                                    backdropFilter: tk.glass,
                                    WebkitBackdropFilter: tk.glass,
                                    boxShadow: tk.cardShadow,
                                    opacity: 0,
                                    animation: `${fadeInUp} 0.5s ease forwards 0.8s`,
                                    animationFillMode: 'forwards',
                                    transition: TRANSITION,
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: tk.infoHoverShadow },
                                }}>
                                    <Typography variant="body2" fontWeight={700} sx={{
                                        mb: 2, color: 'text.primary', fontSize: '0.9rem',
                                    }}>
                                        {t('contact.social')}
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                                        <SocialLink href="#" aria-label="Facebook" color={socialColors.facebook}>
                                            <i className="fa-brands fa-facebook-f"></i>
                                        </SocialLink>
                                        <SocialLink href="#" aria-label="Twitter" color={socialColors.twitter}>
                                            <i className="fa-brands fa-x-twitter"></i>
                                        </SocialLink>
                                        <SocialLink href="#" aria-label="Instagram" sx={{ background: socialColors.instagram }}>
                                            <i className="fa-brands fa-instagram"></i>
                                        </SocialLink>
                                        <SocialLink href="#" aria-label="WhatsApp" color={socialColors.whatsapp}>
                                            <i className="fa-brands fa-whatsapp"></i>
                                        </SocialLink>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>

                        {/* ══════════════════════════════════
                            COLUMN B — FORM CARD
                            In RTL → LEFT side. In LTR → RIGHT.
                        ══════════════════════════════════ */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '1 1 0%' },
                            width: { xs: '100%', md: 'auto' },
                            order: { xs: 1, md: 2 },
                        }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: `${CARD_RADIUS}px`,
                                    border: `1px solid ${tk.cardBorder}`,
                                    backgroundColor: tk.cardBg,
                                    backdropFilter: tk.glass,
                                    WebkitBackdropFilter: tk.glass,
                                    boxShadow: tk.cardShadow,
                                    p: { xs: 3, sm: 4, md: 5 },
                                    opacity: 0,
                                    animation: `${fadeInScale} 0.6s ease forwards 0.25s`,
                                    animationFillMode: 'forwards',
                                    transition: `box-shadow 400ms ${EASE}`,
                                    '&:hover': { boxShadow: tk.cardHoverShadow },
                                }}
                            >
                                <form onSubmit={handleSubmit} noValidate>

                                    {/* ── SECTION 1: Personal Info ── */}
                                    <SectionHeading
                                        icon="fa-solid fa-user-circle"
                                        label={t('contact.form.personalInfo')}
                                        tk={tk} delay={0.4}
                                    />

                                    {/* Name — full width */}
                                    <TextField
                                        label={t('contact.form.name')} value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        onBlur={() => handleBlur('name')}
                                        error={getError('name')} helperText={getHelper('name')}
                                        required fullWidth sx={{ ...inputSx, mb: 2 }}
                                        InputProps={{ startAdornment: iconAdornment('fa-solid fa-user') }}
                                    />

                                    {/* Email + Phone row */}
                                    <Box sx={{
                                        display: 'flex', gap: 2, mb: 2,
                                        flexDirection: { xs: 'column', sm: 'row' },
                                    }}>
                                        <TextField
                                            label={t('contact.form.email')} type="email" value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            onBlur={() => handleBlur('email')}
                                            error={getError('email')} helperText={getHelper('email')}
                                            required fullWidth sx={inputSx}
                                            InputProps={{ startAdornment: iconAdornment('fa-solid fa-envelope') }}
                                        />
                                        <TextField
                                            label={t('contact.form.phone')} type="text" value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            onBlur={() => handleBlur('phone')}
                                            error={getError('phone')}
                                            helperText={getError('phone') ? getHelper('phone') : (form.phone.trim() === '' ? t('contact.form.optional') : ' ')}
                                            fullWidth inputProps={{ inputMode: 'tel', dir: 'ltr' }} sx={inputSx}
                                            InputProps={{ startAdornment: iconAdornment('fa-solid fa-phone') }}
                                        />
                                    </Box>

                                    {/* ── Preferred Contact Method ── */}
                                    <SectionHeading
                                        icon="fa-solid fa-headset"
                                        label={t('contact.form.preferredContact')}
                                        tk={tk} delay={0.5}
                                    />
                                    <Box sx={{
                                        p: 2, mb: 3, borderRadius: '14px',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : alpha(TEAL, 0.03),
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : alpha(TEAL, 0.08)}`,
                                    }}>
                                        <Typography variant="caption" sx={{
                                            display: 'block', mb: 1, fontWeight: 500,
                                            color: 'text.disabled', fontSize: '0.75rem',
                                        }}>
                                            ({t('contact.form.optional')})
                                        </Typography>
                                        <RadioGroup
                                            row value={form.preferredContact}
                                            onChange={(e) => setForm(p => ({ ...p, preferredContact: e.target.value }))}
                                            sx={{ gap: { xs: 0.5, sm: 2 } }}
                                        >
                                            {[
                                                { val: 'email', icon: 'fa-solid fa-envelope', label: t('contact.form.contactEmail') },
                                                { val: 'phone', icon: 'fa-solid fa-phone', label: t('contact.form.contactPhone') },
                                                { val: 'whatsapp', icon: 'fa-brands fa-whatsapp', label: t('contact.form.contactWhatsapp') },
                                            ].map(opt => (
                                                <FormControlLabel
                                                    key={opt.val} value={opt.val}
                                                    control={<Radio size="small" sx={{
                                                        color: alpha(G_GREEN, 0.4),
                                                        '&.Mui-checked': { color: G_GREEN },
                                                    }} />}
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <i className={opt.icon} style={{ fontSize: 13, opacity: 0.7 }}></i>
                                                            <span>{opt.label}</span>
                                                        </Box>
                                                    }
                                                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem', fontWeight: 500 } }}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Box>

                                    {/* ── SECTION 3: Message Details ── */}
                                    <SectionHeading
                                        icon="fa-solid fa-comment-dots"
                                        label={t('contact.form.messageInfo')}
                                        tk={tk} delay={0.55}
                                    />

                                    <TextField
                                        label={t('contact.form.subject')} value={form.subject}
                                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                        onBlur={() => handleBlur('subject')}
                                        error={getError('subject')} helperText={getHelper('subject')}
                                        required fullWidth sx={{ ...inputSx, mb: 2 }}
                                        InputProps={{ startAdornment: iconAdornment('fa-solid fa-bookmark') }}
                                    />

                                    <TextField
                                        label={t('contact.form.message')} value={form.message}
                                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        onBlur={() => handleBlur('message')}
                                        error={getError('message')} helperText={getHelper('message')}
                                        required multiline rows={5} fullWidth sx={{ ...inputSx, mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                    <i className="fa-solid fa-comment-dots" style={{ fontSize: 15 }}></i>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* ── Submit Button ── */}
                                    <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                                        <Button
                                            type="submit" variant="contained" size="large" disabled={submitting}
                                            sx={{
                                                width: { xs: '100%', md: 'auto' }, minWidth: { md: 240 },
                                                height: 56, fontWeight: 700, fontSize: '1rem',
                                                textTransform: 'none', borderRadius: '14px', px: 5,
                                                bgcolor: G_GREEN, color: '#fff',
                                                boxShadow: `0 6px 20px ${alpha(G_GREEN, 0.30)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover:not(:disabled)': {
                                                    bgcolor: G_GREEN_DK,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 10px 28px ${alpha(G_GREEN, 0.45)}`,
                                                },
                                                '&:active:not(:disabled)': { transform: 'scale(0.985)', boxShadow: 'none' },
                                                '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px ${alpha(G_GREEN, 0.4)}` },
                                                '&.Mui-disabled': { opacity: 0.65, color: '#fff', backgroundColor: alpha(G_GREEN, 0.5) },
                                            }}
                                            endIcon={submitting ? <CircularProgress size={20} color="inherit" />
                                                : theme.direction === 'ltr' ? <i className="fa-solid fa-paper-plane"></i> : null}
                                            startIcon={!submitting && theme.direction === 'rtl'
                                                ? <i className="fa-solid fa-paper-plane" style={{ transition: 'transform 0.3s ease' }}></i> : null}
                                        >
                                            {submitting ? t('contact.form.sending') : t('contact.form.send')}
                                        </Button>
                                    </Box>
                                </form>
                            </Paper>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ═══════ SNACKBAR ═══════ */}
            <Snackbar
                open={snackbar.open} autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Slide} TransitionProps={{ direction: 'down' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{
                    width: '100%', minWidth: 320, fontSize: '0.95rem', fontWeight: 600,
                    borderRadius: '14px',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
                }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Contact;

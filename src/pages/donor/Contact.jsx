import { useState, useRef, useEffect, useCallback } from 'react';
import { t, getLanguage } from '../../i18n';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Container,
    Grid,
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
    Divider,
    RadioGroup,
    FormControlLabel,
    Radio,
    InputAdornment,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// ─── Animations ─────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ─── Design constants ───────────────────────────────────────
const CARD_RADIUS = 20;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const T_TRANSFORM = `transform 300ms ${EASE_OUT}`;
const T_SHADOW = `box-shadow 300ms ${EASE_OUT}`;
const T_COLOR = 'border-color 220ms ease, background-color 220ms ease';
const TRANSITION = [T_TRANSFORM, T_SHADOW, T_COLOR].join(', ');

// ─── Contact-page surface tokens ────────────────────────────
const contactTokens = (theme) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        pageBg: isDark ? '#0e2121' : theme.palette.background.default,
        cardBg: isDark ? '#152c2c' : theme.palette.background.paper,
        cardBorder: isDark
            ? alpha(theme.palette.primary.light, 0.10)
            : alpha(theme.palette.divider, 0.7),
        cardShadow: isDark
            ? `0 4px 24px ${alpha(theme.palette.common.black, 0.24)}`
            : `0 2px 16px ${alpha(theme.palette.common.black, 0.06)}`,
        cardHoverShadow: isDark
            ? `0 8px 32px ${alpha(theme.palette.common.black, 0.35)}`
            : `0 8px 28px ${alpha(theme.palette.common.black, 0.10)}`,
        infoPanelBg: isDark
            ? alpha(theme.palette.primary.main, 0.06)
            : alpha(theme.palette.primary.main, 0.03),
        infoPanelBorder: isDark
            ? alpha(theme.palette.primary.light, 0.08)
            : alpha(theme.palette.primary.main, 0.08),
        iconBg: isDark
            ? alpha(theme.palette.primary.main, 0.14)
            : alpha(theme.palette.primary.main, 0.08),
        inputBg: isDark
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(0,0,0,0.02)',
        sectionLabelColor: isDark
            ? alpha(theme.palette.primary.light, 0.85)
            : theme.palette.primary.dark,
    };
};

// ─── Validation helpers ─────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (email) => !email || EMAIL_RE.test(email);
const isPhoneValid = (phone) => {
    const trimmed = phone.trim();
    if (!trimmed) return true;
    return /^\d{10,15}$/.test(trimmed);
};

// ─── Styled Components ──────────────────────────────────────
const HeroSection = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        minHeight: 260,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: isDark
            ? `linear-gradient(180deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.hero.base, 0.95)} 0%, ${theme.palette.hero.dark} 100%)`,
        color: theme.palette.common.white,
        textAlign: 'center',
        '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23ffffff' stroke-width='0.4' opacity='0.07'/%3E%3Cpath d='M30 12L48 30L30 48L12 30Z' fill='none' stroke='%23ffffff' stroke-width='0.25' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            opacity: isDark ? 0.35 : 0.5,
            pointerEvents: 'none',
            zIndex: 0,
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(to bottom, transparent, ${isDark ? '#0e2121' : theme.palette.background.default})`,
            pointerEvents: 'none',
            zIndex: 1,
        },
    };
});

const SocialLink = styled(IconButton)(({ theme, color }) => ({
    width: 42,
    height: 42,
    fontSize: '1rem',
    color: theme.palette.common.white,
    backgroundColor: color,
    transition: TRANSITION,
    '&:hover': {
        backgroundColor: color,
        transform: 'translateY(-3px)',
        boxShadow: `0 4px 14px ${alpha(color || theme.palette.primary.main, 0.35)}`,
    },
    '&:active': {
        transform: 'translateY(-1px)',
    },
}));

// ─── Section group heading with decorative line ─────────────
const SectionHeading = ({ icon, label, tokens, theme, delay = 0 }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2.5,
            opacity: 0,
            animation: `${fadeInUp} 0.5s ease forwards ${delay}s`,
            animationFillMode: 'forwards',
        }}
    >
        <Box
            sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: tokens.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                fontSize: 15,
                flexShrink: 0,
            }}
        >
            <i className={icon}></i>
        </Box>
        <Typography
            variant="subtitle1"
            sx={{
                fontWeight: 700,
                color: tokens.sectionLabelColor,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
            }}
        >
            {label}
        </Typography>
        <Box
            sx={{
                flex: 1,
                height: 1,
                backgroundColor: tokens.infoPanelBorder,
                borderRadius: 1,
            }}
        />
    </Box>
);

// ═══════════════════════════════════════════════════════════════
// CONTACT COMPONENT
// ═══════════════════════════════════════════════════════════════
function Contact() {
    const containerRef = useRef(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isRTL = theme.direction === 'rtl';

    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: '', preferredContact: '',
    });
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

    const handleSnackbarClose = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const tokens = contactTokens(theme);

    const contactInfo = [
        { icon: 'fa-solid fa-location-dot', label: t('contact.addressLabel'), value: t('contact.info.address') },
        { icon: 'fa-solid fa-phone', label: t('contact.phoneLabel'), value: t('contact.info.phone') },
        { icon: 'fa-solid fa-envelope', label: t('contact.emailLabel'), value: t('contact.info.email') },
        { icon: 'fa-solid fa-clock', label: t('contact.workHoursLabel'), value: t('contact.info.workHours') },
    ];

    // ─── Validation ─────────────────────────────────────────
    const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return form.phone.trim() !== '' && !isPhoneValid(form.phone);
        if (field === 'subject') return !form.subject || form.subject.trim().length < 3;
        if (field === 'message') return !form.message || form.message.trim().length < 10;
        return false;
    };

    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name') {
            if (!form.name.trim()) return t('contact.form.errors.nameRequired');
            return t('contact.form.errors.nameMin');
        }
        if (field === 'email') {
            if (!form.email.trim()) return t('contact.form.errors.emailRequired');
            return t('contact.form.errors.emailInvalid');
        }
        if (field === 'phone') return t('contact.form.errors.phoneInvalid');
        if (field === 'subject') {
            if (!form.subject.trim()) return t('contact.form.errors.subjectRequired');
            return t('contact.form.errors.subjectMin');
        }
        if (field === 'message') {
            if (!form.message.trim()) return t('contact.form.errors.messageRequired');
            return t('contact.form.errors.messageMin');
        }
        return ' ';
    };

    // ─── Submit ─────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        const allTouched = { name: true, email: true, phone: true, subject: true, message: true };
        setTouched(allTouched);

        const hasErrors = [
            !form.name || form.name.trim().length < 3,
            !form.email || !isEmailValid(form.email),
            form.phone.trim() !== '' && !isPhoneValid(form.phone),
            !form.subject || form.subject.trim().length < 3,
            !form.message || form.message.trim().length < 10,
        ].some(Boolean);

        if (hasErrors) return;

        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setForm({ name: '', email: '', phone: '', subject: '', message: '', preferredContact: '' });
            setTouched({});
            setSnackbar({
                open: true,
                severity: 'success',
                message: t('contact.messageSent'),
            });
        }, 1200);
    };

    const socialColors = {
        facebook: '#1877F2',
        twitter: '#1DA1F2',
        instagram: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        whatsapp: '#25D366',
    };

    // ─── Shared input sx ────────────────────────────────────
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: tokens.inputBg,
            borderRadius: '12px',
            minHeight: 52,
            transition: 'background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
            '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            },
        },
        '& .MuiInputAdornment-root': {
            color: isDark
                ? alpha(theme.palette.primary.light, 0.5)
                : alpha(theme.palette.primary.main, 0.45),
            fontSize: '1rem',
        },
    };

    // ─── Icon adornment helper ──────────────────────────────
    const iconAdornment = (iconClass) => (
        <InputAdornment position="start">
            <i className={iconClass} style={{ fontSize: 16 }}></i>
        </InputAdornment>
    );

    return (
        <Box ref={containerRef} sx={{ pb: 8, backgroundColor: tokens.pageBg }}>
            {/* ═══════ HERO ═══════ */}
            <HeroSection>
                <Container sx={{ position: 'relative', zIndex: 2, py: { xs: 6, md: 8 } }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.1rem' },
                            letterSpacing: '-0.01em',
                            animation: `${fadeInUp} 0.6s ease forwards`,
                            mb: 1.5,
                        }}
                    >
                        {t('contact.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: 520,
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontWeight: 400,
                            opacity: 0,
                            color: alpha(theme.palette.common.white, 0.82),
                            animation: `${fadeInUp} 0.6s ease forwards 0.2s`,
                            animationFillMode: 'forwards',
                        }}
                    >
                        {t('contact.subtitle')}
                    </Typography>
                    <Box
                        sx={{
                            width: 48,
                            height: 2,
                            borderRadius: 1,
                            mx: 'auto',
                            mt: 3,
                            opacity: 0,
                            background: alpha(theme.palette.common.white, 0.25),
                            animation: `${fadeInUp} 0.6s ease forwards 0.35s`,
                            animationFillMode: 'forwards',
                        }}
                    />
                </Container>
            </HeroSection>

            {/* ═══════ MAIN CARD ═══════ */}
            <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4 }, position: 'relative', zIndex: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: 1160,
                        mx: 'auto',
                        borderRadius: `${CARD_RADIUS}px`,
                        border: `1px solid ${tokens.cardBorder}`,
                        backgroundColor: tokens.cardBg,
                        boxShadow: tokens.cardShadow,
                        overflow: 'hidden',
                        animation: `${fadeInScale} 0.65s ease forwards 0.3s`,
                        opacity: 0,
                        animationFillMode: 'forwards',
                        transition: `box-shadow 400ms ${EASE_OUT}`,
                        '&:hover': {
                            boxShadow: tokens.cardHoverShadow,
                        },
                        // Global input focus/error ring styles
                        '& .MuiOutlinedInput-root': {
                            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}`,
                        },
                        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '1px',
                            boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.error.main, 0.08)}`,
                        },
                        '& .MuiFormHelperText-root': {
                            minHeight: '1.25em',
                            marginTop: theme.spacing(0.5),
                            lineHeight: 1.4,
                        },
                        '& .MuiFormHelperText-root.Mui-error': {
                            fontSize: '0.75rem',
                            fontWeight: 500,
                        },
                    }}
                >
                    <Grid container direction={{ xs: 'column-reverse', md: 'row' }}>
                        {/* ════════════════════════════════════════════
                            INFO PANEL (Column B)
                            In RTL → right side. In LTR → left side.
                        ════════════════════════════════════════════ */}
                        <Grid item xs={12} md={4.5}>
                            <Box
                                sx={{
                                    height: '100%',
                                    backgroundColor: tokens.infoPanelBg,
                                    borderRight: { md: `1px solid ${tokens.infoPanelBorder}` },
                                    borderTop: { xs: `1px solid ${tokens.infoPanelBorder}`, md: 'none' },
                                    p: { xs: 3, md: 4 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
                                {/* Panel title */}
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                        color: 'text.primary',
                                        fontSize: '1.05rem',
                                        opacity: 0,
                                        animation: `${slideInLeft} 0.5s ease forwards 0.5s`,
                                        animationFillMode: 'forwards',
                                    }}
                                >
                                    {t('contact.subtitle')}
                                </Typography>

                                {/* Info items */}
                                <Stack spacing={2}>
                                    {contactInfo.map((info, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 1.5,
                                                borderRadius: '12px',
                                                backgroundColor: isDark
                                                    ? alpha(theme.palette.primary.main, 0.04)
                                                    : alpha(theme.palette.primary.main, 0.03),
                                                border: `1px solid ${isDark
                                                    ? alpha(theme.palette.primary.light, 0.06)
                                                    : 'transparent'
                                                    }`,
                                                transition: 'background-color 200ms ease, transform 200ms ease',
                                                opacity: 0,
                                                animation: `${slideInLeft} 0.45s ease forwards ${0.55 + i * 0.08}s`,
                                                animationFillMode: 'forwards',
                                                '&:hover': {
                                                    backgroundColor: isDark
                                                        ? alpha(theme.palette.primary.main, 0.08)
                                                        : alpha(theme.palette.primary.main, 0.06),
                                                    transform: isRTL ? 'translateX(4px)' : 'translateX(-4px)',
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    fontSize: 18,
                                                    color: 'primary.main',
                                                    width: 40,
                                                    height: 40,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '10px',
                                                    backgroundColor: tokens.iconBg,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <i className={info.icon}></i>
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="caption"
                                                    display="block"
                                                    sx={{
                                                        mb: 0.25,
                                                        color: isDark
                                                            ? alpha(theme.palette.text.secondary, 0.7)
                                                            : 'text.secondary',
                                                        fontSize: '0.7rem',
                                                        letterSpacing: '0.02em',
                                                    }}
                                                >
                                                    {info.label}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color="text.primary"
                                                    sx={{
                                                        wordBreak: 'break-word',
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {info.value}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>

                                {/* Divider */}
                                <Divider sx={{ borderColor: tokens.infoPanelBorder }} />

                                {/* Social Links */}
                                <Box
                                    sx={{
                                        opacity: 0,
                                        animation: `${fadeInUp} 0.5s ease forwards 0.9s`,
                                        animationFillMode: 'forwards',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        display="block"
                                        sx={{
                                            mb: 1.5,
                                            color: isDark
                                                ? alpha(theme.palette.text.primary, 0.6)
                                                : 'text.secondary',
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.03em',
                                        }}
                                    >
                                        {t('contact.social')}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <SocialLink href="#" aria-label="Facebook" color={socialColors.facebook}>
                                            <i className="fa-brands fa-facebook-f"></i>
                                        </SocialLink>
                                        <SocialLink href="#" aria-label="Twitter" color={socialColors.twitter}>
                                            <i className="fa-brands fa-x-twitter"></i>
                                        </SocialLink>
                                        <SocialLink
                                            href="#"
                                            aria-label="Instagram"
                                            sx={{ background: socialColors.instagram }}
                                        >
                                            <i className="fa-brands fa-instagram"></i>
                                        </SocialLink>
                                        <SocialLink href="#" aria-label="WhatsApp" color={socialColors.whatsapp}>
                                            <i className="fa-brands fa-whatsapp"></i>
                                        </SocialLink>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>

                        {/* ════════════════════════════════════════════
                            FORM PANEL (Column A)
                            In RTL → left side (primary). In LTR → right side.
                        ════════════════════════════════════════════ */}
                        <Grid item xs={12} md={7.5}>
                            <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                                <form onSubmit={handleSubmit} noValidate>
                                    {/* Form heading */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 0.5,
                                            color: 'text.primary',
                                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                                            opacity: 0,
                                            animation: `${slideInRight} 0.5s ease forwards 0.4s`,
                                            animationFillMode: 'forwards',
                                        }}
                                    >
                                        {t('contact.description')}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 4,
                                            color: isDark
                                                ? alpha(theme.palette.text.secondary, 0.7)
                                                : 'text.secondary',
                                            lineHeight: 1.6,
                                            opacity: 0,
                                            animation: `${slideInRight} 0.5s ease forwards 0.5s`,
                                            animationFillMode: 'forwards',
                                        }}
                                    >
                                        {t('contact.subtitle')}
                                    </Typography>

                                    {/* ── SECTION 1: Personal Info ── */}
                                    <SectionHeading
                                        icon="fa-solid fa-user-circle"
                                        label={t('contact.form.personalInfo')}
                                        tokens={tokens}
                                        theme={theme}
                                        delay={0.55}
                                    />

                                    <Grid container spacing={2} sx={{ mb: 1 }}>
                                        {/* Name — full width */}
                                        <Grid item xs={12}>
                                            <TextField
                                                label={t('contact.form.name')}
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                onBlur={() => handleBlur('name')}
                                                error={getError('name')}
                                                helperText={getHelper('name')}
                                                required
                                                fullWidth
                                                sx={inputSx}
                                                InputProps={{
                                                    startAdornment: iconAdornment('fa-solid fa-user'),
                                                }}
                                            />
                                        </Grid>

                                        {/* Email */}
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label={t('contact.form.email')}
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                onBlur={() => handleBlur('email')}
                                                error={getError('email')}
                                                helperText={getHelper('email')}
                                                required
                                                fullWidth
                                                sx={inputSx}
                                                InputProps={{
                                                    startAdornment: iconAdornment('fa-solid fa-envelope'),
                                                }}
                                            />
                                        </Grid>

                                        {/* Phone */}
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label={t('contact.form.phone')}
                                                type="text"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                onBlur={() => handleBlur('phone')}
                                                error={getError('phone')}
                                                helperText={
                                                    getError('phone')
                                                        ? getHelper('phone')
                                                        : (form.phone.trim() === '' ? t('contact.form.optional') : ' ')
                                                }
                                                fullWidth
                                                inputProps={{ inputMode: 'tel', dir: 'ltr' }}
                                                sx={inputSx}
                                                InputProps={{
                                                    startAdornment: iconAdornment('fa-solid fa-phone'),
                                                }}
                                            />
                                        </Grid>

                                        {/* Preferred Contact Method */}
                                        <Grid item xs={12}>
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '12px',
                                                    backgroundColor: isDark
                                                        ? alpha(theme.palette.primary.main, 0.04)
                                                        : alpha(theme.palette.primary.main, 0.02),
                                                    border: `1px solid ${isDark
                                                        ? alpha(theme.palette.primary.light, 0.06)
                                                        : alpha(theme.palette.primary.main, 0.06)
                                                        }`,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        mb: 1,
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    {t('contact.form.preferredContact')}
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 400,
                                                            color: 'text.disabled',
                                                            mx: 1,
                                                        }}
                                                    >
                                                        ({t('contact.form.optional')})
                                                    </Typography>
                                                </Typography>
                                                <RadioGroup
                                                    row
                                                    value={form.preferredContact}
                                                    onChange={(e) => setForm(p => ({ ...p, preferredContact: e.target.value }))}
                                                    sx={{ gap: { xs: 0.5, sm: 2 } }}
                                                >
                                                    <FormControlLabel
                                                        value="email"
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                sx={{
                                                                    color: alpha(theme.palette.primary.main, 0.4),
                                                                    '&.Mui-checked': { color: 'primary.main' },
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                <i className="fa-solid fa-envelope" style={{ fontSize: 13, opacity: 0.7 }}></i>
                                                                <span>{t('contact.form.contactEmail')}</span>
                                                            </Box>
                                                        }
                                                        sx={{
                                                            '& .MuiFormControlLabel-label': {
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500,
                                                            },
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="phone"
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                sx={{
                                                                    color: alpha(theme.palette.primary.main, 0.4),
                                                                    '&.Mui-checked': { color: 'primary.main' },
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                <i className="fa-solid fa-phone" style={{ fontSize: 13, opacity: 0.7 }}></i>
                                                                <span>{t('contact.form.contactPhone')}</span>
                                                            </Box>
                                                        }
                                                        sx={{
                                                            '& .MuiFormControlLabel-label': {
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500,
                                                            },
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="whatsapp"
                                                        control={
                                                            <Radio
                                                                size="small"
                                                                sx={{
                                                                    color: alpha(theme.palette.primary.main, 0.4),
                                                                    '&.Mui-checked': { color: 'primary.main' },
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                <i className="fa-brands fa-whatsapp" style={{ fontSize: 14, opacity: 0.7 }}></i>
                                                                <span>{t('contact.form.contactWhatsapp')}</span>
                                                            </Box>
                                                        }
                                                        sx={{
                                                            '& .MuiFormControlLabel-label': {
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500,
                                                            },
                                                        }}
                                                    />
                                                </RadioGroup>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    {/* ── SECTION 2: Message Info ── */}
                                    <Box sx={{ mt: 3 }}>
                                        <SectionHeading
                                            icon="fa-solid fa-comment-dots"
                                            label={t('contact.form.messageInfo')}
                                            tokens={tokens}
                                            theme={theme}
                                            delay={0.65}
                                        />

                                        <Grid container spacing={2}>
                                            {/* Subject */}
                                            <Grid item xs={12}>
                                                <TextField
                                                    label={t('contact.form.subject')}
                                                    value={form.subject}
                                                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                                    onBlur={() => handleBlur('subject')}
                                                    error={getError('subject')}
                                                    helperText={getHelper('subject')}
                                                    required
                                                    fullWidth
                                                    sx={inputSx}
                                                    InputProps={{
                                                        startAdornment: iconAdornment('fa-solid fa-bookmark'),
                                                    }}
                                                />
                                            </Grid>

                                            {/* Message */}
                                            <Grid item xs={12}>
                                                <TextField
                                                    label={t('contact.form.message')}
                                                    value={form.message}
                                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                                    onBlur={() => handleBlur('message')}
                                                    error={getError('message')}
                                                    helperText={getHelper('message')}
                                                    required
                                                    multiline
                                                    rows={5}
                                                    fullWidth
                                                    sx={inputSx}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                                <i className="fa-solid fa-comment-dots" style={{ fontSize: 16 }}></i>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* ── Submit Button ── */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: { xs: 'stretch', md: 'flex-end' },
                                            mt: 3,
                                        }}
                                    >
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={submitting}
                                            sx={{
                                                width: { xs: '100%', md: 'auto' },
                                                minWidth: { md: 220 },
                                                height: 54,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                borderRadius: '999px',
                                                px: 5,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.3s ease',
                                                '&:hover:not(:disabled)': {
                                                    transform: 'translateY(-2px)',
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                    boxShadow: isDark
                                                        ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.40)}`
                                                        : `0 6px 20px ${alpha(theme.palette.primary.main, 0.30)}`,
                                                },
                                                '&:active:not(:disabled)': {
                                                    transform: 'scale(0.985)',
                                                    boxShadow: 'none',
                                                },
                                                '&:focus-visible': {
                                                    outline: 'none',
                                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                },
                                                '&.Mui-disabled': {
                                                    opacity: 0.65,
                                                    color: theme.palette.primary.contrastText,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                                                },
                                            }}
                                            endIcon={
                                                submitting
                                                    ? <CircularProgress size={20} color="inherit" />
                                                    : theme.direction === 'ltr'
                                                        ? <i className="fa-solid fa-paper-plane"></i>
                                                        : null
                                            }
                                            startIcon={
                                                !submitting && theme.direction === 'rtl'
                                                    ? <i className="fa-solid fa-paper-plane"></i>
                                                    : null
                                            }
                                        >
                                            {submitting
                                                ? t('contact.form.sending')
                                                : t('contact.form.send')
                                            }
                                        </Button>
                                    </Box>
                                </form>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* ═══════ SUCCESS / ERROR SNACKBAR ═══════ */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'down' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        minWidth: 320,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.18)}`,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Contact;

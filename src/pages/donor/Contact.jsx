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
    Card,
    CardContent,
    alpha,
    CircularProgress,
    Snackbar,
    Alert,
    Slide
} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { initScrollAnimations } from '../../hooks/useScrollAnimation';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

// --- Unified card radius ---
const CARD_RADIUS = 16;

// ─── Unified transition spec ────────────────────────────────
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const T_TRANSFORM = `transform 300ms ${EASE_OUT}`;
const T_SHADOW = `box-shadow 300ms ${EASE_OUT}`;
const T_COLOR = 'border-color 220ms ease, background-color 220ms ease';
const TRANSITION = [T_TRANSFORM, T_SHADOW, T_COLOR].join(', ');

// ─── Contact-page surface tokens (scoped to this page only) ───
const contactTokens = (theme) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        pageBg: isDark ? '#0e2121' : theme.palette.background.default,
        cardBg: isDark ? '#152c2c' : theme.palette.background.paper,
        cardBorder: isDark
            ? alpha(theme.palette.primary.light, 0.10)
            : alpha(theme.palette.divider, 0.7),
        cardShadow: isDark
            ? `0 2px 8px ${alpha(theme.palette.common.black, 0.18)}`
            : `0 1px 6px ${alpha(theme.palette.common.black, 0.04)}`,
        cardHoverShadow: isDark
            ? `0 6px 20px ${alpha(theme.palette.common.black, 0.30)}`
            : `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
        mapBg: isDark ? '#132828' : theme.palette.grey[50],
        iconBg: isDark
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.primary.main, 0.07),
    };
};

// ─── Validation helpers ─────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmailValid = (email) => !email || EMAIL_RE.test(email);

// Phone: validate trimmed value is 10-15 digits only
const isPhoneValid = (phone) => {
    const trimmed = phone.trim();
    if (!trimmed) return true; // optional
    return /^\d{10,15}$/.test(trimmed);
};

// --- Styled Components ---
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
        // Subtle Islamic geometric pattern
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
        // Soft bottom fade
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

const InfoCard = styled(Paper)(({ theme }) => {
    const tokens = contactTokens(theme);
    return {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        padding: theme.spacing(2.5),
        borderRadius: CARD_RADIUS,
        border: `1px solid ${tokens.cardBorder}`,
        backgroundColor: tokens.cardBg,
        boxShadow: tokens.cardShadow,
        transition: TRANSITION,
        '&:hover': {
            borderColor: alpha(theme.palette.primary.light, 0.25),
            boxShadow: tokens.cardHoverShadow,
            transform: 'translateY(-3px)',
        },
    };
});

const SocialLink = styled(IconButton)(({ theme, color }) => ({
    width: 48,
    height: 48,
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

const MapPlaceholder = styled(Box)(({ theme }) => {
    const tokens = contactTokens(theme);
    return {
        borderRadius: CARD_RADIUS,
        border: `1px solid ${tokens.cardBorder}`,
        backgroundColor: tokens.mapBg,
        boxShadow: tokens.cardShadow,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1),
        color: theme.palette.text.secondary,
        transition: TRANSITION,
    };
});

function Contact() {
    const containerRef = useRef(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isEn = getLanguage() === 'en';

    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
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

    useEffect(() => {
    }, []);

    // --- Blur handler: mark field as touched ---
    const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

    // --- Per-field error check (only returns true if touched) ---
    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return form.phone.trim() !== '' && !isPhoneValid(form.phone);
        if (field === 'subject') return !form.subject || form.subject.trim().length < 3;
        if (field === 'message') return !form.message || form.message.trim().length < 10;
        return false;
    };

    // --- Helper text: always returns a string so layout is stable ---
    const getHelper = (field) => {
        if (!getError(field)) return ' '; // reserve space

        if (field === 'name') {
            if (!form.name.trim()) return t('contact.form.errors.nameRequired');
            return t('contact.form.errors.nameMin');
        }
        if (field === 'email') {
            if (!form.email.trim()) return t('contact.form.errors.emailRequired');
            return t('contact.form.errors.emailInvalid');
        }
        if (field === 'phone') {
            return t('contact.form.errors.phoneInvalid');
        }
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

    // --- Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = { name: true, email: true, phone: true, subject: true, message: true };
        setTouched(allTouched);

        // Check validity (re-derive from form values, not from getError which depends on stale touched)
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
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
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
        whatsapp: '#25D366'
    };

    // Form Paper sx
    const formPaperSx = {
        p: { xs: 3, sm: 4 },
        borderRadius: `${CARD_RADIUS}px`,
        border: `1px solid ${tokens.cardBorder}`,
        backgroundColor: tokens.cardBg,
        boxShadow: tokens.cardShadow,
        transition: TRANSITION,
        animation: `${fadeInUp} 0.6s ease forwards 0.4s`,
        opacity: 0,
        animationFillMode: 'forwards',
        // --- Volunteer-form–matching focus/error ring styles ---
        '& .MuiOutlinedInput-root': {
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
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
    };

    // Submit button sx
    const submitBtnSx = {
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover:not(:disabled)': {
            transform: 'translateY(-2px)',
            boxShadow: isDark
                ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`
                : `0 6px 18px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
        '&:active': {
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
    };

    return (
        <Box ref={containerRef} sx={{ pb: 8, backgroundColor: tokens.pageBg }}>
            {/* Hero */}
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
                    {/* Thin decorative divider */}
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

            <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 5 } }}>
                <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
                    {/* Contact Info Cards */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={3} sx={{ animation: `${fadeInUp} 0.6s ease forwards 0.3s`, opacity: 0, animationFillMode: 'forwards' }}>
                            <Stack spacing={2}>
                                {contactInfo.map((info, i) => (
                                    <InfoCard key={i} elevation={0}>
                                        <Box sx={{
                                            fontSize: 22,
                                            color: 'primary.main',
                                            width: 44,
                                            height: 44,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '12px',
                                            backgroundColor: tokens.iconBg,
                                            flexShrink: 0,
                                        }}>
                                            <i className={info.icon}></i>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                display="block"
                                                sx={{
                                                    mb: 0.25,
                                                    color: isDark
                                                        ? alpha(theme.palette.text.secondary, 0.7)
                                                        : 'text.secondary',
                                                }}
                                            >
                                                {info.label}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600} color="text.primary">
                                                {info.value}
                                            </Typography>
                                        </Box>
                                    </InfoCard>
                                ))}
                            </Stack>

                            {/* Social Links */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    gutterBottom
                                    sx={{
                                        color: isDark
                                            ? alpha(theme.palette.text.primary, 0.7)
                                            : 'text.secondary',
                                    }}
                                >
                                    {t('contact.social')}
                                </Typography>
                                <Stack direction="row" spacing={1.5}>
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

                            {/* Map Placeholder */}
                            <MapPlaceholder>
                                <Box sx={{ fontSize: 40, animation: `${bounce} 2s ease-in-out infinite` }}>
                                    <i className="fa-solid fa-location-dot"></i>
                                </Box>
                                <Typography variant="body2">
                                    {isEn ? 'Cairo, Egypt' : 'القاهرة، مصر'}
                                </Typography>
                            </MapPlaceholder>
                        </Stack>
                    </Grid>

                    {/* Contact Form */}
                    <Grid item xs={12} md={7}>
                        <Paper
                            elevation={0}
                            sx={formPaperSx}
                        >
                            <form onSubmit={handleSubmit} noValidate>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    mb={3}
                                    sx={{
                                        color: isDark
                                            ? alpha(theme.palette.text.primary, 0.75)
                                            : 'text.secondary',
                                    }}
                                >
                                    {t('contact.description')}
                                </Typography>

                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label={t('contact.form.name')}
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            onBlur={() => handleBlur('name')}
                                            error={getError('name')}
                                            helperText={getHelper('name')}
                                            required
                                            fullWidth
                                        />
                                    </Grid>
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
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label={t('contact.form.phone')}
                                            type="text"
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            onBlur={() => handleBlur('phone')}
                                            error={getError('phone')}
                                            helperText={getHelper('phone')}
                                            fullWidth
                                            inputProps={{ inputMode: 'tel', dir: 'ltr' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label={t('contact.form.subject')}
                                            value={form.subject}
                                            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                            onBlur={() => handleBlur('subject')}
                                            error={getError('subject')}
                                            helperText={getHelper('subject')}
                                            required
                                            fullWidth
                                        />
                                    </Grid>
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
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={submitting}
                                            sx={submitBtnSx}
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
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            {/* Success / Error Snackbar */}
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

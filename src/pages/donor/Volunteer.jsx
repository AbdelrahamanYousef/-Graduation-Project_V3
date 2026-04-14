import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Stack,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const TEAL_DARK = '#0a1f1c';
const DEEP_BLUE = '#0a1628';
const G_GREEN = '#00b16a';
const ACCENT_CYAN = '#22d3ee';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ═══════════════════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.92) translateY(18px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
`;

const floatParticle = keyframes`
  0%   { transform: translateY(0)     scale(1);   opacity: 0.25; }
  50%  { transform: translateY(-22px) scale(1.3); opacity: 0.6;  }
  100% { transform: translateY(0)     scale(1);   opacity: 0.25; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1);   }
  50%      { opacity: 0.55; transform: scale(1.08); }
`;

const gradientShift = keyframes`
  0%   { background-position: 0% 50%;   }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%;   }
`;

const shimmer = keyframes`
  0%   { left: -100%; }
  100% { left: 200%;  }
`;

const decorLinePulse = keyframes`
  0%, 100% { width: 40px; opacity: 0.45; }
  50%      { width: 56px; opacity: 0.7;  }
`;

/* ═══════════════════════════════════════════════════════════════
   STYLED: HERO — futuristic deep-teal gradient with glow layers
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        paddingTop: 110,
        paddingBottom: 120,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        /* Rich teal → deep-blue gradient */
        background: dk
            ? `linear-gradient(160deg, ${TEAL_DARK} 0%, #030d0b 40%, ${DEEP_BLUE} 100%)`
            : `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_MID} 40%, ${TEAL_DARK} 75%, #0d1f2d 100%)`,
        /* subtle vignette overlay */
        '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(0,177,106,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
        },
        [theme.breakpoints.down('md')]: {
            paddingTop: 56,
            paddingBottom: 72,
        },
    };
});

/* ═══════════════════════════════════════════════════════════════
   STYLED: WAVE DIVIDER
   ═══════════════════════════════════════════════════════════════ */
const WaveDivider = styled(Box)(({ theme }) => ({
    marginTop: -1,
    lineHeight: 0,
    '& svg': {
        display: 'block',
        width: '100%',
        height: 36,
        fill: theme.palette.background.default,
    },
}));

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADING  (Matches Contact form style)
   ═══════════════════════════════════════════════════════════════ */
const SectionHeading = ({ icon, label, delay = 0 }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const grad1 = isDark ? G_GREEN : TEAL;
    const grad2 = isDark ? ACCENT_CYAN : TEAL_DARK;
    
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5,
            opacity: 0, animation: `${fadeInUp} 0.5s ease forwards ${delay}s`,
            animationFillMode: 'forwards',
        }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                background: `linear-gradient(135deg, ${grad1}, ${grad2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, flexShrink: 0,
                boxShadow: `0 3px 10px ${alpha(grad1, 0.30)}`,
            }}>
                <i className={icon}></i>
            </Box>
            <Typography variant="subtitle1" sx={{
                fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.9)' : TEAL_DARK,
                fontSize: '0.95rem', letterSpacing: '0.01em',
            }}>
                {label}
            </Typography>
            <Box sx={{ flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
        </Box>
    );
};

/* Shared Input Styling (Matches Contact form) */
const inputSx = (theme) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: '12px', minHeight: 52,
        transition: 'all 0.3s ease',
        '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', transition: 'border-color 0.3s ease' },
        '&:hover fieldset': { borderColor: alpha(G_GREEN, 0.4) },
        '&.Mui-focused fieldset': { borderColor: G_GREEN, boxShadow: `0 0 0 3px ${alpha(G_GREEN, 0.10)}` },
        '&.Mui-error fieldset': { borderWidth: '1px', boxShadow: `0 0 0 3px ${alpha('#e57373', 0.08)}` },
    },
    '& .MuiInputAdornment-root': {
        color: theme.palette.mode === 'dark' ? alpha(G_GREEN, 0.6) : alpha(TEAL, 0.5),
    },
    '& .MuiFormHelperText-root': { minHeight: '1.25em', mt: 0.5, lineHeight: 1.4 },
    '& .MuiFormHelperText-root.Mui-error': { fontSize: '0.75rem', fontWeight: 500 },
});

function Volunteer() {
    const containerRef = useRef(null); // Keep ref if needed for logic, though animations are CSS-in-JS now
    const theme = useTheme();
    const isEn = getLanguage() === 'en';
    const [form, setForm] = useState({ name: '', email: '', phone: '', area: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };
    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'area') return !form[field];
        return false;
    };
    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name' && form.name && form.name.trim().length < 3)
            return isEn ? 'Name must be at least 3 characters' : 'الاسم يجب أن يكون 3 أحرف على الأقل';
        if (field === 'email' && form.email)
            return isEn ? 'Enter a valid email' : 'أدخل بريدًا صالحًا';
        if (field === 'phone' && form.phone)
            return isEn ? 'Enter a valid phone (10–15 digits)' : 'أدخل رقمًا صالحًا (10–15 رقم)';
        return isEn ? 'This field is required' : 'هذا الحقل مطلوب';
    };

    const volunteerAreas = [
        { id: 'medical', icon: 'fa-solid fa-hospital', label: isEn ? 'Medical' : 'طبي', desc: isEn ? 'Participate in medical convoys and health awareness' : 'المشاركة في القوافل الطبية والتوعية الصحية' },
        { id: 'education', icon: 'fa-solid fa-book-open', label: isEn ? 'Educational' : 'تعليمي', desc: isEn ? 'Teaching children, literacy programs, and tutoring' : 'تعليم الأطفال ومحو الأمية والدروس الخصوصية' },
        { id: 'community', icon: 'fa-solid fa-people-roof', label: isEn ? 'Community' : 'مجتمعي', desc: isEn ? 'Local community development and social initiatives' : 'تنمية المجتمعات المحلية والمبادرات الاجتماعية' },
        { id: 'tech', icon: 'fa-solid fa-laptop-code', label: isEn ? 'Technical' : 'تقني', desc: isEn ? 'Design, development, and digital infrastructure support' : 'التصميم والبرمجة ودعم البنية التحتية الرقمية' },
        { id: 'admin', icon: 'fa-solid fa-clipboard-list', label: isEn ? 'Administrative' : 'إداري', desc: isEn ? 'Organization, management, and project planning' : 'التنظيم والإدارة والتخطيط للمشاريع' },
        { id: 'field', icon: 'fa-solid fa-truck', label: isEn ? 'Field Work' : 'ميداني', desc: isEn ? 'Distribution, relief, and direct field work' : 'التوزيع والإغاثة والعمل الميداني المباشر' },
    ];

    const impactNumbers = [
        { value: '2,500+', label: isEn ? 'Active Volunteers' : 'متطوع نشط', icon: 'fa-solid fa-users' },
        { value: '50,000+', label: isEn ? 'Volunteer Hours' : 'ساعة تطوعية', icon: 'fa-solid fa-clock' },
        { value: '120+', label: isEn ? 'Communities Served' : 'مجتمع مستفيد', icon: 'fa-solid fa-people-roof' },
        { value: '35+', label: isEn ? 'Volunteer Projects' : 'مشروع تطوعي', icon: 'fa-solid fa-bullseye' },
    ];

    const reasons = [
        { icon: 'fa-solid fa-heart', title: isEn ? 'Great Reward' : 'أجر عظيم', desc: isEn ? 'Volunteering is one of the greatest forms of charity' : 'التطوع من أعظم أبواب الخير والصدقة الجارية' },
        { icon: 'fa-solid fa-handshake', title: isEn ? 'New Friends' : 'صداقات جديدة', desc: isEn ? 'Join a community of like-minded volunteers' : 'انضم لمجتمع من المتطوعين المحبين للخير' },
        { icon: 'fa-solid fa-arrow-trend-up', title: isEn ? 'Develop Skills' : 'تطوير مهاراتك', desc: isEn ? 'Gain practical experience and develop your professional skills' : 'اكتسب خبرات عملية وطوّر مهاراتك المهنية' },
        { icon: 'fa-solid fa-earth-americas', title: isEn ? 'Real Impact' : 'أثر حقيقي', desc: isEn ? 'Witness your direct impact on people\'s lives' : 'شاهد تأثيرك المباشر على حياة المحتاجين' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mark all required fields touched on submit
        const allTouched = { name: true, email: true, phone: true, area: true };
        setTouched(allTouched);
        // Check validity
        const hasErrors = ['name', 'email', 'phone', 'area'].some(f => {
            if (f === 'name') return !form.name || form.name.trim().length < 3;
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            return !form[f];
        });
        if (hasErrors) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setForm({ name: '', email: '', phone: '', area: '', message: '' });
        setTouched({});
    };


    return (
        <Box sx={{ pb: 12 }}>
            {/* ═══════ HERO — futuristic ═══════ */}
            <HeroSection>

                {/* ── Ambient glow orbs ── */}
                <Box sx={{
                    position: 'absolute', top: '-10%', left: '15%',
                    width: 420, height: 420, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(G_GREEN, 0.12)} 0%, transparent 70%)`,
                    animation: `${glowPulse} 7s ease-in-out infinite`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '-5%', right: '10%',
                    width: 340, height: 340, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(ACCENT_CYAN, 0.08)} 0%, transparent 70%)`,
                    animation: `${glowPulse} 9s ease-in-out infinite 2s`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
                <Box sx={{
                    position: 'absolute', top: '40%', right: '35%',
                    width: 200, height: 200, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha('#fff', 0.03)} 0%, transparent 70%)`,
                    animation: `${glowPulse} 11s ease-in-out infinite 4s`,
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* ── Floating particles ── */}
                {[
                    { top: '18%', left: '8%', size: 5, delay: '0s', dur: '6s' },
                    { top: '55%', left: '20%', size: 7, delay: '1s', dur: '7s' },
                    { top: '25%', left: '45%', size: 4, delay: '0.5s', dur: '8s' },
                    { top: '65%', left: '65%', size: 6, delay: '2s', dur: '6.5s' },
                    { top: '12%', left: '78%', size: 8, delay: '1.5s', dur: '7.5s' },
                    { top: '75%', left: '88%', size: 5, delay: '3s', dur: '9s' },
                    { top: '40%', left: '92%', size: 3, delay: '0.8s', dur: '6s' },
                    { top: '82%', left: '35%', size: 4, delay: '2.5s', dur: '8s' },
                ].map((p, i) => (
                    <Box key={i} sx={{
                        position: 'absolute', top: p.top, left: p.left,
                        width: p.size, height: p.size, borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha('#fff', 0.7)} 0%, ${alpha(ACCENT_CYAN, 0.3)} 100%)`,
                        animation: `${floatParticle} ${p.dur} ease-in-out infinite`,
                        animationDelay: p.delay,
                        pointerEvents: 'none', zIndex: 0,
                        boxShadow: `0 0 ${p.size * 2}px ${alpha(ACCENT_CYAN, 0.25)}`,
                    }} />
                ))}

                {/* ── Hero content ── */}
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 660, mx: 'auto', px: 2 }}>

                    {/* Decorative line — animated subtle pulse */}
                    <Box sx={{
                        width: 40, height: 2.5, borderRadius: 2, mx: 'auto', mb: 2.5,
                        background: `linear-gradient(90deg, ${alpha('#fff', 0.15)}, ${alpha(ACCENT_CYAN, 0.5)}, ${alpha('#fff', 0.15)})`,
                        animation: `${decorLinePulse} 4s ease-in-out infinite`,
                    }} />

                    {/* Title */}
                    <Typography sx={{
                        fontWeight: 900, mb: 1.5, color: '#fff',
                        fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' },
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        animation: `${fadeInUp} 0.7s ${EASE} both`,
                    }}>
                        {t('volunteer.title')}
                    </Typography>

                    {/* Subtitle */}
                    <Typography sx={{
                        color: alpha('#fff', 0.72),
                        lineHeight: 1.75,
                        fontWeight: 500,
                        fontSize: { xs: '0.88rem', md: '1rem' },
                        animation: `${fadeInUp} 0.7s ${EASE} both 0.12s`,
                    }}>
                        {t('volunteer.subtitle')}
                    </Typography>

                    {/* Description */}
                    <Typography sx={{
                        color: alpha('#fff', 0.48),
                        lineHeight: 1.75,
                        fontSize: { xs: '0.8rem', md: '0.88rem' },
                        animation: `${fadeInUp} 0.7s ${EASE} both 0.24s`,
                        mt: 1.5,
                        maxWidth: 520, mx: 'auto',
                    }}>
                        {t('volunteer.description')}
                    </Typography>
                </Box>
            </HeroSection>

            {/* Wave transition */}
            <WaveDivider>
                <svg viewBox="0 0 1200 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,0 C300,36 900,0 1200,36 L1200,36 L0,36 Z" />
                </svg>
            </WaveDivider>

            <Container sx={{ mt: -6, position: 'relative', zIndex: 2 }}>

                {/* ═══════ IMPACT STATS — glassmorphic futuristic cards ═══════ */}
                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 10 }}>
                    {impactNumbers.map((stat, i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    borderRadius: '20px',
                                    p: '1px',
                                    /* animated gradient border */
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(G_GREEN, 0.35)}, ${alpha(ACCENT_CYAN, 0.15)}, ${alpha(G_GREEN, 0.1)})`
                                        : `linear-gradient(135deg, ${alpha(TEAL, 0.2)}, ${alpha(G_GREEN, 0.12)}, ${alpha(TEAL, 0.06)})`,
                                    backgroundSize: '200% 200%',
                                    /* entrance + infinite gradient border combined */
                                    animation: `${fadeInScale} 0.6s ${EASE} both ${0.15 + i * 0.1}s, ${gradientShift} 6s ease ${0.8 + i * 0.1}s infinite`,
                                    height: '100%',
                                }}
                            >
                                <Box
                                    sx={{
                                        borderRadius: '19px',
                                        height: '100%',
                                        p: { xs: 2.5, md: 3.5 },
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        /* glassmorphism */
                                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(15, 25, 40, 0.75)'
                                            : 'rgba(255, 255, 255, 0.82)',
                                        backdropFilter: 'saturate(1.4) blur(20px)',
                                        WebkitBackdropFilter: 'saturate(1.4) blur(20px)',
                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                            ? `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${alpha('#fff', 0.04)}`
                                            : `0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 ${alpha('#fff', 0.6)}`,
                                        transition: `transform 400ms ${EASE}, box-shadow 400ms ${EASE}`,
                                        cursor: 'default',
                                        /* shimmer overlay */
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: '-100%',
                                            width: '60%', height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.06)}, transparent)`,
                                            transform: 'skewX(-20deg)',
                                            pointerEvents: 'none',
                                            transition: 'none',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 16px 48px rgba(0,0,0,0.5), 0 0 20px ${alpha(G_GREEN, 0.12)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`
                                                : `0 12px 40px rgba(0,0,0,0.10), 0 0 16px ${alpha(TEAL, 0.06)}, inset 0 1px 0 ${alpha('#fff', 0.7)}`,
                                        },
                                        '&:hover::after': {
                                            animation: `${shimmer} 1.2s ease forwards`,
                                        },
                                        '&:hover .stat-icon-badge': {
                                            transform: 'scale(1.05)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 6px 20px ${alpha(G_GREEN, 0.3)}`
                                                : `0 6px 20px ${alpha(TEAL, 0.2)}`,
                                        },
                                    }}
                                >
                                    {/* Icon badge */}
                                    <Box
                                        className="stat-icon-badge"
                                        sx={{
                                            width: 52, height: 52, borderRadius: '16px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22, color: '#fff', mb: 0.5,
                                            background: (theme) => theme.palette.mode === 'dark'
                                                ? `linear-gradient(135deg, ${G_GREEN}, ${alpha(ACCENT_CYAN, 0.7)})`
                                                : `linear-gradient(135deg, ${TEAL}, ${alpha(G_GREEN, 0.85)})`,
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 4px 14px ${alpha(G_GREEN, 0.25)}`
                                                : `0 4px 14px ${alpha(TEAL, 0.18)}`,
                                            transition: `transform 350ms ${EASE}, box-shadow 350ms ${EASE}`,
                                        }}
                                    >
                                        <i className={stat.icon}></i>
                                    </Box>

                                    {/* Value */}
                                    <Typography sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.35rem', md: '1.6rem' },
                                        letterSpacing: '-0.01em',
                                        color: 'text.primary',
                                        lineHeight: 1.2,
                                    }}>
                                        {stat.value}
                                    </Typography>

                                    {/* Label */}
                                    <Typography sx={{
                                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                                        fontWeight: 600,
                                        color: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'text.secondary',
                                        letterSpacing: '0.02em',
                                    }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* ═══════ WHY VOLUNTEER — futuristic ═══════ */}
                <Box sx={{
                    mb: 10, py: { xs: 6, md: 8 }, mx: -3, px: 3,
                    borderRadius: '24px',
                    position: 'relative', overflow: 'hidden',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? `linear-gradient(160deg, rgba(10,22,40,0.6) 0%, rgba(15,23,42,0.4) 100%)`
                        : `linear-gradient(160deg, ${alpha(TEAL, 0.03)} 0%, ${alpha(G_GREEN, 0.015)} 50%, ${alpha(ACCENT_CYAN, 0.02)} 100%)`,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : alpha(TEAL, 0.06)}`,
                }}>
                    {/* Section ambient glow */}
                    <Box sx={{
                        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                        width: 500, height: 300, borderRadius: '50%',
                        background: (theme) => theme.palette.mode === 'dark'
                            ? `radial-gradient(circle, ${alpha(G_GREEN, 0.06)} 0%, transparent 70%)`
                            : `radial-gradient(circle, ${alpha(TEAL, 0.04)} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    {/* Section heading */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 }, position: 'relative', zIndex: 1 }}>
                        <Box sx={{
                            width: 36, height: 2.5, borderRadius: 2, mx: 'auto', mb: 2,
                            background: `linear-gradient(90deg, ${alpha(G_GREEN, 0.3)}, ${alpha(ACCENT_CYAN, 0.5)}, ${alpha(G_GREEN, 0.3)})`,
                        }} />
                        <Typography sx={{
                            fontWeight: 800, color: 'text.primary',
                            fontSize: { xs: '1.3rem', md: '1.65rem' },
                            letterSpacing: '-0.01em',
                        }}>
                            {t('volunteer.whyVolunteer')}
                        </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ position: 'relative', zIndex: 1 }}>
                        {reasons.map((reason, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                {/* Gradient border wrapper */}
                                <Box sx={{
                                    borderRadius: '20px', p: '1px', height: '100%',
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(G_GREEN, 0.25)}, ${alpha(ACCENT_CYAN, 0.1)}, ${alpha(G_GREEN, 0.06)})`
                                        : `linear-gradient(135deg, ${alpha(TEAL, 0.14)}, ${alpha(G_GREEN, 0.08)}, ${alpha(TEAL, 0.04)})`,
                                    backgroundSize: '200% 200%',
                                    animation: `${gradientShift} 8s ease infinite ${i * 0.4}s`,
                                }}>
                                    <Box sx={{
                                        borderRadius: '19px', height: '100%',
                                        p: { xs: 3, md: 3.5 },
                                        textAlign: 'center',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        position: 'relative', overflow: 'hidden',
                                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(15, 25, 40, 0.78)'
                                            : 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'saturate(1.3) blur(18px)',
                                        WebkitBackdropFilter: 'saturate(1.3) blur(18px)',
                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                            ? `0 6px 28px rgba(0,0,0,0.35), inset 0 1px 0 ${alpha('#fff', 0.04)}`
                                            : `0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 ${alpha('#fff', 0.5)}`,
                                        transition: `transform 400ms ${EASE}, box-shadow 400ms ${EASE}`,
                                        cursor: 'default',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: '-100%',
                                            width: '60%', height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.05)}, transparent)`,
                                            transform: 'skewX(-20deg)',
                                            pointerEvents: 'none',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 14px 44px rgba(0,0,0,0.45), 0 0 18px ${alpha(G_GREEN, 0.1)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`
                                                : `0 10px 36px rgba(0,0,0,0.09), 0 0 14px ${alpha(TEAL, 0.05)}, inset 0 1px 0 ${alpha('#fff', 0.65)}`,
                                        },
                                        '&:hover::after': {
                                            animation: `${shimmer} 1.2s ease forwards`,
                                        },
                                        '&:hover .why-icon-badge': {
                                            transform: 'scale(1.05)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 6px 20px ${alpha(G_GREEN, 0.3)}`
                                                : `0 6px 18px ${alpha(TEAL, 0.22)}`,
                                        },
                                    }}>
                                        {/* Icon badge */}
                                        <Box
                                            className="why-icon-badge"
                                            sx={{
                                                width: 56, height: 56, borderRadius: '18px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 24, color: '#fff', mb: 2,
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? `linear-gradient(135deg, ${G_GREEN}, ${alpha(ACCENT_CYAN, 0.7)})`
                                                    : `linear-gradient(135deg, ${TEAL}, ${alpha(G_GREEN, 0.85)})`,
                                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                                    ? `0 4px 16px ${alpha(G_GREEN, 0.25)}`
                                                    : `0 4px 16px ${alpha(TEAL, 0.18)}`,
                                                transition: `transform 350ms ${EASE}, box-shadow 350ms ${EASE}`,
                                            }}
                                        >
                                            <i className={reason.icon}></i>
                                        </Box>

                                        <Typography sx={{
                                            fontWeight: 750, fontSize: { xs: '0.95rem', md: '1.05rem' },
                                            color: 'text.primary', mb: 1, lineHeight: 1.3,
                                        }}>
                                            {reason.title}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: { xs: '0.8rem', md: '0.88rem' },
                                            color: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                                            lineHeight: 1.65,
                                        }}>
                                            {reason.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ═══════ OPPORTUNITIES — futuristic ═══════ */}
                <Box sx={{ mb: 10 }}>
                    {/* Section heading */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
                        <Box sx={{
                            width: 36, height: 2.5, borderRadius: 2, mx: 'auto', mb: 2,
                            background: `linear-gradient(90deg, ${alpha(G_GREEN, 0.3)}, ${alpha(ACCENT_CYAN, 0.5)}, ${alpha(G_GREEN, 0.3)})`,
                        }} />
                        <Typography sx={{
                            fontWeight: 800, color: 'text.primary',
                            fontSize: { xs: '1.3rem', md: '1.65rem' },
                            letterSpacing: '-0.01em',
                        }}>
                            {t('volunteer.opportunities')}
                        </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {volunteerAreas.map((area, i) => (
                            <Grid item xs={12} sm={6} md={4} key={area.id}>
                                {/* Gradient border wrapper */}
                                <Box sx={{
                                    borderRadius: '20px', p: '1px', height: '100%',
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(ACCENT_CYAN, 0.2)}, ${alpha(G_GREEN, 0.12)}, ${alpha(ACCENT_CYAN, 0.06)})`
                                        : `linear-gradient(135deg, ${alpha(TEAL, 0.12)}, ${alpha(G_GREEN, 0.08)}, ${alpha(TEAL, 0.04)})`,
                                    backgroundSize: '200% 200%',
                                    animation: `${gradientShift} 7s ease infinite ${i * 0.25}s`,
                                }}>
                                    <Box sx={{
                                        borderRadius: '19px', height: '100%',
                                        p: { xs: 3, md: 3.5 },
                                        textAlign: 'center',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        position: 'relative', overflow: 'hidden',
                                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(15, 25, 40, 0.78)'
                                            : 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'saturate(1.3) blur(18px)',
                                        WebkitBackdropFilter: 'saturate(1.3) blur(18px)',
                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                            ? `0 6px 28px rgba(0,0,0,0.35), inset 0 1px 0 ${alpha('#fff', 0.04)}`
                                            : `0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 ${alpha('#fff', 0.5)}`,
                                        transition: `transform 400ms ${EASE}, box-shadow 400ms ${EASE}`,
                                        cursor: 'pointer',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: '-100%',
                                            width: '60%', height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.05)}, transparent)`,
                                            transform: 'skewX(-20deg)',
                                            pointerEvents: 'none',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 14px 44px rgba(0,0,0,0.45), 0 0 18px ${alpha(ACCENT_CYAN, 0.08)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`
                                                : `0 10px 36px rgba(0,0,0,0.09), 0 0 14px ${alpha(TEAL, 0.05)}, inset 0 1px 0 ${alpha('#fff', 0.65)}`,
                                        },
                                        '&:hover::after': {
                                            animation: `${shimmer} 1.2s ease forwards`,
                                        },
                                        '&:hover .opp-icon-badge': {
                                            transform: 'scale(1.05)',
                                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                                ? `0 6px 20px ${alpha(ACCENT_CYAN, 0.25)}`
                                                : `0 6px 18px ${alpha(TEAL, 0.22)}`,
                                        },
                                    }}>
                                        {/* Icon badge */}
                                        <Box
                                            className="opp-icon-badge"
                                            sx={{
                                                width: 60, height: 60, borderRadius: '20px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 26, color: '#fff', mb: 2,
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? `linear-gradient(135deg, ${alpha(ACCENT_CYAN, 0.85)}, ${G_GREEN})`
                                                    : `linear-gradient(135deg, ${TEAL}, ${TEAL_MID})`,
                                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                                    ? `0 4px 16px ${alpha(ACCENT_CYAN, 0.2)}`
                                                    : `0 4px 16px ${alpha(TEAL, 0.18)}`,
                                                transition: `transform 350ms ${EASE}, box-shadow 350ms ${EASE}`,
                                            }}
                                        >
                                            <i className={area.icon}></i>
                                        </Box>

                                        <Typography sx={{
                                            fontWeight: 750, fontSize: { xs: '0.95rem', md: '1.05rem' },
                                            color: 'text.primary', mb: 1, lineHeight: 1.3,
                                        }}>
                                            {area.label}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: { xs: '0.8rem', md: '0.88rem' },
                                            color: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                                            lineHeight: 1.65,
                                        }}>
                                            {area.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ═══════ SIGN UP FORM (Matches Contact form styling) ═══════ */}
                <Box sx={{ position: 'relative', py: { xs: 5, md: 8 }, mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 4 },
                        alignItems: 'flex-start',
                    }}>
                        {/* ══════════════════════════════════
                            COLUMN A — INFO CARDS
                            In RTL → RIGHT side. In LTR → LEFT.
                        ══════════════════════════════════ */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '0 0 38%' },
                            width: { xs: '100%', md: '38%' },
                            order: { xs: 2, md: 1 },
                        }}>
                            <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
                                {/* Main Info Card */}
                                <Paper elevation={0} sx={{
                                    p: { xs: 3, md: 4 },
                                    borderRadius: '24px',
                                    border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                    backgroundColor: (t) => t.palette.mode === 'dark' ? 'rgba(15,22,35,0.6)' : 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: (theme) => theme.palette.mode === 'dark'
                                        ? `0 12px 32px rgba(0,0,0,0.3)`
                                        : `0 12px 32px rgba(0,0,0,0.03)`,
                                    textAlign: 'center',
                                }}>
                                    <Box sx={{
                                        width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 3,
                                        background: (t) => t.palette.mode === 'dark' ? `linear-gradient(135deg, ${G_GREEN}, #059669)` : `linear-gradient(135deg, ${TEAL}, #0d7c65)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: 24, flexShrink: 0,
                                        boxShadow: `0 4px 16px ${alpha(TEAL, 0.25)}`,
                                    }}>
                                        <i className="fa-solid fa-handshake-angle"></i>
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                                        {t('volunteer.signUp')}
                                    </Typography>
                                    <Box sx={{ maxWidth: 320, mx: 'auto' }}>
                                        <Typography variant="subtitle1" sx={{ 
                                            fontWeight: 700,
                                            color: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.95)' : 'text.primary',
                                            mb: 1, 
                                            lineHeight: 1.4,
                                            fontSize: '1rem',
                                            letterSpacing: '-0.01em'
                                        }}>
                                            {isEn ? "Join us and make a difference" : "انضم إلينا واصنع الفرق"}
                                        </Typography>
                                        <Divider sx={{ my: 1.5, opacity: 0.5, width: '40%', mx: 'auto', borderColor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }} />
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.secondary', 
                                            lineHeight: 1.7, 
                                            fontSize: '0.88rem',
                                        }}>
                                            {isEn ? "We will contact you to determine the best area and time to volunteer." : "سنتواصل معك لتحديد أنسب مجال ووقت للتطوع."}
                                        </Typography>
                                    </Box>
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
                                    borderRadius: '24px',
                                    border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
                                    backgroundColor: (t) => t.palette.mode === 'dark' ? 'rgba(20,28,40,0.9)' : 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: (theme) => theme.palette.mode === 'dark'
                                        ? `0 24px 64px rgba(0,0,0,0.4)`
                                        : `0 24px 64px rgba(0,0,0,0.06)`,
                                    p: { xs: 3, sm: 4, md: 5 },
                                }}
                            >
                                <form onSubmit={handleSubmit} noValidate>
                                    <SectionHeading
                                        icon="fa-solid fa-user-circle"
                                        label={t('volunteer.signUp')}
                                    />
                                    
                                    <Stack spacing={2.5}>
                                        <TextField
                                            label={t('volunteer.name')}
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            onBlur={() => handleBlur('name')}
                                            error={getError('name')}
                                            helperText={getHelper('name')}
                                            required
                                            fullWidth
                                            sx={(theme) => inputSx(theme)}
                                        />
                                        <Box sx={{
                                            display: 'flex', gap: 2.5,
                                            flexDirection: { xs: 'column', sm: 'row' },
                                        }}>
                                            <TextField
                                                label={t('volunteer.email')}
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                onBlur={() => handleBlur('email')}
                                                error={getError('email')}
                                                helperText={getHelper('email')}
                                                required
                                                fullWidth
                                                sx={(theme) => inputSx(theme)}
                                            />
                                            <TextField
                                                label={t('volunteer.phone')}
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                onBlur={() => handleBlur('phone')}
                                                error={getError('phone')}
                                                helperText={getHelper('phone')}
                                                required
                                                fullWidth
                                                sx={(theme) => inputSx(theme)}
                                            />
                                        </Box>
                                        <FormControl fullWidth required error={getError('area')} sx={(theme) => inputSx(theme)}>
                                            <InputLabel>{t('volunteer.area')}</InputLabel>
                                            <Select
                                                value={form.area}
                                                label={t('volunteer.area')}
                                                onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                                                onBlur={() => handleBlur('area')}
                                            >
                                                <MenuItem value="">{t('volunteer.areaPlaceholder')}</MenuItem>
                                                {volunteerAreas.map(a => (
                                                    <MenuItem key={a.id} value={a.id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <i className={a.icon} style={{ width: 22, textAlign: 'center', opacity: 0.8 }}></i>
                                                            {a.label}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {getError('area') && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75, fontSize: '0.82rem' }}>
                                                    {getHelper('area')}
                                                </Typography>
                                            )}
                                        </FormControl>
                                        
                                        <SectionHeading icon="fa-solid fa-comment-dots" label={t('volunteer.message')} />
                                        <TextField
                                            label={t('volunteer.message')}
                                            multiline
                                            rows={4}
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                            fullWidth
                                            sx={(theme) => inputSx(theme)}
                                        />

                                        <Box sx={{ pt: 2 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                disabled={submitted}
                                                sx={{
                                                    height: 52,
                                                    fontWeight: 700,
                                                    fontSize: '1.05rem',
                                                    textTransform: 'none',
                                                    borderRadius: '12px',
                                                    background: (t) => t.palette.mode === 'dark'
                                                        ? `linear-gradient(135deg, ${G_GREEN} 0%, #059669 100%)`
                                                        : `linear-gradient(135deg, ${TEAL} 0%, #0d7c65 100%)`,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.mode === 'dark' ? G_GREEN : TEAL, 0.3)}`,
                                                    '&:hover:not(:disabled)': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.mode === 'dark' ? G_GREEN : TEAL, 0.45)}`,
                                                        background: (t) => t.palette.mode === 'dark'
                                                            ? `linear-gradient(135deg, #059669 0%, ${G_GREEN} 100%)`
                                                            : `linear-gradient(135deg, #0d7c65 0%, ${TEAL} 100%)`,
                                                    },
                                                    '&.Mui-disabled': {
                                                        opacity: 0.7,
                                                        color: '#fff',
                                                        background: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : alpha(TEAL, 0.4),
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                {submitted ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {isEn ? 'Registered Successfully!' : 'تم التسجيل بنجاح!'} <i className="fa-solid fa-check"></i>
                                                    </Box>
                                                ) : t('common.joinNow')}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </form>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Volunteer;

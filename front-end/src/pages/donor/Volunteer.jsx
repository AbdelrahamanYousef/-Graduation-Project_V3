import { useState, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Stack,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    IconButton,
    Chip,
    useTheme,
    alpha,
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — design tokens (kept consistent across the page)
   ═══════════════════════════════════════════════════════════════ */
const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const TEAL_DARK = '#0a1f1c';
const DEEP_BLUE = '#0a1628';
const G_GREEN = '#00b16a';
const ACCENT_CYAN = '#22d3ee';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const MAX_CV_MB = 5;
const ALLOWED_CV_EXT = ['pdf', 'doc', 'docx'];

/* ═══════════════════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(14px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(1.08); }
`;

const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0%   { left: -100%; }
  100% { left: 200%; }
`;

/* ═══════════════════════════════════════════════════════════════
   STYLED: HERO — split editorial layout (new direction)
   - Asymmetric grid (text + visual panel)
   - No floating particles; uses a clean gradient + grid-pattern overlay
   - Stats are docked at the bottom of the hero (no disconnected floating cards)
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        // NOTE: do NOT use overflow:hidden here — the docked stats strip
        // overlaps the bottom of the hero (negative margin-top) and would be clipped.
        color: '#fff',
        paddingTop: 96,
        paddingBottom: 120,
        background: dk
            ? `linear-gradient(135deg, ${TEAL_DARK} 0%, #040f0d 55%, ${DEEP_BLUE} 100%)`
            : `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 55%, ${TEAL_DARK} 100%)`,
        '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
                'radial-gradient(ellipse at 80% 10%, rgba(34,211,238,0.10) 0%, transparent 55%),' +
                'radial-gradient(ellipse at 10% 90%, rgba(0,177,106,0.12) 0%, transparent 55%)',
            pointerEvents: 'none',
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            pointerEvents: 'none',
        },
        [theme.breakpoints.down('md')]: {
            paddingTop: 64,
            paddingBottom: 96,
            textAlign: 'center',
        },
    };
});

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADING
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

/* Shared Input Styling */
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
    const containerRef = useRef(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        area: '',
        message: '',
        cvFile: null,   // File object
        cvUrl: '',      // URL string
    });
    const [cvMode, setCvMode] = useState('file'); // 'file' | 'url'
    const [cvError, setCvError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };
    const isUrlValid = (url) => {
        if (!url) return false;
        try { new URL(url); return /^https?:\/\//i.test(url); } catch { return false; }
    };
    const getError = (field) => {
        if (!touched[field]) return false;
        if (field === 'name') return !form.name || form.name.trim().length < 3;
        if (field === 'email') return !form.email || !isEmailValid(form.email);
        if (field === 'phone') return !form.phone || !isPhoneValid(form.phone);
        if (field === 'area') return !form[field];
        if (field === 'cvUrl') return cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        return false;
    };
    const getHelper = (field) => {
        if (!getError(field)) return ' ';
        if (field === 'name' && form.name && form.name.trim().length < 3)
            return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        if (field === 'email' && form.email) return 'أدخل بريدًا صالحًا';
        if (field === 'phone' && form.phone) return 'أدخل رقمًا صالحًا (10–15 رقم)';
        if (field === 'cvUrl') return 'أدخل رابطًا صالحًا يبدأ بـ http(s)';
        return 'هذا الحقل مطلوب';
    };

    /* ── CV handling ── */
    const handleCvFile = (file) => {
        setCvError('');
        if (!file) return;
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_CV_EXT.includes(ext)) {
            setCvError(`صيغة غير مدعومة. المسموح: ${ALLOWED_CV_EXT.join(', ').toUpperCase()}`);
            return;
        }
        if (file.size > MAX_CV_MB * 1024 * 1024) {
            setCvError(`الحد الأقصى لحجم الملف ${MAX_CV_MB}MB`);
            return;
        }
        setForm(p => ({ ...p, cvFile: file, cvUrl: '' }));
    };
    const clearCv = () => {
        setForm(p => ({ ...p, cvFile: null, cvUrl: '' }));
        setCvError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const volunteerAreas = [
        { id: 'medical', icon: 'fa-solid fa-hospital', label: 'طبي', desc: 'المشاركة في القوافل الطبية والتوعية الصحية' },
        { id: 'education', icon: 'fa-solid fa-book-open', label: 'تعليمي', desc: 'تعليم الأطفال ومحو الأمية والدروس الخصوصية' },
        { id: 'community', icon: 'fa-solid fa-people-roof', label: 'مجتمعي', desc: 'تنمية المجتمعات المحلية والمبادرات الاجتماعية' },
        { id: 'tech', icon: 'fa-solid fa-laptop-code', label: 'تقني', desc: 'التصميم والبرمجة ودعم البنية التحتية الرقمية' },
        { id: 'admin', icon: 'fa-solid fa-clipboard-list', label: 'إداري', desc: 'التنظيم والإدارة والتخطيط للمشاريع' },
        { id: 'field', icon: 'fa-solid fa-truck', label: 'ميداني', desc: 'التوزيع والإغاثة والعمل الميداني المباشر' },
    ];

    const impactNumbers = [
        { value: '+2,500', label: 'متطوع نشط', icon: 'fa-solid fa-users' },
        { value: '+50,000', label: 'ساعة تطوعية', icon: 'fa-solid fa-clock' },
        { value: '+120', label: 'مجتمع مستفيد', icon: 'fa-solid fa-people-roof' },
        { value: '+35', label: 'مشروع تطوعي', icon: 'fa-solid fa-bullseye' },
    ];

    const reasons = [
        { icon: 'fa-solid fa-heart', title: 'أجر عظيم', desc: 'التطوع من أعظم أبواب الخير والصدقة الجارية' },
        { icon: 'fa-solid fa-handshake', title: 'صداقات جديدة', desc: 'انضم لمجتمع من المتطوعين المحبين للخير' },
        { icon: 'fa-solid fa-arrow-trend-up', title: 'تطوير مهاراتك', desc: 'اكتسب خبرات عملية وطوّر مهاراتك المهنية' },
        { icon: 'fa-solid fa-earth-americas', title: 'أثر حقيقي', desc: 'شاهد تأثيرك المباشر على حياة المحتاجين' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const allTouched = { name: true, email: true, phone: true, area: true, cvUrl: true };
        setTouched(allTouched);
        const hasErrors = ['name', 'email', 'phone', 'area'].some(f => {
            if (f === 'name') return !form.name || form.name.trim().length < 3;
            if (f === 'email') return !form.email || !isEmailValid(form.email);
            if (f === 'phone') return !form.phone || !isPhoneValid(form.phone);
            return !form[f];
        });
        const cvInvalid = cvMode === 'url' && form.cvUrl && !isUrlValid(form.cvUrl);
        if (hasErrors || cvInvalid) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setForm({ name: '', email: '', phone: '', area: '', message: '', cvFile: null, cvUrl: '' });
        setTouched({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Box sx={{ pb: 12 }} ref={containerRef}>

            {/* ═══════════════════════════════════════════════
                HERO — split editorial layout + docked stats
                ═══════════════════════════════════════════════ */}
            <HeroSection>
                {/* ambient glows */}
                <Box sx={{
                    position: 'absolute', top: '-15%', right: '-5%',
                    width: 420, height: 420, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(G_GREEN, 0.18)} 0%, transparent 70%)`,
                    animation: `${glowPulse} 8s ease-in-out infinite`,
                    pointerEvents: 'none', zIndex: 0,
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '5%', left: '-8%',
                    width: 340, height: 340, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(ACCENT_CYAN, 0.10)} 0%, transparent 70%)`,
                    animation: `${glowPulse} 10s ease-in-out infinite 1.5s`,
                    pointerEvents: 'none', zIndex: 0,
                }} />

                <Container sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                        {/* ── TEXT COLUMN ── */}
                        <Grid item xs={12} lg={7} sx={{ pr: { lg: 6, xl: 8 } }}>
                            <Chip
                                label="انضم لمجتمع المتطوعين"
                                icon={<i className="fa-solid fa-seedling" style={{ fontSize: 12, color: ACCENT_CYAN, marginInlineStart: 8 }} />}
                                sx={{
                                    color: '#fff',
                                    backgroundColor: alpha('#fff', 0.08),
                                    border: `1px solid ${alpha('#fff', 0.14)}`,
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: 600, fontSize: '0.8rem', mb: 3,
                                    animation: `${fadeInUp} 0.6s ${EASE} both`,
                                    '& .MuiChip-icon': { mr: 0, ml: 0 },
                                }}
                            />
                            <Typography
                                component="h1"
                                sx={{
                                    fontWeight: 900,
                                    color: '#fff',
                                    fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
                                    lineHeight: 1.15,
                                    letterSpacing: '-0.02em',
                                    mb: 2.5,
                                    animation: `${fadeInUp} 0.7s ${EASE} both 0.08s`,
                                }}
                            >
                                {t('volunteer.title')}{' '}
                                <Box component="span" sx={{
                                    background: `linear-gradient(90deg, ${G_GREEN}, ${ACCENT_CYAN})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    {t('volunteer.subtitle')}
                                </Box>
                            </Typography>
                            <Typography sx={{
                                color: alpha('#fff', 0.72),
                                lineHeight: 1.8,
                                fontSize: { xs: '0.92rem', md: '1.05rem' },
                                maxWidth: 560,
                                mb: 4,
                                animation: `${fadeInUp} 0.7s ${EASE} both 0.16s`,
                            }}>
                                {t('volunteer.description')}
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{
                                    animation: `${fadeInUp} 0.7s ${EASE} both 0.24s`,
                                    justifyContent: { xs: 'center', md: 'flex-start' },
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    href="#volunteer-form"
                                    sx={{
                                        height: 52, px: 4, borderRadius: '12px',
                                        fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                                        background: `linear-gradient(135deg, ${G_GREEN}, #059669)`,
                                        boxShadow: `0 8px 24px ${alpha(G_GREEN, 0.4)}`,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 12px 32px ${alpha(G_GREEN, 0.55)}`,
                                            background: `linear-gradient(135deg, #059669, ${G_GREEN})`,
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                    endIcon={<i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} />}
                                >
                                    سجّل تطوعك الآن
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    href="#opportunities"
                                    sx={{
                                        height: 52, px: 4, borderRadius: '12px',
                                        fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                                        color: '#fff',
                                        borderColor: alpha('#fff', 0.25),
                                        backgroundColor: alpha('#fff', 0.04),
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            borderColor: alpha('#fff', 0.5),
                                            backgroundColor: alpha('#fff', 0.08),
                                        },
                                    }}
                                >
                                    استكشف الفرص
                                </Button>
                            </Stack>
                        </Grid>

                        {/* ── VISUAL COLUMN — geometric panel ── */}
                        {/* Hidden on md (not enough room — badges bleed into the title).
                            Only shown on lg+ where the disc has space to breathe. */}
                        <Grid item xs={12} lg={5} sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <Box sx={{
                                position: 'relative',
                                aspectRatio: '1 / 1',
                                width: '100%',
                                maxWidth: 340,
                                // Push the disc to the FAR side of its column (left edge in RTL)
                                // so its floating badges never reach into the title text.
                                mr: 'auto',
                                ml: 0,
                                animation: `${fadeInScale} 0.9s ${EASE} both 0.3s`,
                            }}>
                                {/* layered rings */}
                                {[0, 1, 2].map(i => (
                                    <Box key={i} sx={{
                                        position: 'absolute', inset: i * 18,
                                        borderRadius: '50%',
                                        border: `1px solid ${alpha('#fff', 0.08 + i * 0.03)}`,
                                    }} />
                                ))}
                                {/* core glowing disk */}
                                <Box sx={{
                                    position: 'absolute', inset: '20%',
                                    borderRadius: '50%',
                                    background: `conic-gradient(from 180deg, ${alpha(G_GREEN, 0.4)}, ${alpha(ACCENT_CYAN, 0.35)}, ${alpha(G_GREEN, 0.4)})`,
                                    filter: 'blur(8px)',
                                    opacity: 0.85,
                                    animation: `${gradientShift} 12s linear infinite`,
                                    backgroundSize: '200% 200%',
                                }} />
                                <Box sx={{
                                    position: 'absolute', inset: '28%',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${alpha('#0a1f1c', 0.85)}, ${alpha(TEAL_DARK, 0.7)})`,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha('#fff', 0.1)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 30px 80px ${alpha('#000', 0.5)}`,
                                }}>
                                    <i className="fa-solid fa-hands-holding-heart" style={{ fontSize: 64, color: '#fff', opacity: 0.95 }}></i>
                                </Box>
                                {/* floating mini badges — kept inside the disc bounds so they don't overlap the title */}
                                {[
                                    { icon: 'fa-solid fa-hospital',     top: '-2%',   left: '-4%' },
                                    { icon: 'fa-solid fa-book-open',    top: '6%',    right: '-2%' },
                                    { icon: 'fa-solid fa-laptop-code',  bottom: '6%', left: '-2%' },
                                    { icon: 'fa-solid fa-people-roof',  bottom: '-2%',right: '-4%' },
                                ].map((b, i) => (
                                    <Box key={i} sx={{
                                        position: 'absolute', ...b,
                                        width: 64, height: 64, borderRadius: '18px',
                                        background: `linear-gradient(135deg, ${alpha('#fff', 0.12)}, ${alpha('#fff', 0.04)})`,
                                        border: `1px solid ${alpha('#fff', 0.15)}`,
                                        backdropFilter: 'blur(14px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: 24,
                                        boxShadow: `0 12px 36px ${alpha('#000', 0.4)}`,
                                        animation: `${fadeInScale} 0.6s ${EASE} both ${0.5 + i * 0.12}s`,
                                    }}>
                                        <i className={b.icon}></i>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>

            </HeroSection>

            {/* ── DOCKED STATS STRIP — overlaps the hero via negative margin (lives OUTSIDE
                the hero to avoid being clipped by its decorative overlays) ── */}
            <Container sx={{
                position: 'relative',
                zIndex: 3,
                mt: { xs: -7, md: -8 },
                px: { xs: 2, sm: 3 },
            }}>
                <Box sx={{
                        borderRadius: '24px',
                        p: '1px',
                        background: `linear-gradient(135deg, ${alpha(G_GREEN, 0.45)}, ${alpha(ACCENT_CYAN, 0.25)}, ${alpha(G_GREEN, 0.15)})`,
                        backgroundSize: '200% 200%',
                        animation: `${gradientShift} 8s ease infinite`,
                        boxShadow: `0 24px 60px ${alpha('#000', 0.35)}`,
                    }}>
                        <Box sx={{
                            borderRadius: '23px',
                            backgroundColor: isDark ? 'rgba(15, 25, 40, 0.92)' : 'rgba(255, 255, 255, 0.96)',
                            backdropFilter: 'saturate(1.4) blur(20px)',
                            WebkitBackdropFilter: 'saturate(1.4) blur(20px)',
                            px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2.5, md: 3 },
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: { xs: 'wrap', md: 'nowrap' },
                                width: '100%',
                                alignItems: 'stretch',
                            }}>
                                {impactNumbers.map((stat, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            flex: { xs: '1 1 50%', md: '1 1 0' },
                                            minWidth: 0,
                                            py: { xs: 1.5, md: 1.25 },
                                            px: { xs: 1, sm: 2, md: 2.5 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                            borderInlineEndStyle: 'solid',
                                            borderInlineEndWidth: {
                                                xs: i % 2 === 0 ? '1px' : 0,
                                                md: i === impactNumbers.length - 1 ? 0 : '1px',
                                            },
                                            borderBottomStyle: 'solid',
                                            borderBottomWidth: { xs: i < 2 ? '1px' : 0, md: 0 },
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'inline-flex', alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: { xs: 1, sm: 1.25, md: 1.5 },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            textAlign: 'center',
                                            minHeight: { xs: 72, md: 'auto' },
                                        }}>
                                            <Box sx={{
                                                width: { xs: 38, md: 44 },
                                                height: { xs: 38, md: 44 },
                                                borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: 18, flexShrink: 0,
                                                background: isDark
                                                    ? `linear-gradient(135deg, ${G_GREEN}, ${alpha(ACCENT_CYAN, 0.7)})`
                                                    : `linear-gradient(135deg, ${TEAL}, ${G_GREEN})`,
                                                boxShadow: `0 6px 14px ${alpha(isDark ? G_GREEN : TEAL, 0.3)}`,
                                            }}>
                                                <i className={stat.icon}></i>
                                            </Box>
                                            <Box sx={{ textAlign: { xs: 'center', sm: 'start' } }}>
                                                <Typography sx={{
                                                    fontWeight: 800,
                                                    fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.4rem' },
                                                    lineHeight: 1.1,
                                                    color: 'text.primary',
                                                    letterSpacing: '-0.01em',
                                                }}>
                                                    {stat.value}
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.8rem' },
                                                    fontWeight: 600,
                                                    color: isDark ? 'rgba(255,255,255,0.65)' : 'text.secondary',
                                                    mt: 0.25,
                                                }}>
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
            </Container>

            <Container sx={{ mt: { xs: 8, md: 10 } }}>

                {/* ═══════ WHY VOLUNTEER ═══════ */}
                <Box sx={{
                    mb: 10, py: { xs: 6, md: 8 }, px: { xs: 3, md: 5 },
                    borderRadius: '24px',
                    position: 'relative', overflow: 'hidden',
                    background: isDark
                        ? `linear-gradient(160deg, rgba(10,22,40,0.6) 0%, rgba(15,23,42,0.4) 100%)`
                        : `linear-gradient(160deg, ${alpha(TEAL, 0.03)} 0%, ${alpha(G_GREEN, 0.015)} 50%, ${alpha(ACCENT_CYAN, 0.02)} 100%)`,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : alpha(TEAL, 0.06)}`,
                }}>
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
                            {t('volunteer.whyVolunteer')}
                        </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {reasons.map((reason, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Box sx={{
                                    borderRadius: '20px', p: '1px', height: '100%',
                                    background: isDark
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
                                        backgroundColor: isDark ? 'rgba(15, 25, 40, 0.78)' : 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'saturate(1.3) blur(18px)',
                                        WebkitBackdropFilter: 'saturate(1.3) blur(18px)',
                                        boxShadow: isDark
                                            ? `0 6px 28px rgba(0,0,0,0.35), inset 0 1px 0 ${alpha('#fff', 0.04)}`
                                            : `0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 ${alpha('#fff', 0.5)}`,
                                        transition: `transform 400ms ${EASE}, box-shadow 400ms ${EASE}`,
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
                                            boxShadow: isDark
                                                ? `0 14px 44px rgba(0,0,0,0.45), 0 0 18px ${alpha(G_GREEN, 0.1)}`
                                                : `0 10px 36px rgba(0,0,0,0.09), 0 0 14px ${alpha(TEAL, 0.05)}`,
                                        },
                                        '&:hover::after': { animation: `${shimmer} 1.2s ease forwards` },
                                    }}>
                                        <Box sx={{
                                            width: 56, height: 56, borderRadius: '18px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 24, color: '#fff', mb: 2,
                                            background: isDark
                                                ? `linear-gradient(135deg, ${G_GREEN}, ${alpha(ACCENT_CYAN, 0.7)})`
                                                : `linear-gradient(135deg, ${TEAL}, ${alpha(G_GREEN, 0.85)})`,
                                            boxShadow: `0 4px 16px ${alpha(isDark ? G_GREEN : TEAL, 0.22)}`,
                                        }}>
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
                                            color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
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

                {/* ═══════ OPPORTUNITIES ═══════ */}
                <Box id="opportunities" sx={{ mb: 10, scrollMarginTop: 80 }}>
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
                                <Box sx={{
                                    borderRadius: '20px', p: '1px', height: '100%',
                                    background: isDark
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
                                        backgroundColor: isDark ? 'rgba(15, 25, 40, 0.78)' : 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'saturate(1.3) blur(18px)',
                                        WebkitBackdropFilter: 'saturate(1.3) blur(18px)',
                                        boxShadow: isDark
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
                                            boxShadow: isDark
                                                ? `0 14px 44px rgba(0,0,0,0.45), 0 0 18px ${alpha(ACCENT_CYAN, 0.08)}`
                                                : `0 10px 36px rgba(0,0,0,0.09), 0 0 14px ${alpha(TEAL, 0.05)}`,
                                        },
                                        '&:hover::after': { animation: `${shimmer} 1.2s ease forwards` },
                                    }}>
                                        <Box sx={{
                                            width: 60, height: 60, borderRadius: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 26, color: '#fff', mb: 2,
                                            background: isDark
                                                ? `linear-gradient(135deg, ${alpha(ACCENT_CYAN, 0.85)}, ${G_GREEN})`
                                                : `linear-gradient(135deg, ${TEAL}, ${TEAL_MID})`,
                                            boxShadow: `0 4px 16px ${alpha(isDark ? ACCENT_CYAN : TEAL, 0.2)}`,
                                        }}>
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
                                            color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
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

                {/* ═══════ SIGN UP FORM ═══════ */}
                <Box id="volunteer-form" sx={{ position: 'relative', py: { xs: 5, md: 8 }, mb: 4, scrollMarginTop: 80 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 4 },
                        alignItems: 'flex-start',
                    }}>
                        {/* COL A — INFO */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '0 0 38%' },
                            width: { xs: '100%', md: '38%' },
                            order: { xs: 2, md: 1 },
                        }}>
                            <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
                                <Paper elevation={0} sx={{
                                    p: { xs: 3, md: 4 },
                                    borderRadius: '24px',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                    backgroundColor: isDark ? 'rgba(15,22,35,0.6)' : 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: isDark
                                        ? `0 12px 32px rgba(0,0,0,0.3)`
                                        : `0 12px 32px rgba(0,0,0,0.03)`,
                                    textAlign: 'center',
                                }}>
                                    <Box sx={{
                                        width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 3,
                                        background: isDark ? `linear-gradient(135deg, ${G_GREEN}, #059669)` : `linear-gradient(135deg, ${TEAL}, #0d7c65)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: 24,
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
                                            color: isDark ? 'rgba(255,255,255,0.95)' : 'text.primary',
                                            mb: 1, lineHeight: 1.4,
                                            fontSize: '1rem', letterSpacing: '-0.01em',
                                        }}>
                                            انضم إلينا واصنع الفرق
                                        </Typography>
                                        <Divider sx={{ my: 1.5, opacity: 0.5, width: '40%', mx: 'auto',
                                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }} />
                                        <Typography variant="body2" sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.7, fontSize: '0.88rem',
                                        }}>
                                            سنتواصل معك لتحديد أنسب مجال ووقت للتطوع.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Stack>
                        </Box>

                        {/* COL B — FORM */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '1 1 0%' },
                            width: { xs: '100%', md: 'auto' },
                            order: { xs: 1, md: 2 },
                        }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: '24px',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
                                    backgroundColor: isDark ? 'rgba(20,28,40,0.9)' : 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: isDark
                                        ? `0 24px 64px rgba(0,0,0,0.4)`
                                        : `0 24px 64px rgba(0,0,0,0.06)`,
                                    p: { xs: 3, sm: 4, md: 5 },
                                }}
                            >
                                <form onSubmit={handleSubmit} noValidate>
                                    <SectionHeading icon="fa-solid fa-user-circle" label={t('volunteer.signUp')} />

                                    <Stack spacing={2.5}>
                                        <TextField
                                            label={t('volunteer.name')}
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            onBlur={() => handleBlur('name')}
                                            error={getError('name')}
                                            helperText={getHelper('name')}
                                            required fullWidth
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
                                                required fullWidth
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
                                                required fullWidth
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

                                        {/* ═══════ CV — file OR url ═══════ */}
                                        <SectionHeading icon="fa-solid fa-file-lines" label="السيرة الذاتية (اختياري)" />
                                        <ToggleButtonGroup
                                            value={cvMode}
                                            exclusive
                                            onChange={(_, v) => v && setCvMode(v)}
                                            sx={{
                                                width: '100%',
                                                '& .MuiToggleButton-root': {
                                                    flex: 1, py: 1.25, borderRadius: '12px !important',
                                                    textTransform: 'none', fontWeight: 600, fontSize: '0.88rem',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                                    '&.Mui-selected': {
                                                        background: `linear-gradient(135deg, ${alpha(G_GREEN, 0.15)}, ${alpha(ACCENT_CYAN, 0.08)})`,
                                                        color: isDark ? '#fff' : TEAL_DARK,
                                                        borderColor: alpha(G_GREEN, 0.4),
                                                    },
                                                    '&:not(:last-of-type)': { mr: 1.25 },
                                                },
                                            }}
                                        >
                                            <ToggleButton value="file">
                                                <i className="fa-solid fa-cloud-arrow-up" style={{ marginInlineEnd: 8 }} />
                                                رفع ملف
                                            </ToggleButton>
                                            <ToggleButton value="url">
                                                <i className="fa-solid fa-link" style={{ marginInlineEnd: 8 }} />
                                                لينك
                                            </ToggleButton>
                                        </ToggleButtonGroup>

                                        {cvMode === 'file' ? (
                                            <Box>
                                                <input
                                                    ref={fileInputRef}
                                                    id="cv-file-input"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    onChange={(e) => handleCvFile(e.target.files?.[0])}
                                                    style={{ display: 'none' }}
                                                />
                                                {!form.cvFile ? (
                                                    <Box
                                                        component="label"
                                                        htmlFor="cv-file-input"
                                                        onDragOver={(e) => { e.preventDefault(); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            handleCvFile(e.dataTransfer.files?.[0]);
                                                        }}
                                                        sx={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                            justifyContent: 'center', gap: 1,
                                                            cursor: 'pointer',
                                                            py: 4, px: 2,
                                                            borderRadius: '14px',
                                                            border: `2px dashed ${cvError ? '#e57373' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')}`,
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                                                            transition: 'all 0.25s ease',
                                                            '&:hover': {
                                                                borderColor: alpha(G_GREEN, 0.6),
                                                                backgroundColor: alpha(G_GREEN, 0.04),
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            width: 48, height: 48, borderRadius: '12px',
                                                            background: `linear-gradient(135deg, ${alpha(G_GREEN, 0.15)}, ${alpha(ACCENT_CYAN, 0.1)})`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: isDark ? G_GREEN : TEAL,
                                                            fontSize: 20,
                                                        }}>
                                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                                        </Box>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                                                            اسحب وأفلت الملف هنا، أو اضغط للاختيار
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                                                            PDF, DOC, DOCX • حتى {MAX_CV_MB}MB
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                                        p: 2, borderRadius: '12px',
                                                        border: `1px solid ${alpha(G_GREEN, 0.3)}`,
                                                        backgroundColor: alpha(G_GREEN, 0.06),
                                                    }}>
                                                        <Box sx={{
                                                            width: 40, height: 40, borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${G_GREEN}, #059669)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#fff', fontSize: 16, flexShrink: 0,
                                                        }}>
                                                            <i className="fa-solid fa-file-lines"></i>
                                                        </Box>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography sx={{
                                                                fontWeight: 700, fontSize: '0.9rem',
                                                                color: 'text.primary',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {form.cvFile.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                                {(form.cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            onClick={clearCv}
                                                            size="small"
                                                            aria-label="حذف الملف"
                                                            sx={{ color: 'text.secondary', '&:hover': { color: '#e57373' } }}
                                                        >
                                                            <i className="fa-solid fa-xmark" style={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                                {cvError && (
                                                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, mx: 1.75, fontSize: '0.78rem', fontWeight: 500 }}>
                                                        {cvError}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <TextField
                                                label="رابط السيرة الذاتية (Google Drive / Dropbox / LinkedIn ...)"
                                                type="url"
                                                placeholder="https://..."
                                                value={form.cvUrl}
                                                onChange={e => setForm(p => ({ ...p, cvUrl: e.target.value, cvFile: null }))}
                                                onBlur={() => handleBlur('cvUrl')}
                                                error={getError('cvUrl')}
                                                helperText={getError('cvUrl') ? getHelper('cvUrl') : ' '}
                                                fullWidth
                                                sx={(theme) => inputSx(theme)}
                                            />
                                        )}

                                        <SectionHeading icon="fa-solid fa-comment-dots" label={t('volunteer.message')} />
                                        <TextField
                                            label={t('volunteer.message')}
                                            multiline rows={4}
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
                                                    fontWeight: 700, fontSize: '1.05rem',
                                                    textTransform: 'none', borderRadius: '12px',
                                                    background: isDark
                                                        ? `linear-gradient(135deg, ${G_GREEN} 0%, #059669 100%)`
                                                        : `linear-gradient(135deg, ${TEAL} 0%, #0d7c65 100%)`,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: `0 6px 16px ${alpha(isDark ? G_GREEN : TEAL, 0.3)}`,
                                                    '&:hover:not(:disabled)': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 8px 24px ${alpha(isDark ? G_GREEN : TEAL, 0.45)}`,
                                                        background: isDark
                                                            ? `linear-gradient(135deg, #059669 0%, ${G_GREEN} 100%)`
                                                            : `linear-gradient(135deg, #0d7c65 0%, ${TEAL} 100%)`,
                                                    },
                                                    '&.Mui-disabled': {
                                                        opacity: 0.7, color: '#fff',
                                                        background: isDark ? 'rgba(255,255,255,0.1)' : alpha(TEAL, 0.4),
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                {submitted ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        تم التسجيل بنجاح! <i className="fa-solid fa-check"></i>
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
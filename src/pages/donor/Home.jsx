import { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Chip,
    Avatar,
    LinearProgress,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency, getLanguage, formatNumber } from '../../i18n'; // Added formatNumber
import { updates, donationAmounts, testimonials, impactStats as originalImpactStats } from '../../data/mockData';
import { useAdminData } from '../../contexts/AdminDataContext';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { CampaignCardItem, QuickDonateModal } from './Campaigns';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.05); }
`;

const circlePulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.05; }
  50% { transform: scale(1.08); opacity: 0.10; }
`;

// Hero-specific animations — GPU-accelerated (transform + opacity only)
const sineFloat = keyframes`
  0%   { transform: translateY(0px); }
  25%  { transform: translateY(-10px); }
  50%  { transform: translateY(-18px); }
  75%  { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const heartPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 12px rgba(255,107,107,0.5)); }
  50%      { transform: scale(1.12); opacity: 0.85; filter: drop-shadow(0 0 24px rgba(255,107,107,0.8)); }
`;

const particleRise = keyframes`
  0%   { transform: translateY(0) scale(1); opacity: 0.7; }
  60%  { opacity: 0.4; }
  100% { transform: translateY(-90px) scale(0.5); opacity: 0; }
`;

const orbitSpin = keyframes`
  from { transform: rotateX(65deg) rotateZ(0deg); }
  to   { transform: rotateX(65deg) rotateZ(360deg); }
`;

const orbitSpinReverse = keyframes`
  from { transform: rotateX(65deg) rotateZ(360deg); }
  to   { transform: rotateX(65deg) rotateZ(0deg); }
`;

const badgeFloat1 = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33%      { transform: translateY(-8px) translateX(4px); }
  66%      { transform: translateY(4px) translateX(-3px); }
`;

const badgeFloat2 = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  40%      { transform: translateY(6px) translateX(-5px); }
  70%      { transform: translateY(-5px) translateX(3px); }
`;

// --- Styled Components ---

const HeroSection = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'announcementVisible',
})(({ theme, announcementVisible }) => {
    const ptMobile = announcementVisible ? '88px' : '64px';
    const ptDesktop = announcementVisible ? '148px' : '112px';
    return {
        position: 'relative',
        background: `radial-gradient(circle at 30% 40%, ${theme.palette.hero.overlay}, transparent 40%), linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
        color: theme.palette.common.white,
        paddingTop: ptMobile,
        paddingBottom: '60px',
        overflow: 'hidden',
        minHeight: { xs: 'auto', sm: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.up('sm')]: {
            paddingBottom: '80px',
        },
        [theme.breakpoints.up('md')]: {
            paddingTop: ptDesktop,
            paddingBottom: '160px',
            minHeight: '90vh',
        },
    };
});

const HeroGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(6),
        minHeight: '70vh',
    },
}));

const HeroContent = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 5,
    textAlign: 'center',
    order: 1,
    [theme.breakpoints.up('md')]: {
        textAlign: 'right',
        order: 1,
    },
}));

const HeroIllustrationContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    maxWidth: '380px',
    aspectRatio: '1',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    order: 2,
    [theme.breakpoints.up('xs')]: {
        maxWidth: '280px',
    },
    [theme.breakpoints.up('sm')]: {
        maxWidth: '380px',
    },
    [theme.breakpoints.up('md')]: {
        maxWidth: '500px',
        order: 2,
    },
}));

const HeroCircle = styled(Box)(({ theme, size, color, delay }) => {
    const baseSize = Number(size) || 300;
    return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto',
        width: baseSize * 0.55,
        height: baseSize * 0.55,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.06,
        animation: `${circlePulse} 8s ease-in-out infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
        [theme.breakpoints.up('sm')]: {
            width: baseSize * 0.75,
            height: baseSize * 0.75,
        },
        [theme.breakpoints.up('md')]: {
            width: baseSize,
            height: baseSize,
        },
    };
});

const OrbitalRing = styled(Box)(({ theme, ringSize, duration, reverse }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `clamp(${ringSize * 0.55}px, ${ringSize * 0.08}vw, ${ringSize}px)`,
    height: `clamp(${ringSize * 0.55}px, ${ringSize * 0.08}vw, ${ringSize}px)`,
    marginTop: `clamp(-${ringSize * 0.275}px, -${ringSize * 0.04}vw, -${ringSize / 2}px)`,
    marginLeft: `clamp(-${ringSize * 0.275}px, -${ringSize * 0.04}vw, -${ringSize / 2}px)`,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.10)',
    pointerEvents: 'none',
    animation: `${reverse ? orbitSpinReverse : orbitSpin} ${duration}s linear infinite`,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    zIndex: 3,
    '&::after': {
        content: '""',
        position: 'absolute',
        top: -3,
        left: '50%',
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
}));

const GlassBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    display: 'none',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderRadius: 14,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: theme.palette.common.white,
    fontSize: '0.8rem',
    fontWeight: 600,
    zIndex: 10,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    willChange: 'transform',
    [theme.breakpoints.up('sm')]: {
        display: 'flex',
    },
}));

const HeroParticle = styled(Box)(({ delay, leftPos, size }) => ({
    position: 'absolute',
    top: '38%',
    left: leftPos || '50%',
    fontSize: size || '0.7rem',
    color: 'rgba(255,107,107,0.7)',
    animation: `${particleRise} 4s ease-out infinite`,
    animationDelay: delay || '0s',
    pointerEvents: 'none',
    zIndex: 4,
    willChange: 'transform, opacity',
}));

const StatCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(0.5),
    borderRadius: theme.custom.radius.lg,
    border: `1.5px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    transition: 'all 280ms ease',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 3,
        borderRadius: '3px 3px 0 0',
        backgroundColor: theme.palette.primary.main,
        transition: 'width 300ms ease',
    },
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1.5px ${alpha(theme.palette.primary.main, 0.3)}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.03),
        '&::after': {
            width: '60%',
        },
        '& .stat-icon': {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
        },
    },
}));

const StatIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    height: 72,
    borderRadius: '50%',
    fontSize: '2.4rem',
    flexShrink: 0,
    color: theme.palette.mode === 'light' ? '#1F2D3D' : theme.palette.primary.light,
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transition: 'all 280ms ease',
}));

const ProgramCard = styled(Card)(({ theme, color }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    textAlign: 'center',
    borderRadius: theme.custom.radius.lg,
    transition: 'all 0.3s ease',
    border: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    '&:hover': {
        borderColor: color,
        backgroundColor: alpha(color, 0.05),
        transform: 'translateY(-4px)',
        '& .program-icon': {
            backgroundColor: color,
            color: theme.palette.common.white,
        }
    },
}));

const QuickDonateSection = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.mint,
    color: theme.palette.text.primary,
    padding: theme.spacing(theme.custom.sectionPadding, 0),
    position: 'relative',
    overflow: 'hidden',
}));

const TestimonialCard = styled(Card)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: '100%',
        padding: theme.spacing(4),
        borderRadius: 24,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.palette.common.white,
        position: 'relative',
        boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.25)'
            : '0 4px 20px rgba(0,0,0,0.05)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: isDark
                ? '0 8px 28px rgba(0,0,0,0.35)'
                : '0 8px 30px rgba(0,0,0,0.1)',
        },
        '&::before': {
            content: '"\\201C"',
            position: 'absolute',
            top: theme.spacing(2),
            left: theme.spacing(3),
            fontSize: '6rem',
            color: isDark ? 'rgba(255,255,255,0.06)' : '#E0F2F1',
            lineHeight: 1,
            fontFamily: 'serif',
            zIndex: 0,
        },
    };
});

const PillButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.custom.radius.pill,
    padding: theme.spacing(1.5, 4),
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textTransform: 'none',
}));

function Home() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [donateProject, setDonateProject] = useState(null);
    const navigate = useNavigate();

    // Read from shared context — reflects admin changes in real time
    const { state } = useAdminData();
    const dashboardStats = state.dashboardStats || {};

    // Derived lists
    const programs = state.programs?.filter(p => !p.status || p.status === 'active') || [];
    const featuredProjectsList = state.projects?.filter(p => p.featured) || [];

    // Dynamically calculate stats based on real data
    const impactStats = {
        totalDonations: dashboardStats.totalDonations || 0,
        beneficiaries: dashboardStats.beneficiaries || 0,
        projects: dashboardStats.totalProjects || 0,
        donors: dashboardStats.totalDonors || new Set(state.donations?.map(d => d.donor || d.donorName)).size || 0,
    };

    // Consistent section py value
    const sectionPy = theme.custom.sectionPadding;

    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);



    // Active islamic content
    const activeVerses = useMemo(() => {
        return (state.content?.quranicVerses || []).filter(v => v.active);
    }, [state.content?.quranicVerses]);

    // Rotation effect for islamic content
    useEffect(() => {
        if (state.content?.islamicDisplayMode !== 'rotating' || activeVerses.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentVerseIndex(prev => (prev + 1) % activeVerses.length);
        }, (state.content?.islamicRotationInterval || 5) * 1000);
        return () => clearInterval(interval);
    }, [state.content?.islamicDisplayMode, state.content?.islamicRotationInterval, activeVerses.length]);

    // Calculate or override stats
    const displayStats = useMemo(() => {
        const config = state.content?.statsConfig;
        if (config?.override) {
            return [
                { icon: 'fa-solid fa-coins', value: config.totalDonations || 0, label: t('home.totalDonations') },
                { icon: 'fa-solid fa-users', value: config.beneficiaries || 0, label: t('home.beneficiaries') },
                { icon: 'fa-solid fa-folder-open', value: config.projects || 0, label: t('home.projects') },
                { icon: 'fa-solid fa-calendar-days', value: config.years || 0, label: 'سنوات العطاء' },
            ];
        }
        return [
            { icon: 'fa-solid fa-coins', value: impactStats.totalDonations || 0, label: t('home.totalDonations') },
            { icon: 'fa-solid fa-users', value: impactStats.beneficiaries || 0, label: t('home.beneficiaries') },
            { icon: 'fa-solid fa-folder-open', value: impactStats.projects || 0, label: t('home.projects') },
            { icon: 'fa-solid fa-heart', value: impactStats.donors || 0, label: t('home.donors') },
        ];
    }, [state.content?.statsConfig, impactStats]);

    const [announcementVisible, setAnnouncementVisible] = useState(false);

    useEffect(() => {
        const checkVisibility = () => {
            const list = state.content?.announcements || [];
            const today = new Date().toISOString().split('T')[0];
            const active = list.find(a => {
                if (!a.active) return false;
                if (a.startDate && a.startDate > today) return false;
                if (a.endDate && a.endDate < today) return false;
                return true;
            });
            
            if (active) {
                const dismissedId = sessionStorage.getItem('dismissed_announcement_id');
                const dismissedText = sessionStorage.getItem('dismissed_announcement_text');
                const isDismissed = dismissedId === String(active.id) || dismissedText === active.text;
                setAnnouncementVisible(!isDismissed);
            } else {
                setAnnouncementVisible(false);
            }
        };

        checkVisibility();

        const handleAnnouncementChange = () => {
            checkVisibility();
        };

        window.addEventListener('announcement_change', handleAnnouncementChange);
        return () => {
            window.removeEventListener('announcement_change', handleAnnouncementChange);
        };
    }, [state.content?.announcements]);

    return (
        <Box sx={{ overflowX: 'hidden' }}>


            {/* ========== HERO ========== */}
            <HeroSection
                announcementVisible={announcementVisible}
                sx={{
                    ...(state.settings?.heroStyle === 'image' && state.content?.heroBanner?.image && {
                        backgroundImage: `linear-gradient(${theme.palette.hero.overlay}, ${theme.palette.hero.overlay}), url(${state.content.heroBanner.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    })
                }}
            >
                <Container>
                    <HeroGrid>
                        {/* --- Text Column --- */}
                        <HeroContent>
                            <Typography
                                variant="h1"
                                fontWeight="900"
                                sx={{
                                    lineHeight: 1.15,
                                    mb: 2,
                                    fontSize: 'clamp(1.8rem, 5vw, 4rem)',
                                    color: 'common.white',
                                    animation: `${fadeInUp} 0.8s ease forwards`,
                                }}
                            >
                                {state.content?.heroBanner?.title || t('home.heroTitle')}
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    lineHeight: 1.7,
                                    fontSize: 'clamp(0.88rem, 2vw, 1.25rem)',
                                    color: alpha(theme.palette.common.white, 0.85),
                                    animation: `${fadeInUp} 0.8s ease forwards 0.2s`,
                                    opacity: 0,
                                    animationFillMode: 'forwards',
                                }}
                            >
                                {state.content?.heroBanner?.subtitle || t('home.heroSubtitle')}
                            </Typography>
                            {activeVerses.length > 0 && state.content?.islamicDisplayMode === 'rotating' && (
                                <Box sx={{ mb: 4, minHeight: 60 }}>
                                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9), fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)', fontStyle: 'italic' }}>
                                        "{activeVerses[currentVerseIndex].text}"
                                        {activeVerses[currentVerseIndex].reference && <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.85rem', opacity: 0.8 }}>- {activeVerses[currentVerseIndex].reference}</Box>}
                                    </Typography>
                                </Box>
                            )}
                            {activeVerses.length > 0 && state.content?.islamicDisplayMode === 'stacked' && (
                                <Stack spacing={2} sx={{ mb: 4 }}>
                                    {activeVerses.map(verse => (
                                        <Typography key={verse.id} variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9), fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', fontStyle: 'italic', borderLeft: '3px solid', borderColor: 'primary.main', pl: 2 }}>
                                            "{verse.text}"
                                            {verse.reference && <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.8rem', opacity: 0.8 }}>- {verse.reference}</Box>}
                                        </Typography>
                                    ))}
                                </Stack>
                            )}

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                justifyContent={{ xs: 'center', md: 'flex-start' }}
                                alignItems={{ xs: 'center', sm: 'stretch' }}
                                sx={{
                                    animation: `${fadeInUp} 0.8s ease forwards 0.4s`,
                                    opacity: 0,
                                    animationFillMode: 'forwards',
                                    '& > a': {
                                        width: { xs: '240px', sm: 'auto' }
                                    }
                                }}
                            >
                                <PillButton
                                    component={Link}
                                    to="/donate"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{
                                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)',
                                        bgcolor: 'primary.dark',
                                        '&:hover': { bgcolor: 'primary.800' }
                                    }}
                                >
                                    {t('common.donate')} <i className="fa-solid fa-heart" style={{ marginInlineStart: 8 }}></i>
                                </PillButton>
                                <PillButton
                                    component={Link}
                                    to="/campaigns"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        color: 'common.white',
                                        borderColor: alpha(theme.palette.common.white, 0.5),
                                        '&:hover': {
                                            borderColor: 'common.white',
                                            bgcolor: alpha(theme.palette.common.white, 0.1)
                                        }
                                    }}
                                >
                                    {t('common.learnMore')}
                                </PillButton>
                            </Stack>
                        </HeroContent>

                        {/* --- Illustration Column: 5-Layer Visual --- */}
                        <HeroIllustrationContainer>
                            {/* Layer 0: Radial glow backgrounds */}
                            <HeroCircle size={400} color={theme.palette.hero.glow} delay="0s" />
                            <HeroCircle size={280} color={theme.palette.hero.glow} delay="1.5s" />
                            <HeroCircle size={150} color={theme.palette.hero.glow} delay="3s" />
                            {/* Soft radial glow behind illustration */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 'clamp(160px, 50%, 320px)',
                                    height: 'clamp(160px, 50%, 320px)',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(77,182,172,0.22) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                    zIndex: 0,
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />

                            {/* Layer 4: Orbital Rings */}
                            <OrbitalRing ringSize={340} duration={22} />
                            <OrbitalRing ringSize={440} duration={32} reverse />

                            {/* Layer 3: Particle Micro-Hearts */}
                            <HeroParticle delay="0s" leftPos="42%" size="0.65rem"><i className="fa-solid fa-heart" /></HeroParticle>
                            <HeroParticle delay="0.8s" leftPos="55%" size="0.5rem"><i className="fa-solid fa-heart" /></HeroParticle>
                            <HeroParticle delay="1.6s" leftPos="48%" size="0.75rem"><i className="fa-solid fa-heart" /></HeroParticle>
                            <HeroParticle delay="2.4s" leftPos="60%" size="0.55rem"><i className="fa-solid fa-heart" /></HeroParticle>
                            <Box sx={{ display: { xs: 'none', md: 'contents' } }}>
                                <HeroParticle delay="3.2s" leftPos="38%" size="0.6rem"><i className="fa-solid fa-heart" /></HeroParticle>
                                <HeroParticle delay="1.2s" leftPos="64%" size="0.5rem"><i className="fa-solid fa-heart" /></HeroParticle>
                                <HeroParticle delay="2.8s" leftPos="45%" size="0.7rem"><i className="fa-solid fa-heart" /></HeroParticle>
                            </Box>

                            {/* Layer 1: Base Hand */}
                            <Box
                                sx={{
                                    fontSize: 'clamp(4rem, 12vw, 8.5rem)',
                                    color: 'common.white',
                                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
                                    animation: `${sineFloat} 5s ease-in-out infinite`,
                                    position: 'relative',
                                    zIndex: 2,
                                    lineHeight: 1,
                                    willChange: 'transform',
                                }}
                            >
                                <i className="fa-solid fa-hand-holding" />
                            </Box>

                            {/* Layer 2: Glowing Heart */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '22%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: 'clamp(2rem, 6vw, 4rem)',
                                    color: '#ff6b6b',
                                    animation: `${heartPulse} 2.5s ease-in-out infinite`,
                                    zIndex: 5,
                                    lineHeight: 1,
                                    willChange: 'transform, opacity, filter',
                                }}
                            >
                                <i className="fa-solid fa-heart" />
                            </Box>

                            {/* Layer 5: Glassmorphic Badges */}
                            <GlassBadge
                                sx={{
                                    top: '12%',
                                    right: '-8%',
                                    animation: `${badgeFloat1} 6s ease-in-out infinite`,
                                }}
                            >
                                <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: '0.9rem', color: '#4DB6AC' }} />
                                {'تبرع جديد'}
                            </GlassBadge>
                            <GlassBadge
                                sx={{
                                    bottom: '18%',
                                    left: '-5%',
                                    animation: `${badgeFloat2} 8s ease-in-out infinite`,
                                }}
                            >
                                <i className="fa-solid fa-chart-line" style={{ fontSize: '0.9rem', color: '#FFD54F' }} />
                                {'نشاط حملة'}
                            </GlassBadge>
                        </HeroIllustrationContainer>
                    </HeroGrid>
                </Container>

                {/* Wave Divider */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        overflow: 'hidden',
                        lineHeight: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        '& svg': {
                            height: { xs: '60px', sm: '100px', md: '150px' },
                            width: 'calc(100% + 1.3px)',
                        }
                    }}
                >
                    <svg
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        style={{ display: 'block' }}
                    >
                        <path
                            fill={theme.palette.background.default}
                            fillOpacity="1"
                            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                </Box>
            </HeroSection>

            {/* ========== IMPACT STATS ========== */}
            <Box sx={{ py: { xs: 4, md: sectionPy }, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                        {displayStats.map((stat, i) => (
                            <Grid item xs={6} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
                                <StatCard elevation={0}>
                                    <StatIcon className="stat-icon">
                                        <i className={stat.icon}></i>
                                    </StatIcon>
                                    <Typography variant="h4" sx={{ fontWeight: '800', lineHeight: 1.1, fontSize: { xs: '1.3rem', sm: '1.5rem', md: '2rem' } }}>
                                        {formatNumber(stat.value)}+
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.8rem' }, letterSpacing: '0.02em' }}>
                                        {stat.label}
                                    </Typography>
                                </StatCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== PROGRAMS ========== */}
            <Box sx={{ py: { xs: 4, md: sectionPy } }}>
                <Container>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 6 } }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.4rem', md: '2rem' } }}>{t('home.ourPrograms')}</Typography>
                        <Button component={Link} to="/programs" endIcon={'←'} sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {programs.map((program, i) => (
                            <Grid item xs={6} sm={6} md={3} key={program.id}>
                                <ProgramCard elevation={0} color={program.color}>
                                    <Box
                                        className="program-icon"
                                        sx={{
                                            width: { xs: 56, sm: 64, md: 72 },
                                            height: { xs: 56, sm: 64, md: 72 },
                                            borderRadius: '50%',
                                            bgcolor: alpha(program.color, 0.1),
                                            color: program.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' },
                                            mb: 2,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className={program.icon}></i>
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                        {program.name}
                                    </Typography>
                                </ProgramCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== URGENT CASES — الحالات الأشد احتياجاً ========== */}
            <Box sx={{
                py: { xs: 4, md: sectionPy },
                bgcolor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : alpha(theme.palette.primary.main, 0.025),
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative background glow */}
                <Box sx={{
                    position: 'absolute',
                    top: -80,
                    right: '10%',
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.error.main, 0.06)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    filter: 'blur(40px)',
                }} />
                <Container>
                    {/* Section header */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography
                                variant="h4"
                                fontWeight="900"
                                sx={{
                                    fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2.4rem' },
                                    background: isDark
                                        ? `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.error.light})`
                                        : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.error.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {t('home.urgentCases')}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    bgcolor: alpha(theme.palette.error.main, isDark ? 0.20 : 0.10),
                                    color: theme.palette.error.main,
                                    px: 1.2,
                                    py: 0.4,
                                    borderRadius: '999px',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    animation: `${pulseGlow} 2s ease-in-out infinite`,
                                }}
                            >
                                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '0.6rem' }} />
                                {'عاجل'}
                            </Box>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: 500,
                                mx: 'auto',
                                lineHeight: 1.7,
                                fontWeight: 400,
                                fontSize: { xs: '0.8rem', md: '1rem' }
                            }}
                        >
                            {t('home.urgentCasesSubtitle')}
                        </Typography>
                    </Box>

                    {/* Cards grid */}
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: { xs: 2, md: 3 },
                        mb: 4,
                    }}>
                        {featuredProjectsList.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                                <i className="fa-regular fa-star" style={{ fontSize: 48, opacity: 0.3 }} />
                                <Typography sx={{ mt: 2 }}>{'لا توجد حالات مميزة بعد'}</Typography>
                            </Box>
                        ) : featuredProjectsList.map((project, i) => (
                            <Box key={project.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, display: 'flex', justifyContent: 'center' }}>
                                <CampaignCardItem
                                    project={project}
                                    index={i}
                                    onClick={() => navigate(`/campaigns`)}
                                    onDonate={(p) => setDonateProject(p)}
                                />
                            </Box>
                        ))}
                    </Box>

                    {/* View all link */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            component={Link}
                            to="/campaigns"
                            variant="outlined"
                            color="primary"
                            endIcon={'←'}
                            sx={{
                                borderRadius: '999px',
                                px: { xs: 2.5, md: 4 },
                                py: { xs: 0.8, md: 1.2 },
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: { xs: '0.8rem', md: '0.95rem' },
                                borderWidth: '1.5px',
                                transition: 'all 250ms ease',
                                '&:hover': {
                                    borderWidth: '1.5px',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                            }}
                        >
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* ========== QUICK DONATE ========== */}
            <QuickDonateSection>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                            {t('home.quickDonate')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', lineHeight: 1.7, fontWeight: 400 }}>
                            {t('home.chooseAmount')}
                        </Typography>
                    </Box>

                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: (t) => `${t.custom.radius.xl}px`,
                            border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : alpha(theme.palette.primary.main, 0.10)}`,
                            bgcolor: isDark ? 'rgba(255,255,255,0.045)' : '#fff',
                            boxShadow: isDark
                                ? '0 2px 12px rgba(0,0,0,0.20)'
                                : '0 4px 24px rgba(11,107,107,0.08)',
                        }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4, justifyContent: 'center' }}>
                            {donationAmounts.map(amount => (
                                <Button
                                    key={amount}
                                    variant={selectedAmount === amount ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => setSelectedAmount(amount)}
                                    sx={{
                                        minWidth: { xs: 'calc(33.33% - 12px)', sm: 100 },
                                        height: 48,
                                        borderRadius: '14px',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        transition: 'all 250ms ease',
                                        border: selectedAmount === amount
                                            ? `2px solid ${theme.palette.primary.main}`
                                            : `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : alpha(theme.palette.primary.main, 0.20)}`,
                                        bgcolor: selectedAmount === amount
                                            ? (isDark ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.10))
                                            : 'transparent',
                                        color: selectedAmount === amount
                                            ? (isDark ? theme.palette.primary.light : theme.palette.primary.dark)
                                            : 'text.primary',
                                        boxShadow: selectedAmount === amount
                                            ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`
                                            : 'none',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: theme.palette.primary.main,
                                            bgcolor: selectedAmount === amount
                                                ? (isDark ? alpha(theme.palette.primary.main, 0.28) : alpha(theme.palette.primary.main, 0.15))
                                                : alpha(theme.palette.primary.main, 0.04),
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                                        },
                                        '&:focus-visible': {
                                            outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                            outlineOffset: 2,
                                        },
                                    }}
                                >
                                    {formatNumber(amount)}
                                </Button>
                            ))}
                        </Box>
                        <Button
                            component={Link}
                            to={`/donate${selectedAmount ? `?amount=${selectedAmount}` : ''}`}
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                                height: 56,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: (t) => `${t.custom.radius.pill}px`,
                                textTransform: 'none',
                                transition: 'all 250ms ease',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: isDark
                                    ? '0 4px 16px rgba(0,0,0,0.35)'
                                    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.30)}`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    boxShadow: isDark
                                        ? '0 6px 24px rgba(0,0,0,0.45)'
                                        : `0 6px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                                },
                                '&:active': {
                                    transform: 'scale(0.985)',
                                },
                                '&:focus-visible': {
                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}`,
                                },
                            }}
                        >
                            {t('common.donate')} <i className="fa-solid fa-heart" style={{ marginInlineStart: 8 }}></i>
                        </Button>
                    </Card>
                </Container>
            </QuickDonateSection>

            {/* ========== ZAKAT CTA ========== */}
            <Box sx={{
                py: sectionPy,
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.12)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.light, 0.06)} 100%)`,
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#eef2f6'}`,
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#eef2f6'}`,
            }}>
                <Container maxWidth="md">
                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 3.5, md: 5 },
                            borderRadius: '24px',
                            background: isDark
                                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #112d2c 100%)`
                                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: '#fff',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0,0,0,0.3)'
                                : `0 8px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'center',
                            gap: 4,
                            '&:hover': {
                                '& .zakat-icon-box': {
                                    transform: 'scale(1.05) rotate(-5deg)',
                                },
                            },
                        }}
                    >
                        {/* Decorative background circle */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: '-50px',
                            left: '-50px',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            pointerEvents: 'none',
                        }} />

                        {/* Icon Box */}
                        <Box
                            className="zakat-icon-box"
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '20px',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            }}
                        >
                            <i className="fa-solid fa-calculator" style={{ fontSize: '2.2rem', color: '#fff' }}></i>
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'right' } }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    fontWeight: 800,
                                    fontSize: { xs: '1.4rem', md: '1.75rem' },
                                    mb: 1.5,
                                }}
                            >
                                {getLanguage() === 'en' ? 'Calculate Your Zakat Accurately' : 'احسب زكاتك بدقة وسهولة'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: { xs: '0.85rem', md: '0.92rem' },
                                    lineHeight: 1.8,
                                    maxWidth: 550,
                                }}
                            >
                                {getLanguage() === 'en'
                                    ? 'Use our advanced live calculator to compute Zakat on money, gold, silver, and agricultural crops based on real-time prices.'
                                    : 'استخدم حاسبة الزكاة المتطورة لحساب زكاة أموالك، مدخراتك، الذهب، الفضة، والمحاصيل الزراعية بكل دقة بناءً على أسعار السوق الحية.'}
                            </Typography>
                        </Box>

                        {/* CTA Button */}
                        <Button
                            component={Link}
                            to="/zakat"
                            variant="contained"
                            sx={{
                                bgcolor: '#fff',
                                color: theme.palette.primary.dark,
                                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                                fontWeight: 800,
                                px: 4,
                                py: 1.6,
                                borderRadius: '14px',
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        >
                            {getLanguage() === 'en' ? 'Open Zakat Calculator' : 'افتح حاسبة الزكاة'}
                            <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: 8, fontSize: '0.85rem' }}></i>
                        </Button>
                    </Card>
                </Container>
            </Box>

            {/* ========== TESTIMONIALS ========== */}
            {(state.content?.testimonials && state.content.testimonials.length > 0) && (
                <Box sx={{
                    pt: sectionPy,
                    pb: { xs: 4, md: 6 },
                    bgcolor: isDark ? 'rgba(255,255,255,0.015)' : undefined,
                }}>
                    <Container>
                        <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
                            {t('home.testimonials')}
                        </Typography>
                        <Grid container spacing={3}>
                            {state.content.testimonials.map((testimonial) => (
                                <Grid item xs={12} sm={6} md={4} key={testimonial.id} sx={{ display: 'flex' }}>
                                    <TestimonialCardItem
                                        text={testimonial.content || testimonial.text}
                                        name={testimonial.name}
                                        role={testimonial.role}
                                        initial={testimonial.name?.charAt(0)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            )}

            {/* ========== LATEST UPDATES ========== */}
            <Box sx={{
                py: sectionPy,
                bgcolor: isDark
                    ? 'rgba(255,255,255,0.025)'
                    : alpha(theme.palette.primary.main, 0.025),
            }}>
                <Container>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                    }}>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.4rem' } }}
                        >
                            {t('home.latestUpdates')}
                        </Typography>
                        <Button
                            component={Link}
                            to="/updates"
                            endIcon={'←'}
                            sx={{
                                fontWeight: 500,
                                color: 'primary.main',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                transition: 'color 200ms ease',
                                '&:hover': {
                                    bgcolor: 'transparent',
                                    textDecoration: 'underline',
                                    color: 'primary.dark',
                                },
                            }}
                        >
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {updates.slice(0, 3).map((update, i) => (
                            <Grid item xs={12} md={4} key={update.id} sx={{ display: 'flex' }}>
                                <Card
                                    component={Link}
                                    to={`/updates/${update.id}`}
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        borderRadius: 4,
                                        boxShadow: isDark
                                            ? '0 2px 10px rgba(0,0,0,0.25)'
                                            : '0 1px 6px rgba(0,0,0,0.06)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2.5,
                                        gap: 2,
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        cursor: 'pointer',
                                        willChange: 'transform, box-shadow',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : undefined,
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: isDark
                                                ? '0 8px 28px rgba(0,0,0,0.35)'
                                                : '0 8px 30px rgba(0,0,0,0.1)',
                                            '& .news-icon-box': {
                                                transform: 'translateY(-2px)',
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 0.75,
                                                lineHeight: 1.45,
                                                color: 'text.primary',
                                            }}
                                        >
                                            {update.title}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                                                fontWeight: 500,
                                                letterSpacing: '0.01em',
                                            }}
                                        >
                                            {update.date}
                                        </Typography>
                                    </Box>

                                    <Box
                                        className="news-icon-box"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 44,
                                            height: 44,
                                            borderRadius: '12px',
                                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
                                            color: 'primary.main',
                                            flexShrink: 0,
                                            transition: 'transform 0.3s ease',
                                        }}
                                    >
                                        <i className="fa-solid fa-bullhorn" style={{ fontSize: '1.1rem', transform: 'rotate(-20deg)' }}></i>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== CTA ========== */}
            <Box sx={{
                py: sectionPy,
                textAlign: 'center',
                bgcolor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : alpha(theme.palette.primary.main, 0.03),
                position: 'relative',
            }}>
                <Container maxWidth="md">
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, mb: 2 }}
                    >
                        {t('home.ctaTitle')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)',
                            mb: 5,
                            maxWidth: 520,
                            mx: 'auto',
                            lineHeight: 1.7,
                            fontWeight: 400,
                        }}
                    >
                        {t('home.ctaSubtitle')}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <PillButton
                            component={Link}
                            to="/donate"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: isDark
                                    ? '0 4px 20px rgba(0,0,0,0.35)'
                                    : `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                                transition: 'all 200ms ease-in-out',
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: isDark
                                        ? '0 8px 28px rgba(0,0,0,0.45)'
                                        : `0 8px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
                                },
                            }}
                        >
                            {t('common.donate')} <i className="fa-solid fa-heart" style={{ marginInlineStart: 8 }}></i>
                        </PillButton>
                        <PillButton
                            component={Link}
                            to="/volunteer"
                            variant="outlined"
                            color="primary"
                            size="large"
                            sx={{
                                borderWidth: '1.5px',
                                transition: 'all 200ms ease-in-out',
                                '&:hover': {
                                    borderWidth: '1.5px',
                                    transform: 'translateY(-2px)',
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
                                },
                            }}
                        >
                            {t('common.joinNow')}
                        </PillButton>
                    </Stack>
                </Container>
            </Box>

            {/* Quick Donate Modal — triggered from urgent case cards */}
            <QuickDonateModal
                open={!!donateProject}
                onClose={() => setDonateProject(null)}
                project={donateProject}
            />
        </Box >
    );
}

// --- Sub Components ---

function ProjectCard({ project }) {
    const theme = useTheme();
    const percentage = Math.round((project.raised / project.goal) * 100);
    const title = project.title;

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[5] }
        }}>
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={project.image}
                    alt={title}
                />
                {project.daysLeft <= 10 && (
                    <Chip
                        label={'عاجل'}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold' }}
                    />
                )}
            </Box>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" color="primary" fontWeight="bold" gutterBottom>
                    {project.program}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ flex: 1 }}>
                    {title}
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">{percentage}% {'مكتمل'}</Typography>
                        <Typography variant="body2" color="text.secondary">{project.daysLeft} {'يوم متبقي'}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={percentage > 100 ? 100 : percentage} />
                </Box>

                <Button
                    component={Link}
                    to={`/projects/${project.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    {t('campaigns.donateNow')}
                </Button>
            </CardContent>
        </Card>
    );
}

function TestimonialCardItem({ text, name, role, initial }) {
    return (
        <TestimonialCard elevation={0}>
            {/* Quote Mark is handled by styled component ::before */}

            <Typography
                variant="body1"
                sx={{
                    color: 'text.secondary',
                    mb: 4,
                    position: 'relative',
                    zIndex: 2,
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    textAlign: 'right' // Arabic text in image is right aligned
                }}
            >
                {text}
            </Typography>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                // In RTL, "flex-start" IS Right.
                // We want the group on the Right (Start).
                justifyContent: 'flex-start',

                // Standard row: [Avatar] [Text]
                // LTR: Avatar (Left) -> Text (Right).
                // RTL: Avatar (Right) -> Text (Left).
                // This matches the design image EXACTLY.
                flexDirection: 'row',

                gap: 2
            }}>
                <Avatar sx={{
                    bgcolor: '#0F5C54', // Dark Teal
                    width: 48,
                    height: 48,
                    color: 'common.white',
                    fontWeight: 'bold'
                }}>
                    {initial || name.charAt(0)}
                </Avatar>

                <Box sx={{ textAlign: 'right' }}> {/* Name and Role */}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {role}
                    </Typography>
                </Box>
            </Box>
        </TestimonialCard>
    );
}

export default Home;

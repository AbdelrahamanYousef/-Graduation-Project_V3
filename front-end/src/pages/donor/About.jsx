import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Stack,
    Avatar,
    Paper,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- Animations ---
const floatParticle = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const TEAL = '#1a4a44';
const TEAL_MID = '#112e2a';
const TEAL_DARK = '#0a1f1c';
const G_GREEN = '#00b16a';

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
            paddingTop: 60,
            paddingBottom: 80,
        },
    };
});

const UnifiedSection = styled(Paper)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        borderRadius: 24,
        background: dk ? '#1e293b' : '#ffffff',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: dk
            ? `0 12px 40px rgba(0,0,0,0.25)`
            : `0 12px 32px rgba(0,0,0,0.04)`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
        },
    };
});

const SectionHalf = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(4, 5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    transition: 'background 0.3s ease',
    '&:hover': {
        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    },
    '&:hover .icon-badge': {
        transform: 'scale(1.05) translateY(-2px)',
    }
}));

const SectionDivider = styled(Box)(({ theme }) => ({
    width: '100%',
    height: 1,
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)',
    [theme.breakpoints.up('md')]: {
        width: 1,
        height: 'auto',
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)'
            : 'linear-gradient(180deg, transparent, rgba(0,0,0,0.06), transparent)',
    },
}));

const IconBadge = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    const iconGradient1 = dk ? G_GREEN : TEAL;
    const iconGradient2 = dk ? '#059669' : '#0d7c65';

    return {
        width: 56,
        height: 56,
        borderRadius: '14px',
        background: `linear-gradient(135deg, ${iconGradient1}, ${iconGradient2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(2.5),
        fontSize: 24,
        color: '#fff',
        boxShadow: `0 4px 12px ${alpha(iconGradient1, 0.25)}`,
        transition: 'transform 0.3s ease',
    };
});

const ValueCard = styled(Paper)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        height: '100%',
        padding: theme.spacing(4, 3),
        borderRadius: 20,
        background: dk ? '#1e293b' : '#ffffff',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: dk
            ? `0 4px 16px rgba(0,0,0,0.2)`
            : `0 4px 16px rgba(0,0,0,0.03)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: dk
                ? `0 12px 32px rgba(0,0,0,0.35)`
                : `0 12px 28px rgba(0,0,0,0.08)`,
            borderColor: dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        },
        '&:hover .value-icon': {
            transform: 'scale(1.1) rotate(5deg)',
        }
    };
});

const ValueIconWrapper = styled(Box)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        width: 64,
        height: 64,
        borderRadius: '16px',
        background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(2.5),
        fontSize: 28,
        color: dk ? G_GREEN : TEAL,
        transition: 'transform 0.3s ease',
    };
});

const JourneyTrack = styled(Box)(({ theme }) => {
    const isRtl = theme.direction === 'rtl';
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        maxWidth: 800,
        margin: '0 auto',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 32,
            bottom: 32,
            [isRtl ? 'right' : 'left']: 24,
            width: 2,
            background: dk
                ? 'linear-gradient(to bottom, transparent, rgba(0,177,106,0.3) 5%, rgba(0,177,106,0.3) 95%, transparent)'
                : 'linear-gradient(to bottom, transparent, rgba(26,74,68,0.2) 5%, rgba(26,74,68,0.2) 95%, transparent)',
            zIndex: 0,
            [theme.breakpoints.up('md')]: {
                [isRtl ? 'right' : 'left']: 48,
            }
        }
    };
});

const JourneyItem = styled(Box)(({ theme }) => {
    const isRtl = theme.direction === 'rtl';
    return {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        marginBottom: theme.spacing(3),
        paddingInlineEnd: 48,
        zIndex: 1,
        '&:last-child': {
            marginBottom: 0,
        },
        [theme.breakpoints.up('md')]: {
            paddingInlineEnd: 80,
            marginBottom: theme.spacing(4),
        }
    };
});

const ConnectionNode = styled(Box)(({ theme }) => {
    const isRtl = theme.direction === 'rtl';
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'absolute',
        [isRtl ? 'right' : 'left']: 24,
        top: '50%',
        transform: isRtl ? 'translate(50%, -50%)' : 'translate(-50%, -50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: dk ? '#00b16a' : '#1a4a44',
        boxShadow: `0 0 0 6px ${dk ? '#0f172a' : '#fafafa'}, 0 0 0 8px ${dk ? 'rgba(0,177,106,0.2)' : 'rgba(26,74,68,0.1)'}`,
        zIndex: 2,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        [theme.breakpoints.up('md')]: {
            [isRtl ? 'right' : 'left']: 48,
        }
    };
});

const JourneyCard = styled(Paper)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        padding: theme.spacing(3, 4),
        borderRadius: 24,
        background: dk
            ? 'linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6))'
            : 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.8))',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: dk
            ? '0 8px 24px rgba(0,0,0,0.25)'
            : '0 8px 24px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: dk
                ? 'radial-gradient(circle at top right, rgba(0,177,106,0.08), transparent 70%)'
                : 'radial-gradient(circle at top right, rgba(26,74,68,0.04), transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
        },
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: dk
                ? '0 12px 32px rgba(0,177,106,0.15)'
                : '0 12px 32px rgba(26,74,68,0.08)',
            borderColor: dk ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.2)',
            '&::before': { opacity: 1 },
            '& .year-watermark': {
                transform: 'scale(1.05)',
                color: dk ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.03)',
            }
        }
    };
});

const YearWatermark = styled(Typography)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    const isRtl = theme.direction === 'rtl';
    return {
        position: 'absolute',
        bottom: -15,
        [isRtl ? 'left' : 'right']: -10,
        fontSize: '6rem',
        fontWeight: 900,
        lineHeight: 1,
        color: dk ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'transform 0.5s ease, color 0.5s ease',
        userSelect: 'none',
    };
});

const TeamCard = styled(Paper)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        height: '100%',
        padding: theme.spacing(5, 4),
        borderRadius: 24,
        background: dk ? '#1e293b' : '#ffffff',
        border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: dk
            ? `0 4px 16px rgba(0,0,0,0.2)`
            : `0 4px 16px rgba(0,0,0,0.03)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 120,
            background: dk
                ? 'linear-gradient(to bottom, rgba(0,177,106,0.1), transparent)'
                : 'linear-gradient(to bottom, rgba(26,74,68,0.05), transparent)',
            opacity: 0.8,
        },
        '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: dk
                ? `0 12px 32px rgba(0,0,0,0.3)`
                : `0 12px 28px rgba(0,0,0,0.08)`,
            borderColor: dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        },
        '&:hover .team-avatar': {
            transform: 'scale(1.05)',
            boxShadow: `0 8px 24px ${dk ? 'rgba(0,177,106,0.3)' : 'rgba(26,74,68,0.2)'}`
        }
    };
});

const TeamAvatar = styled(Avatar)(({ theme }) => {
    const dk = theme.palette.mode === 'dark';
    return {
        width: 100,
        height: 100,
        marginBottom: theme.spacing(3),
        background: dk
            ? 'linear-gradient(135deg, #00b16a, #059669)'
            : 'linear-gradient(135deg, #1a4a44, #112e2a)',
        color: '#ffffff',
        border: `4px solid ${dk ? '#1e293b' : '#ffffff'}`,
        boxShadow: `0 4px 12px ${dk ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
        zIndex: 1,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
        '& i': { fontSize: 40 }
    };
});

// --- About Component ---

function About() {
    const theme = useTheme();
    const { state } = useAdminData();
    const aboutUs = state.content?.aboutUs || {};
    

    const team = [
        { name: 'د. أحمد محمود', role: 'رئيس مجلس الإدارة', image: 'fa-solid fa-user-tie' },
        { name: 'أ. فاطمة حسن', role: 'المدير التنفيذي', image: 'fa-solid fa-user-tie' },
        { name: 'م. خالد عبدالله', role: 'مدير البرامج', image: 'fa-solid fa-laptop-code' },
        { name: 'أ. سارة علي', role: 'مدير التطوير', image: 'fa-solid fa-chalkboard-user' },
    ];

    const milestones = [
        { year: '2010', event: 'تأسيس الجمعية'},
        { year: '2012', event: 'افتتاح أول دار أيتام'},
        { year: '2015', event: 'إطلاق برنامج القوافل الطبية'},
        { year: '2018', event: 'الوصول لـ 10,000 مستفيد' },
        { year: '2020', event: 'إطلاق المنصة الإلكترونية'},
        { year: '2024', event: 'تحقيق 15 مليون جنيه تبرعات'},
    ];

    const particles = [];

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                <Container sx={{ position: 'relative', zIndex: 1, maxWidth: 800, mx: 'auto', px: 2 }}>
                    <Box sx={{ width: 40, height: 3, borderRadius: 2, bgcolor: alpha('#fff', 0.3), mx: 'auto', mb: 2 }} />
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontWeight: 900,
                            fontSize: { xs: '2.2rem', md: '3.5rem' },
                            color: 'common.white',
                            mb: 2,
                            letterSpacing: '0',
                            animation: `${fadeInUp} 0.5s ease both`,
                        }}
                    >
                        {t('about.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: 700,
                            mx: 'auto',
                            lineHeight: 1.7,
                            color: alpha('#fff', 0.65),
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            animation: `${fadeInUp} 0.5s ease both 0.1s`,
                        }}
                    >
                        {aboutUs.story || t('about.subtitle')}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
                {/* Vision & Mission */}
                <Box sx={{ mb: 12 }}>
                    <UnifiedSection elevation={0} sx={{ animation: `${fadeInUp} 0.6s ease forwards 0.3s`, opacity: 0, animationFillMode: 'forwards' }}>
                        <SectionHalf>
                            <IconBadge className="icon-badge">
                                <i className="fa-solid fa-bullseye"></i>
                            </IconBadge>
                            <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ mb: 1.5, fontSize: '1.3rem' }}>
                                {t('about.vision')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem', maxWidth: 360 }}>
                                {aboutUs.vision || t('about.visionText')}
                            </Typography>
                        </SectionHalf>

                        <SectionDivider />

                        <SectionHalf>
                            <IconBadge className="icon-badge">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </IconBadge>
                            <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ mb: 1.5, fontSize: '1.3rem' }}>
                                {t('about.mission')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem', maxWidth: 360 }}>
                                {aboutUs.mission || t('about.missionText')}
                            </Typography>
                        </SectionHalf>
                    </UnifiedSection>
                </Box>

                {/* Values */}
                <Box sx={{ mb: 10 }}>
                    <Typography variant="h4" fontWeight="800" color="text.primary" textAlign="center" sx={{ mb: 5, fontSize: { xs: '1.75rem', md: '2rem' } }}>
                        {t('about.values')}
                    </Typography>
                    <Grid container spacing={3} alignItems="stretch">
                        {[
                            { icon: 'fa-handshake', title: t('about.integrity'), desc: t('about.integrityDesc') },
                            { icon: 'fa-magnifying-glass', title: t('about.transparency'), desc: t('about.transparencyDesc') },
                            { icon: 'fa-bolt', title: t('about.efficiency'), desc: t('about.efficiencyDesc') },
                            { icon: 'fa-heart', title: t('about.compassion'), desc: t('about.compassionDesc') },
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <ValueCard elevation={0}>
                                    <ValueIconWrapper className="value-icon">
                                        <i className={`fa-solid ${item.icon}`}></i>
                                    </ValueIconWrapper>
                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                        <Typography variant="h6" fontWeight="800" color="text.primary" sx={{ mb: 1.5, fontSize: '1.15rem' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                                            {i === 0 && aboutUs.values ? aboutUs.values : item.desc}
                                        </Typography>
                                    </Box>
                                </ValueCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Timeline / Journey Track */}
                <Box sx={{ mb: 14, position: 'relative', zIndex: 2 }}>
                    <Typography variant="h4" fontWeight="800" color="text.primary" textAlign="center" sx={{ mb: { xs: 8, md: 10 }, fontSize: { xs: '1.75rem', md: '2rem' } }}>
                        {t('about.journey')}
                    </Typography>

                    <JourneyTrack>
                        {milestones.map((milestone, index) => (
                            <JourneyItem key={index}>
                                <ConnectionNode className="connection-node" />

                                <JourneyCard elevation={0} sx={{ width: '100%' }}>
                                    <YearWatermark className="year-watermark">
                                        {milestone.year}
                                    </YearWatermark>

                                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                                        <Typography variant="h5" fontWeight="900" sx={{
                                            mb: 0.5,
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(90deg, #00b16a, #10b981)'
                                                : 'linear-gradient(90deg, #1a4a44, #2c7a70)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            display: 'inline-block',
                                            fontSize: '1.25rem'
                                        }}>
                                            {milestone.year}
                                        </Typography>

                                        <Typography variant="body1" fontWeight="700" color="text.primary" sx={{ lineHeight: 1.5, fontSize: '1.05rem' }}>
                                            {milestone.event}
                                        </Typography>
                                    </Box>
                                </JourneyCard>
                            </JourneyItem>
                        ))}
                    </JourneyTrack>
                </Box>

                {/* Team */}
                <Box sx={{ mb: 12, maxWidth: 1100, mx: 'auto' }}>
                    <Typography variant="h4" fontWeight="800" color="text.primary" textAlign="center" gutterBottom sx={{ mb: 8, fontSize: { xs: '1.75rem', md: '2rem' } }}>
                        {t('about.team')}
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {team.map((member, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <TeamCard elevation={0}>
                                    <TeamAvatar className="team-avatar">
                                        <i className={member.image}></i>
                                    </TeamAvatar>
                                    <Typography variant="h6" fontWeight="800" color="text.primary" gutterBottom sx={{ position: 'relative', zIndex: 1, fontSize: '1.15rem' }}>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ position: 'relative', zIndex: 1, fontWeight: 700 }}>
                                        {member.role}
                                    </Typography>
                                </TeamCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Legal */}
                <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 5 },
                            borderRadius: '24px',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                            background: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.03)',
                        }}
                    >
                        <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom sx={{ mb: 4, textAlign: 'center', fontSize: '1.5rem' }}>
                            {t('about.legal')}
                        </Typography>

                        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                            {[
                                { label: t('about.regNumber'), value: '1234 / 2010', icon: 'fa-id-card' },
                                { label: t('about.commercialReg'), value: '56789', icon: 'fa-file-signature' },
                                { label: t('about.taxNumber'), value: '123-456-789', icon: 'fa-file-invoice-dollar' },
                                { label: t('about.headquarters'), value: 'القاهرة، مصر', icon: 'fa-location-dot' }
                            ].map((item, idx) => (
                                <Grid item xs={12} sm={6} md={3} key={idx}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            height: '100%',
                                            p: 3,
                                            borderRadius: '16px',
                                            background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.015)',
                                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}`,
                                            transition: 'transform 0.3s ease, background 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: '14px',
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: theme.palette.mode === 'dark' ? 'rgba(0,177,106,0.1)' : 'rgba(26,74,68,0.05)',
                                                color: theme.palette.mode === 'dark' ? '#00b16a' : '#1a4a44',
                                                fontSize: '1.25rem'
                                            }}
                                        >
                                            <i className={`fa-solid ${item.icon}`} />
                                        </Box>

                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, lineHeight: 1.2, mb: 1 }}>
                                            {item.label}
                                        </Typography>

                                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 800, mt: 'auto' }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}

export default About;

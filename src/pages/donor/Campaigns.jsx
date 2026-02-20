import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Tabs,
    Tab,
    Chip,
    LinearProgress,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency, formatNumber } from '../../i18n';
import { projects, programs } from '../../data/mockData';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Font Helpers ───────────────────────────────────────────
const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const LATIN_FONT = "'Inter', 'Manrope', sans-serif";

// Detects if text is predominantly Latin (>50% Latin characters)
const isLatinText = (text) => {
    if (!text) return false;
    const latinChars = text.replace(/[^a-zA-Z]/g, '').length;
    const totalAlpha = text.replace(/[^a-zA-Z\u0600-\u06FF]/g, '').length;
    return totalAlpha > 0 && (latinChars / totalAlpha) > 0.5;
};

// ─── Styled Components ──────────────────────────────────────

// A) Section Header — compact teal gradient with subtle radial depth
const HeroSection = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        background: isDark
            ? `linear-gradient(135deg, ${theme.palette.hero.dark} 0%, #041e1e 100%)`
            : `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
        color: theme.palette.common.white,
        padding: theme.spacing(7, 0, 6),
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: '55%',
            height: '180%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
    };
});

// B+C) Filter Section — compact, unified toolbar
const FilterSection = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        backgroundColor: isDark ? '#0f2222' : theme.palette.background.paper,
        padding: theme.spacing(2, 0),
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
        position: 'sticky',
        top: 64,
        zIndex: 10,
        backdropFilter: 'blur(12px)',
    };
});

// D) Campaign Card — premium surface with subtle border, gentle hover
const CampaignCard = styled(Card)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease',
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: isDark ? '#152b2b' : '#FFFFFF',
        border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,107,107,0.08)'}`,
        boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.3)'
            : '0 2px 12px rgba(0,0,0,0.05)',
        '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: alpha(theme.palette.primary.main, 0.35),
            boxShadow: isDark
                ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                : `0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`,
            '& .donate-overlay': {
                opacity: 1,
            },
        },
    };
});

// Image area — desaturated with cohesive teal-tinted overlay
const CampaignImage = styled(CardMedia)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: 200,
        position: 'relative',
        overflow: 'hidden',
        filter: `saturate(0.7) contrast(1.05) brightness(${isDark ? 0.85 : 0.95})`,
        '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.10)} 0%, ${alpha('#000', isDark ? 0.45 : 0.15)} 100%)`,
            pointerEvents: 'none',
        },
    };
});

// Glassy hover overlay on the image
const DonateOverlay = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha(theme.palette.primary.dark, isDark ? 0.5 : 0.4),
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 280ms ease',
        zIndex: 1,
    };
});

// ─── Component: Campaigns ───────────────────────────────────

function Campaigns() {
    const theme = useTheme();
    const [activeProgram, setActiveProgram] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const isDark = theme.palette.mode === 'dark';

    const handleProgramChange = (event, newValue) => {
        setActiveProgram(newValue);
    };

    const filteredProjects = projects
        .filter(p => {
            const matchesProgram = activeProgram === 'all' || p.programId === parseInt(activeProgram);
            const matchesSearch = p.title.includes(searchQuery) || p.description.includes(searchQuery);
            return matchesProgram && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'mostFunded') return (b.raised / b.goal) - (a.raised / a.goal);
            if (sortBy === 'endingSoon') return a.daysLeft - b.daysLeft;
            return b.id - a.id;
        });

    // Shared input styling for search + sort
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            height: 44,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
            },
            '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.10)}`,
            },
        },
    };

    return (
        <Box sx={{ pb: 8 }}>
            {/* ════════ A) Hero Banner ════════ */}
            <HeroSection>
                <Container>
                    {/* Thin teal accent line */}
                    <Box sx={{
                        width: 48,
                        height: 3,
                        borderRadius: 2,
                        bgcolor: alpha('#fff', 0.35),
                        mx: 'auto',
                        mb: 2.5,
                    }} />
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            animation: `${fadeInUp} 0.6s ease forwards`,
                            position: 'relative',
                        }}
                    >
                        {t('campaigns.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            maxWidth: 520,
                            mx: 'auto',
                            mt: 1.5,
                            color: alpha(theme.palette.common.white, 0.7),
                            fontWeight: 400,
                            lineHeight: 1.7,
                            animation: `${fadeInUp} 0.6s ease forwards 0.2s`,
                            opacity: 0,
                            animationFillMode: 'forwards',
                            position: 'relative',
                        }}
                    >
                        ساهم في دعم الحملات الخيرية وكن جزءًا من التغيير
                    </Typography>
                </Container>
            </HeroSection>

            {/* ════════ B+C) Filters ════════ */}
            <FilterSection>
                <Container>
                    <Stack spacing={2}>
                        {/* Search + Sort Row */}
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <TextField
                                placeholder={t('campaigns.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 200, ...inputSx }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '0.85rem', opacity: 0.5 }}></i>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                size="small"
                                sx={{ width: 200, ...inputSx }}
                            >
                                <MenuItem value="newest">{t('campaigns.newest')}</MenuItem>
                                <MenuItem value="mostFunded">{t('campaigns.mostFunded')}</MenuItem>
                                <MenuItem value="endingSoon">{t('campaigns.endingSoon')}</MenuItem>
                            </TextField>
                        </Box>

                        {/* Tabs — modern underline style with focus-visible */}
                        <Tabs
                            value={activeProgram}
                            onChange={handleProgramChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                minHeight: 40,
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : theme.palette.divider}`,
                                '& .MuiTabs-indicator': {
                                    height: 2.5,
                                    borderRadius: '2px 2px 0 0',
                                    backgroundColor: theme.palette.primary.main,
                                },
                                '& .MuiTab-root': {
                                    minHeight: 40,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    px: 2,
                                    mr: 0.5,
                                    borderRadius: '8px 8px 0 0',
                                    color: isDark ? 'rgba(255,255,255,0.55)' : 'text.secondary',
                                    transition: 'all 200ms ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                        color: theme.palette.primary.main,
                                    },
                                    '&.Mui-selected': {
                                        fontWeight: 700,
                                        color: theme.palette.primary.main,
                                    },
                                    '&:focus-visible': {
                                        outline: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                        outlineOffset: -2,
                                    },
                                    '& .MuiTab-iconWrapper': {
                                        marginInlineEnd: '6px',
                                        fontSize: '0.85rem',
                                    },
                                },
                            }}
                        >
                            <Tab label={t('campaigns.allPrograms')} value="all" icon={<i className="fa-solid fa-layer-group"></i>} iconPosition="start" />
                            {programs.map(prog => (
                                <Tab
                                    key={prog.id}
                                    label={prog.name}
                                    value={String(prog.id)}
                                    icon={<i className={prog.icon}></i>}
                                    iconPosition="start"
                                />
                            ))}
                        </Tabs>
                    </Stack>
                </Container>
            </FilterSection>

            {/* ════════ D+E) Campaign Grid ════════ */}
            <Container sx={{ mt: 5 }}>
                {filteredProjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h2" sx={{ mb: 2 }}>🔍</Typography>
                        <Typography variant="h5" gutterBottom>{t('campaigns.noResults')}</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProjects.map((project, index) => (
                            <Grid item xs={12} sm={6} key={project.id} sx={{ display: 'flex' }}>
                                <CampaignCardItem project={project} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

// ─── Component: CampaignCardItem ────────────────────────────

function CampaignCardItem({ project, index }) {
    const percentage = Math.round((project.raised / project.goal) * 100);
    const isUrgent = project.daysLeft <= 10;
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <CampaignCard
            elevation={0}
            sx={{
                animation: `${fadeInUp} 0.5s ease forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
            }}
        >
            {/* Image Area */}
            <Box sx={{ position: 'relative' }}>
                <CampaignImage
                    image={project.image}
                    title={project.title}
                />

                {/* Category pill — top-right (RTL: top-left auto by position) */}
                <Chip
                    label={project.program}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 2,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: 999,
                        bgcolor: alpha('#fff', isDark ? 0.12 : 0.85),
                        color: isDark ? '#B2DFDB' : theme.palette.primary.dark,
                        backdropFilter: 'blur(6px)',
                        border: `1px solid ${alpha('#fff', isDark ? 0.1 : 0.3)}`,
                    }}
                />

                {isUrgent && (
                    <Chip
                        label={t('campaigns.urgent')}
                        color="error"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 24,
                            zIndex: 2,
                        }}
                    />
                )}

                <DonateOverlay className="donate-overlay">
                    <Button
                        component={Link}
                        to={`/projects/${project.id}`}
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 999,
                            px: 4,
                            py: 1,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                        }}
                    >
                        {t('campaigns.donateNow')}
                    </Button>
                </DonateOverlay>
            </Box>

            {/* Card Body */}
            <CardContent
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: '20px !important',
                }}
            >
                {/* Title */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        fontFamily: isLatinText(project.title) ? LATIN_FONT : ARABIC_FONT,
                        direction: isLatinText(project.title) ? 'ltr' : 'rtl',
                        textAlign: isLatinText(project.title) ? 'left' : 'right',
                        lineHeight: isLatinText(project.title) ? 1.4 : 1.5,
                        letterSpacing: isLatinText(project.title) ? '0.3px' : 0,
                        mb: 1,
                        height: 52,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {project.title}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontFamily: isLatinText(project.description) ? LATIN_FONT : ARABIC_FONT,
                        direction: isLatinText(project.description) ? 'ltr' : 'rtl',
                        textAlign: isLatinText(project.description) ? 'left' : 'right',
                        lineHeight: isLatinText(project.description) ? 1.6 : 1.7,
                        letterSpacing: isLatinText(project.description) ? '0.2px' : 0,
                        mb: 2.5,
                        height: 42,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {project.description}
                </Typography>

                {/* Progress + Stats (pushed to bottom) */}
                <Box sx={{ mt: 'auto' }}>
                    {/* Raised amount + days left */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrency(project.raised)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                            {t('campaigns.daysLeft')}: {project.daysLeft}
                        </Typography>
                    </Box>

                    {/* Progress Bar — thicker, rounded, theme-aware track */}
                    <LinearProgress
                        variant="determinate"
                        value={percentage > 100 ? 100 : percentage}
                        sx={{
                            height: 7,
                            borderRadius: 4,
                            mb: 2,
                            bgcolor: isDark ? 'rgba(255,255,255,0.07)' : alpha(theme.palette.primary.main, 0.08),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: theme.palette.primary.main,
                            },
                        }}
                    />

                    {/* Stats mini-grid */}
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 0.25 }}>
                                {t('campaigns.donors')}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {formatNumber(project.donors)}
                            </Typography>
                        </Grid>
                        <Grid item sx={{ textAlign: 'left' }}>
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 0.25 }}>
                                الهدف
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {formatCurrency(project.goal)}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* CTA Button — premium teal contained */}
                    <Button
                        component={Link}
                        to={`/projects/${project.id}`}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            mt: 2.5,
                            py: 1.1,
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            boxShadow: isDark
                                ? '0 2px 8px rgba(0,0,0,0.3)'
                                : '0 2px 8px rgba(11,107,107,0.18)',
                            transition: 'all 250ms ease',
                            '&:hover': {
                                boxShadow: isDark
                                    ? '0 4px 16px rgba(0,0,0,0.4)'
                                    : '0 4px 16px rgba(11,107,107,0.25)',
                            },
                            '&:focus-visible': {
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                        }}
                    >
                        {t('campaigns.donateNow')}
                    </Button>
                </Box>
            </CardContent>
        </CampaignCard>
    );
}

export default Campaigns;

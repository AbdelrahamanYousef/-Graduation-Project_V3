import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { projects, programs, updates, impactStats, donationAmounts, testimonials } from '../../data/mockData';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    position: 'relative',
    background: `radial-gradient(circle at 30% 40%, ${theme.palette.hero.overlay}, transparent 40%), linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(8, 0),
    overflow: 'hidden',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '100%',
        background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
    },
    [theme.breakpoints.up('md')]: {
        padding: 0,
        minHeight: '90vh',
    },
}));

const HeroContent = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
        textAlign: 'right',
    },
}));

const HeroVisual = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 400,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(8),
    [theme.breakpoints.up('md')]: {
        marginTop: 0,
        height: 600,
    },
}));

const HeroCircle = styled(Box)(({ theme, size, color, delay }) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    opacity: 0.1,
    animation: `${float} 6s ease-in-out infinite`,
    animationDelay: delay,
}));

const StatCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',

    padding: theme.spacing(4),
    minHeight: 220,

    borderRadius: 16,
    border: `2px solid ${theme.palette.divider}`,
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',

    transition: 'all 0.3s ease',

    '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        borderColor: theme.palette.primary.main,
    }
}));

const StatIcon = styled(Box)(({ theme }) => ({
    display: 'flex', // Changed from inline-flex for better block centering logic
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    fontSize: '3rem',
    marginBottom: theme.spacing(3),
    color: '#1F2D3D', // Navy
    transition: 'all 0.3s ease',
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

const TestimonialCard = styled(Card)(({ theme }) => ({
    height: '100%',
    padding: theme.spacing(4),
    borderRadius: 24, // Use specific radius fro design
    backgroundColor: theme.palette.common.white,
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    },
    '&::before': {
        content: '"\\201C"',
        position: 'absolute',
        top: theme.spacing(2),
        left: theme.spacing(3), // Always on left for decorative purpose or based on Lang?
        // Let's make it consistent with the image which shows it on the left (for RTL reading it might be end, but image shows left)
        // Actually in the image for "قالوا عن نور" (RTL), the quote marks are on the Left side.
        fontSize: '6rem',
        color: '#E0F2F1', // Light Teal/Mint
        lineHeight: 1,
        fontFamily: 'serif',
        zIndex: 0
    }
}));

const PillButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.custom.radius.pill,
    padding: theme.spacing(1.5, 4),
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textTransform: 'none',
}));

function Home() {
    const theme = useTheme();
    const [selectedAmount, setSelectedAmount] = useState(null);
    const lang = getLanguage();
    const isEn = lang === 'en';
    const featuredProjects = projects.filter(p => p.featured).slice(0, 3);

    // Consistent section py value
    const sectionPy = theme.custom.sectionPadding;

    // Transform impactStats object into array for rendering
    const statsArray = [
        { icon: 'fa-solid fa-coins', value: impactStats.totalDonations, label: t('home.totalDonations') },
        { icon: 'fa-solid fa-users', value: impactStats.beneficiaries, label: t('home.beneficiaries') },
        { icon: 'fa-solid fa-folder-open', value: impactStats.projects, label: t('home.projects') },
        { icon: 'fa-solid fa-heart', value: impactStats.donors, label: t('home.donors') },
    ];

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            {/* ========== HERO ========== */}
            <HeroSection>
                <Container>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <HeroContent>
                                <Typography
                                    variant="h1"
                                    fontWeight="900"
                                    sx={{
                                        lineHeight: 1.2,
                                        mb: 2,
                                        fontSize: { xs: '2.5rem', md: '4rem' },
                                        color: 'common.white',
                                        animation: `${fadeInUp} 0.8s ease forwards`
                                    }}
                                >
                                    {t('home.heroTitle')}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 4,
                                        lineHeight: 1.6,
                                        color: alpha(theme.palette.common.white, 0.85),
                                        animation: `${fadeInUp} 0.8s ease forwards 0.2s`,
                                        opacity: 0,
                                        animationFillMode: 'forwards'
                                    }}
                                >
                                    {t('home.heroSubtitle')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 4,
                                        color: alpha(theme.palette.common.white, 0.7),
                                        display: 'block',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {t('home.heroSubtitle2')}
                                </Typography>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                                    sx={{ animation: `${fadeInUp} 0.8s ease forwards 0.4s`, opacity: 0, animationFillMode: 'forwards' }}
                                >
                                    <PillButton
                                        component={Link}
                                        to="/donate"
                                        variant="contained"
                                        color="secondary" // Use secondary for contrast
                                        size="large"
                                        sx={{
                                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)',
                                            bgcolor: 'secondary.main',
                                            '&:hover': { bgcolor: 'secondary.dark' }
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
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <HeroVisual>
                                <HeroCircle size={400} color={theme.palette.hero.glow} delay="0s" />
                                <HeroCircle size={280} color={theme.palette.hero.glow} delay="1s" />
                                <HeroCircle size={150} color={theme.palette.hero.glow} delay="2s" />
                                <Box
                                    sx={{
                                        fontSize: '8rem',
                                        color: 'common.white',
                                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                                        animation: `${float} 4s ease-in-out infinite`
                                    }}
                                >
                                    <i className="fa-solid fa-hand-holding-heart"></i>
                                </Box>
                            </HeroVisual>
                        </Grid>
                    </Grid>
                </Container>
            </HeroSection>

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
                    mt: -1 // Fix any sub-pixel gap
                }}
            >
                <svg
                    position="relative"
                    display="block"
                    width="calc(100% + 1.3px)"
                    height="150px"
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

            {/* ========== IMPACT STATS ========== */}
            <Box sx={{ py: sectionPy, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                    }}>
                        <Grid container spacing={3} sx={{
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}>
                            {statsArray.map((stat, i) => (
                                <Grid item xs={6} md={3} key={i}>
                                    <StatCard elevation={0}>
                                        <StatIcon className="stat-icon">
                                            <i className={stat.icon}></i>
                                        </StatIcon>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                                            {formatNumber(stat.value)}+
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.label}
                                        </Typography>
                                    </StatCard>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>

            {/* ========== PROGRAMS ========== */}
            <Box sx={{ py: sectionPy }}>
                <Container>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Typography variant="h3" fontWeight="bold">{t('home.ourPrograms')}</Typography>
                        <Button component={Link} to="/programs" endIcon={isEn ? '→' : '←'}>
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {programs.map((program, i) => (
                            <Grid item xs={6} md={3} key={program.id}>
                                <ProgramCard elevation={0} color={program.color}>
                                    <Box
                                        className="program-icon"
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: '50%',
                                            bgcolor: alpha(program.color, 0.1),
                                            color: program.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.75rem',
                                            mb: 2,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className={program.icon}></i>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {isEn ? program.nameEn : program.name}
                                    </Typography>
                                </ProgramCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== FEATURED CAMPAIGNS ========== */}
            <Box sx={{ py: sectionPy, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                <Container>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Typography variant="h3" fontWeight="bold">{t('home.featuredProjects')}</Typography>
                        <Button component={Link} to="/campaigns" endIcon={isEn ? '→' : '←'}>
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {featuredProjects.map((project, i) => (
                            <Grid item xs={12} md={4} key={project.id}>
                                <ProjectCard project={project} isEn={isEn} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== QUICK DONATE ========== */}
            <QuickDonateSection>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom color="primary.main">{t('home.quickDonate')}</Typography>
                        <Typography variant="h6" color="text.secondary">{t('home.chooseAmount')}</Typography>
                    </Box>

                    <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: (t) => `${t.custom.radius.xl}px`, boxShadow: theme.shadows[5] }}>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {donationAmounts.map(amount => (
                                <Grid item xs={4} sm={2} key={amount}>
                                    <Button
                                        variant={selectedAmount === amount ? "contained" : "outlined"}
                                        color="primary"
                                        fullWidth
                                        onClick={() => setSelectedAmount(amount)}
                                        sx={{
                                            borderRadius: (t) => `${t.custom.radius.md}px`,
                                            py: 1.5,
                                            borderWidth: 2,
                                            fontWeight: 'bold',
                                            '&:hover': { borderWidth: 2 }
                                        }}
                                    >
                                        {formatNumber(amount)}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                        <Button
                            component={Link}
                            to={`/donate${selectedAmount ? `?amount=${selectedAmount}` : ''}`}
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={!selectedAmount}
                            sx={{
                                height: 56,
                                fontSize: '1.1rem',
                                borderRadius: (t) => `${t.custom.radius.pill}px`,
                            }}
                        >
                            {t('common.donate')} <i className="fa-solid fa-heart" style={{ marginInlineStart: 8 }}></i>
                        </Button>
                    </Card>
                </Container>
            </QuickDonateSection>

            {/* ========== TESTIMONIALS ========== */}
            <Box sx={{ py: sectionPy }}>
                <Container>
                    <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
                        {t('home.testimonials')}
                    </Typography>
                    <Grid container spacing={3}>
                        {testimonials.map((testimonial) => (
                            <Grid item xs={12} sm={6} md={4} key={testimonial.id} sx={{ display: 'flex' }}>
                                <TestimonialCardItem
                                    text={isEn ? testimonial.textEn : testimonial.text}
                                    name={isEn ? testimonial.nameEn : testimonial.name}
                                    role={isEn ? testimonial.roleEn : testimonial.role}
                                    initial={testimonial.avatarInitial}
                                    isEn={isEn}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== LATEST UPDATES ========== */}
            <Box sx={{ py: sectionPy, bgcolor: 'background.default' }}>
                <Container>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Typography variant="h3" fontWeight="bold">{t('home.latestUpdates')}</Typography>
                        <Button component={Link} to="/updates" endIcon={isEn ? '→' : '←'}>
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {updates.slice(0, 3).map((update, i) => (
                            <Grid item xs={12} md={4} key={update.id} sx={{ display: 'flex' }}>
                                <Card sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    gap: 2, // Use gap for spacing
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                                    }
                                }}>

                                    {/* Icon Area */}
                                    {/* Image shows icon on valid Left (end in RTL) or Start?
                                        In RTL "basha'ir al-khayr", the text is on right. Icon is on left.
                                        So it's flex-row-reverse? No, if direction is RTL, start is right.
                                        Leading (start) -> Text. Trailing (end) -> Icon.
                                        Let's assume standard flex direction with icon at the end (left).
                                     */}

                                    <Box sx={{ flex: 1, textAlign: isEn ? 'left' : 'right' }}>
                                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.4 }}>
                                            {update.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {update.date}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1F2D3D' // Dark Navy from design image
                                    }}>
                                        <i className="fa-solid fa-bullhorn" style={{ fontSize: '1.5rem', transform: 'rotate(-20deg)' }}></i>
                                    </Box>

                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ========== CTA ========== */}
            <Box sx={{ py: sectionPy, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{t('home.ctaTitle')}</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>{t('home.ctaSubtitle')}</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <PillButton
                            component={Link}
                            to="/donate"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ boxShadow: theme.shadows[4] }}
                        >
                            {t('common.donate')} <i className="fa-solid fa-heart" style={{ marginInlineStart: 8 }}></i>
                        </PillButton>
                        <PillButton
                            component={Link}
                            to="/volunteer"
                            variant="outlined"
                            color="primary"
                            size="large"
                        >
                            {t('common.joinNow')}
                        </PillButton>
                    </Stack>
                </Container>
            </Box>
        </Box >
    );
}

// --- Sub Components ---

function ProjectCard({ project, isEn }) {
    const theme = useTheme();
    const percentage = Math.round((project.raised / project.goal) * 100);
    const title = isEn ? (project.titleEn || project.title) : project.title;

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
                        label={isEn ? 'Urgent' : 'عاجل'}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold' }}
                    />
                )}
            </Box>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" color="primary" fontWeight="bold" gutterBottom>
                    {isEn ? (project.programEn || project.program) : project.program}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ flex: 1 }}>
                    {title}
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">{percentage}% {isEn ? 'funded' : 'مكتمل'}</Typography>
                        <Typography variant="body2" color="text.secondary">{project.daysLeft} {isEn ? 'days left' : 'يوم متبقي'}</Typography>
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

function TestimonialCardItem({ text, name, role, initial, isEn }) {
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

                <Box sx={{ textAlign: isEn ? 'left' : 'right' }}> {/* Name and Role */}
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

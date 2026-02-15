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
    useTheme
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import styled from '@emotion/styled';

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(12, 0),
    textAlign: 'center',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
    height: '100%',
    textAlign: 'center',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[4],
    },
}));

const IconWrapper = styled(Box)(({ theme, color = 'primary' }) => ({
    fontSize: 48,
    marginBottom: theme.spacing(2),
    color: theme.palette[color].main,
}));

const TimelineItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    position: 'relative',
    paddingBottom: theme.spacing(4),
    '&:last-child': {
        paddingBottom: 0,
        '& .timeline-line': {
            display: 'none',
        },
    },
}));

const TimelineDot = styled(Box)(({ theme }) => ({
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: theme.palette.primary.main,
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
    marginTop: 6,
}));

const TimelineLine = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 22,
    left: 7, // Center of 16px dot
    bottom: 0,
    width: 2,
    background: theme.palette.divider,
    zIndex: 0,
}));

// --- About Component ---

function About() {
    const theme = useTheme();
    const isEn = getLanguage() === 'en';

    const team = [
        { name: isEn ? 'Dr. Ahmed Mahmoud' : 'د. أحمد محمود', role: isEn ? 'Chairman of the Board' : 'رئيس مجلس الإدارة', image: 'fa-solid fa-user-tie' },
        { name: isEn ? 'Ms. Fatma Hassan' : 'أ. فاطمة حسن', role: isEn ? 'Executive Director' : 'المدير التنفيذي', image: 'fa-solid fa-user-tie' },
        { name: isEn ? 'Eng. Khaled Abdullah' : 'م. خالد عبدالله', role: isEn ? 'Programs Director' : 'مدير البرامج', image: 'fa-solid fa-laptop-code' },
        { name: isEn ? 'Ms. Sara Ali' : 'أ. سارة علي', role: isEn ? 'Development Director' : 'مدير التطوير', image: 'fa-solid fa-chalkboard-user' },
    ];

    const milestones = [
        { year: '2010', event: isEn ? 'Organization Founded' : 'تأسيس الجمعية' },
        { year: '2012', event: isEn ? 'First Orphanage Opened' : 'افتتاح أول دار أيتام' },
        { year: '2015', event: isEn ? 'Medical Convoy Program Launched' : 'إطلاق برنامج القوافل الطبية' },
        { year: '2018', event: isEn ? 'Reached 10,000 Beneficiaries' : 'الوصول لـ 10,000 مستفيد' },
        { year: '2020', event: isEn ? 'Online Platform Launched' : 'إطلاق المنصة الإلكترونية' },
        { year: '2024', event: isEn ? 'Achieved EGP 15 Million in Donations' : 'تحقيق 15 مليون جنيه تبرعات' },
    ];

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                <Container>
                    <Typography variant="h3" fontWeight="bold" gutterBottom component="h1">
                        {t('about.title')}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                        {t('about.subtitle')}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: 8 }}>
                {/* Vision & Mission */}
                <Grid container spacing={4} sx={{ mb: 8 }}>
                    <Grid item xs={12} md={6}>
                        <FeatureCard>
                            <IconWrapper>
                                <i className="fa-solid fa-bullseye"></i>
                            </IconWrapper>
                            <Typography variant="h5" gutterBottom color="primary.main">
                                {t('about.vision')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('about.visionText')}
                            </Typography>
                        </FeatureCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FeatureCard>
                            <IconWrapper>
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            </IconWrapper>
                            <Typography variant="h5" gutterBottom color="primary.main">
                                {t('about.mission')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('about.missionText')}
                            </Typography>
                        </FeatureCard>
                    </Grid>
                </Grid>

                {/* Values */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        {t('about.values')}
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 4 }}>
                                <IconWrapper sx={{ fontSize: 36, mb: 2 }}>
                                    <i className="fa-solid fa-handshake"></i>
                                </IconWrapper>
                                <Typography variant="h6" gutterBottom>
                                    {t('about.integrity')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('about.integrityDesc')}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 4 }}>
                                <IconWrapper sx={{ fontSize: 36, mb: 2 }}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </IconWrapper>
                                <Typography variant="h6" gutterBottom>
                                    {t('about.transparency')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('about.transparencyDesc')}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 4 }}>
                                <IconWrapper sx={{ fontSize: 36, mb: 2 }}>
                                    <i className="fa-solid fa-bolt"></i>
                                </IconWrapper>
                                <Typography variant="h6" gutterBottom>
                                    {t('about.efficiency')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('about.efficiencyDesc')}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 4 }}>
                                <IconWrapper sx={{ fontSize: 36, mb: 2 }}>
                                    <i className="fa-solid fa-heart"></i>
                                </IconWrapper>
                                <Typography variant="h6" gutterBottom>
                                    {t('about.compassion')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('about.compassionDesc')}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Timeline */}
                <Box sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        {t('about.journey')}
                    </Typography>
                    <Box>
                        {milestones.map((milestone, index) => (
                            <TimelineItem key={index}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ width: 60, flexShrink: 0, pt: 0.5 }}>
                                    {milestone.year}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <TimelineDot />
                                    <TimelineLine className="timeline-line" />
                                </Box>
                                <Paper sx={{ flex: 1, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                                    <Typography variant="body1">
                                        {milestone.event}
                                    </Typography>
                                </Paper>
                            </TimelineItem>
                        ))}
                    </Box>
                </Box>

                {/* Team */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        {t('about.team')}
                    </Typography>
                    <Grid container spacing={4}>
                        {team.map((member, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ height: '100%', p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.light' }}>
                                        <i className={member.image} style={{ fontSize: 40 }}></i>
                                    </Avatar>
                                    <Typography variant="h6" gutterBottom>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {member.role}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Legal */}
                <Box>
                    <Card sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                            {t('about.legal')}
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('about.regNumber')}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        1234 / 2010
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('about.commercialReg')}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        56789
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('about.taxNumber')}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        123-456-789
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('about.headquarters')}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {isEn ? 'Cairo, Egypt' : 'القاهرة، مصر'}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

export default About;

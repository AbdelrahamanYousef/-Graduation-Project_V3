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
    useTheme,
    alpha
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- Animations ---
const floatParticle = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    position: 'relative',
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    textAlign: 'center',
    padding: theme.spacing(12, 2),
}));

const Particle = styled(Box)(({ top, left, size, delay }) => ({
    position: 'absolute',
    top,
    left,
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    animation: `${floatParticle} 6s ease-in-out infinite`,
    animationDelay: delay,
}));

const ImpactCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(5),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    transition: 'all 0.3s ease',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10],
    },
}));

const WhyCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    height: '100%',
    '&:hover': {
        borderColor: theme.palette.primary.light,
        boxShadow: theme.shadows[4],
        transform: 'translateY(-3px)',
    },
}));

const OpportunityCard = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    textAlign: 'center',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        transform: 'scale(1.03)',
        boxShadow: theme.shadows[4],
    },
}));

const SignupSection = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 3,
    overflow: 'hidden',
    boxShadow: theme.shadows[10],
    background: theme.palette.background.paper,
}));

const SignupInfo = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    padding: theme.spacing(6),
    color: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
}));

function Volunteer() {
    const containerRef = useRef(null); // Keep ref if needed for logic, though animations are CSS-in-JS now
    const theme = useTheme();
    const isEn = getLanguage() === 'en';
    const [form, setForm] = useState({ name: '', email: '', phone: '', area: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

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
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setForm({ name: '', email: '', phone: '', area: '', message: '' });
    };

    const particles = [
        { top: '20%', left: '10%', size: 6, delay: '0s' },
        { top: '60%', left: '25%', size: 8, delay: '0.5s' },
        { top: '30%', left: '50%', size: 6, delay: '1s' },
        { top: '70%', left: '70%', size: 4, delay: '1.5s' },
        { top: '15%', left: '80%', size: 10, delay: '2s' },
        { top: '80%', left: '90%', size: 6, delay: '2.5s' },
    ];

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                {particles.map((p, i) => (
                    <Particle key={i} {...p} />
                ))}
                <Container sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ animation: `${fadeInUp} 0.6s ease forwards` }}
                    >
                        {t('volunteer.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ maxWidth: 600, mx: 'auto', mb: 2, animation: `${fadeInUp} 0.6s ease forwards 0.2s`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {t('volunteer.subtitle')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ maxWidth: 800, mx: 'auto', animation: `${fadeInUp} 0.6s ease forwards 0.3s`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {t('volunteer.description')}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
                {/* Impact Numbers */}
                <Grid container spacing={3} sx={{ mb: 12 }}>
                    {impactNumbers.map((stat, i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <ImpactCard elevation={3} sx={{ animation: `${fadeInUp} 0.6s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}>
                                <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>
                                    <i className={stat.icon}></i>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </ImpactCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Why Volunteer */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        {t('volunteer.whyVolunteer')}
                    </Typography>
                    <Grid container spacing={4}>
                        {reasons.map((reason, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <WhyCard elevation={0}>
                                    <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                                        <i className={reason.icon}></i>
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {reason.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {reason.desc}
                                    </Typography>
                                </WhyCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Opportunities */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        {t('volunteer.opportunities')}
                    </Typography>
                    <Grid container spacing={3}>
                        {volunteerAreas.map((area, i) => (
                            <Grid item xs={12} sm={6} md={4} key={area.id}>
                                <OpportunityCard>
                                    <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                                        <i className={area.icon}></i>
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {area.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {area.desc}
                                    </Typography>
                                </OpportunityCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Sign Up Form */}
                <SignupSection>
                    <Grid container>
                        <Grid item xs={12} md={6}>
                            <SignupInfo>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {t('volunteer.signUp')}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                                    {t('volunteer.signUpSubtitle')}
                                </Typography>
                                <Box sx={{ fontSize: 80, textAlign: 'center', animation: `${float} 3s ease-in-out infinite` }}>
                                    <i className="fa-solid fa-hand-holding-heart"></i>
                                </Box>
                            </SignupInfo>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 6 }}>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label={t('volunteer.name')}
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            required
                                            fullWidth
                                            variant="outlined"
                                        />
                                        <TextField
                                            label={t('volunteer.email')}
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            required
                                            fullWidth
                                        />
                                        <TextField
                                            label={t('volunteer.phone')}
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            required
                                            fullWidth
                                        />
                                        <FormControl fullWidth required>
                                            <InputLabel>{t('volunteer.area')}</InputLabel>
                                            <Select
                                                value={form.area}
                                                label={t('volunteer.area')}
                                                onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                                            >
                                                <MenuItem value="">{t('volunteer.areaPlaceholder')}</MenuItem>
                                                {volunteerAreas.map(a => (
                                                    <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label={t('volunteer.message')}
                                            multiline
                                            rows={3}
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                            fullWidth
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={submitted}
                                            sx={{ mt: 2 }}
                                        >
                                            {submitted ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isEn ? 'Registered Successfully!' : 'تم التسجيل بنجاح!'} <i className="fa-solid fa-check"></i>
                                                </Box>
                                            ) : t('common.joinNow')}
                                        </Button>
                                    </Stack>
                                </form>
                            </Box>
                        </Grid>
                    </Grid>
                </SignupSection>
            </Container>
        </Box>
    );
}

export default Volunteer;

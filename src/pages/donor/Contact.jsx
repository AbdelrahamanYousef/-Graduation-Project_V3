import { useState, useRef, useEffect } from 'react';
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
    alpha
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

// --- Styled Components ---
const HeroSection = styled(Box)(({ theme }) => ({
    position: 'relative',
    minHeight: 260,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    textAlign: 'center',
}));

const InfoCard = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: theme.palette.primary.light,
        boxShadow: theme.shadows[2],
        transform: 'translateX(-5px)',
    },
}));

const SocialLink = styled(IconButton)(({ theme, color }) => ({
    width: 48,
    height: 48,
    color: theme.palette.common.white,
    backgroundColor: color,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: color,
        transform: 'translateY(-3px) scale(1.1)',
    },
}));

const MapPlaceholder = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.grey[50]})`,
    borderRadius: theme.shape.borderRadius * 1.5,
    height: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

function Contact() {
    const containerRef = useRef(null);
    const theme = useTheme();
    const isEn = getLanguage() === 'en';
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const contactInfo = [
        { icon: 'fa-solid fa-location-dot', label: t('contact.addressLabel'), value: t('contact.info.address') },
        { icon: 'fa-solid fa-phone', label: t('contact.phoneLabel'), value: t('contact.info.phone') },
        { icon: 'fa-solid fa-envelope', label: t('contact.emailLabel'), value: t('contact.info.email') },
        { icon: 'fa-solid fa-clock', label: t('contact.workHoursLabel'), value: t('contact.info.workHours') },
    ];

    // Re-implementing scroll animation logic with local styles or just keeping the hook if useful
    // For now, simpler to just use CSS-in-JS animations on mount or simplified transition
    // But since the hook is used elsewhere, we'll keep the ref but implement animations via sx or just let them be visible

    useEffect(() => {
        // We can keep `initScrollAnimations` if we add the global class, 
        // OR we can just use simple entry animations here. 
        // Let's use simple entry animations for now to reduce dependency on the hook's CSS classes.
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
    };

    const socialColors = {
        facebook: '#1877F2',
        twitter: '#1DA1F2',
        instagram: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        whatsapp: '#25D366'
    };

    return (
        <Box ref={containerRef} sx={{ pb: 8 }}>
            {/* Hero */}
            <HeroSection>
                <Container sx={{ position: 'relative', zIndex: 1, py: 6 }}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ animation: `${fadeInUp} 0.6s ease forwards` }}
                    >
                        {t('contact.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ maxWidth: 600, mx: 'auto', animation: `${fadeInUp} 0.6s ease forwards 0.2s`, opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {t('contact.subtitle')}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: 6 }}>
                <Grid container spacing={4}>
                    {/* Contact Info Cards */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={4} sx={{ animation: `${fadeInUp} 0.6s ease forwards 0.3s`, opacity: 0, animationFillMode: 'forwards' }}>
                            <Stack spacing={2}>
                                {contactInfo.map((info, i) => (
                                    <InfoCard key={i} elevation={0}>
                                        <Box sx={{ fontSize: 28, color: 'text.secondary', width: 40, textAlign: 'center' }}>
                                            <i className={info.icon}></i>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {info.label}
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {info.value}
                                            </Typography>
                                        </Box>
                                    </InfoCard>
                                ))}
                            </Stack>

                            {/* Social Links */}
                            <Box>
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    {t('contact.social')}
                                </Typography>
                                <Stack direction="row" spacing={2}>
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
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                animation: `${fadeInUp} 0.6s ease forwards 0.4s`,
                                opacity: 0,
                                animationFillMode: 'forwards'
                            }}
                        >
                            {submitted ? (
                                <Box sx={{ textAlign: 'center', py: 8, animation: `${fadeInScale} 0.5s ease` }}>
                                    <Box sx={{ fontSize: 64, color: 'success.main', mb: 2, animation: `${bounce} 1s ease` }}>
                                        <i className="fa-solid fa-circle-check"></i>
                                    </Box>
                                    <Typography variant="h5" color="success.main">
                                        {t('contact.messageSent')}
                                    </Typography>
                                </Box>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <Typography variant="h5" gutterBottom color="text.secondary" mb={3}>
                                        {t('contact.description')}
                                    </Typography>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label={t('contact.form.name')}
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
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
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label={t('contact.form.phone')}
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label={t('contact.form.subject')}
                                                value={form.subject}
                                                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label={t('contact.form.message')}
                                                value={form.message}
                                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
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
                                                endIcon={theme.direction === 'ltr' ? <i className="fa-solid fa-paper-plane"></i> : null}
                                                startIcon={theme.direction === 'rtl' ? <i className="fa-solid fa-paper-plane"></i> : null}
                                            >
                                                {t('contact.form.send')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Contact;

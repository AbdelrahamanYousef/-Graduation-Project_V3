import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Tabs,
    Tab,
    LinearProgress,
    Chip,
    Avatar,
    Divider,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatCurrency, formatNumber, formatDate, getLanguage } from '../../i18n';
import { projects, updates } from '../../data/mockData';
import styled from '@emotion/styled';

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme, image }) => ({
    height: '50vh',
    minHeight: 400,
    maxHeight: 600,
    background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%), url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    color: theme.palette.common.white,
    paddingBottom: theme.spacing(6),
    position: 'relative',
}));

const SidebarCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    position: 'sticky',
    top: theme.spacing(12),
}));

const AmountButton = styled(Button)(({ theme, selected }) => ({
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
    color: selected ? theme.palette.primary.main : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.2) : theme.palette.action.hover,
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.secondary}`,
    },
}));

function ProjectDetails() {
    const { id } = useParams();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [donationAmount, setDonationAmount] = useState(100);
    const isEn = getLanguage() === 'en';

    const project = projects.find(p => p.id === parseInt(id));
    const projectUpdates = updates.filter(u => u.projectId === parseInt(id));

    if (!project) {
        return (
            <Box sx={{ py: 12, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    {isEn ? 'Project not found' : 'المشروع غير موجود'}
                </Typography>
                <Button component={Link} to="/projects" variant="contained">
                    {isEn ? 'Back to Projects' : 'العودة للمشاريع'}
                </Button>
            </Box>
        );
    }

    const title = isEn ? (project.titleEn || project.title) : project.title;
    const program = isEn ? (project.programEn || project.program) : project.program;
    const percentage = Math.round((project.raised / project.goal) * 100);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ pb: 8 }}>
            {/* Hero Image */}
            <HeroSection image={project.image}>
                <Container>
                    <Chip
                        label={program}
                        color="primary"
                        sx={{ mb: 2, fontWeight: 'bold' }}
                    />
                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        sx={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        {title}
                    </Typography>
                </Container>
            </HeroSection>

            <Container sx={{ mt: 6 }}>
                <Grid container spacing={6}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={8}>
                        <Stack direction="row" spacing={4} sx={{ mb: 4, color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-location-dot"></i>
                                {project.location}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-regular fa-clock"></i>
                                {project.daysLeft} {t('projects.daysLeft')}
                            </Box>
                        </Stack>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} aria-label="project tabs">
                                <Tab label={t('projectDetails.overview')} />
                                <Tab label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {t('projectDetails.updates')}
                                        {projectUpdates.length > 0 && (
                                            <Chip label={projectUpdates.length} size="small" color="secondary" sx={{ height: 20 }} />
                                        )}
                                    </Box>
                                } />
                                <Tab label={t('projectDetails.budget')} />
                                <Tab label={t('projectDetails.faq')} />
                            </Tabs>
                        </Box>

                        {/* Tab Panels */}
                        <Box role="tabpanel" hidden={activeTab !== 0}>
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>{t('projectDetails.aboutProject')}</Typography>
                                    <Typography paragraph sx={{ mb: 4, lineHeight: 1.8 }}>{project.description}</Typography>

                                    <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderLeft: `4px solid ${theme.palette.primary.main}`, mb: 4 }}>
                                        <Typography fontStyle="italic">
                                            {isEn
                                                ? 'Through this project, we aim to provide support and assistance to the most vulnerable communities in Egyptian society. Your generous donation helps change many lives and achieve lasting positive impact.'
                                                : 'نسعى من خلال هذا المشروع إلى تقديم الدعم والمساعدة للفئات الأكثر احتياجًا في المجتمع المصري. بتبرعك الكريم، تساهم في تغيير حياة الكثيرين وتحقيق الأثر الإيجابي المستدام.'}
                                        </Typography>
                                    </Paper>

                                    <Typography variant="h5" fontWeight="bold" gutterBottom>{t('projectDetails.projectGoals')}</Typography>
                                    <Box component="ul" sx={{ pl: 2 }}>
                                        {[
                                            isEn ? 'Reach targeted groups in the most underserved areas' : 'الوصول إلى الفئات المستهدفة في المناطق الأكثر احتياجًا',
                                            isEn ? 'Provide direct financial and in-kind support' : 'توفير الدعم المادي والعيني بشكل مباشر',
                                            isEn ? 'Ensure full transparency in donation distribution' : 'ضمان الشفافية الكاملة في توزيع التبرعات',
                                            isEn ? 'Regular monitoring and impact assessment' : 'متابعة وتقييم الأثر بشكل دوري'
                                        ].map((goal, index) => (
                                            <Typography component="li" key={index} sx={{ mb: 1 }}>{goal}</Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Box role="tabpanel" hidden={activeTab !== 1}>
                            {activeTab === 1 && (
                                <Stack spacing={3}>
                                    {projectUpdates.length === 0 ? (
                                        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                            {isEn ? 'No updates at this time' : 'لا توجد تحديثات حالياً'}
                                        </Typography>
                                    ) : (
                                        projectUpdates.map(update => (
                                            <Paper key={update.id} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                    <Box
                                                        component="img"
                                                        src={update.image}
                                                        alt={update.title}
                                                        sx={{ width: { xs: '100%', sm: 120 }, height: 120, objectFit: 'cover', borderRadius: 2 }}
                                                    />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="h6" gutterBottom>{update.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary" paragraph>{update.content}</Typography>
                                                        <Typography variant="caption" color="text.disabled">
                                                            <i className="fa-regular fa-calendar" style={{ marginRight: 6 }}></i>
                                                            {formatDate(update.date)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        ))
                                    )}
                                </Stack>
                            )}
                        </Box>

                        <Box role="tabpanel" hidden={activeTab !== 2}>
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>{t('projectDetails.budgetBreakdown')}</Typography>
                                    <Stack spacing={3} sx={{ mt: 3 }}>
                                        {[
                                            { label: isEn ? 'Supplies & Materials' : 'المستلزمات والمواد', value: 60 },
                                            { label: isEn ? 'Transportation & Distribution' : 'النقل والتوزيع', value: 20 },
                                            { label: isEn ? 'Operations & Management' : 'التشغيل والإدارة', value: 15 },
                                            { label: isEn ? 'Emergency & Reserve' : 'الطوارئ والاحتياطي', value: 5 }
                                        ].map((item, index) => (
                                            <Box key={index}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography fontWeight="medium">{item.label}</Typography>
                                                    <Typography fontWeight="bold">{item.value}%</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={item.value} sx={{ height: 10, borderRadius: 5 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        <Box role="tabpanel" hidden={activeTab !== 3}>
                            {activeTab === 3 && (
                                <Stack spacing={2}>
                                    {[
                                        { q: isEn ? 'How can I make sure my donation reaches those in need?' : 'كيف يمكنني التأكد من وصول تبرعي؟', a: isEn ? 'We are committed to full transparency and publish regular updates on donation distribution with photos and detailed reports.' : 'نلتزم بالشفافية الكاملة وننشر تحديثات دورية عن توزيع التبرعات مع صور وتقارير مفصلة.' },
                                        { q: isEn ? 'Can I set up a monthly donation?' : 'هل يمكنني التبرع بشكل شهري؟', a: isEn ? 'Yes, you can set up a recurring monthly donation to support this project on an ongoing basis.' : 'نعم، يمكنك إعداد تبرع شهري متكرر لدعم المشروع بشكل مستمر.' },
                                        { q: isEn ? 'Are donations tax-deductible?' : 'هل التبرع معفى من الضرائب؟', a: isEn ? 'Yes, donations are tax-exempt under Egyptian law, and we provide official receipts.' : 'نعم، التبرعات معفاة من الضرائب وفقًا للقوانين المصرية ونوفر إيصالات رسمية.' }
                                    ].map((faq, index) => (
                                        <Paper key={index} elevation={0} variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{faq.q}</Typography>
                                            <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        <SidebarCard>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                                            {formatCurrency(project.raised)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {isEn ? 'from' : 'من'} {formatCurrency(project.goal)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage > 100 ? 100 : percentage}
                                        sx={{ height: 12, borderRadius: 6, mb: 2 }}
                                    />
                                    <Grid container justifyContent="space-between" textAlign="center">
                                        <Grid item>
                                            <Typography variant="h6" fontWeight="bold">{percentage}%</Typography>
                                            <Typography variant="caption" color="text.secondary">{isEn ? 'funded' : 'مكتمل'}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" fontWeight="bold">{formatNumber(project.donors)}</Typography>
                                            <Typography variant="caption" color="text.secondary">{t('projects.donors')}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" fontWeight="bold">{project.daysLeft}</Typography>
                                            <Typography variant="caption" color="text.secondary">{t('projects.daysLeft')}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                    {t('donate.selectAmount')}
                                </Typography>

                                <Grid container spacing={1} sx={{ mb: 3 }}>
                                    {[50, 100, 200, 500, 1000, 2000].map(amount => (
                                        <Grid item xs={4} key={amount}>
                                            <AmountButton
                                                selected={donationAmount === amount}
                                                onClick={() => setDonationAmount(amount)}
                                            >
                                                {formatCurrency(amount, 'USD').replace('$', '')} {/* Simplified for grid fit */}
                                            </AmountButton>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Button
                                    component={Link}
                                    to={`/donate?project=${project.id}&amount=${donationAmount}`}
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mb: 2, height: 48 }}
                                >
                                    {t('common.donate')}
                                </Button>

                                <Button
                                    fullWidth
                                    startIcon={<i className="fa-solid fa-share-nodes"></i>}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {t('projectDetails.shareProject')}
                                </Button>
                            </CardContent>
                        </SidebarCard>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default ProjectDetails;

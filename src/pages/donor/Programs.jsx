import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { t } from '../../i18n';
import { programs, projects } from '../../data/mockData';
import styled from '@emotion/styled';

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(12, 0),
    textAlign: 'center',
}));

const ProgramCard = styled(Card)(({ theme, programColor }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'visible',
    marginTop: theme.spacing(4),
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[8],
    },
}));

const ProgramIconWrapper = styled(Box)(({ theme, bgcolor }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: bgcolor,
    color: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    margin: '-40px auto 0',
    boxShadow: theme.shadows[3],
    border: `4px solid ${theme.palette.background.paper}`,
}));

function Programs() {
    const theme = useTheme();

    return (
        <Box sx={{ pb: 12 }}>
            {/* Hero */}
            <HeroSection>
                <Container>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        component="h1"
                    >
                        {t('nav.programs')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ opacity: 0.9, maxWidth: 700, mx: 'auto' }}
                    >
                        اكتشف برامجنا المتنوعة التي تستهدف مختلف فئات المحتاجين في المجتمع المصري
                    </Typography>
                </Container>
            </HeroSection>

            {/* Programs Grid */}
            <Container sx={{ mt: -4 }}>
                <Grid container spacing={4}>
                    {programs.map(program => {
                        const programProjects = projects.filter(p => p.programId === program.id);
                        const totalRaised = programProjects.reduce((sum, p) => sum + p.raised, 0);

                        return (
                            <Grid item xs={12} sm={6} md={4} key={program.id}>
                                <ProgramCard elevation={2}>
                                    <ProgramIconWrapper bgcolor={program.color}>
                                        <i className={program.icon}></i>
                                    </ProgramIconWrapper>
                                    <CardContent sx={{ flex: 1, textAlign: 'center', pt: 3, px: 3 }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {program.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60 }}>
                                            {getProgramDescription(program.id)}
                                        </Typography>

                                        <DividerWithText />

                                        <Stack
                                            direction="row"
                                            justifyContent="space-around"
                                            sx={{ my: 3 }}
                                        >
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                    {programProjects.length}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    مشروع نشط
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold" color="secondary.main">
                                                    {(totalRaised / 1000).toFixed(0)}K
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ج.م تم جمعها
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Button
                                            component={Link}
                                            to={`/projects?program=${program.id}`}
                                            variant="outlined"
                                            fullWidth
                                            color="inherit"
                                            sx={{
                                                borderColor: alpha(theme.palette.common.black, 0.1),
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    color: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            عرض المشاريع
                                        </Button>
                                    </CardContent>
                                </ProgramCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
}

const DividerWithText = styled(Box)(({ theme }) => ({
    height: 1,
    width: '60%',
    backgroundColor: theme.palette.divider,
    margin: '0 auto',
}));

function getProgramDescription(id) {
    const descriptions = {
        1: 'نوفر الرعاية الشاملة للأيتام من تعليم وصحة ومعيشة كريمة لضمان مستقبل أفضل لهم.',
        2: 'نقدم خدمات طبية مجانية وقوافل علاجية للمناطق المحرومة والفئات الأكثر احتياجًا.',
        3: 'ندعم العملية التعليمية من خلال توفير المستلزمات والمنح الدراسية للطلاب المتفوقين.',
        4: 'نستجيب للأزمات والكوارث بتوفير المساعدات العاجلة للمتضررين.',
        5: 'تنمية شاملة لتحسين مستوى المعيشة ومحاربة الفقر.',
        6: 'مشاريع موسمية في رمضان والأعياد لإدخال الفرحة على الأسر المحتاجة.',
    };
    return descriptions[id] || '';
}

export default Programs;

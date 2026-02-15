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

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.hero.base} 0%, ${theme.palette.hero.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(12, 0),
    textAlign: 'center',
    position: 'relative',
}));

const FilterSection = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 64, // Appbar height
    zIndex: 10,
    boxShadow: theme.shadows[1],
}));

const CampaignCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[8],
        '& .donate-overlay': {
            opacity: 1,
        }
    },
}));

const CampaignImage = styled(CardMedia)(({ theme }) => ({
    height: 200,
    position: 'relative',
}));

const DonateOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha(theme.palette.common.black, 0.4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
}));

function Campaigns() {
    const theme = useTheme();
    const [activeProgram, setActiveProgram] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

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

    return (
        <Box sx={{ pb: 8 }}>
            {/* Hero Banner */}
            <HeroSection>
                <Container>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ animation: `${fadeInUp} 0.6s ease forwards` }}
                    >
                        {t('campaigns.title')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: 600,
                            mx: 'auto',
                            animation: `${fadeInUp} 0.6s ease forwards 0.2s`,
                            opacity: 0,
                            animationFillMode: 'forwards'
                        }}
                    >
                        ساهم في دعم الحملات الخيرية وكن جزءًا من التغيير
                    </Typography>
                </Container>
            </HeroSection>

            {/* Filters */}
            <FilterSection>
                <Container>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                placeholder={t('campaigns.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ flex: 1, minWidth: 200 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ width: 200 }}
                            >
                                <MenuItem value="newest">{t('campaigns.newest')}</MenuItem>
                                <MenuItem value="mostFunded">{t('campaigns.mostFunded')}</MenuItem>
                                <MenuItem value="endingSoon">{t('campaigns.endingSoon')}</MenuItem>
                            </TextField>
                        </Box>

                        <Tabs
                            value={activeProgram}
                            onChange={handleProgramChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
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

            {/* Campaign Grid */}
            <Container sx={{ mt: 6 }}>
                {filteredProjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h2" sx={{ mb: 2 }}>🔍</Typography>
                        <Typography variant="h5" gutterBottom>{t('campaigns.noResults')}</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {filteredProjects.map((project, index) => (
                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                <CampaignCardItem project={project} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

function CampaignCardItem({ project, index }) {
    const percentage = Math.round((project.raised / project.goal) * 100);
    const isUrgent = project.daysLeft <= 10;
    const theme = useTheme();

    return (
        <CampaignCard elevation={3} sx={{ animation: `${fadeInUp} 0.5s ease forwards`, animationDelay: `${index * 0.1}s`, opacity: 0 }}>
            <Box sx={{ position: 'relative' }}>
                <CampaignImage
                    image={project.image}
                    title={project.title}
                />

                {isUrgent && (
                    <Chip
                        label={t('campaigns.urgent')}
                        color="error"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[2]
                        }}
                    />
                )}

                <DonateOverlay className="donate-overlay">
                    <Button
                        component={Link}
                        to={`/projects/${project.id}`}
                        variant="contained"
                        color="primary"
                    >
                        {t('campaigns.donateNow')}
                    </Button>
                </DonateOverlay>
            </Box>

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Chip
                    label={project.program}
                    size="small"
                    sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}
                />

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        height: 64, // Fixed height for 2 lines
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {project.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 3,
                        height: 40,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {project.description}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {formatCurrency(project.raised)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('campaigns.daysLeft')}: {project.daysLeft}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={percentage > 100 ? 100 : percentage}
                        sx={{ height: 6, borderRadius: 3, mb: 2 }}
                    />

                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography variant="caption" display="block" color="text.secondary">{t('campaigns.donors')}</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{formatNumber(project.donors)}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="caption" display="block" color="text.secondary">Goal</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(project.goal)}</Typography>
                        </Grid>
                    </Grid>

                    <Button
                        component={Link}
                        to={`/projects/${project.id}`}
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        {t('campaigns.donateNow')}
                    </Button>
                </Box>
            </CardContent>
        </CampaignCard>
    );
}

export default Campaigns;

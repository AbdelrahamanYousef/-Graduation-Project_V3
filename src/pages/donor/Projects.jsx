import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    LinearProgress,
    Chip,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { t, formatNumber } from '../../i18n';
import { projects, programs } from '../../data/mockData';
import styled from '@emotion/styled';

// --- Styled Components ---

const FilterBar = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const ProjectCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        height: 280,
    },
}));

const ProjectImage = styled(CardMedia)(({ theme }) => ({
    height: 200,
    [theme.breakpoints.up('md')]: {
        height: '100%',
        width: 320,
        flexShrink: 0,
    },
}));

function Projects() {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgram, setSelectedProgram] = useState(searchParams.get('program') || 'all');
    const [sortBy, setSortBy] = useState('newest');

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.includes(searchQuery) ||
            project.description.includes(searchQuery);
        const matchesProgram = selectedProgram === 'all' ||
            project.programId.toString() === selectedProgram;
        return matchesSearch && matchesProgram;
    });

    // Sort projects
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        switch (sortBy) {
            case 'mostFunded':
                return (b.raised / b.goal) - (a.raised / a.goal);
            case 'endingSoon':
                return a.daysLeft - b.daysLeft;
            default: // newest
                return b.id - a.id;
        }
    });

    return (
        <Box sx={{ py: 8, minHeight: '80vh' }}>
            <Container>
                {/* Page Header */}
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                    {t('projects.title')}
                </Typography>

                {/* Filters Bar */}
                <FilterBar>
                    <TextField
                        placeholder={t('projects.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        sx={{ flex: { md: 2 } }}
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
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        sx={{ flex: { md: 1 }, minWidth: 200 }}
                    >
                        <MenuItem value="all">{t('projects.allPrograms')}</MenuItem>
                        {programs.map(program => (
                            <MenuItem key={program.id} value={program.id}>{program.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ flex: { md: 1 }, minWidth: 200 }}
                    >
                        <MenuItem value="newest">{t('projects.newest')}</MenuItem>
                        <MenuItem value="mostFunded">{t('projects.mostFunded')}</MenuItem>
                        <MenuItem value="endingSoon">{t('projects.endingSoon')}</MenuItem>
                    </TextField>
                </FilterBar>

                {/* Results */}
                {sortedProjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h2" sx={{ mb: 2 }}>🔍</Typography>
                        <Typography variant="h5" gutterBottom>{t('states.noSearchResults')}</Typography>
                        <Typography color="text.secondary" paragraph>{t('projects.noResults')}</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => { setSearchQuery(''); setSelectedProgram('all'); }}
                        >
                            {t('common.viewAll')}
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {sortedProjects.map(project => (
                            <Grid item xs={12} key={project.id}>
                                <ProjectListCard project={project} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

/**
 * Project List Card (horizontal layout)
 */
function ProjectListCard({ project }) {
    const theme = useTheme();
    const progress = Math.min(100, Math.round((project.raised / project.goal) * 100));

    return (
        <ProjectCard>
            <Box sx={{ position: 'relative' }}>
                <ProjectImage
                    image={project.image}
                    title={project.title}
                />
                <Chip
                    label={project.program}
                    size="small"
                    color="primary"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 'bold',
                        boxShadow: theme.shadows[2]
                    }}
                />
            </Box>

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        component={Link}
                        to={`/projects/${project.id}`}
                        sx={{
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        {project.title}
                    </Typography>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {project.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 3, fontSize: '0.875rem' }}>
                    <i className="fa-solid fa-location-dot"></i>
                    {project.location}
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {progress}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('projects.daysLeft')}: <strong>{project.daysLeft}</strong>
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            <strong>{formatNumber(project.donors)}</strong> {t('projects.donors')}
                        </Typography>
                        <Button
                            component={Link}
                            to={`/projects/${project.id}`}
                            variant="contained"
                            disableElevation
                        >
                            {t('common.donate')}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </ProjectCard>
    );
}

export default Projects;

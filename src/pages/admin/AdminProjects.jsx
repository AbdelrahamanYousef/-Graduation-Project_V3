import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Chip,
    LinearProgress,
    Tabs,
    Tab,
    MenuItem,
    useTheme,
    alpha
} from '@mui/material';
import { projects, programs } from '../../data/mockData';
import { formatCurrency } from '../../i18n';

/**
 * Admin Projects Page - إدارة المشاريع
 */
function AdminProjects() {
    const theme = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');

    const handleFilterChange = (event, newValue) => {
        setFilter(newValue);
    };

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'active': return 'primary';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'pending': return 'قيد المراجعة';
            case 'active': return 'نشط';
            default: return status;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        إدارة المشاريع
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        إضافة ومتابعة مشاريع الجمعية
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => setIsModalOpen(true)}
                    startIcon={<i className="fa-solid fa-plus"></i>}
                >
                    مشروع جديد
                </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={filter}
                    onChange={handleFilterChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={`الكل (${projects.length})`} value="all" />
                    <Tab label="نشط" value="active" />
                    <Tab label="مكتمل" value="completed" />
                    <Tab label="قيد المراجعة" value="pending" />
                </Tabs>
            </Box>

            {/* Projects Grid */}
            <Grid container spacing={3}>
                {filteredProjects.map(project => {
                    const program = programs.find(p => p.id === project.programId);
                    const progress = Math.min(Math.round((project.raised / project.goal) * 100), 100);

                    return (
                        <Grid item xs={12} sm={6} lg={4} key={project.id}>
                            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            bgcolor: alpha(program?.color || theme.palette.primary.main, 0.1),
                                            color: program?.color || 'primary.main',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 'medium'
                                        }}>
                                            <i className={program?.icon}></i>
                                            {program?.name}
                                        </Box>
                                        <Chip
                                            label={getStatusLabel(project.status || 'active')}
                                            color={getStatusColor(project.status || 'active')}
                                            size="small"
                                            variant="soft" // Using soft variant if available in theme, else standard
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    </Box>

                                    <Typography variant="h6" fontWeight="bold" component="div">
                                        {project.title}
                                    </Typography>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                {formatCurrency(project.raised)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                من {formatCurrency(project.goal)}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{ height: 8, borderRadius: 1 }}
                                        />
                                    </Box>

                                    <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <i className="fa-solid fa-location-dot"></i>
                                            {project.location}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <i className="fa-solid fa-users"></i>
                                            {project.donors} متبرع
                                        </Box>
                                    </Stack>
                                </CardContent>

                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="outlined" fullWidth>تعديل</Button>
                                    <Button size="small" variant="outlined" fullWidth>عرض</Button>
                                    <IconButton size="small">
                                        <i className="fa-solid fa-ellipsis"></i>
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Add Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle>إضافة مشروع جديد</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            <TextField
                                label="عنوان المشروع"
                                fullWidth
                                required
                                variant="outlined"
                            />
                            <TextField
                                select
                                label="البرنامج"
                                fullWidth
                                variant="outlined"
                                defaultValue=""
                            >
                                {programs.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            <TextField
                                label="المبلغ المستهدف (ج.م)"
                                type="number"
                                fullWidth
                                required
                                variant="outlined"
                            />
                            <TextField
                                label="الموقع"
                                placeholder="المحافظة، المدينة"
                                fullWidth
                                variant="outlined"
                            />
                        </Box>

                        <TextField
                            label="وصف المشروع"
                            multiline
                            rows={4}
                            placeholder="وصف تفصيلي للمشروع..."
                            fullWidth
                            variant="outlined"
                        />

                        <Box sx={{
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'action.hover',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.selected' }
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                <i className="fa-solid fa-camera" style={{ marginRight: 8 }}></i>
                                اختر صورة أو اسحبها هنا
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setIsModalOpen(false)} color="inherit">
                        إلغاء
                    </Button>
                    <Button variant="contained" onClick={() => setIsModalOpen(false)}>
                        إنشاء المشروع
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminProjects;

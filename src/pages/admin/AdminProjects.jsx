import { useState, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button, IconButton,
    TextField, MenuItem, Stack, LinearProgress, Tooltip, useTheme, alpha,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, List, ListItem, ListItemText, Divider, Select, FormControl, InputLabel
} from '@mui/material';
import { AdminPageHeader, AdminFilterBar, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { formatCurrency, t } from '../../i18n';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';

/**
 * Admin Projects Page — Full CRUD, updates home page in real time
 */
function AdminProjects() {
    const theme = useTheme();
    const { state, dispatch } = useAdminData();
    const projectsList = state.projects;
    const programsList = state.programs;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [filter, setFilter] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [updatesModalOpen, setUpdatesModalOpen] = useState(false);
    const [updatesProject, setUpdatesProject] = useState(null);
    const [newUpdateText, setNewUpdateText] = useState('');

    const emptyForm = { title: '', programId: '', goal: '', donationAmount: '', location: '', description: '' };
    const [formData, setFormData] = useState(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, project: null });

    const handleStatusChange = (project, newStatus) => {
        dispatch(adminActions.updateProject({ ...project, status: newStatus }));
        setSnackbar({ open: true, msg: `تم تغيير حالة المشروع إلى ${newStatus}`, severity: 'success' });
    };

    const toggleFeatured = useCallback((project) => {
        dispatch(adminActions.toggleFeatured(project.id));
        setSnackbar({
            open: true,
            severity: 'success',
            msg: project.featured
                ? `تم إزالة "${project.title}" من الحالات الأشد احتياجاً`
                : `تم إضافة "${project.title}" للحالات الأشد احتياجاً ⭐`,
        });
    }, [dispatch]);

    const handleAdd = () => {
        setEditProject(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((project) => {
        setEditProject(project);
        setFormData({
            title: project.title || '',
            programId: project.programId || '',
            goal: project.goal || '',
            donationAmount: project.donationAmount || '',
            location: project.location || '',
            description: project.description || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال عنوان المشروع', severity: 'error' });
            return;
        }

        if (editProject) {
            dispatch(adminActions.updateProject({
                ...editProject,
                title: formData.title,
                programId: Number(formData.programId),
                goal: Number(formData.goal),
                donationAmount: Number(formData.donationAmount),
                location: formData.location,
                description: formData.description,
            }));
            setSnackbar({ open: true, msg: `تم تحديث المشروع "${formData.title}"`, severity: 'success' });
        } else {
            const program = programsList.find(p => p.id === Number(formData.programId));
            dispatch(adminActions.addProject({
                id: Math.max(...projectsList.map(p => p.id), 0) + 1,
                title: formData.title,
                programId: Number(formData.programId),
                program: program?.name || '',
                programEn: program?.nameEn || '',
                goal: Number(formData.goal) || 100000,
                raised: 0,
                donors: 0,
                daysLeft: 30,
                donationAmount: Number(formData.donationAmount) || 0,
                location: formData.location,
                description: formData.description,
                status: 'active',
                featured: false,
                image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
            }));
            setSnackbar({ open: true, msg: `تم إنشاء المشروع "${formData.title}"`, severity: 'success' });
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
    };

    const handleDelete = useCallback((project) => {
        setDeleteConfirm({ open: true, project });
    }, []);

    const confirmDelete = () => {
        const { project } = deleteConfirm;
        if (!project) return;
        dispatch(adminActions.deleteProject(project.id));
        setSnackbar({ open: true, msg: `تم حذف المشروع "${project.title}"`, severity: 'success' });
        setDeleteConfirm({ open: false, project: null });
    };

    const handleManageUpdates = (project) => {
        setUpdatesProject(project);
        setUpdatesModalOpen(true);
    };

    const handleAddUpdate = () => {
        if (!newUpdateText.trim()) return;
        const newUpdate = { id: Date.now(), text: newUpdateText, date: new Date().toLocaleDateString('ar-EG') };
        dispatch(adminActions.updateProject({
            ...updatesProject,
            updates: [...(updatesProject.updates || []), newUpdate]
        }));
        setUpdatesProject(prev => ({ ...prev, updates: [...(prev.updates || []), newUpdate] }));
        setNewUpdateText('');
        setSnackbar({ open: true, msg: 'تم إضافة التحديث بنجاح', severity: 'success' });
    };

    const handleDeleteUpdate = (updateId) => {
        const newUpdates = (updatesProject.updates || []).filter(u => u.id !== updateId);
        dispatch(adminActions.updateProject({ ...updatesProject, updates: newUpdates }));
        setUpdatesProject(prev => ({ ...prev, updates: newUpdates }));
        setSnackbar({ open: true, msg: 'تم حذف التحديث', severity: 'success' });
    };


    const filteredProjects = filter === 'all' ? projectsList : projectsList.filter(p => p.status === filter);

    const tabs = [
        { label: `${t('admin.projectsPage.all')} (${projectsList.length})`, value: 'all' },
        { label: `${t('admin.projectsPage.active')} (${projectsList.filter(p => p.status === 'active').length})`, value: 'active' },
        { label: `${t('admin.projectsPage.completed')} (${projectsList.filter(p => p.status === 'completed').length})`, value: 'completed' },
        { label: `${t('admin.projectsPage.pending')} (${projectsList.filter(p => p.status === 'pending').length})`, value: 'pending' },
    ];

    const updateField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.projectsPage.title')}
                subtitle={t('admin.projectsPage.subtitle')}
                action={{ label: t('admin.projectsPage.addBtn'), icon: 'fa-solid fa-plus', onClick: handleAdd }}
            />

            <AdminFilterBar tabs={tabs} activeTab={filter} onTabChange={(_, v) => setFilter(v)} />

            <Grid container spacing={3}>
                {filteredProjects.map(project => {
                    const program = programsList.find(p => p.id === project.programId);
                    const progress = Math.min(Math.round(((project.raised || 0) / (project.goal || 1)) * 100), 100);
                    return (
                        <Grid item xs={12} sm={6} lg={4} key={project.id}>
                            <Card elevation={0} sx={{
                                border: 1, borderColor: project.featured ? '#f59e0b' : 'divider',
                                height: '100%', display: 'flex', flexDirection: 'column',
                                ...(project.featured && { boxShadow: '0 0 0 2px #f59e0b40' }),
                            }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            bgcolor: alpha(program?.color || theme.palette.primary.main, 0.1),
                                            color: program?.color || 'primary.main',
                                            px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'medium'
                                        }}>
                                            {program?.icon && <i className={program.icon} />}
                                            {program?.name}
                                        </Box>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            {project.featured && <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: 12 }} />}
                                            <AdminStatusChip status={project.status || 'active'} />
                                        </Stack>
                                    </Box>

                                    <Typography variant="h6" fontWeight="bold">{project.title}</Typography>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="bold" color="primary">{formatCurrency(project.raised || 0)}</Typography>
                                            <Typography variant="caption" color="text.secondary">{t('admin.projectsPage.from')} {formatCurrency(project.goal)}</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
                                        {project.donationAmount > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                                <i className="fa-solid fa-hand-holding-heart" style={{ fontSize: '0.75rem', color: program?.color || theme.palette.primary.main }} />
                                                <Typography variant="caption" fontWeight="bold" color="primary">{formatCurrency(project.donationAmount)}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{t('admin.projectsPage.donationAmount')}</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <i className="fa-solid fa-location-dot" /> {project.location}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <i className="fa-solid fa-users" /> {project.donors || 0} {t('admin.projectsPage.donors')}
                                        </Box>
                                    </Stack>
                                </CardContent>

                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <Select
                                            value={project.status || 'draft'}
                                            onChange={(e) => handleStatusChange(project, e.target.value)}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            <MenuItem value="draft">مسودة</MenuItem>
                                            <MenuItem value="active">نشط</MenuItem>
                                            <MenuItem value="completed">مكتمل</MenuItem>
                                            <MenuItem value="archived">مؤرشف</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Tooltip title={project.featured ? t('admin.projectsPage.removeFeatured') : t('admin.projectsPage.addFeatured')}>
                                        <IconButton size="small" onClick={() => toggleFeatured(project)}
                                            sx={{
                                                color: project.featured ? '#f59e0b' : 'text.disabled',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { color: project.featured ? '#d97706' : '#f59e0b', transform: 'scale(1.15)' },
                                            }}>
                                            <i className={project.featured ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="تحديثات المشروع">
                                        <IconButton size="small" color="info" onClick={() => handleManageUpdates(project)}>
                                            <i className="fa-solid fa-bullhorn" style={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('admin.projectsPage.edit')}>
                                        <IconButton size="small" color="primary" onClick={() => handleEdit(project)}>
                                            <i className="fa-solid fa-pen-to-square" style={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('common.delete')}>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(project)}>
                                            <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {filteredProjects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography sx={{ mt: 2 }}>لا توجد مشاريع في هذه الفئة</Typography>
                </Box>
            )}

            {/* Add/Edit Modal */}
            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                onSubmit={handleSubmit}
                title={editProject ? `تعديل: ${editProject.title}` : t('admin.projectsPage.addDialog')}
                submitLabel={editProject ? t('admin.programsPage.saveChanges') : t('admin.projectsPage.createBtn')}
                maxWidth="md"
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <TextField label={t('admin.projectsPage.titleLabel')} fullWidth required value={formData.title} onChange={updateField('title')} />
                    <TextField select label={t('admin.projectsPage.programLabel')} fullWidth value={formData.programId} onChange={updateField('programId')}>
                        {programsList.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </TextField>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <TextField label={t('admin.projectsPage.goalLabel')} type="number" fullWidth required value={formData.goal} onChange={updateField('goal')} />
                    <TextField label={t('admin.projectsPage.donationAmountLabel')} type="number" fullWidth value={formData.donationAmount} onChange={updateField('donationAmount')} />
                </Box>
                <TextField label={t('admin.projectsPage.locationLabel')} fullWidth value={formData.location} onChange={updateField('location')} />
                <TextField label={t('admin.projectsPage.descLabel')} multiline rows={4} fullWidth value={formData.description} onChange={updateField('description')} />
                <Box sx={{
                    border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3,
                    textAlign: 'center', bgcolor: 'action.hover', cursor: 'pointer',
                }}>
                    <Typography variant="body2" color="text.secondary">
                        <i className="fa-solid fa-camera" style={{ marginInlineEnd: 8 }} />{t('admin.projectsPage.imageUpload')}
                    </Typography>
                </Box>
            </AdminFormDialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, project: null })}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من حذف مشروع "{deleteConfirm.project?.title}"؟
                        {deleteConfirm.project?.raised > 0 && (
                            <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
                                تحذير: هذا المشروع يحتوي على تبرعات بقيمة {formatCurrency(deleteConfirm.project.raised)}! 
                                حذفه قد يؤدي إلى فقدان السجلات المرتبطة به.
                            </Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, project: null })} color="inherit">إلغاء</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">حذف نهائياً</Button>
                </DialogActions>
            </Dialog>

            {/* Updates Modal */}
            <Dialog open={updatesModalOpen} onClose={() => setUpdatesModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>إدارة تحديثات المشروع: {updatesProject?.title}</DialogTitle>
                <DialogContent dividers>
                    <List disablePadding>
                        {(!updatesProject?.updates || updatesProject.updates.length === 0) ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>لا توجد تحديثات حالياً</Typography>
                        ) : (
                            updatesProject.updates.map((update, i) => (
                                <Box key={update.id}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" size="small" color="error" onClick={() => handleDeleteUpdate(update.id)}>
                                                <i className="fa-solid fa-trash" style={{ fontSize: 12 }} />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={update.text}
                                            secondary={update.date}
                                        />
                                    </ListItem>
                                    {i < updatesProject.updates.length - 1 && <Divider />}
                                </Box>
                            ))
                        )}
                    </List>
                    <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth size="small" label="تحديث جديد..."
                            value={newUpdateText} onChange={(e) => setNewUpdateText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddUpdate(); }}
                        />
                        <Button variant="contained" onClick={handleAddUpdate}>إضافة</Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdatesModalOpen(false)}>إغلاق</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminProjects;

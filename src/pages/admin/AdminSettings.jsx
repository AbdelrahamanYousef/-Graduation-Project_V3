import { useState, useCallback } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Grid,
    Switch, Button, Chip, MenuItem,
    List, ListItem, ListItemText, ListItemSecondaryAction,
    Avatar, useTheme, alpha, Snackbar, Alert
} from '@mui/material';
import { AdminPageHeader, AdminFilterBar, AdminDataTable, AdminIconBox, AdminFormDialog } from '../../components/admin';
import { t } from '../../i18n';
import { settingsUsers as initialUsers, settingsIntegrations as initialIntegrations, settingsNotifications } from '../../data/adminMockData';
import { getStatusColor, getStatusLabel } from '../../utils/admin.helpers';

/**
 * Admin Settings Page — with working forms, user CRUD, and toggles
 */
function AdminSettings() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [users, setUsers] = useState(initialUsers);
    const [integrations, setIntegrations] = useState(initialIntegrations);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Org form state
    const [orgData, setOrgData] = useState({ name: 'جمعية نور الخيرية', email: 'info@nour.org', phone: '+20 2 1234 5678', address: 'القاهرة، مصر' });
    const [sysData, setSysData] = useState({ language: 'ar', timezone: 'africa-cairo', currency: 'egp' });

    // User form state
    const emptyUserForm = { name: '', email: '', role: 'محرر', status: 'active' };
    const [userForm, setUserForm] = useState(emptyUserForm);

    const handleSaveOrg = () => setSnackbar({ open: true, msg: 'تم حفظ بيانات المؤسسة بنجاح ✓', severity: 'success' });
    const handleSaveSys = () => setSnackbar({ open: true, msg: 'تم حفظ إعدادات النظام بنجاح ✓', severity: 'success' });

    const handleAddUser = () => { setEditUser(null); setUserForm(emptyUserForm); setIsUserModalOpen(true); };
    const handleEditUser = useCallback((user) => {
        setEditUser(user);
        setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status || 'active' });
        setIsUserModalOpen(true);
    }, []);

    const handleDeleteUser = useCallback((user) => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setSnackbar({ open: true, msg: `تم حذف المستخدم "${user.name}"`, severity: 'success' });
    }, []);

    const handleSubmitUser = () => {
        if (!userForm.name.trim() || !userForm.email.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال اسم وبريد المستخدم', severity: 'error' }); return;
        }
        if (editUser) {
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...userForm } : u));
            setSnackbar({ open: true, msg: `تم تحديث "${userForm.name}"`, severity: 'success' });
        } else {
            setUsers(prev => [...prev, { id: Math.max(...prev.map(u => u.id), 0) + 1, ...userForm }]);
            setSnackbar({ open: true, msg: `تم إضافة "${userForm.name}" بنجاح`, severity: 'success' });
        }
        setIsUserModalOpen(false);
        setUserForm(emptyUserForm);
    };

    const handleToggleIntegration = useCallback((index) => {
        setIntegrations(prev => prev.map((intg, i) =>
            i === index ? { ...intg, status: intg.status === 'connected' ? 'disconnected' : 'connected' } : intg
        ));
        setSnackbar({ open: true, msg: 'تم تحديث حالة التكامل', severity: 'success' });
    }, []);

    const handleToggleNotification = (index) => {
        setSnackbar({ open: true, msg: 'تم تحديث إعداد الإشعارات', severity: 'success' });
    };

    const tabs = [
        { label: t('admin.settingsPage.general'), value: 'general', icon: 'fa-solid fa-gear' },
        { label: `${t('admin.settingsPage.usersTab')} (${users.length})`, value: 'users', icon: 'fa-solid fa-users' },
        { label: t('admin.settingsPage.notifications'), value: 'notifications', icon: 'fa-solid fa-bell' },
        { label: t('admin.settingsPage.integrations'), value: 'integrations', icon: 'fa-solid fa-plug' },
    ];

    const userColumns = [
        {
            key: 'name', label: t('admin.settingsPage.name'), fontWeight: 'medium',
            render: (_, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 14 }}>
                        {row.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="medium">{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                </Box>
            ),
        },
        { key: 'role', label: t('admin.settingsPage.role') },
        { key: 'status', label: t('admin.settingsPage.status'), type: 'status' },
    ];

    const userActions = [
        { icon: 'fa-solid fa-pen', tooltip: t('common.edit'), onClick: (row) => handleEditUser(row) },
        { icon: 'fa-solid fa-trash', tooltip: t('common.delete'), color: 'error', onClick: (row) => handleDeleteUser(row) },
    ];

    const updateUserField = (field) => (e) => setUserForm(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title={t('admin.settingsPage.title')}
                subtitle={t('admin.settingsPage.subtitle')}
            />

            <AdminFilterBar tabs={tabs} activeTab={activeTab} onTabChange={(_, v) => setActiveTab(v)} />

            {/* General Settings */}
            {activeTab === 'general' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.settingsPage.orgInfo')}</Typography>
                            </Box>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label={t('admin.settingsPage.orgName')} value={orgData.name} onChange={e => setOrgData(d => ({ ...d, name: e.target.value }))} fullWidth />
                                <TextField label={t('admin.settingsPage.email')} value={orgData.email} onChange={e => setOrgData(d => ({ ...d, email: e.target.value }))} fullWidth />
                                <TextField label={t('admin.settingsPage.phone')} value={orgData.phone} onChange={e => setOrgData(d => ({ ...d, phone: e.target.value }))} fullWidth />
                                <TextField label={t('admin.settingsPage.address')} value={orgData.address} onChange={e => setOrgData(d => ({ ...d, address: e.target.value }))} fullWidth />
                                <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={handleSaveOrg}>{t('admin.settingsPage.saveChanges')}</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">{t('admin.settingsPage.systemSettings')}</Typography>
                            </Box>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField select label={t('admin.settingsPage.language')} value={sysData.language} onChange={e => setSysData(d => ({ ...d, language: e.target.value }))} fullWidth>
                                    <MenuItem value="ar">العربية</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                </TextField>
                                <TextField select label={t('admin.settingsPage.timezone')} value={sysData.timezone} onChange={e => setSysData(d => ({ ...d, timezone: e.target.value }))} fullWidth>
                                    <MenuItem value="africa-cairo">القاهرة (GMT+2)</MenuItem>
                                    <MenuItem value="asia-riyadh">الرياض (GMT+3)</MenuItem>
                                </TextField>
                                <TextField select label={t('admin.settingsPage.currency')} value={sysData.currency} onChange={e => setSysData(d => ({ ...d, currency: e.target.value }))} fullWidth>
                                    <MenuItem value="egp">جنيه مصري (EGP)</MenuItem>
                                    <MenuItem value="usd">دولار أمريكي (USD)</MenuItem>
                                </TextField>
                                <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={handleSaveSys}>{t('admin.settingsPage.saveChanges')}</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<i className="fa-solid fa-plus" />} onClick={handleAddUser}>
                            {t('admin.settingsPage.addUser')}
                        </Button>
                    </Box>
                    <AdminDataTable columns={userColumns} data={users} actions={userActions} />
                </Box>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold">{t('admin.settingsPage.notificationSettings')}</Typography>
                    </Box>
                    <List disablePadding>
                        {settingsNotifications.map((n, i) => (
                            <ListItem key={i} divider={i !== settingsNotifications.length - 1}>
                                <ListItemText
                                    primary={n.label}
                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                    secondary={n.desc}
                                />
                                <ListItemSecondaryAction>
                                    <Switch defaultChecked={n.enabled} color="primary" onChange={() => handleToggleNotification(i)} />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Card>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
                <Grid container spacing={2}>
                    {integrations.map((intg, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card elevation={0} sx={{ border: 1, borderColor: intg.status === 'active' ? 'success.main' : 'divider', textAlign: 'center', p: 2 }}>
                                <AdminIconBox icon={intg.icon} color={intg.color} size={50} fontSize={24} />
                                <Typography variant="body1" fontWeight="bold" sx={{ mt: 1.5 }}>{intg.name}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">{intg.desc}</Typography>
                                <Chip
                                    label={getStatusLabel(intg.status)}
                                    color={getStatusColor(intg.status)}
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                                <Box sx={{ mt: 1 }}>
                                    <Button
                                        size="small"
                                        variant={intg.status === 'connected' ? 'outlined' : 'contained'}
                                        color={intg.status === 'connected' ? 'error' : 'primary'}
                                        onClick={() => handleToggleIntegration(i)}
                                    >
                                        {intg.status === 'connected' ? 'قطع الاتصال' : t('admin.settingsPage.connect')}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit User Dialog */}
            <AdminFormDialog
                open={isUserModalOpen}
                onClose={() => { setIsUserModalOpen(false); setUserForm(emptyUserForm); }}
                onSubmit={handleSubmitUser}
                title={editUser ? `تعديل: ${editUser.name}` : t('admin.settingsPage.addUser')}
                submitLabel={editUser ? t('admin.programsPage.saveChanges') : t('admin.settingsPage.addUser')}
            >
                <TextField label={t('admin.settingsPage.name')} fullWidth required value={userForm.name} onChange={updateUserField('name')} />
                <TextField label={t('admin.settingsPage.email')} fullWidth required value={userForm.email} onChange={updateUserField('email')} type="email" />
                <TextField select label={t('admin.settingsPage.role')} fullWidth value={userForm.role} onChange={updateUserField('role')}>
                    <MenuItem value="مدير">مدير</MenuItem>
                    <MenuItem value="محرر">محرر</MenuItem>
                    <MenuItem value="مشرف">مشرف</MenuItem>
                    <MenuItem value="مراجع">مراجع</MenuItem>
                </TextField>
            </AdminFormDialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminSettings;

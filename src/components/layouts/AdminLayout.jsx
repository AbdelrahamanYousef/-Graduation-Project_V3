import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    InputBase,
    Divider,
    useTheme,
    useMediaQuery,
    Tooltip,
    Stack,
    alpha
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

const DRAWER_WIDTH = 280;

/**
 * AdminLayout - Dashboard layout for admin/staff pages
 */
function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser, logout, updateAdminPhoto } = useAuth();
    const { isDark, toggleTheme, language, toggleLanguage } = useAppTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, initNotifications } = useNotifications();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isEn = getLanguage() === 'en';

    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const photoInputRef = useRef(null);

    // Initialize admin notifications
    useEffect(() => {
        initNotifications('admin');
    }, [initNotifications]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNotifClick = (event) => setNotifAnchorEl(event.currentTarget);
    const handleNotifClose = () => setNotifAnchorEl(null);

    const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
    const handleProfileClose = () => setProfileAnchorEl(null);

    const handleLogout = () => {
        handleProfileClose();
        logout();
        navigate('/');
    };

    const handlePhotoUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateAdminPhoto(ev.target.result);
        };
        reader.readAsDataURL(file);
    }, [updateAdminPhoto]);

    const getTimeAgo = useCallback((isoTime) => {
        const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000);
        if (diff < 1) return t('notifications.justNow');
        if (diff < 60) return `${diff} ${t('notifications.minutesAgo')}`;
        return `${Math.floor(diff / 60)} ${t('notifications.hoursAgo')}`;
    }, []);

    const navItems = [
        { path: '/admin', label: t('admin.dashboard'), icon: 'fa-solid fa-chart-pie', exact: true },
        { path: '/admin/programs', label: t('admin.programs'), icon: 'fa-solid fa-folder-open' },
        { path: '/admin/projects', label: t('admin.projects'), icon: 'fa-solid fa-clipboard-list' },
        { path: '/admin/donations', label: t('admin.donations'), icon: 'fa-solid fa-coins' },
        { path: '/admin/beneficiaries', label: t('admin.beneficiaries'), icon: 'fa-solid fa-users' },
        { path: '/admin/finance', label: t('admin.finance'), icon: 'fa-solid fa-credit-card' },
        { path: '/admin/reports', label: t('admin.reports'), icon: 'fa-solid fa-chart-line' },
        { path: '/admin/settings', label: t('admin.settings'), icon: 'fa-solid fa-gear' },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'secondary.main', color: 'white' }}>
            {/* Sidebar Header */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Box component={Link} to="/admin" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                    <i className="fa-solid fa-moon" style={{ fontSize: '1.5rem' }}></i>
                    <Typography variant="h6" fontWeight="bold">{isEn ? 'Nour' : 'نور'}</Typography>
                    <Box sx={{ bgcolor: 'secondary.light', px: 1, py: 0.25, borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: 'secondary.contrastText' }}>{isEn ? 'Admin' : 'إدارة'}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={isActive(item)}
                            onClick={isMobile ? handleDrawerToggle : undefined}
                            sx={{
                                borderRadius: 1,
                                color: 'rgba(255,255,255,0.7)',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                    '& .MuiListItemIcon-root': { color: 'white' }
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': { color: 'white' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'inherit', fontSize: '1.1rem' }}>
                                <i className={item.icon}></i>
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive(item) ? 'bold' : 'medium' }}
                            />
                            {isActive(item) && (
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'secondary.contrastText', ml: 'auto' }} />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Sidebar Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <ButtonBaseLink to="/" label={isEn ? 'Back to Site' : 'العودة للموقع'} icon="fa-solid fa-house" />
                <ButtonBaseAction onClick={handleLogout} label={isEn ? 'Logout' : 'تسجيل الخروج'} icon="fa-solid fa-right-from-bracket" color="error.light" />
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    [language === 'ar' ? 'mr' : 'ml']: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    backdropFilter: 'blur(20px)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </IconButton>

                    {/* Search Bar */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 400
                    }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: theme.palette.text.secondary }}></i>
                        <InputBase
                            placeholder={isEn ? 'Search...' : 'بحث...'}
                            sx={{ ml: 1, flex: 1 }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={toggleLanguage} size="small" sx={{ border: 1, borderColor: 'divider', width: 36, height: 36 }}>
                            <Typography variant="caption" fontWeight="bold">{language === 'ar' ? 'EN' : 'ع'}</Typography>
                        </IconButton>

                        <IconButton onClick={toggleTheme} size="small" sx={{ border: 1, borderColor: 'divider', width: 36, height: 36 }}>
                            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                        </IconButton>

                        <IconButton onClick={handleNotifClick} sx={{ width: 40, height: 40 }}>
                            <Badge badgeContent={unreadCount} color="error">
                                <i className="fa-solid fa-bell"></i>
                            </Badge>
                        </IconButton>

                        {/* User Profile */}
                        <Box sx={{ ml: 1 }}>
                            <ListItemButton
                                onClick={handleProfileClick}
                                sx={{
                                    borderRadius: 2,
                                    p: 0.5,
                                    gap: 1.5,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Avatar
                                    src={adminUser?.photo}
                                    alt={adminUser?.name}
                                    sx={{ width: 36, height: 36, bgcolor: 'primary.soft' }}
                                >
                                    {adminUser?.name?.charAt(0) || 'A'}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'start' }}>
                                    <Typography variant="subtitle2" lineHeight={1.2}>
                                        {isEn ? (adminUser?.nameEn || adminUser?.name || 'Admin') : (adminUser?.name || 'المسؤول')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {isEn ? (adminUser?.roleEn || adminUser?.role || 'Manager') : (adminUser?.role || 'مدير')}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    anchor={language === 'ar' ? 'right' : 'left'}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    anchor={language === 'ar' ? 'right' : 'left'}
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    mt: 8, // Height of AppBar
                    [language === 'ar' ? 'mr' : 'ml']: { md: `${DRAWER_WIDTH}px` }
                }}
            >
                <Outlet />
            </Box>

            {/* Notification Menu */}
            <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifClose}
                PaperProps={{ sx: { width: 360, maxHeight: 480, mt: 1.5 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight="bold">{t('notifications.title')}</Typography>
                    {unreadCount > 0 && (
                        <Typography
                            variant="caption"
                            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}
                            onClick={markAllAsRead}
                        >
                            {t('notifications.markAllRead')}
                        </Typography>
                    )}
                </Box>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        <i className="fa-solid fa-bell-slash" style={{ fontSize: '2rem', marginBottom: 16, opacity: 0.5 }}></i>
                        <Typography variant="body2">{t('notifications.empty')}</Typography>
                    </Box>
                ) : (
                    notifications.map(n => (
                        <MenuItem
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            sx={{
                                py: 1.5,
                                px: 2,
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: !n.read ? 'action.hover' : 'transparent',
                                whiteSpace: 'normal',
                                alignItems: 'flex-start',
                                gap: 2
                            }}
                        >
                            <Box sx={{ color: 'primary.main', mt: 0.5 }}><i className={n.icon}></i></Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={!n.read ? 'bold' : 'normal'}>
                                    {isEn ? n.titleEn : n.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ my: 0.5 }}>
                                    {isEn ? n.messageEn : n.message}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {getTimeAgo(n.time)}
                                </Typography>
                            </Box>
                            {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />}
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                PaperProps={{ sx: { width: 280, mt: 1.5 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                    <Avatar
                        src={adminUser?.photo}
                        sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                    >
                        {adminUser?.name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {isEn ? (adminUser?.nameEn || adminUser?.name) : adminUser?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEn ? (adminUser?.roleEn || adminUser?.role) : adminUser?.role}
                        </Typography>
                    </Box>
                </Box>

                <MenuItem onClick={() => { photoInputRef.current?.click(); handleProfileClose(); }}>
                    <ListItemIcon><i className="fa-solid fa-camera"></i></ListItemIcon>
                    <ListItemText primary={t('account.changePhoto')} />
                </MenuItem>

                <MenuItem component={Link} to="/admin/settings" onClick={handleProfileClose}>
                    <ListItemIcon><i className="fa-solid fa-gear"></i></ListItemIcon>
                    <ListItemText primary={isEn ? 'Settings' : 'الإعدادات'} />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><i className="fa-solid fa-right-from-bracket"></i></ListItemIcon>
                    <ListItemText primary={isEn ? 'Logout' : 'تسجيل الخروج'} />
                </MenuItem>
            </Menu>

            {/* Hidden Photo Input */}
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
            />
        </Box>
    );
}

// Helper Components for Sidebar Footer
function ButtonBaseLink({ to, label, icon }) {
    return (
        <ListItemButton
            component={Link}
            to={to}
            sx={{
                borderRadius: 1,
                mb: 0.5,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }
            }}
        >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><i className={icon}></i></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
    );
}

function ButtonBaseAction({ onClick, label, icon, color }) {
    return (
        <ListItemButton
            onClick={onClick}
            sx={{
                borderRadius: 1,
                color: color || 'rgba(255,255,255,0.7)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: color || 'white' }
            }}
        >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><i className={icon}></i></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
    );
}

export default AdminLayout;

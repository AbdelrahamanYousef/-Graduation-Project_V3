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
    alpha,
    Button,
    Collapse
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 120;
const APPBAR_HEIGHT = 64;

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser, logout, updateAdminPhoto } = useAuth();
    const { isDark, toggleTheme } = useAppTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, initNotifications } = useNotifications();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const photoInputRef = useRef(null);

    // Initialize admin notifications
    useEffect(() => {
        initNotifications('admin');
    }, [initNotifications]);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        if (isMobile) {
            setSidebarExpanded(false);
        }
    }, [isMobile]);

    const handleSidebarToggle = () => setSidebarExpanded(!sidebarExpanded);
    const handleDrawerToggle = () => setMobileDrawerOpen(!mobileDrawerOpen);

    const handleNotifClick = (event) => setNotifAnchorEl(event.currentTarget);
    const handleNotifClose = () => setNotifAnchorEl(null);

    const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
    const handleProfileClose = () => setProfileAnchorEl(null);

    const handleLogout = () => {
        handleProfileClose();
        logout();
        navigate('/');
    };

    const handlePhotoUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await updateAdminPhoto(file);
    }, [updateAdminPhoto]);

    const getTimeAgo = useCallback((isoTime) => {
        const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000);
        if (diff < 1) return t('notifications.justNow');
        if (diff < 60) return `${diff} ${t('notifications.minutesAgo')}`;
        return `${Math.floor(diff / 60)} ${t('notifications.hoursAgo')}`;
    }, []);

    const topNavItems = [
        { path: '/admin', label: t('admin.dashboard'), icon: 'fa-solid fa-chart-pie', exact: true },
        { path: '/admin/reports', label: t('admin.reports'), icon: 'fa-solid fa-chart-line' },
        { path: '/admin/settings', label: t('admin.settings'), icon: 'fa-solid fa-gear' }
    ];

    const sidebarItems = [
        { path: '/admin/programs', label: t('admin.programs'), icon: 'fa-solid fa-folder-open' },
        { path: '/admin/projects', label: t('admin.projects'), icon: 'fa-solid fa-clipboard-list' },
        { path: '/admin/donations', label: t('admin.donations'), icon: 'fa-solid fa-coins' },
        { path: '/admin/beneficiaries', label: t('admin.beneficiaries'), icon: 'fa-solid fa-users' },
        { path: '/admin/finance', label: t('admin.finance'), icon: 'fa-solid fa-credit-card' },
        { path: '/admin/cms', label: 'إدارة المحتوى', icon: 'fa-solid fa-pen-nib' }
    ];

    const navItems = [
        { path: '/admin', label: t('admin.dashboard'), icon: 'fa-solid fa-chart-pie', exact: true },
        { path: '/admin/programs', label: t('admin.programs'), icon: 'fa-solid fa-folder-open' },
        { path: '/admin/projects', label: t('admin.projects'), icon: 'fa-solid fa-clipboard-list' },
        { path: '/admin/donations', label: t('admin.donations'), icon: 'fa-solid fa-coins' },
        { path: '/admin/beneficiaries', label: t('admin.beneficiaries'), icon: 'fa-solid fa-users' },
        { path: '/admin/finance', label: t('admin.finance'), icon: 'fa-solid fa-credit-card' },
        { path: '/admin/reports', label: t('admin.reports'), icon: 'fa-solid fa-chart-line' },
        { path: '/admin/cms', label: 'إدارة المحتوى', icon: 'fa-solid fa-pen-nib' },
        { path: '/admin/settings', label: t('admin.settings'), icon: 'fa-solid fa-gear' },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'width 0.3s ease'
        }}>
            {/* Sidebar Header with Logo */}
            <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: APPBAR_HEIGHT
            }}>
                <Box component={Link} to="/admin" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    width: '100%'
                }}>
                    <i className="fa-solid fa-moon" style={{ fontSize: '1.3rem', color: theme.palette.secondary.main }}></i>
                    {sidebarExpanded && (
                        <>
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>نور</Typography>
                            <Box sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                ml: 'auto'
                            }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ color: 'secondary.main', fontSize: '0.7rem' }}>إدارة</Typography>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1, py: 2 }}>
                {sidebarItems.map((item) => (
                    <Tooltip
                        key={item.path}
                        title={!sidebarExpanded ? item.label : ''}
                        placement="right"
                        arrow
                    >
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive(item)}
                                onClick={isMobile ? handleDrawerToggle : undefined}
                                sx={{
                                    borderRadius: 1,
                                    color: isActive(item) ? 'secondary.main' : 'text.primary',
                                    '&.Mui-selected': {
                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                        color: 'secondary.main',
                                        '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.12) }
                                    },
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.secondary.main, 0.05)
                                    },
                                    transition: 'all 0.2s ease',
                                    justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                                    px: 1.5,
                                    py: 1.25
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 0,
                                    mr: sidebarExpanded ? 1.5 : 0,
                                    color: 'inherit',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <i className={item.icon}></i>
                                </ListItemIcon>
                                {sidebarExpanded && (
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: isActive(item) ? '600' : '500'
                                        }}
                                    />
                                )}
                                {sidebarExpanded && isActive(item) && (
                                    <Box sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: 'secondary.main',
                                        ml: 'auto'
                                    }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>

            {/* Sidebar Footer */}
            <Box sx={{
                p: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider'
            }}>
                <Tooltip title={!sidebarExpanded ? 'العودة للموقع' : ''} placement="right" arrow>
                    <ListItemButton
                        component={Link}
                        to="/"
                        sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover' },
                            justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                            px: 1.5,
                            py: 1.25
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 0,
                            mr: sidebarExpanded ? 1.5 : 0,
                            color: 'inherit',
                            fontSize: '1rem',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <i className="fa-solid fa-house"></i>
                        </ListItemIcon>
                        {sidebarExpanded && (
                            <ListItemText
                                primary="العودة للموقع"
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500' }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title={!sidebarExpanded ? 'تسجيل الخروج' : ''} placement="right" arrow>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 1,
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                            justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                            px: 1.5,
                            py: 1.25
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 0,
                            mr: sidebarExpanded ? 1.5 : 0,
                            color: 'inherit',
                            fontSize: '1rem',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </ListItemIcon>
                        {sidebarExpanded && (
                            <ListItemText
                                primary="تسجيل الخروج"
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: '500' }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: 'background.default'
        }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    zIndex: 1100,
                    borderRadius: 0
                }}
            >
                <Toolbar sx={{ height: APPBAR_HEIGHT, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Sidebar Toggle Button */}
                    <IconButton
                        onClick={handleSidebarToggle}
                        sx={{
                            color: 'text.primary',
                            display: { xs: 'none', md: 'flex' },
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <i className={sidebarExpanded ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
                    </IconButton>

                    {/* Mobile Menu Button */}
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            color: 'text.primary',
                            display: { xs: 'flex', md: 'none' }
                        }}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </IconButton>

                    {/* Top Navigation Items */}
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            ml: 1,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            pr: 2
                        }}
                    >
                        {topNavItems.map((item) => (
                            <Tooltip key={item.path} title={item.label}>
                                <IconButton
                                    component={Link}
                                    to={item.path}
                                    sx={{
                                        color: isActive(item) ? 'secondary.main' : 'text.primary',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={item.label}
                                >
                                    <i className={item.icon}></i>
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Stack>

                    {/* Search Bar */}
                    <Box sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        px: 2,
                        py: 0.75,
                        width: '100%',
                        maxWidth: 350,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'action.selected' }
                    }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: theme.palette.text.secondary, marginRight: 8 }}></i>
                        <InputBase
                            placeholder="بحث..."
                            sx={{ flex: 1, fontSize: '0.875rem' }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Right Actions */}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        {/* Theme Toggle */}
                        <Tooltip title={isDark ? 'وضع فاتح' : 'وضع مظلم'}>
                            <IconButton
                                onClick={toggleTheme}
                                size="small"
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    width: 36,
                                    height: 36
                                }}
                            >
                                <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                            </IconButton>
                        </Tooltip>

                        {/* Notifications */}
                        <Tooltip title="إشعارات">
                            <IconButton
                                onClick={handleNotifClick}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Badge badgeContent={unreadCount} color="error">
                                    <i className="fa-solid fa-bell"></i>
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* User Profile */}
                        <ListItemButton
                            onClick={handleProfileClick}
                            sx={{
                                p: 0.5,
                                gap: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'action.hover' },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Avatar
                                src={adminUser?.photo}
                                alt={adminUser?.name}
                                sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}
                            >
                                {adminUser?.name?.charAt(0) || 'A'}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'start' }}>
                                <Typography variant="caption" fontWeight="600" lineHeight={1.2}>
                                    {adminUser?.name || 'المسؤول'}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Desktop Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'flex' },
                    transition: 'width 0.3s ease',
                    mt: `${APPBAR_HEIGHT}px`
                }}
            >
                <Drawer
                    variant="permanent"
                    anchor="left"
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
                            transition: 'width 0.3s ease',
                            mt: `${APPBAR_HEIGHT}px`,
                            position: 'relative'
                        }
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileDrawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                anchor="left"
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: SIDEBAR_EXPANDED,
                        mt: `${APPBAR_HEIGHT}px`
                    }
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    minHeight: '100vh',
                    mt: `${APPBAR_HEIGHT}px`,
                    width: {
                        xs: '100%',
                        md: `calc(100% - ${sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED}px)`
                    },
                    transition: 'width 0.3s ease'
                }}
            >
                <Outlet />
            </Box>

            {/* Notification Menu */}
            <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="subtitle2" fontWeight="bold">{t('notifications.title')}</Typography>
                    {unreadCount > 0 && (
                        <Typography
                            variant="caption"
                            sx={{
                                cursor: 'pointer',
                                color: 'secondary.main',
                                fontWeight: '600',
                                '&:hover': { textDecoration: 'underline' }
                            }}
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
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                bgcolor: !n.read ? alpha(theme.palette.secondary.main, 0.05) : 'transparent',
                                whiteSpace: 'normal',
                                alignItems: 'flex-start',
                                gap: 2,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <Box sx={{ color: 'secondary.main', mt: 0.5 }}><i className={n.icon}></i></Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={!n.read ? '600' : 'normal'}>
                                    {n.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ my: 0.5 }}>
                                    {n.message}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {getTimeAgo(n.time)}
                                </Typography>
                            </Box>
                            {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main', mt: 1 }} />}
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                PaperProps={{
                    sx: {
                        width: 280,
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 1
                }}>
                    <Avatar
                        src={adminUser?.photo}
                        sx={{ width: 48, height: 48, bgcolor: 'secondary.main' }}
                    >
                        {adminUser?.name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {adminUser?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {adminUser?.role}
                        </Typography>
                    </Box>
                </Box>

                <MenuItem onClick={() => { photoInputRef.current?.click(); handleProfileClose(); }}>
                    <ListItemIcon><i className="fa-solid fa-camera"></i></ListItemIcon>
                    <ListItemText primary={t('account.changePhoto')} />
                </MenuItem>

                <MenuItem component={Link} to="/admin/settings" onClick={handleProfileClose}>
                    <ListItemIcon><i className="fa-solid fa-gear"></i></ListItemIcon>
                    <ListItemText primary="الإعدادات" />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><i className="fa-solid fa-right-from-bracket"></i></ListItemIcon>
                    <ListItemText primary="تسجيل الخروج" />
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

export default AdminLayout;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem as MuiMenuItem,
    Divider,
    ListItemIcon,
    ListItemText,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    useScrollTrigger,
    Slide,
    Badge,
    Grid,
    Stack,
    useTheme,
    alpha,
    Popover
} from '@mui/material';
import { t, getLanguage } from '../../i18n';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

// --- Components for Navbar ---

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

function ElevationScroll({ children }) {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });

    return cloneElement(children, {
        elevation: trigger ? 4 : 0,
        style: {
            backgroundColor: trigger ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: trigger ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent'
        }
    });
}

/**
 * DonorLayout - Main layout wrapper for public donor pages
 */
function DonorLayout({ children, scrolled }) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme, language, toggleLanguage } = useAppTheme();
    const { isDonorLoggedIn, donorUser, donorLogout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, initNotifications } = useNotifications();
    const isEn = getLanguage() === 'en';

    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);

    // Initialize notifications
    useEffect(() => {
        if (isDonorLoggedIn) initNotifications('donor');
    }, [isDonorLoggedIn, initNotifications]);

    // Handlers
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    const handleOpenNotifMenu = (event) => setNotifAnchorEl(event.currentTarget);
    const handleCloseNotifMenu = () => setNotifAnchorEl(null);

    const handleLogout = useCallback(() => {
        donorLogout();
        handleCloseUserMenu();
        navigate('/');
    }, [donorLogout, navigate]);

    // Navigation Links
    const navLinks = useMemo(() => [
        { path: '/', label: t('nav.home'), icon: 'fa-solid fa-house' },
        { path: '/campaigns', label: t('nav.campaigns'), icon: 'fa-solid fa-bullhorn' },
        { path: '/zakat', label: t('nav.zakatCalc'), icon: 'fa-solid fa-calculator' },
        { path: '/volunteer', label: t('nav.volunteer'), icon: 'fa-solid fa-handshake' },
        { path: '/about', label: t('nav.about'), icon: 'fa-solid fa-building-columns' },
        { path: '/contact', label: t('nav.contact'), icon: 'fa-solid fa-phone' },
    ], []);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Helper: Get Initials
    const getInitials = useCallback(() => {
        if (!donorUser) return '';
        const name = isEn ? (donorUser.nameEn || donorUser.name) : donorUser.name;
        return name?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?';
    }, [donorUser, isEn]);

    const getUserName = useCallback(() => {
        if (!donorUser) return '';
        return isEn ? (donorUser.nameEn || donorUser.name) : donorUser.name;
    }, [donorUser, isEn]);

    const getTimeAgo = useCallback((isoTime) => {
        const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000);
        if (diff < 1) return t('notifications.justNow');
        if (diff < 60) return `${diff} ${t('notifications.minutesAgo')}`;
        return `${Math.floor(diff / 60)} ${t('notifications.hoursAgo')}`;
    }, []);

    // Drawer Content (Mobile)
    const drawer = (
        <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <i className="fa-solid fa-moon" style={{ fontSize: '1.5rem', color: theme.palette.primary.main }}></i>
                <Typography variant="h6" color="primary" fontWeight="bold">نور</Typography>
            </Box>
            <List sx={{ flex: 1, px: 2 }}>
                {navLinks.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={isActive(item.path)}
                            onClick={handleDrawerToggle}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                                <i className={item.icon}></i>
                            </ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 'bold' : 'medium' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {!isDonorLoggedIn && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle} sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><i className="fa-solid fa-right-to-bracket"></i></ListItemIcon>
                            <ListItemText primary={t('nav.login')} />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" size="small" onClick={toggleLanguage} startIcon={<i className="fa-solid fa-globe"></i>}>
                            {language === 'ar' ? 'English' : 'العربية'}
                        </Button>
                        <Button fullWidth variant="outlined" size="small" onClick={toggleTheme} startIcon={<i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>}>
                            {isDark ? 'Light' : 'Dark'}
                        </Button>
                    </Stack>
                    <Button component={Link} to="/donate" variant="contained" fullWidth onClick={handleDrawerToggle}>
                        {t('common.donate')}
                    </Button>
                    {isDonorLoggedIn && (
                        <Button color="error" fullWidth onClick={handleLogout} startIcon={<i className="fa-solid fa-right-from-bracket"></i>}>
                            {t('nav.logout')}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" color="inherit" sx={{ bgcolor: theme.palette.navbar.glass, backdropFilter: `blur(${theme.palette.navbar.blur})`, color: theme.palette.navbar.text }} elevation={scrolled ? 4 : 0}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                        {/* Mobile Menu Icon */}
                        <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                            <IconButton onClick={handleDrawerToggle} color="inherit">
                                <i className="fa-solid fa-bars"></i>
                            </IconButton>
                        </Box>

                        {/* Logo */}
                        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 } }}>
                            <i className="fa-solid fa-moon" style={{ fontSize: '1.75rem', color: theme.palette.common.white }}></i>
                            <Typography variant="h5" color="inherit" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>نور</Typography>
                        </Box>

                        {/* Desktop Nav */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.path}
                                    component={Link}
                                    to={link.path}
                                    sx={{
                                        color: isActive(link.path) ? 'common.white' : alpha(theme.palette.common.white, 0.7),
                                        fontWeight: isActive(link.path) ? 'bold' : 'medium',
                                        bgcolor: isActive(link.path) ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1), color: 'common.white' }
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Language & Theme - Desktop Only */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                                <Tooltip title={language === 'ar' ? 'Switch to English' : 'التبديل العربية'}>
                                    <IconButton onClick={toggleLanguage} size="small" sx={{ border: 1, borderColor: alpha(theme.palette.common.white, 0.3), color: 'inherit' }}>
                                        <Typography variant="caption" fontWeight="bold">{language === 'ar' ? 'EN' : 'ع'}</Typography>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
                                    <IconButton onClick={toggleTheme} size="small" sx={{ border: 1, borderColor: alpha(theme.palette.common.white, 0.3), color: 'inherit' }}>
                                        <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {isDonorLoggedIn ? (
                                <>
                                    {/* Notifications */}
                                    <Tooltip title={t('notifications.title')}>
                                        <IconButton onClick={handleOpenNotifMenu} color="inherit">
                                            <Badge badgeContent={unreadCount} color="error">
                                                <i className="fa-solid fa-bell"></i>
                                            </Badge>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={notifAnchorEl}
                                        open={Boolean(notifAnchorEl)}
                                        onClose={handleCloseNotifMenu}
                                        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{t('notifications.title')}</Typography>
                                            {unreadCount > 0 && (
                                                <Button size="small" onClick={markAllAsRead}>{t('notifications.markAllRead')}</Button>
                                            )}
                                        </Box>
                                        <Divider />
                                        {notifications.length === 0 ? (
                                            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                                <i className="fa-solid fa-bell-slash" style={{ fontSize: '2rem', marginBottom: 8 }}></i>
                                                <Typography variant="body2">{t('notifications.empty')}</Typography>
                                            </Box>
                                        ) : (
                                            notifications.map((n) => (
                                                <MenuItem key={n.id} onClick={() => markAsRead(n.id)} sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', whiteSpace: 'normal' }}>
                                                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                        <Box sx={{ mt: 0.5, color: 'primary.main' }}><i className={n.icon}></i></Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight={n.read ? 'normal' : 'bold'}>
                                                                {isEn ? n.titleEn : n.title}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                {isEn ? n.messageEn : n.message}
                                                            </Typography>
                                                            <Typography variant="caption" color="primary">
                                                                {getTimeAgo(n.time)}
                                                            </Typography>
                                                        </Box>
                                                        {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />}
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        )}
                                    </Menu>

                                    {/* User Menu */}
                                    <Tooltip title={isEn ? "Open settings" : "فتح الإعدادات"}>
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, border: `2px solid ${theme.palette.primary.main}` }}>
                                            <Avatar src={donorUser?.photo} alt={getUserName()} sx={{ width: 32, height: 32 }}>
                                                {!donorUser?.photo && getInitials()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorElUser}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                        PaperProps={{ sx: { width: 240, mt: 1.5 } }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <Box sx={{ px: 2, py: 1.5 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>{getUserName()}</Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>{donorUser?.email || donorUser?.phone}</Typography>
                                        </Box>
                                        <Divider />
                                        <MenuItem component={Link} to="/account?tab=overview" onClick={handleCloseUserMenu}>
                                            <ListItemIcon><i className="fa-solid fa-user"></i></ListItemIcon>
                                            <ListItemText primary={t('nav.myProfile')} />
                                        </MenuItem>
                                        <MenuItem component={Link} to="/account?tab=donations" onClick={handleCloseUserMenu}>
                                            <ListItemIcon><i className="fa-solid fa-heart"></i></ListItemIcon>
                                            <ListItemText primary={t('nav.myDonations')} />
                                        </MenuItem>
                                        <MenuItem component={Link} to="/account?tab=profile" onClick={handleCloseUserMenu}>
                                            <ListItemIcon><i className="fa-solid fa-gear"></i></ListItemIcon>
                                            <ListItemText primary={t('nav.settings')} />
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                            <ListItemIcon sx={{ color: 'error.main' }}><i className="fa-solid fa-right-from-bracket"></i></ListItemIcon>
                                            <ListItemText primary={t('nav.logout')} />
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button component={Link} to="/login" variant="text" color="inherit" sx={{ display: { xs: 'none', md: 'flex' } }}>
                                    {t('nav.login')}
                                </Button>
                            )}

                            <Button component={Link} to="/donate" variant="contained" size="small" sx={{ ml: 1, display: { xs: 'none', md: 'flex' }, borderRadius: 5 }}>
                                {t('common.donate')}
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor={language === 'ar' ? 'right' : 'left'}
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
            >
                {drawer}
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, pb: { xs: 7, md: 0 }, pt: location.pathname === '/' ? 0 : { xs: 8, md: 9 } }}>
                {children}
            </Box>

            {/* Mobile Bottom Nav */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: { xs: 'flex', md: 'none' }, justifyContent: 'space-around', py: 1, zIndex: 1000, pb: 'env(safe-area-inset-bottom)' }}>
                {[
                    { path: '/', icon: 'fa-solid fa-house', label: t('nav.home') },
                    { path: '/campaigns', icon: 'fa-solid fa-bullhorn', label: t('nav.campaigns') },
                    { path: '/donate', icon: 'fa-solid fa-heart', label: t('nav.donate'), isFab: true },
                    { path: '/zakat', icon: 'fa-solid fa-calculator', label: t('nav.zakatCalc') },
                    { path: '/account', icon: 'fa-solid fa-user', label: t('nav.account') },
                ].map(item => (
                    <Box key={item.path} component={Link} to={item.path} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive(item.path) ? 'primary.main' : 'text.secondary', width: '20%' }}>
                        {item.isFab ? (
                            <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: -4, boxShadow: 3 }}>
                                <i className={item.icon}></i>
                            </Box>
                        ) : (
                            <i className={item.icon} style={{ fontSize: '1.2rem', marginBottom: 4 }}></i>
                        )}
                        <Typography variant="caption" color={isActive(item.path) ? 'primary' : 'text.secondary'}>{item.label}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ bgcolor: (t) => t.palette.footer.bg, color: (t) => t.palette.footer.text, py: 8 }}>
                <Container>
                    <Grid container spacing={4}>
                        {/* About */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className="fa-solid fa-moon" style={{ color: theme.palette.primary.main, fontSize: '1.5rem' }}></i>
                                <Typography variant="h6" sx={{ color: (t) => t.palette.footer.heading }} fontWeight="bold">نور</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: (t) => t.palette.footer.textMuted, mb: 2 }}>
                                {t('footer.aboutText')}
                            </Typography>
                        </Grid>

                        {/* Quick Links */}
                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" sx={{ color: (t) => t.palette.footer.heading }} fontWeight="bold" gutterBottom textTransform="uppercase">
                                {t('footer.quickLinks')}
                            </Typography>
                            <Stack spacing={1}>
                                <Link to="/campaigns" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>{t('nav.campaigns')}</Typography></Link>
                                <Link to="/volunteer" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>{t('nav.volunteer')}</Typography></Link>
                                <Link to="/zakat" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>{t('nav.zakatCalc')}</Typography></Link>
                                <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>{t('nav.about')}</Typography></Link>
                            </Stack>
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" sx={{ color: (t) => t.palette.footer.heading }} fontWeight="bold" gutterBottom textTransform="uppercase">
                                {t('footer.contact')}
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-envelope" style={{ fontSize: '0.9rem' }}></i>
                                    <Typography variant="body2">info@nour-charity.org</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-phone" style={{ fontSize: '0.9rem' }}></i>
                                    <Typography variant="body2">+20 2 1234 5678</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-location-dot" style={{ fontSize: '0.9rem' }}></i>
                                    <Typography variant="body2">القاهرة، مصر</Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Social */}
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" sx={{ color: (t) => t.palette.footer.heading }} fontWeight="bold" gutterBottom textTransform="uppercase">
                                {t('footer.followUs')}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {['facebook-f', 'x-twitter', 'instagram', 'youtube'].map((icon) => (
                                    <IconButton key={icon} sx={{ bgcolor: (t) => t.palette.footer.iconBg, color: (t) => t.palette.footer.textMuted, width: 40, height: 40, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                        <i className={`fa-brands fa-${icon}`}></i>
                                    </IconButton>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4, borderColor: (t) => t.palette.footer.divider }} />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: (t) => t.palette.footer.textMuted }}>
                            © 2024 نور. {t('footer.rights')}
                        </Typography>
                        <Stack direction="row" spacing={3}>
                            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="caption" sx={{ '&:hover': { color: 'white' } }}>{t('footer.privacy')}</Typography></Link>
                            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}><Typography variant="caption" sx={{ '&:hover': { color: 'white' } }}>{t('footer.terms')}</Typography></Link>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}



// Redefining DonorLayout to correctly use the hooks inside
export default function DonorLayoutExport({ children }) {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 30,
    });

    return <DonorLayout scrolled={trigger}>{children}</DonorLayout>;
}

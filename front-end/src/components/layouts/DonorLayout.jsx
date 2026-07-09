import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../i18n';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatBot from '../donor/ChatBot';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import { paths } from '../../constants/paths';

function useScrollTrigger(options = {}) {
    const { threshold = 0 } = options;
    const [trigger, setTrigger] = useState(false);
    useEffect(() => {
        const handleScroll = () => setTrigger(window.scrollY > threshold);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);
    return trigger;
}

const getNotificationIcon = (type) => {
    switch (type) {
        case 'CONTACT': return 'fa-solid fa-message';
        case 'SPECIAL_REQUEST': return 'fa-solid fa-hand-holding-heart';
        case 'VOLUNTEER': return 'fa-solid fa-handshake';
        case 'DONATION': return 'fa-solid fa-coins';
        default: return 'fa-solid fa-bell';
    }
};

function DonorLayout({ children }) {
    const scrolled = useScrollTrigger({ threshold: 30 });
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useAppTheme();
    const { isDonorLoggedIn, donorUser, donorLogout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, initNotifications } = useNotifications();
    const { state } = useAdminData();
    const orgInfo = state?.settings?.organization || { name: 'نور', email: 'info@nour-charity.org', phone: '+20 2 1234 5678', address: 'القاهرة، مصر' };
    const socialLinks = state?.settings?.social || {};

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [hideAnnouncement, setHideAnnouncement] = useState(false);

    const activeAnnouncement = useMemo(() => {
        const list = state.content?.announcements || [];
        const today = new Date().toISOString().split('T')[0];
        return list.find(a => {
            if (!a.active) return false;
            if (a.startDate && a.startDate > today) return false;
            if (a.endDate && a.endDate < today) return false;
            return true;
        });
    }, [state.content?.announcements]);

    useEffect(() => {
        if (activeAnnouncement) {
            const dismissedId = sessionStorage.getItem('dismissed_announcement_id');
            const dismissedText = sessionStorage.getItem('dismissed_announcement_text');
            if (dismissedId === String(activeAnnouncement.id) || dismissedText === activeAnnouncement.text) {
                setHideAnnouncement(true);
            } else {
                setHideAnnouncement(false);
            }
        } else {
            setHideAnnouncement(false);
        }
    }, [activeAnnouncement]);

    const showAnnouncement = activeAnnouncement && !hideAnnouncement;

    const handleDismissAnnouncement = () => {
        if (activeAnnouncement) {
            sessionStorage.setItem('dismissed_announcement_id', String(activeAnnouncement.id || ''));
            sessionStorage.setItem('dismissed_announcement_text', activeAnnouncement.text || '');
        }
        setHideAnnouncement(true);
        window.dispatchEvent(new Event('announcement_change'));
    };

    useEffect(() => {
        if (isDonorLoggedIn) initNotifications('donor');
    }, [isDonorLoggedIn, initNotifications]);

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

    const navLinks = useMemo(() => [
        { path: '/', label: t('nav.home'), icon: 'fa-solid fa-house' },
        { path: '/programs', label: t('nav.programs'), icon: 'fa-solid fa-folder-open' },
        { path: '/campaigns', label: t('nav.campaigns'), icon: 'fa-solid fa-bullhorn' },
        { path: '/blog', label: t('nav.updates'), icon: 'fa-solid fa-newspaper' },
        { path: '/zakat', label: t('nav.zakatCalc'), icon: 'fa-solid fa-calculator' },
        { path: '/volunteer', label: t('nav.volunteer'), icon: 'fa-solid fa-handshake' },
        { path: '/special-requests', label: 'طلب مساعدة', icon: 'fa-solid fa-hand-holding-heart' },
        { path: '/about', label: t('nav.about'), icon: 'fa-solid fa-building-columns' },
        { path: '/contact', label: t('nav.contact'), icon: 'fa-solid fa-phone' },
    ], []);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getInitials = useCallback(() => {
        if (!donorUser) return '';
        return donorUser.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?';
    }, [donorUser]);

    const getUserName = useCallback(() => donorUser?.name || '', [donorUser]);

    const getTimeAgo = useCallback((isoTime) => {
        if (!isoTime) return '';
        const date = new Date(isoTime);
        if (isNaN(date.getTime())) return '';
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diff < 1) return t('notifications.justNow');
        if (diff < 60) return `${diff} ${t('notifications.minutesAgo')}`;
        return `${Math.floor(diff / 60)} ${t('notifications.hoursAgo')}`;
    }, []);

    const announcementColors = {
        urgent: 'bg-error-500',
        success: 'bg-success-500',
        seasonal: 'bg-warning-500',
    };

    return (
        <div className="flex flex-col min-h-screen" dir="rtl">
            {showAnnouncement && (
                <div className={`fixed top-0 left-0 right-0 h-9 z-[1201] text-white px-4 text-center text-sm font-bold flex items-center justify-center gap-1 ${announcementColors[activeAnnouncement.type] || 'bg-primary-500'}`}>
                    <i className="fa-solid fa-bullhorn"></i>
                    {activeAnnouncement.title && <span className="mr-1 underline ml-1">{activeAnnouncement.title}:</span>}
                    {activeAnnouncement.text}
                    <button onClick={handleDismissAnnouncement} className="absolute left-2 text-white opacity-80 hover:opacity-100">
                        <i className="fa-solid fa-xmark text-base"></i>
                    </button>
                </div>
            )}

            {/* Navbar */}
            <header className={`fixed w-full z-[1100] transition-all duration-300 ${showAnnouncement ? 'top-9' : 'top-0'} ${scrolled ? 'shadow-md' : 'shadow-none'}`}
                style={{ backgroundColor: scrolled ? 'rgba(15, 92, 84, 0.98)' : 'rgba(15, 92, 84, 0.95)', backdropFilter: 'blur(8px)' }}>
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="flex items-center min-h-[64px] md:min-h-[72px]">
                        {/* Mobile Menu */}
                        <div className="flex md:hidden ml-1">
                            <button onClick={handleDrawerToggle} className="text-white p-2">
                                <i className="fa-solid fa-bars text-xl"></i>
                            </button>
                        </div>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-1.5 no-underline text-white flex-grow md:flex-grow-0 ml-auto md:ml-0">
                            <i className="fa-solid fa-moon text-[1.6rem]" style={{ filter: isDark ? 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' : 'none' }}></i>
                            <span className="hidden sm:block text-white font-extrabold text-[1.4rem] tracking-wide">{orgInfo.name || 'نور'}</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="flex-1 hidden md:flex justify-center gap-1">
                            {navLinks.map((link) => (
                                <Link key={link.path} to={link.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${isActive(link.path) ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            {/* Theme Toggle Desktop */}
                            <div className="hidden md:flex gap-1">
                                <button onClick={toggleTheme} title={isDark ? 'الوضع المضيء' : 'الوضع الليلي'}
                                    className="border border-white/30 text-white rounded-md p-1.5 hover:bg-white/10 transition-colors">
                                    <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                                </button>
                            </div>

                            {isDonorLoggedIn ? (
                                <>
                                    {/* Notifications */}
                                    <button onClick={handleOpenNotifMenu} className="relative text-white p-2 hover:bg-white/10 rounded-md transition-colors">
                                        <i className="fa-solid fa-bell text-lg"></i>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-error-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">{unreadCount}</span>
                                        )}
                                    </button>
                                    {notifAnchorEl && (
                                        <div className="fixed inset-0 z-[1200]" onClick={handleCloseNotifMenu}></div>
                                    )}
                                    <div className={`absolute top-full left-0 md:left-auto md:right-0 w-[320px] max-h-[400px] bg-white dark:bg-neutral-800 rounded-xl shadow-modal border border-neutral-200 dark:border-neutral-700 z-[1201] overflow-hidden ${notifAnchorEl ? 'block' : 'hidden'}`}
                                        style={{ position: 'fixed', top: showAnnouncement ? 108 : 72, left: 'auto', right: 80 }}>
                                        <div className="p-3 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                                            <span className="font-bold text-sm">{t('notifications.title')}</span>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:underline">{t('notifications.markAllRead')}</button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-neutral-500">
                                                <i className="fa-solid fa-bell-slash text-2xl mb-2"></i>
                                                <p className="text-sm">{t('notifications.empty')}</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <button key={n.id} onClick={() => markAsRead(n.id)}
                                                    className={`w-full text-right p-3 flex gap-3 border-b border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}>
                                                    <span className="text-primary-500 mt-0.5"><i className={n.icon || getNotificationIcon(n.type)}></i></span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${!n.isRead ? 'font-bold' : ''}`}>{n.title}</p>
                                                        <p className="text-xs text-neutral-500 mt-0.5">{n.message}</p>
                                                        <p className="text-xs text-primary-500 mt-0.5">{getTimeAgo(n.createdAt)}</p>
                                                    </div>
                                                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0"></span>}
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {/* User Menu */}
                                    <div className="relative">
                                        <button onClick={handleOpenUserMenu} className="p-0.5 rounded-full border-2 border-primary-500 ml-1 flex items-center">
                                            {donorUser?.photo ? (
                                                <img src={donorUser.photo} alt={getUserName()} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">{getInitials()}</div>
                                            )}
                                        </button>
                                        {anchorElUser && (
                                            <div className="fixed inset-0 z-[1200]" onClick={handleCloseUserMenu}></div>
                                        )}
                                        <div 
                                            className={`absolute top-full left-0 mt-2 w-[240px] bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 z-[1201] transition-all duration-200 ease-out origin-top-left ${
                                                anchorElUser 
                                                    ? 'opacity-100 scale-100 pointer-events-auto' 
                                                    : 'opacity-0 scale-95 pointer-events-none'
                                            }`}
                                        >
                                            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                                                <p className="font-bold text-sm truncate dark:text-neutral-200">{getUserName()}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-450 truncate">{donorUser?.email || donorUser?.phone}</p>
                                            </div>
                                            <Link to="/account?tab=overview" onClick={handleCloseUserMenu} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 no-underline text-inherit text-sm dark:text-neutral-200 transition-colors duration-200">
                                                <i className="fa-solid fa-user w-5 text-neutral-500 dark:text-neutral-400"></i>
                                                <span>{t('nav.myProfile')}</span>
                                            </Link>
                                            <Link to="/account?tab=donations" onClick={handleCloseUserMenu} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 no-underline text-inherit text-sm dark:text-neutral-200 transition-colors duration-200">
                                                <i className="fa-solid fa-hand-holding-heart w-5 text-neutral-500 dark:text-neutral-400"></i>
                                                <span>{t('nav.myDonations')}</span>
                                            </Link>
                                            <Link to="/account?tab=profile" onClick={handleCloseUserMenu} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 no-underline text-inherit text-sm dark:text-neutral-200 transition-colors duration-200">
                                                <i className="fa-solid fa-gear w-5 text-neutral-500 dark:text-neutral-400"></i>
                                                <span>{t('nav.settings')}</span>
                                            </Link>
                                            <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                                            <button onClick={handleLogout} className="w-full text-right flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-error-500 text-sm">
                                                <i className="fa-solid fa-right-from-bracket w-5"></i>
                                                <span>{t('nav.logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link to={paths.auth.login} className="hidden md:flex px-3 py-1.5 text-white hover:bg-white/10 rounded-md transition-all duration-280 no-underline text-sm font-medium">
                                    {t('nav.login')}
                                </Link>
                            )}

                            <Link to={paths.donor.donate} className="hidden md:flex mr-1 px-4 py-1.5 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors no-underline text-sm">
                                {t('common.donate')}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[1200] bg-black/50 md:hidden" onClick={handleDrawerToggle}></div>
            )}
            
            {/* التعديل هنا: تم تبديل translate-x-full بـ -translate-x-full ليعمل بشكل صحيح مع اتجاه الـ RTL */}
            <div className={`fixed top-0 bottom-0 left-0 w-[280px] bg-white dark:bg-neutral-800 z-[1201] shadow-xl transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="py-3 px-4 flex items-center justify-center gap-1 border-b border-neutral-200 dark:border-neutral-700">
                        <i className="fa-solid fa-moon text-xl text-primary-500"></i>
                        <span className="text-primary-500 font-bold">{orgInfo.name || 'نور'}</span>
                    </div>
                    <nav className="flex-1 px-2 py-3 overflow-y-auto">
                        {navLinks.map((item) => (
                            <Link key={item.path} to={item.path} onClick={handleDrawerToggle}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 no-underline transition-colors ${isActive(item.path) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'text-inherit hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}>
                                <i className={`${item.icon} w-5 text-center ${isActive(item.path) ? 'text-primary-500' : ''}`}></i>
                                <span className={`text-sm ${isActive(item.path) ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                            </Link>
                        ))}
                        {!isDonorLoggedIn && (
                            <Link to={paths.auth.login} onClick={handleDrawerToggle} className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-inherit hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                <i className="fa-solid fa-right-to-bracket w-5 text-center"></i>
                                <span className="text-sm font-medium">{t('nav.login')}</span>
                            </Link>
                        )}
                    </nav>
                    <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                        <div className="flex gap-2">
                            <button onClick={toggleTheme} className="flex-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                <i className={isDark ? 'fa-solid fa-sun ml-1' : 'fa-solid fa-moon ml-1'}></i>
                                {isDark ? 'Light' : 'Dark'}
                            </button>
                        </div>
                        <Link to={paths.donor.donate} onClick={handleDrawerToggle} className="block w-full px-3 py-2 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors text-center no-underline text-sm">
                            {t('common.donate')}
                        </Link>
                        {isDonorLoggedIn && (
                            <button onClick={handleLogout} className="w-full px-3 py-2 text-error-500 border border-error-200 rounded-md hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors text-sm font-medium">
                                <i className="fa-solid fa-right-from-bracket ml-1"></i>
                                {t('nav.logout')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className={`flex-grow ${location.pathname === '/' ? 'pt-0' : showAnnouncement ? 'pt-[100px] md:pt-[108px]' : 'pt-16 md:pt-[72px]'}`}>
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex md:hidden justify-around py-2 z-[1000]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {[
                    { path: '/', icon: 'fa-solid fa-house', label: t('nav.home') },
                    { path: '/campaigns', icon: 'fa-solid fa-bullhorn', label: t('nav.campaigns') },
                    { path: '/donate', icon: 'fa-solid fa-heart', label: t('nav.donate'), isFab: true },
                    { path: '/zakat', icon: 'fa-solid fa-calculator', label: t('nav.zakatCalc') },
                    { path: '/account', icon: 'fa-solid fa-user', label: t('nav.account') },
                ].map(item => (
                    <Link key={item.path} to={item.path}
                        className={`flex flex-col items-center no-underline w-1/5 ${isActive(item.path) ? 'text-primary-500' : 'text-neutral-500'}`}>
                        {item.isFab ? (
                            <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-lg mb-0.5">
                                <i className={item.icon}></i>
                            </div>
                        ) : (
                            <i className={`${item.icon} text-lg mb-0.5`}></i>
                        )}
                        <span className={`text-[0.7rem] ${isActive(item.path) ? 'text-primary-500 font-medium' : 'text-neutral-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Footer */}
            <footer className="py-8 relative" style={{ backgroundColor: isDark ? '#0C1B1B' : '#1A2E3B', borderTop: '3px solid', borderTopColor: isDark ? 'rgba(38,152,152,0.15)' : 'rgba(11,107,107,0.25)', color: isDark ? '#90A4AE' : '#B0BEC5' }}>
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                        {/* About */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-moon text-primary-500 text-xl"></i>
                                <h6 className="font-bold" style={{ color: isDark ? '#B2DFDB' : '#E0F2F1' }}>{orgInfo.name || 'نور'}</h6>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#607D8B' : '#78909C' }}>
                                {t('footer.aboutText')}
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h6 className="font-bold text-sm tracking-widest mb-2 uppercase" style={{ color: isDark ? '#B2DFDB' : '#E0F2F1' }}>{t('footer.quickLinks')}</h6>
                            <div className="space-y-1.5 mt-2">
                                {[
                                    { to: '/campaigns', label: t('nav.campaigns') },
                                    { to: '/volunteer', label: t('nav.volunteer') },
                                    { to: '/special-requests', label: 'طلب مساعدة' },
                                    { to: '/zakat', label: t('nav.zakatCalc') },
                                    { to: '/about', label: t('nav.about') },
                                ].map((link) => (
                                    <Link key={link.to} to={link.to} className="block no-underline text-sm transition-all duration-250 hover:translate-x-1"
                                        style={{ color: 'inherit' }}
                                        onMouseEnter={e => e.target.style.color = isDark ? '#80CBC4' : '#4DB6AC'}
                                        onMouseLeave={e => e.target.style.color = 'inherit'}>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h6 className="font-bold text-sm tracking-widest mb-2 uppercase" style={{ color: isDark ? '#B2DFDB' : '#E0F2F1' }}>{t('footer.contact')}</h6>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>{orgInfo.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <i className="fa-solid fa-phone"></i>
                                    <span>{orgInfo.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>{orgInfo.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Social */}
                        <div>
                            <h6 className="font-bold text-sm tracking-widest mb-2 uppercase" style={{ color: isDark ? '#B2DFDB' : '#E0F2F1' }}>{t('footer.followUs')}</h6>
                            <div className="flex gap-1.5 mt-2">
                                {[
                                    { icon: 'facebook-f', link: socialLinks.facebook },
                                    { icon: 'x-twitter', link: socialLinks.twitter },
                                    { icon: 'instagram', link: socialLinks.instagram },
                                    { icon: 'youtube', link: socialLinks.youtube }
                                ].map(({ icon, link }) => (
                                    <a key={icon} href={link || '#'} target="_blank" rel="noopener noreferrer"
                                        className="w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all duration-300 no-underline"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)', color: isDark ? '#607D8B' : '#78909C', display: link ? 'flex' : 'none' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0B6B6B'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(11,107,107,0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = isDark ? '#607D8B' : '#78909C'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        <i className={`fa-brands fa-${icon}`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="my-5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)' }}></div>

                    {/* Copyright */}
                    <div className="rounded-lg px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 text-center"
                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)' }}>
                        <span className="text-xs" style={{ color: isDark ? '#607D8B' : '#78909C' }}>
                            © {new Date().getFullYear()} {orgInfo.name || 'نور'}. {t('footer.rights')}
                        </span>
                        <div className="flex gap-4">
                            <Link to="/privacy" className="no-underline text-xs transition-colors duration-250" style={{ color: 'inherit' }}
                                onMouseEnter={e => e.target.style.color = isDark ? '#80CBC4' : '#4DB6AC'}
                                onMouseLeave={e => e.target.style.color = 'inherit'}>
                                {t('footer.privacy')}
                            </Link>
                            <Link to="/terms" className="no-underline text-xs transition-colors duration-250" style={{ color: 'inherit' }}
                                onMouseEnter={e => e.target.style.color = isDark ? '#80CBC4' : '#4DB6AC'}
                                onMouseLeave={e => e.target.style.color = 'inherit'}>
                                {t('footer.terms')}
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
            <ChatBot />
        </div>
    );
}

export default DonorLayout;

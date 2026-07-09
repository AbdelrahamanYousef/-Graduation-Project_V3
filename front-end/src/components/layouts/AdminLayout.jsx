import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { t, getLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 120;

const getNotificationIcon = (type) => {
    switch (type) {
        case 'CONTACT': return 'fa-solid fa-message';
        case 'SPECIAL_REQUEST': return 'fa-solid fa-hand-holding-heart';
        case 'VOLUNTEER': return 'fa-solid fa-handshake';
        case 'DONATION': return 'fa-solid fa-coins';
        default: return 'fa-solid fa-bell';
    }
};

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser, logout, updateAdminPhoto } = useAuth();
    const { isDark, toggleTheme } = useAppTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, initNotifications } = useNotifications();
    const photoInputRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);

    useEffect(() => {
        initNotifications('admin');
    }, [initNotifications]);

    useEffect(() => {
        if (isMobile) setSidebarExpanded(false);
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
        if (!isoTime) return '';
        const date = new Date(isoTime);
        if (isNaN(date.getTime())) return '';
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
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
        { path: '/admin/reports', label: t('admin.reports'), icon: 'fa-solid fa-chart-line' },
        { path: '/admin/campaigns', label: 'الحملات', icon: 'fa-solid fa-bullhorn' },
        { path: '/admin/donations', label: t('admin.donations'), icon: 'fa-solid fa-coins' },
        { path: '/admin/beneficiaries', label: t('admin.beneficiaries'), icon: 'fa-solid fa-users' },
        { path: '/admin/finance', label: t('admin.finance'), icon: 'fa-solid fa-credit-card' },
        { path: '/admin/volunteers', label: 'طلبات التطوع', icon: 'fa-solid fa-handshake' },
        { path: '/admin/special-requests', label: 'الطلبات الخاصة', icon: 'fa-solid fa-hand-holding-heart' },
        { path: '/admin/users', label: 'المستخدمون', icon: 'fa-solid fa-users-gear' },
        { path: '/admin/cms', label: 'إدارة المحتوى', icon: 'fa-solid fa-pen-nib' },
        { path: '/admin/blog', label: 'الأخبار', icon: 'fa-solid fa-newspaper' },
        { path: '/admin/gallery', label: 'المعرض', icon: 'fa-solid fa-images' },
        { path: '/admin/messages', label: 'الرسائل', icon: 'fa-solid fa-message' }
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 transition-[width] duration-300" style={{ width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}>
            {/* Header */}
            <div className="p-3 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-700" style={{ minHeight: 64 }}>
                <Link to="/admin" className="flex items-center gap-1 no-underline text-inherit w-full">
                    <i className="fa-solid fa-moon text-lg" style={{ color: 'var(--color-secondary-500)' }}></i>
                    {sidebarExpanded && (
                        <>
                            <span className="font-bold text-sm">نور</span>
                            <span className="mr-auto px-1.5 py-0.5 rounded text-[0.7rem] font-bold" style={{ backgroundColor: 'rgba(18,53,91,0.1)', color: 'var(--color-secondary-500)' }}>إدارة</span>
                        </>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-1.5 py-3 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const active = isActive(item);
                    return (
                        <div key={item.path} className="mb-0.5" title={!sidebarExpanded ? item.label : ''}>
                            <Link to={item.path} onClick={isMobile ? handleDrawerToggle : undefined}
                                className={`flex items-center no-underline rounded-lg transition-all duration-200 px-1.5 py-1.5 ${sidebarExpanded ? 'justify-start' : 'justify-center'} ${active ? 'bg-secondary-500/10 text-secondary-500' : 'text-inherit hover:bg-secondary-500/5'}`}
                                style={active ? { color: 'var(--color-secondary-500)' } : {}}>
                                <span className={`flex items-center justify-center text-lg ${sidebarExpanded ? 'ml-1.5' : ''}`} style={{ minWidth: 0 }}>
                                    <i className={item.icon}></i>
                                </span>
                                {sidebarExpanded && (
                                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                                )}
                                {sidebarExpanded && active && (
                                    <span className="w-1 h-1 rounded-full bg-secondary-500 mr-auto"></span>
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-1.5 border-t border-neutral-200 dark:border-neutral-700">
                <Link to="/" title={!sidebarExpanded ? 'العودة للموقع' : ''}
                    className={`flex items-center no-underline rounded-lg mb-0.5 text-inherit hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors ${sidebarExpanded ? 'justify-start px-1.5 py-1.5' : 'justify-center p-1.5'}`}>
                    <span className={`flex items-center justify-center text-base ${sidebarExpanded ? 'ml-1.5' : ''}`}>
                        <i className="fa-solid fa-house"></i>
                    </span>
                    {sidebarExpanded && <span className="text-sm font-medium">العودة للموقع</span>}
                </Link>
                <button onClick={handleLogout} title={!sidebarExpanded ? 'تسجيل الخروج' : ''}
                    className={`w-full flex items-center rounded-lg text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors ${sidebarExpanded ? 'justify-start px-1.5 py-1.5' : 'justify-center p-1.5'}`}>
                    <span className={`flex items-center justify-center text-base ${sidebarExpanded ? 'ml-1.5' : ''}`}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </span>
                    {sidebarExpanded && <span className="text-sm font-medium">تسجيل الخروج</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
            {/* AppBar */}
            <header className="fixed top-0 left-0 right-0 z-[1100] bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center h-16 px-3 gap-3">
                    {/* Sidebar Toggle */}
                    <button onClick={handleSidebarToggle}
                        className="hidden md:flex border border-neutral-200 dark:border-neutral-600 rounded-md p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors">
                        <i className={sidebarExpanded ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
                    </button>

                    {/* Mobile Menu */}
                    <button onClick={handleDrawerToggle}
                        className="flex md:hidden p-1.5 text-neutral-700 dark:text-neutral-300">
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>

                    {/* Top Nav */}
                    <div className="hidden md:flex items-center gap-1 mr-1 pl-2 border-r border-neutral-200 dark:border-neutral-700">
                        {topNavItems.map((item) => (
                            <Link key={item.path} to={item.path} title={item.label}
                                className={`p-1.5 rounded-md transition-colors no-underline ${isActive(item) ? 'text-secondary-500' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}`}>
                                <i className={item.icon}></i>
                            </Link>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 rounded-lg w-full max-w-[350px]">
                        <i className="fa-solid fa-magnifying-glass text-neutral-400 ml-2"></i>
                        <input type="text" placeholder="بحث..." className="flex-1 bg-transparent border-none outline-none text-sm text-inherit" />
                    </div>

                    <div className="flex-grow"></div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1">
                        {/* Theme */}
                        <button onClick={toggleTheme} title={isDark ? 'وضع فاتح' : 'وضع مظلم'}
                            className="border border-neutral-200 dark:border-neutral-600 rounded-md w-9 h-9 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors">
                            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                        </button>

                        {/* Notifications */}
                        <button onClick={handleNotifClick} title="إشعارات"
                            className="border border-neutral-200 dark:border-neutral-600 rounded-md p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors relative">
                            <i className="fa-solid fa-bell"></i>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{unreadCount}</span>
                            )}
                        </button>

                        {/* Profile */}
                        <button onClick={handleProfileClick}
                            className="flex items-center gap-1 p-0.5 border border-neutral-200 dark:border-neutral-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors">
                            {adminUser?.photo ? (
                                <img src={adminUser.photo} alt={adminUser?.name} className="w-8 h-8 rounded object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'var(--color-secondary-500)' }}>
                                    {adminUser?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                            <span className="hidden sm:block text-xs font-semibold leading-tight ml-0.5 mr-1">
                                {adminUser?.name || 'المسؤول'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/50 md:hidden" onClick={handleDrawerToggle}></div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-shrink-0 mt-16" style={{ width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}>
                {sidebarContent}
            </aside>

            {/* Mobile Drawer */}
            <div className={`fixed top-16 bottom-0 right-0 z-[1001] transition-transform duration-300 md:hidden`}
                style={{ transform: mobileDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}>
                <div style={{ width: SIDEBAR_EXPANDED }}>
                    {sidebarContent}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow mt-16 p-3 md:p-4 min-h-screen transition-[width] duration-300 w-full"
                style={{ width: isMobile ? '100%' : `calc(100% - ${sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED}px)` }}>
                <Outlet />
            </main>

            {/* Notification Menu */}
            {notifAnchorEl && (
                <div className="fixed inset-0 z-[1200]" onClick={handleNotifClose}></div>
            )}
            <div className={`fixed top-16 left-4 w-[360px] max-h-[480px] bg-white dark:bg-neutral-800 rounded-xl shadow-modal border border-neutral-200 dark:border-neutral-700 z-[1201] overflow-hidden ${notifAnchorEl ? 'block' : 'hidden'}`}>
                <div className="p-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-sm font-bold">{t('notifications.title')}</span>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-secondary-500 font-semibold hover:underline">{t('notifications.markAllRead')}</button>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500">
                        <i className="fa-solid fa-bell-slash text-2xl mb-4 opacity-50"></i>
                        <p className="text-sm">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <button key={n.id} onClick={() => markAsRead(n.id)}
                            className={`w-full text-right p-3 flex gap-3 border-b border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${!n.isRead ? 'bg-secondary-50/50 dark:bg-secondary-900/20' : ''}`}>
                            <span className="text-secondary-500 mt-0.5"><i className={n.icon || getNotificationIcon(n.type)}></i></span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                                <p className="text-xs text-neutral-500 my-0.5">{n.message}</p>
                                <p className="text-xs text-neutral-400">{getTimeAgo(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary-500 mt-1 flex-shrink-0"></span>}
                        </button>
                    ))
                )}
            </div>

            {/* Profile Menu */}
            {profileAnchorEl && (
                <div className="fixed inset-0 z-[1200]" onClick={handleProfileClose}></div>
            )}
            <div className={`fixed top-16 left-4 w-[280px] bg-white dark:bg-neutral-800 rounded-xl shadow-modal border border-neutral-200 dark:border-neutral-700 z-[1201] ${profileAnchorEl ? 'block' : 'hidden'}`}>
                <div className="p-3 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700 mb-1">
                    {adminUser?.photo ? (
                        <img src={adminUser.photo} alt={adminUser?.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--color-secondary-500)' }}>{adminUser?.name?.charAt(0) || 'A'}</div>
                    )}
                    <div>
                        <p className="text-sm font-bold">{adminUser?.name}</p>
                        <p className="text-xs text-neutral-500">{adminUser?.role}</p>
                    </div>
                </div>
                <button onClick={() => { photoInputRef.current?.click(); handleProfileClose(); }}
                    className="w-full text-right flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-sm">
                    <i className="fa-solid fa-camera w-5 text-neutral-500"></i>
                    <span>{t('account.changePhoto')}</span>
                </button>
                <Link to="/admin/settings" onClick={handleProfileClose}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors no-underline text-inherit text-sm">
                    <i className="fa-solid fa-gear w-5 text-neutral-500"></i>
                    <span>الإعدادات</span>
                </Link>
                <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                <button onClick={handleLogout}
                    className="w-full text-right flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-error-500 text-sm">
                    <i className="fa-solid fa-right-from-bracket w-5"></i>
                    <span>تسجيل الخروج</span>
                </button>
            </div>

            {/* Hidden Photo Input */}
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
    );
}

export default AdminLayout;

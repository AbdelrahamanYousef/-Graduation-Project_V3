import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

// Mock notifications for admin
const ADMIN_NOTIFICATIONS = [
    {
        id: 1,
        type: 'donation',
        title: 'تبرع جديد',
        titleEn: 'New Donation',
        message: 'تم استلام تبرع بقيمة 5,000 ج.م من أحمد محمد',
        messageEn: 'Received a donation of 5,000 EGP from Ahmed Mohamed',
        time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        read: false,
        icon: 'fa-solid fa-coins',
    },
    {
        id: 2,
        type: 'project',
        title: 'مشروع جديد',
        titleEn: 'New Project',
        message: 'تمت إضافة مشروع "المياه النظيفة" بنجاح',
        messageEn: 'Project "Clean Water" has been added successfully',
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        read: false,
        icon: 'fa-solid fa-clipboard-list',
    },
    {
        id: 3,
        type: 'alert',
        title: 'تنبيه النظام',
        titleEn: 'System Alert',
        message: 'حملة "كفالة يتيم" وصلت إلى 90% من الهدف',
        messageEn: 'Campaign "Orphan Sponsorship" reached 90% of goal',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        icon: 'fa-solid fa-bell',
    },
];

// Mock notifications for donor
const DONOR_NOTIFICATIONS = [
    {
        id: 101,
        type: 'welcome',
        title: 'مرحباً بك!',
        titleEn: 'Welcome!',
        message: 'شكراً لانضمامك إلى نور. ابدأ رحلتك في العطاء',
        messageEn: 'Thanks for joining Nour. Start your giving journey',
        time: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        read: false,
        icon: 'fa-solid fa-champagne-glasses',
    },
    {
        id: 102,
        type: 'update',
        title: 'تحديث مشروع',
        titleEn: 'Project Update',
        message: 'مشروع المياه النظيفة: تم الانتهاء من حفر البئر الثالث',
        messageEn: 'Clean Water Project: Third well drilling completed',
        time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
        icon: 'fa-solid fa-chart-pie',
    },
    {
        id: 103,
        type: 'campaign',
        title: 'حملة جديدة',
        titleEn: 'New Campaign',
        message: 'حملة "إفطار صائم" متاحة الآن. ساهم معنا!',
        messageEn: '"Iftar for Fasting" campaign is now live. Contribute!',
        time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
        icon: 'fa-solid fa-moon',
    },
];

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const initializedRef = useRef({ admin: false, donor: false });

    // Initialize notifications for a user type
    const initNotifications = useCallback((userType) => {
        if (initializedRef.current[userType]) return;
        initializedRef.current[userType] = true;
        const mockData = userType === 'admin' ? ADMIN_NOTIFICATIONS : DONOR_NOTIFICATIONS;
        setNotifications(prev => {
            // Avoid duplicates
            const existingIds = new Set(prev.map(n => n.id));
            const newNotifs = mockData.filter(n => !existingIds.has(n.id));
            return [...prev, ...newNotifs];
        });
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        initializedRef.current = { admin: false, donor: false };
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            initNotifications,
            clearNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
}

export default NotificationContext;

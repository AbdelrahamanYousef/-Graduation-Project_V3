import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

// Mock notifications for admin
const ADMIN_NOTIFICATIONS = [];

// Mock notifications for donor
const DONOR_NOTIFICATIONS = [];

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

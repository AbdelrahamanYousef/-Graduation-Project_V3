import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getNotifications, markNotificationRead as apiMarkRead, markAllNotificationsRead as apiMarkAllRead, clearNotifications as apiClearAll } from '../api/notifications.api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { isAdmin, isDonorLoggedIn, adminToken, donorToken } = useAuth();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const isAuthed = (isAdmin || isDonorLoggedIn) && (adminToken || donorToken);
        if (!isAuthed) return;

        let cancelled = false;
        async function fetchNotifications() {
            try {
                const data = await getNotifications();
                if (!cancelled) {
                    setNotifications(Array.isArray(data) ? data : []);
                    setLoaded(true);
                }
            } catch {
                if (!cancelled) {
                    setNotifications([]);
                    setLoaded(true);
                }
            }
        }
        fetchNotifications();
        return () => { cancelled = true; };
    }, [isAdmin, isDonorLoggedIn, adminToken, donorToken]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = useCallback(async (id) => {
        try {
            await apiMarkRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch {
            // silent
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await apiMarkAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            // silent
        }
    }, []);

    const clearAll = useCallback(async () => {
        try {
            await apiClearAll();
            setNotifications([]);
        } catch {
            // silent
        }
    }, []);

    // No-op: notifications auto-fetch on auth state change
    const initNotifications = useCallback(() => {}, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearNotifications: clearAll,
            initNotifications,
            loaded,
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

import apiClient from './client';

export const notificationKeys = {
    all: ['notifications'],
};

/**
 * Get notifications for current user
 */
export async function getNotifications() {
    const { data } = await apiClient.get('/notifications');
    return data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(id) {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
}

/**
 * Clear all notifications
 */
export async function clearNotifications() {
    const { data } = await apiClient.delete('/notifications');
    return data;
}

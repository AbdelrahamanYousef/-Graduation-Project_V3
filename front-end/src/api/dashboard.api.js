import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const dashboardKeys = {
    stats: ['dashboard', 'stats'],
    recentDonations: ['dashboard', 'recentDonations'],
    projectsSummary: ['dashboard', 'projectsSummary'],
    activity: ['dashboard', 'activity'],
    pendingTasks: ['dashboard', 'pendingTasks'],
};

// ─── API Functions ──────────────────────────────────────────

/**
 * Get dashboard overview statistics
 * @returns {Promise<object>}
 */
export async function getDashboardStats() {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
}

/**
 * Get recent donations for dashboard feed
 * @param {number} [limit=5]
 * @returns {Promise<object[]>}
 */
export async function getRecentDonations(limit = 5) {
    const { data } = await apiClient.get('/dashboard/recent-donations', { params: { limit } });
    return data;
}

/**
 * Get projects summary for dashboard
 * @returns {Promise<object[]>}
 */
export async function getProjectsSummary() {
    const { data } = await apiClient.get('/dashboard/projects-summary');
    return data;
}

/**
 * Get recent activity log
 * @param {number} [limit=10]
 * @returns {Promise<object[]>}
 */
export async function getRecentActivity(limit = 10) {
    const { data } = await apiClient.get('/dashboard/activity', { params: { limit } });
    return data;
}

/**
 * Get pending tasks
 * @returns {Promise<object[]>}
 */
export async function getPendingTasks() {
    const { data } = await apiClient.get('/dashboard/pending-tasks');
    return data;
}

/**
 * Mark a task as complete
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function completeTask(id) {
    const { data } = await apiClient.put(`/dashboard/tasks/${id}/complete`);
    return data;
}



import apiClient from './client';
import { impactStats, projects as mockProjects, programs, updates } from '../data/mockData';

// ─── Query Keys ─────────────────────────────────────────────
export const dashboardKeys = {
    stats: ['dashboard', 'stats'],
    recentDonations: ['dashboard', 'recentDonations'],
    projectsSummary: ['dashboard', 'projectsSummary'],
    programs: ['dashboard', 'programs'],
    updates: ['dashboard', 'updates'],
};

// ─── API Functions ──────────────────────────────────────────

/**
 * Get dashboard overview statistics
 * @returns {Promise<object>}
 */
export async function getDashboardStats() {
    // TODO: return apiClient.get('/dashboard/stats').then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...impactStats,
                monthlyGrowth: 12.5,
                activeProjects: mockProjects.filter(p => p.status === 'active').length,
                completedProjects: mockProjects.filter(p => p.status === 'completed').length,
            });
        }, 200);
    });
}

/**
 * Get recent donations for dashboard feed
 * @param {number} [limit=5]
 * @returns {Promise<object[]>}
 */
export async function getRecentDonations(limit = 5) {
    // TODO: return apiClient.get('/dashboard/recent-donations', { params: { limit } }).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, donorName: 'أحمد محمد', amount: 5000, type: 'صدقة جارية', date: '2024-02-10', projectTitle: 'كفالة 500 يتيم في الصعيد' },
                { id: 2, donorName: 'فاطمة علي', amount: 10000, type: 'زكاة المال', date: '2024-02-09', projectTitle: 'إغاثة طبية عاجلة لمستشفيات غزة' },
                { id: 3, donorName: 'محمود حسن', amount: 2500, type: 'كفالة يتيم', date: '2024-02-08', projectTitle: 'كفالة 500 يتيم في الصعيد' },
                { id: 4, donorName: 'سارة أحمد', amount: 1000, type: 'صدقة', date: '2024-02-07', projectTitle: 'دعم مراكز غسيل الكلى' },
                { id: 5, donorName: 'خالد إبراهيم', amount: 7500, type: 'وقف', date: '2024-02-06', projectTitle: 'حفر 10 آبار ارتوازية' },
            ].slice(0, limit));
        }, 200);
    });
}

/**
 * Get projects summary for dashboard
 * @returns {Promise<object[]>}
 */
export async function getProjectsSummary() {
    // TODO: return apiClient.get('/dashboard/projects-summary').then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                mockProjects.map(p => ({
                    id: p.id,
                    title: p.title,
                    titleEn: p.titleEn,
                    progress: Math.round((p.raised / p.goal) * 100),
                    raised: p.raised,
                    goal: p.goal,
                    donors: p.donors,
                    status: p.status,
                })),
            );
        }, 200);
    });
}

/**
 * Get all programs
 * @returns {Promise<object[]>}
 */
export async function getPrograms() {
    // TODO: return apiClient.get('/programs').then(r => r.data);
    return Promise.resolve(programs);
}

/**
 * Get latest updates / news feed
 * @returns {Promise<object[]>}
 */
export async function getUpdates() {
    // TODO: return apiClient.get('/updates').then(r => r.data);
    return Promise.resolve(updates);
}

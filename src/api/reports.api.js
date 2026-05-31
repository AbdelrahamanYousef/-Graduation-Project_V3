import apiClient from './client';

export const reportKeys = {
    all: ['reports'],
    detail: (id) => ['reports', 'detail', id],
};

/**
 * Get quick stats (admin)
 */
export async function getQuickStats() {
    const { data } = await apiClient.get('/reports/quick-stats');
    return data;
}

/**
 * Get all reports (admin)
 */
export async function getReports(filters = {}) {
    const { data } = await apiClient.get('/reports', { params: filters });
    return data;
}

/**
 * Get a report by ID (admin)
 */
export async function getReportById(id) {
    const { data } = await apiClient.get(`/reports/${id}`);
    return data;
}

/**
 * Generate a new report (admin)
 */
export async function generateReport(reportData) {
    const { data } = await apiClient.post('/reports', reportData);
    return data;
}

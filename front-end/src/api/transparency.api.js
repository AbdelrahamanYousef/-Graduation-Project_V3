import apiClient from './client';

/**
 * Get transparency statistics/metrics
 * // TODO: Replace with the correct API endpoint later if the path changes
 */
export async function getTransparencyStats() {
    const { data } = await apiClient.get('/transparency');
    return data;
}

/**
 * Get all external audit reports
 */
export async function getAuditReports() {
    const { data } = await apiClient.get('/transparency/auditors');
    return data;
}

/**
 * Create a new external audit report (Admin only)
 */
export async function createAuditReport(reportData) {
    const { data } = await apiClient.post('/transparency/auditors', reportData);
    return data;
}

/**
 * Update an external audit report (Admin only)
 */
export async function updateAuditReport(id, reportData) {
    const { data } = await apiClient.put(`/transparency/auditors/${id}`, reportData);
    return data;
}

/**
 * Delete an external audit report (Admin only)
 */
export async function deleteAuditReport(id) {
    const { data } = await apiClient.delete(`/transparency/auditors/${id}`);
    return data;
}

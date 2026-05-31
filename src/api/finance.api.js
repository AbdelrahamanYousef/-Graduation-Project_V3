import apiClient from './client';

/**
 * Get financial overview (admin)
 */
export async function getFinanceOverview() {
    const { data } = await apiClient.get('/finance/overview');
    return data;
}

/**
 * Get budget summary per program (admin)
 */
export async function getBudgets() {
    const { data } = await apiClient.get('/finance/budgets');
    return data;
}

/**
 * Get disbursements list (admin)
 */
export async function getDisbursements(filters = {}) {
    const { data } = await apiClient.get('/finance', { params: filters });
    return data;
}

/**
 * Create a disbursement (admin)
 */
export async function createDisbursement(disbursementData) {
    const { data } = await apiClient.post('/finance', disbursementData);
    return data;
}

/**
 * Approve a disbursement (admin)
 */
export async function approveDisbursement(id) {
    const { data } = await apiClient.put(`/finance/${id}/approve`);
    return data;
}

/**
 * Reject a disbursement (admin)
 */
export async function rejectDisbursement(id, reason) {
    const { data } = await apiClient.put(`/finance/${id}/reject`, { reason });
    return data;
}

/**
 * Complete a disbursement (admin)
 */
export async function completeDisbursement(id) {
    const { data } = await apiClient.put(`/finance/${id}/complete`);
    return data;
}

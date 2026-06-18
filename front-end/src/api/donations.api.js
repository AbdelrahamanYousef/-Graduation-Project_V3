import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const donationKeys = {
    all: ['donations'],
    list: (filters) => ['donations', 'list', filters],
    detail: (id) => ['donations', 'detail', id],
    types: ['donations', 'types'],
    paymentMethods: ['donations', 'paymentMethods'],
    amounts: ['donations', 'amounts'],
    stats: ['donations', 'stats'],
};

// ─── API Functions ──────────────────────────────────────────

/**
 * Fetch all donations (admin)
 * @param {object} [filters] - { status, type, dateFrom, dateTo, page, limit, search }
 * @returns {Promise<{ data: object[], meta: object }>}
 */
export async function getDonations(filters = {}) {
    const { data } = await apiClient.get('/donations', { params: filters });
    return data;
}

/**
 * Get a single donation by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getDonationById(id) {
    const { data } = await apiClient.get(`/donations/${id}`);
    return data;
}

/**
 * Create a new donation
 * @param {{ amount: number, type: string, projectId?: string, paymentMethod: string, fullName?: string, phone?: string, email?: string, isAnonymous?: boolean, notes?: string }} data
 * @returns {Promise<object>}
 */
export async function createDonation(data) {
    const { data: result } = await apiClient.post('/donations', data);
    return result;
}

/**
 * Get donation statistics (admin)
 * @returns {Promise<{ total: number, count: number, average: number }>}
 */
export async function getDonationStats() {
    const { data } = await apiClient.get('/donations/stats');
    return data;
}

/**
 * Get donation types reference data
 * @returns {Promise<object[]>}
 */
export async function getDonationTypes() {
    const { data } = await apiClient.get('/donations/types');
    return data;
}

/**
 * Get payment methods reference data
 * @returns {Promise<object[]>}
 */
export async function getPaymentMethods() {
    const { data } = await apiClient.get('/donations/payment-methods');
    return data;
}

/**
 * Get suggested donation amounts
 * @returns {Promise<number[]>}
 */
export async function getDonationAmounts() {
    const { data } = await apiClient.get('/donations/amounts');
    return data;
}

/**
 * Refund a donation (admin)
 * @param {string} id
 * @param {string} reason
 * @returns {Promise<object>}
 */
export async function refundDonation(id, reason) {
    const { data } = await apiClient.post(`/donations/${id}/refund`, { reason });
    return data;
}

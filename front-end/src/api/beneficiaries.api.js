import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const beneficiaryKeys = {
    all: ['beneficiaries'],
    list: (filters) => ['beneficiaries', 'list', filters],
    detail: (id) => ['beneficiaries', 'detail', id],
    stats: ['beneficiaries', 'stats'],
};

// ─── API Functions ──────────────────────────────────────────

/**
 * Fetch all beneficiaries (admin)
 * @param {object} [filters] - { status, search, page, limit }
 * @returns {Promise<{ data: object[], meta: object }>}
 */
export async function getBeneficiaries(filters = {}) {
    const { data } = await apiClient.get('/beneficiaries', { params: filters });
    return data;
}

/**
 * Get a single beneficiary by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getBeneficiaryById(id) {
    const { data } = await apiClient.get(`/beneficiaries/${id}`);
    return data;
}

/**
 * Create a new beneficiary record
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createBeneficiary(data) {
    const { data: result } = await apiClient.post('/beneficiaries', data);
    return result;
}

/**
 * Update an existing beneficiary
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateBeneficiary(id, data) {
    const { data: result } = await apiClient.put(`/beneficiaries/${id}`, data);
    return result;
}

/**
 * Delete a beneficiary (soft delete)
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteBeneficiary(id) {
    const { data } = await apiClient.delete(`/beneficiaries/${id}`);
    return data;
}

/**
 * Get beneficiaries stats
 * @returns {Promise<object>}
 */
export async function getBeneficiaryStats() {
    const { data } = await apiClient.get('/beneficiaries/stats');
    return data;
}

import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const beneficiaryKeys = {
    all: ['beneficiaries'],
    list: (filters) => ['beneficiaries', 'list', filters],
    detail: (id) => ['beneficiaries', 'detail', id],
    stats: ['beneficiaries', 'stats'],
};

// ─── Mock Data ──────────────────────────────────────────────
const mockBeneficiaries = [
    { id: 1, name: 'عائلة محمد حسن', category: 'orphan', location: 'قنا', membersCount: 5, status: 'active', monthlyAid: 1500, startDate: '2023-06-15' },
    { id: 2, name: 'عائلة أحمد سعيد', category: 'medical', location: 'القاهرة', membersCount: 3, status: 'active', monthlyAid: 2000, startDate: '2023-08-01' },
    { id: 3, name: 'عائلة فاطمة علي', category: 'housing', location: 'المنيا', membersCount: 7, status: 'active', monthlyAid: 2500, startDate: '2023-04-10' },
    { id: 4, name: 'عائلة خالد إبراهيم', category: 'orphan', location: 'سوهاج', membersCount: 4, status: 'inactive', monthlyAid: 1200, startDate: '2023-01-20' },
    { id: 5, name: 'عائلة سمير عبدالله', category: 'emergency', location: 'غزة', membersCount: 6, status: 'active', monthlyAid: 3000, startDate: '2024-01-05' },
];

// ─── API Functions ──────────────────────────────────────────

/**
 * Fetch all beneficiaries
 * @param {object} [filters] - { category, status, location }
 * @returns {Promise<object[]>}
 */
export async function getBeneficiaries(filters = {}) {
    // TODO: return apiClient.get('/beneficiaries', { params: filters }).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...mockBeneficiaries];
            if (filters.category) result = result.filter(b => b.category === filters.category);
            if (filters.status) result = result.filter(b => b.status === filters.status);
            resolve(result);
        }, 200);
    });
}

/**
 * Get a single beneficiary by ID
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getBeneficiaryById(id) {
    // TODO: return apiClient.get(`/beneficiaries/${id}`).then(r => r.data);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const found = mockBeneficiaries.find(b => b.id === Number(id));
            found ? resolve(found) : reject({ status: 404, message: 'المستفيد غير موجود' });
        }, 200);
    });
}

/**
 * Create a new beneficiary record
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createBeneficiary(data) {
    // TODO: return apiClient.post('/beneficiaries', data).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: Date.now(), ...data, status: 'active', startDate: new Date().toISOString().split('T')[0] });
        }, 300);
    });
}

/**
 * Update an existing beneficiary
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateBeneficiary(id, data) {
    // TODO: return apiClient.put(`/beneficiaries/${id}`, data).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            const existing = mockBeneficiaries.find(b => b.id === Number(id));
            resolve({ ...existing, ...data });
        }, 300);
    });
}

/**
 * Get beneficiaries stats
 * @returns {Promise<object>}
 */
export async function getBeneficiaryStats() {
    // TODO: return apiClient.get('/beneficiaries/stats').then(r => r.data);

    return Promise.resolve({
        total: mockBeneficiaries.length,
        active: mockBeneficiaries.filter(b => b.status === 'active').length,
        totalMonthlyAid: mockBeneficiaries.reduce((sum, b) => sum + b.monthlyAid, 0),
        byCategory: {
            orphan: mockBeneficiaries.filter(b => b.category === 'orphan').length,
            medical: mockBeneficiaries.filter(b => b.category === 'medical').length,
            housing: mockBeneficiaries.filter(b => b.category === 'housing').length,
            emergency: mockBeneficiaries.filter(b => b.category === 'emergency').length,
        },
    });
}

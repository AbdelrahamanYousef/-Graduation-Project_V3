import apiClient from './client';
import { projects as mockProjects, donationTypes, paymentMethods, donationAmounts } from '../data/mockData';

// ─── Query Keys ─────────────────────────────────────────────
export const donationKeys = {
    all: ['donations'],
    list: (filters) => ['donations', 'list', filters],
    detail: (id) => ['donations', 'detail', id],
    types: ['donations', 'types'],
    paymentMethods: ['donations', 'paymentMethods'],
    amounts: ['donations', 'amounts'],
};

// ─── Mock Data ──────────────────────────────────────────────
const mockDonations = [
    { id: 1, donorName: 'أحمد محمد', amount: 5000, type: 'sadaqah', projectId: 1, date: '2024-02-10', status: 'confirmed' },
    { id: 2, donorName: 'فاطمة علي', amount: 10000, type: 'zakat', projectId: 2, date: '2024-02-09', status: 'confirmed' },
    { id: 3, donorName: 'محمود حسن', amount: 2500, type: 'kafala', projectId: 1, date: '2024-02-08', status: 'pending' },
    { id: 4, donorName: 'سارة أحمد', amount: 1000, type: 'sadaqah', projectId: 3, date: '2024-02-07', status: 'confirmed' },
    { id: 5, donorName: 'خالد إبراهيم', amount: 7500, type: 'waqf', projectId: 6, date: '2024-02-06', status: 'confirmed' },
];

// ─── API Functions ──────────────────────────────────────────

/**
 * Fetch all donations
 * @param {object} [filters] - Optional filters { status, type, dateFrom, dateTo }
 * @returns {Promise<object[]>}
 */
export async function getDonations(filters = {}) {
    // TODO: return apiClient.get('/donations', { params: filters }).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...mockDonations];
            if (filters.status) result = result.filter(d => d.status === filters.status);
            if (filters.type) result = result.filter(d => d.type === filters.type);
            resolve(result);
        }, 200);
    });
}

/**
 * Get a single donation by ID
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getDonationById(id) {
    // TODO: return apiClient.get(`/donations/${id}`).then(r => r.data);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const donation = mockDonations.find(d => d.id === Number(id));
            if (donation) {
                resolve({ ...donation, project: mockProjects.find(p => p.id === donation.projectId) });
            } else {
                reject({ status: 404, message: 'التبرع غير موجود' });
            }
        }, 200);
    });
}

/**
 * Create a new donation
 * @param {{ amount: number, type: string, projectId: number, paymentMethod: string }} data
 * @returns {Promise<object>}
 */
export async function createDonation(data) {
    // TODO: return apiClient.post('/donations', data).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: Date.now(),
                ...data,
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
                receiptNumber: 'REC-' + Date.now(),
            });
        }, 500);
    });
}

/**
 * Get donation types reference data
 */
export async function getDonationTypes() {
    // TODO: return apiClient.get('/donations/types').then(r => r.data);
    return Promise.resolve(donationTypes);
}

/**
 * Get payment methods reference data
 */
export async function getPaymentMethods() {
    // TODO: return apiClient.get('/donations/payment-methods').then(r => r.data);
    return Promise.resolve(paymentMethods);
}

/**
 * Get suggested donation amounts
 */
export async function getDonationAmounts() {
    // TODO: return apiClient.get('/donations/amounts').then(r => r.data);
    return Promise.resolve(donationAmounts);
}

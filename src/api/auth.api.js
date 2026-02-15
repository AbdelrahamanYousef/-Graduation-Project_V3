import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const authKeys = {
    currentUser: ['auth', 'currentUser'],
};

// ─── Mock Credentials (will be removed when backend is ready) ───
const ADMIN_CREDENTIALS = {
    email: 'admin@nour.org',
    password: 'admin123',
};

const MOCK_ADMIN_USER = {
    email: ADMIN_CREDENTIALS.email,
    name: 'محمد أحمد',
    nameEn: 'Mohamed Ahmed',
    role: 'مدير المشاريع',
    roleEn: 'Project Manager',
};

// ─── API Functions ──────────────────────────────────────────

/**
 * Admin login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginAdmin({ email, password }) {
    // TODO: Replace with real API call when backend is ready
    // return apiClient.post('/auth/admin/login', { email, password }).then(r => r.data);

    // Mock implementation
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                const token = 'mock-admin-jwt-' + Date.now();
                resolve({
                    user: { ...MOCK_ADMIN_USER, loggedInAt: new Date().toISOString() },
                    token,
                });
            } else {
                reject({ status: 401, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
            }
        }, 300);
    });
}

/**
 * Donor login (OTP simulation)
 * @param {{ phone: string, name?: string, nameEn?: string, email?: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginDonor({ phone, name, nameEn, email }) {
    // TODO: Replace with real API call
    // return apiClient.post('/auth/donor/login', { phone }).then(r => r.data);

    return new Promise((resolve) => {
        setTimeout(() => {
            const token = 'mock-donor-jwt-' + Date.now();
            resolve({
                user: {
                    phone,
                    name: name || 'أحمد محمد',
                    nameEn: nameEn || 'Ahmed Mohamed',
                    email: email || 'ahmed@example.com',
                    joinDate: new Date().toISOString().split('T')[0],
                    totalDonations: 0,
                    donationCount: 0,
                    isNew: !!name,
                    loggedInAt: new Date().toISOString(),
                },
                token,
            });
        }, 300);
    });
}

/**
 * Get the currently authenticated user profile
 * @returns {Promise<{ user: object }>}
 */
export async function getCurrentUser() {
    // TODO: Replace with real API call
    // return apiClient.get('/auth/me').then(r => r.data);

    return new Promise((resolve) => {
        const admin = localStorage.getItem('nour-admin');
        const donor = localStorage.getItem('nour-donor');
        resolve({ user: admin ? JSON.parse(admin) : donor ? JSON.parse(donor) : null });
    });
}

/**
 * Logout (clears tokens)
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    // TODO: Replace with real API call
    // return apiClient.post('/auth/logout').then(r => r.data);

    localStorage.removeItem('nour-admin-token');
    localStorage.removeItem('nour-donor-token');
    return Promise.resolve();
}

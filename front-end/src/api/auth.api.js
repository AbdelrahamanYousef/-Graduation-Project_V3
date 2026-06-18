import apiClient from './client';

// ─── Query Keys ─────────────────────────────────────────────
export const authKeys = {
    currentUser: ['auth', 'currentUser'],
};

// ─── Email + Password Auth (new flow) ───────────────────────

/**
 * Register a new user with email + password
 * Sends OTP to email for verification
 * @param {{ email: string, password: string, name: string }} data
 * @returns {Promise<{ user: object, token: string, message: string }>}
 */
export async function register({ email, password, name }) {
    const { data } = await apiClient.post('/auth/register', { email, password, name });
    return data;
}

/**
 * Verify email with OTP code
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{ user: object, message: string }>}
 */
export async function verifyEmail(otp) {
    const { data } = await apiClient.post('/auth/verify-email', { otp });
    return data;
}

/**
 * Resend verification OTP
 * @returns {Promise<{ message: string }>}
 */
export async function resendVerification() {
    const { data } = await apiClient.post('/auth/resend-verification');
    return data;
}

/**
 * Login with email + password
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginDonor({ email, password }) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
}

/**
 * Request password reset
 * @param {string} email
 */
export async function forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
}

/**
 * Complete password reset
 * @param {string} token
 * @param {string} newPassword
 */
export async function resetPassword(token, newPassword) {
    const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
    return data;
}

// ─── Admin Auth ─────────────────────────────────────────────

/**
 * Admin login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginAdmin({ email, password }) {
    const { data } = await apiClient.post('/auth/admin/login', { email, password });
    return data;
}

// ─── Legacy Phone OTP (kept for backward compat) ────────────

export async function sendDonorOtp({ phone }) {
    const { data } = await apiClient.post('/auth/donor/login', { phone });
    return data;
}

export async function verifyDonorOtp({ phone, otp }) {
    const { data } = await apiClient.post('/auth/donor/verify-otp', { phone, otp });
    return data;
}

// ─── Common ─────────────────────────────────────────────────

/**
 * Get the currently authenticated user profile
 * @returns {Promise<{ user: object }>}
 */
export async function getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
}

/**
 * Refresh JWT token
 * @param {string} refreshToken
 * @returns {Promise<{ token: string, refreshToken: string }>}
 */
export async function refreshToken(refreshToken) {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
}

/**
 * Logout (clears tokens on client)
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    localStorage.removeItem('nour-admin-token');
    localStorage.removeItem('nour-donor-token');
    localStorage.removeItem('nour-admin');
    localStorage.removeItem('nour-donor');
}

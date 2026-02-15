import axios from 'axios';

/**
 * Axios instance pre-configured for the Nour Charity API
 *
 * - Base URL: http://localhost:5000/api
 * - JWT token injection via request interceptor
 * - Global error handling via response interceptor
 */
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        // Attempt to read the JWT from localStorage
        const adminToken = localStorage.getItem('nour-admin-token');
        const donorToken = localStorage.getItem('nour-donor-token');
        const token = adminToken || donorToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Normalize error shape for consistent handling
        const status = error.response?.status;
        const message =
            error.response?.data?.message ||
            error.message ||
            'حدث خطأ غير متوقع';

        // 401 — clear tokens and optionally redirect
        if (status === 401) {
            localStorage.removeItem('nour-admin-token');
            localStorage.removeItem('nour-donor-token');
            // Don't hard-redirect here; let the auth context/guard handle it
        }

        // Return a normalized rejection so consumers can do:
        //   catch(err) { err.status, err.message }
        return Promise.reject({ status, message, original: error });
    },
);

export default apiClient;

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Demo admin credentials (will be replaced by auth.api.js calls)
const ADMIN_CREDENTIALS = {
    email: 'admin@nour.org',
    password: 'admin123',
    name: 'محمد أحمد',
    nameEn: 'Mohamed Ahmed',
    role: 'مدير المشاريع',
    roleEn: 'Project Manager',
};

/**
 * Reads a stored user + token pair from localStorage
 */
function readStoredAuth(key) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    // ─── Admin auth state ───────────────────────────────────
    const [adminUser, setAdminUser] = useState(() => readStoredAuth('nour-admin'));
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem('nour-admin-token'));

    // ─── Donor auth state ───────────────────────────────────
    const [donorUser, setDonorUser] = useState(() => readStoredAuth('nour-donor'));
    const [donorToken, setDonorToken] = useState(() => localStorage.getItem('nour-donor-token'));

    const isAdmin = !!adminUser;
    const isDonorLoggedIn = !!donorUser;

    // ─── Admin login ────────────────────────────────────────
    const login = useCallback((email, password) => {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const user = {
                email: ADMIN_CREDENTIALS.email,
                name: ADMIN_CREDENTIALS.name,
                nameEn: ADMIN_CREDENTIALS.nameEn,
                role: ADMIN_CREDENTIALS.role,
                roleEn: ADMIN_CREDENTIALS.roleEn,
                loggedInAt: new Date().toISOString(),
            };
            const token = 'mock-admin-jwt-' + Date.now();
            setAdminUser(user);
            setAdminToken(token);
            localStorage.setItem('nour-admin', JSON.stringify(user));
            localStorage.setItem('nour-admin-token', token);
            return { success: true };
        }
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }, []);

    // ─── Donor login via OTP (simulated) ────────────────────
    const donorLogin = useCallback((phone, opts = {}) => {
        const user = {
            phone,
            name: opts.name || 'أحمد محمد',
            nameEn: opts.nameEn || 'Ahmed Mohamed',
            email: opts.email || 'ahmed@example.com',
            joinDate: new Date().toISOString().split('T')[0],
            totalDonations: 0,
            donationCount: 0,
            isNew: !!opts.name,
            loggedInAt: new Date().toISOString(),
        };
        const token = 'mock-donor-jwt-' + Date.now();
        setDonorUser(user);
        setDonorToken(token);
        localStorage.setItem('nour-donor', JSON.stringify(user));
        localStorage.setItem('nour-donor-token', token);
        return { success: true };
    }, []);

    // ─── Donor logout ───────────────────────────────────────
    const donorLogout = useCallback(() => {
        setDonorUser(null);
        setDonorToken(null);
        localStorage.removeItem('nour-donor');
        localStorage.removeItem('nour-donor-token');
    }, []);

    // ─── Admin logout ───────────────────────────────────────
    const logout = useCallback(() => {
        setAdminUser(null);
        setAdminToken(null);
        localStorage.removeItem('nour-admin');
        localStorage.removeItem('nour-admin-token');
    }, []);

    // ─── Update profile photo (admin) ───────────────────────
    const updateAdminPhoto = useCallback((photoBase64) => {
        setAdminUser(prev => {
            const updated = { ...prev, photo: photoBase64 };
            localStorage.setItem('nour-admin', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // ─── Update profile photo (donor) ───────────────────────
    const updateDonorPhoto = useCallback((photoBase64) => {
        setDonorUser(prev => {
            const updated = { ...prev, photo: photoBase64 };
            localStorage.setItem('nour-donor', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // ─── Token getter for Axios interceptor ─────────────────
    const getToken = useCallback(() => adminToken || donorToken, [adminToken, donorToken]);

    return (
        <AuthContext.Provider value={{
            isAdmin, adminUser, login, logout, updateAdminPhoto,
            isDonorLoggedIn, donorUser, donorLogin, donorLogout, updateDonorPhoto,
            getToken, adminToken, donorToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;

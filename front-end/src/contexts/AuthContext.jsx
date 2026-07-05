import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    loginAdmin as apiLoginAdmin,
    loginDonor as apiLoginDonor,
    register as apiRegister,
    verifyEmail as apiVerifyEmail,
    resendVerification as apiResendVerification,
    getCurrentUser,
} from '../api/auth.api';
import { uploadProfilePhoto } from '../api/upload.api';
import { updateDonorProfile } from '../api/donorAccount.api';


const AuthContext = createContext(null);

function readStoredAuth(key) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(() => readStoredAuth('nour-admin'));
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem('nour-admin-token'));
    const [donorUser, setDonorUser] = useState(() => readStoredAuth('nour-donor'));
    const [donorToken, setDonorToken] = useState(() => localStorage.getItem('nour-donor-token'));
    const [loading, setLoading] = useState(true);

    const isAdmin = !!adminUser;
    const isDonorLoggedIn = !!donorUser;

    // Restore session on mount
    useEffect(() => {
        async function restoreSession() {
            const token = adminToken || donorToken;
            if (!token) { setLoading(false); return; }
            try {
                const result = await getCurrentUser();
                if (result.user) {
                    // Don't restore session for unverified donors
                    if (result.user.role !== 'ADMIN' && result.user.emailVerified === false) {
                        clearAllAuth();
                    } else if (result.user.role === 'ADMIN') {
                        setAdminUser(result.user);
                        localStorage.setItem('nour-admin', JSON.stringify(result.user));
                    } else {
                        setDonorUser(result.user);
                        localStorage.setItem('nour-donor', JSON.stringify(result.user));
                    }
                } else {
                    clearAllAuth();
                }
            } catch {
                clearAllAuth();
            } finally {
                setLoading(false);
            }
        }
        restoreSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function clearAllAuth() {
        setAdminUser(null);
        setAdminToken(null);
        setDonorUser(null);
        setDonorToken(null);
        localStorage.removeItem('nour-admin');
        localStorage.removeItem('nour-admin-token');
        localStorage.removeItem('nour-donor');
        localStorage.removeItem('nour-donor-token');
    }

    // ── Admin login ────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        try {
            const result = await apiLoginAdmin({ email, password });
            setAdminUser(result.user);
            setAdminToken(result.token);
            localStorage.setItem('nour-admin', JSON.stringify(result.user));
            localStorage.setItem('nour-admin-token', result.token);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Login failed' };
        }
    }, []);

    // ── Donor register (email + password) ──────────────────
    const registerDonor = useCallback(async ({ email, password, name }) => {
        try {
            const result = await apiRegister({ email, password, name });
            // Store token for verify-email call, but DON'T set donorUser yet
            // User is not "logged in" until email is verified
            setDonorToken(result.token);
            localStorage.setItem('nour-donor-token', result.token);
            return { success: true, user: result.user };
        } catch (err) {
            return { success: false, error: err.message || 'Registration failed' };
        }
    }, []);

    // ── Verify email with OTP ──────────────────────────────
    const verifyDonorEmail = useCallback(async (otp) => {
        try {
            const result = await apiVerifyEmail(otp);
            // NOW the user is verified — store them as logged in
            const verifiedUser = result.user;
            setDonorUser(verifiedUser);
            localStorage.setItem('nour-donor', JSON.stringify(verifiedUser));
            return { success: true, user: verifiedUser };
        } catch (err) {
            return { success: false, error: err.message || 'Verification failed' };
        }
    }, []);

    // ── Resend verification OTP ────────────────────────────
    const resendDonorVerification = useCallback(async () => {
        try {
            await apiResendVerification();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to resend' };
        }
    }, []);

    // ── Donor login (email + password) ─────────────────────
    const donorLogin = useCallback(async (email, password) => {
        try {
            const result = await apiLoginDonor({ email, password });
            setDonorUser(result.user);
            setDonorToken(result.token);
            localStorage.setItem('nour-donor', JSON.stringify(result.user));
            localStorage.setItem('nour-donor-token', result.token);
            return { success: true, user: result.user };
        } catch (err) {
            return { success: false, error: err.message || 'Login failed' };
        }
    }, []);

    // ── Logout ─────────────────────────────────────────────
    const logout = useCallback(() => {
        setAdminUser(null);
        setAdminToken(null);
        localStorage.removeItem('nour-admin');
        localStorage.removeItem('nour-admin-token');
    }, []);

    const donorLogout = useCallback(() => {
        setDonorUser(null);
        setDonorToken(null);
        localStorage.removeItem('nour-donor');
        localStorage.removeItem('nour-donor-token');
    }, []);

    // ── Photo updates (upload to server) ───────────────────
    const updateAdminPhoto = useCallback(async (file) => {
        try {
            const result = await uploadProfilePhoto(file);
            setAdminUser(prev => {
                const updated = { ...prev, photo: result.url };
                localStorage.setItem('nour-admin', JSON.stringify(updated));
                return updated;
            });
            return { success: true, url: result.url };
        } catch (err) {
            return { success: false, error: err.message || 'Upload failed' };
        }
    }, []);

    const updateDonorPhoto = useCallback(async (file) => {
        try {
            let photoUrl = null;
            if (file) {
                const result = await uploadProfilePhoto(file);
                photoUrl = result.url;
            }
            await updateDonorProfile({ avatarUrl: photoUrl });
            setDonorUser(prev => {
                const updated = { ...prev, photo: photoUrl };
                localStorage.setItem('nour-donor', JSON.stringify(updated));
                return updated;
            });
            return { success: true, url: photoUrl };
        } catch (err) {
            console.error('Failed to update photo:', err);
            return { success: false, error: err.message || 'Upload failed' };
        }
    }, []);

    const updateDonorUser = useCallback((userData) => {
        setDonorUser(prev => {
            const updated = { ...prev, ...userData };
            localStorage.setItem('nour-donor', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const getToken = useCallback(() => adminToken || donorToken, [adminToken, donorToken]);

    return (
        <AuthContext.Provider value={{
            isAdmin, adminUser, login, logout, updateAdminPhoto,
            isDonorLoggedIn, donorUser, donorLogin, donorLogout, updateDonorPhoto,
            registerDonor, verifyDonorEmail, resendVerification: resendDonorVerification,
            getToken, adminToken, donorToken, loading, updateDonorUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthContext');
    return ctx;
}

export default AuthContext;

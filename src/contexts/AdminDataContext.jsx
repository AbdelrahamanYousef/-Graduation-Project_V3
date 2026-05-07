import { createContext, useContext, useReducer, useEffect } from 'react';
import { projects as initialProjects, programs as initialPrograms, impactStats as initialStats } from '../data/mockData';
import { donationsList as initialDonations } from '../data/adminMockData';

// ─── Storage Keys ────────────────────────────────────────────
const STORAGE_KEYS = {
    projects: 'nour_admin_projects',
    programs: 'nour_admin_programs',
    donations: 'nour_admin_donations',
    stats: 'nour_admin_stats',
};

// ─── Load / Save helpers ─────────────────────────────────────
function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
}

// ─── Initial State ───────────────────────────────────────────
function buildInitialState() {
    return {
        projects: loadFromStorage(STORAGE_KEYS.projects, initialProjects),
        programs: loadFromStorage(STORAGE_KEYS.programs, initialPrograms),
        donations: loadFromStorage(STORAGE_KEYS.donations, initialDonations),
        stats: loadFromStorage(STORAGE_KEYS.stats, initialStats),
    };
}

// ─── Reducer ─────────────────────────────────────────────────
function adminDataReducer(state, action) {
    switch (action.type) {
        // ── Projects ──
        case 'ADD_PROJECT':
            return { ...state, projects: [...state.projects, action.payload] };

        case 'UPDATE_PROJECT':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.id ? { ...p, ...action.payload } : p
                ),
            };

        case 'DELETE_PROJECT':
            return {
                ...state,
                projects: state.projects.filter(p => p.id !== action.payload),
            };

        case 'TOGGLE_FEATURED':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload ? { ...p, featured: !p.featured } : p
                ),
            };

        // ── Programs ──
        case 'ADD_PROGRAM':
            return { ...state, programs: [...state.programs, action.payload] };

        case 'UPDATE_PROGRAM':
            return {
                ...state,
                programs: state.programs.map(p =>
                    p.id === action.payload.id ? { ...p, ...action.payload } : p
                ),
            };

        case 'DELETE_PROGRAM':
            return {
                ...state,
                programs: state.programs.filter(p => p.id !== action.payload),
            };

        case 'TOGGLE_PROGRAM_STATUS':
            return {
                ...state,
                programs: state.programs.map(p =>
                    p.id === action.payload
                        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
                        : p
                ),
            };

        // ── Donations ──
        case 'ADD_DONATION':
            return { ...state, donations: [...state.donations, action.payload] };

        // ── Stats ──
        case 'UPDATE_STATS':
            return { ...state, stats: { ...state.stats, ...action.payload } };

        // ── Reset ──
        case 'RESET_ALL':
            // Clear localStorage so we get fresh data from mockData
            Object.values(STORAGE_KEYS).forEach(key => {
                try { localStorage.removeItem(key); } catch { /* ignore */ }
            });
            return {
                projects: initialProjects,
                programs: initialPrograms,
                donations: initialDonations,
                stats: initialStats,
            };

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────
const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
    const [state, dispatch] = useReducer(adminDataReducer, null, buildInitialState);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.projects, state.projects);
    }, [state.projects]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.programs, state.programs);
    }, [state.programs]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.donations, state.donations);
    }, [state.donations]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.stats, state.stats);
    }, [state.stats]);

    // ── Derived data ──
    const activeProjects = state.projects.filter(p => p.status === 'active');
    const featuredProjects = state.projects.filter(p => p.featured);
    const activePrograms = state.programs.filter(p => !p.status || p.status === 'active');

    // ── Dashboard stats (derived from real data) ──
    const dashboardStats = {
        totalRevenue: state.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
        activeProjects: activeProjects.length,
        totalProjects: state.projects.length,
        pendingDonations: state.donations.filter(d => d.status === 'pending').length,
        monthlyDonations: state.donations
            .filter(d => {
                if (!d.date) return false;
                const donationMonth = new Date(d.date).getMonth();
                return donationMonth === new Date().getMonth();
            })
            .reduce((sum, d) => sum + (d.amount || 0), 0),
        totalDonors: new Set(state.donations.map(d => d.donor)).size,
    };

    return (
        <AdminDataContext.Provider value={{ state, dispatch, activeProjects, featuredProjects, activePrograms, dashboardStats }}>
            {children}
        </AdminDataContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────
export function useAdminData() {
    const ctx = useContext(AdminDataContext);
    if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
    return ctx;
}

// ─── Action Creators (optional, for cleaner call sites) ──────
export const adminActions = {
    addProject: (project) => ({ type: 'ADD_PROJECT', payload: project }),
    updateProject: (project) => ({ type: 'UPDATE_PROJECT', payload: project }),
    deleteProject: (id) => ({ type: 'DELETE_PROJECT', payload: id }),
    toggleFeatured: (id) => ({ type: 'TOGGLE_FEATURED', payload: id }),
    addProgram: (program) => ({ type: 'ADD_PROGRAM', payload: program }),
    updateProgram: (program) => ({ type: 'UPDATE_PROGRAM', payload: program }),
    deleteProgram: (id) => ({ type: 'DELETE_PROGRAM', payload: id }),
    toggleProgramStatus: (id) => ({ type: 'TOGGLE_PROGRAM_STATUS', payload: id }),
    addDonation: (donation) => ({ type: 'ADD_DONATION', payload: donation }),
    updateStats: (stats) => ({ type: 'UPDATE_STATS', payload: stats }),
    resetAll: () => ({ type: 'RESET_ALL' }),
};

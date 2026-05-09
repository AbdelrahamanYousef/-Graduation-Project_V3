import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { projects as initialProjects, programs as initialPrograms, impactStats as initialStats, testimonials as initialTestimonials } from '../data/mockData';
import { donationsList as initialDonations, beneficiariesList as initialBeneficiaries, financeDisbursements as initialDisbursements, dashboardActivities as initialActivities } from '../data/adminMockData';

// ─── Storage Keys ────────────────────────────────────────────
const STORAGE_KEYS = {
    projects: 'nour_admin_projects',
    programs: 'nour_admin_programs',
    donations: 'nour_admin_donations',
    beneficiaries: 'nour_admin_beneficiaries',
    disbursements: 'nour_admin_disbursements',
    activities: 'nour_admin_activities',
    stats: 'nour_admin_stats',
    settings: 'nour_admin_settings',
    content: 'nour_admin_content',
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
        beneficiaries: loadFromStorage(STORAGE_KEYS.beneficiaries, initialBeneficiaries || []),
        disbursements: loadFromStorage(STORAGE_KEYS.disbursements, initialDisbursements || []),
        activities: loadFromStorage(STORAGE_KEYS.activities, initialActivities || []),
        stats: loadFromStorage(STORAGE_KEYS.stats, initialStats),
        settings: loadFromStorage(STORAGE_KEYS.settings, {
            orgName: 'مؤسسة نور الخيرية',
            email: 'info@nour.org',
            phone: '+20 2 1234 5678',
            address: 'القاهرة، مصر',
            primaryColor: '#00b16a',
            secondaryColor: '#f39c12',
            fontSize: 'normal',
            heroStyle: 'gradient',
            borderRadius: 'medium'
        }),
        content: loadFromStorage(STORAGE_KEYS.content, {
            heroBanner: {
                title: 'معاً نصنع الأمل ونبني المستقبل',
                subtitle: 'نعمل على توفير حياة كريمة للفئات الأكثر احتياجاً من خلال برامج تنموية مستدامة',
            },
            quranicVerses: [
                { id: 1, text: 'وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ ۖ وَهُوَ خَيْرُ الرَّازِقِينَ', reference: 'سورة سبأ: 39', active: true, type: 'quran' }
            ],
            islamicDisplayMode: 'rotating', // rotating, stacked
            islamicRotationInterval: 5,
            announcements: [
                { id: 1, title: 'عاجل', text: 'إغاثة عاجلة لإخواننا في غزة، تبرع الآن لإنقاذ الأرواح.', type: 'urgent', active: true, startDate: '', endDate: '' }
            ],
            testimonials: initialTestimonials || [],
            aboutUs: {
                story: 'مؤسسة خيرية تهدف للتنمية المستدامة.',
                vision: 'مجتمع متكافل ومستدام.',
                mission: 'توفير حياة كريمة للفئات الأكثر احتياجاً.',
                values: 'الشفافية، العطاء، التنمية.'
            },
            statsConfig: {
                override: false,
                totalDonations: 15000000,
                beneficiaries: 500000,
                projects: 120,
                years: 10
            },
            zakatConfig: {
                goldPrice: 3800,
                silverPrice: 45
            }
        }),
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

        case 'ADD_DONATION':
            return { ...state, donations: [...state.donations, action.payload] };

        case 'UPDATE_DONATION':
            return {
                ...state,
                donations: state.donations.map(d =>
                    d.id === action.payload.id ? { ...d, ...action.payload } : d
                ),
            };

        case 'DELETE_DONATION':
            return {
                ...state,
                donations: state.donations.filter(d => d.id !== action.payload),
            };

        // ── Beneficiaries ──
        case 'ADD_BENEFICIARY':
            return { ...state, beneficiaries: [...state.beneficiaries, action.payload] };
        case 'UPDATE_BENEFICIARY':
            return { ...state, beneficiaries: state.beneficiaries.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) };
        case 'DELETE_BENEFICIARY':
            return { ...state, beneficiaries: state.beneficiaries.filter(b => b.id !== action.payload) };

        // ── Disbursements ──
        case 'ADD_DISBURSEMENT':
            return { ...state, disbursements: [...state.disbursements, action.payload] };
        case 'UPDATE_DISBURSEMENT':
            return { ...state, disbursements: state.disbursements.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) };
        case 'DELETE_DISBURSEMENT':
            return { ...state, disbursements: state.disbursements.filter(d => d.id !== action.payload) };

        // ── Activities ──
        case 'ADD_ACTIVITY':
            return { 
                ...state, 
                activities: [
                    { id: Date.now(), timestamp: new Date().toISOString(), ...action.payload },
                    ...state.activities
                ].slice(0, 10) // Keep only last 10
            };

        // ── Stats ──
        case 'UPDATE_STATS':
            return { ...state, stats: { ...state.stats, ...action.payload } };

        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case 'UPDATE_CONTENT':
            return { ...state, content: { ...state.content, ...action.payload } };

        case 'SYNC_STATE':
            return {
                ...state,
                ...action.payload
            };

        case 'RESET_ALL':
            // Clear localStorage so we get fresh data from mockData
            Object.values(STORAGE_KEYS).forEach(key => {
                try { localStorage.removeItem(key); } catch { /* ignore */ }
            });
            return {
                projects: initialProjects,
                programs: initialPrograms,
                donations: initialDonations,
                beneficiaries: initialBeneficiaries || [],
                disbursements: initialDisbursements || [],
                activities: initialActivities || [],
                stats: initialStats,
                content: buildInitialState().content,
                settings: buildInitialState().settings,
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
        saveToStorage(STORAGE_KEYS.beneficiaries, state.beneficiaries);
    }, [state.beneficiaries]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.disbursements, state.disbursements);
    }, [state.disbursements]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.activities, state.activities);
    }, [state.activities]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.stats, state.stats);
    }, [state.stats]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.settings, state.settings);
    }, [state.settings]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.content, state.content);
    }, [state.content]);

    // ── Cross-tab Sync ──
    useEffect(() => {
        const handleStorageChange = (e) => {
            // Check if the modified key belongs to our context
            if (Object.values(STORAGE_KEYS).includes(e.key)) {
                // Re-build state from localStorage
                dispatch({ type: 'SYNC_STATE', payload: buildInitialState() });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ── Derived State (Computed in real-time from raw state) ──
    const derivedState = useMemo(() => {
        // 1. Projects with auto-calculated raised & donors (matched by projectId or title)
        const derivedProjects = state.projects.map(proj => {
            const projDonations = state.donations.filter(d =>
                (d.projectId === proj.id || d.project === proj.title) && d.status === 'completed'
            );
            const raised = projDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
            const donors = new Set(projDonations.map(d => d.donorName || d.donor || d.donorId)).size;
            return { ...proj, raised, donors };
        });

        // 2. Programs with linked project count & total raised
        const derivedPrograms = state.programs.map(prog => {
            const linkedProjects = derivedProjects.filter(p =>
                p.programId === prog.id || p.program === prog.name || p.program === prog.title
            );
            const raised = linkedProjects.reduce((sum, p) => sum + (p.raised || 0), 0);
            return { ...prog, projectCount: linkedProjects.length, raised };
        });

        // 3. Dashboard summary stats
        const completedDonations = state.donations.filter(d => d.status === 'completed');
        const dashboardStats = {
            totalDonations: completedDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0),
            totalProjects: derivedProjects.length,
            activeProjects: derivedProjects.filter(p => p.status === 'active').length,
            beneficiaries: state.beneficiaries.length,
            totalPrograms: derivedPrograms.length,
            pendingDisbursements: (state.disbursements || []).filter(d => d.status === 'pending').length,
        };

        return { ...state, projects: derivedProjects, programs: derivedPrograms, dashboardStats };
    }, [state]);

    return (
        <AdminDataContext.Provider value={{ state: derivedState, dispatch }}>
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
    updateDonation: (donation) => ({ type: 'UPDATE_DONATION', payload: donation }),
    deleteDonation: (id) => ({ type: 'DELETE_DONATION', payload: id }),
    addBeneficiary: (beneficiary) => ({ type: 'ADD_BENEFICIARY', payload: beneficiary }),
    updateBeneficiary: (beneficiary) => ({ type: 'UPDATE_BENEFICIARY', payload: beneficiary }),
    deleteBeneficiary: (id) => ({ type: 'DELETE_BENEFICIARY', payload: id }),
    addDisbursement: (disbursement) => ({ type: 'ADD_DISBURSEMENT', payload: disbursement }),
    updateDisbursement: (disbursement) => ({ type: 'UPDATE_DISBURSEMENT', payload: disbursement }),
    deleteDisbursement: (id) => ({ type: 'DELETE_DISBURSEMENT', payload: id }),
    addActivity: (activity) => ({ type: 'ADD_ACTIVITY', payload: activity }),
    updateStats: (stats) => ({ type: 'UPDATE_STATS', payload: stats }),
    updateSettings: (settings) => ({ type: 'UPDATE_SETTINGS', payload: settings }),
    updateContent: (content) => ({ type: 'UPDATE_CONTENT', payload: content }),
    resetAll: () => ({ type: 'RESET_ALL' }),
};

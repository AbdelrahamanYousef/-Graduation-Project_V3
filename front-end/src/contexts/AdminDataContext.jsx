import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { projects as initialProjects, programs as initialPrograms, impactStats as initialStats, testimonials as initialTestimonials } from '../data/mockData';
import { getPrograms, createProgram as apiCreateProgram, updateProgram as apiUpdateProgram, deleteProgram as apiDeleteProgram } from '../api/programs.api';
import { getProjects, createProject as apiCreateProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject, toggleProjectHighlight as apiToggleProjectHighlight } from '../api/projects.api';
import { getCampaigns } from '../api/campaigns.api';
import { donationsList as initialDonations, beneficiariesList as initialBeneficiaries, financeDisbursements as initialDisbursements, dashboardActivities as initialActivities } from '../data/adminMockData';

// ─── Storage Keys ────────────────────────────────────────────
const STORAGE_KEYS = {
    projects: 'nour_admin_projects',
    programs: 'nour_admin_programs',
    donations: 'nour_admin_donations',
    beneficiaries: 'nour_admin_beneficiaries',
    disbursements: 'nour_admin_disbursements',
    activities: 'nour_admin_activities',
    blogPosts: 'nour_admin_blogPosts',
    gallery: 'nour_admin_gallery',
    contactMessages: 'nour_admin_contactMessages',
    stats: 'nour_admin_stats',
    settings: 'nour_admin_settings',
    content: 'nour_admin_content',
    campaigns: 'nour_admin_campaigns',
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
        projects: [],
        programs: [],
        blogPosts: loadFromStorage(STORAGE_KEYS.blogPosts, [
            {
                id: 101,
                title: 'إطلاق القافلة الطبية الكبرى بمحافظة أسوان',
                summary: 'أطلقت جمعية نور الخيرية قافلة طبية متكاملة لتقديم الخدمات الطبية المجانية لأهالي قرى أسوان.',
                content: 'في إطار سعيها المستمر لدعم الرعاية الصحية في المناطق الأكثر احتياجاً، أطلقت مؤسسة نور الخيرية قافلة طبية شاملة بالتعاون مع نخبة من الأطباء في مختلف التخصصات. تمكنت القافلة من توقيع الكشف الطبي على أكثر من 1200 مستفيد وتوزيع الأدوية بالمجان، بالإضافة إلى تحويل الحالات الحرجة للمستشفيات لإجراء العمليات اللازمة.\n\nتأتي هذه القوافل امتداداً لجهود الجمعية في توفير الرعاية الصحية والطبية وتسهيل وصولها للأسر الأولى بالرعاية.',
                image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=450&fit=crop',
                images: [
                    { id: 1011, url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&h=350&fit=crop', caption: 'الكشف الطبي على الأطفال', order: 1 },
                    { id: 1012, url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=350&fit=crop', caption: 'صيدلية القافلة وتوزيع العلاج مجاناً', order: 2 }
                ],
                category: 'فعاليات',
                author: 'د. أحمد سمير',
                featured: true,
                status: 'published',
                publishedAt: '2026-06-20T10:00:00.000Z'
            },
            {
                id: 102,
                title: 'بدء توزيع المساعدات الغذائية للأسر المتعففة',
                summary: 'بدء الحملة السنوية لتوزيع الطرود الغذائية على الأسر الأولى بالرعاية في مختلف محافظات الصعيد.',
                content: 'انطلقت اليوم فرق متطوعي جمعية نور الخيرية لتوزيع أكثر من 5000 طرد غذائي متكامل يحتوي على المواد التموينية الأساسية للأسر المتعففة.\n\nتهدف الحملة إلى تخفيف الأعباء المعيشية عن كاهل هذه الأسر ومشاركتهم الفرحة والوقوف بجانبهم في مواجهة الظروف الاقتصادية الصعبة.',
                image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=450&fit=crop',
                images: [
                    { id: 1021, url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&h=350&fit=crop', caption: 'تجهيز طرود المواد الغذائية', order: 1 },
                    { id: 1022, url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=350&fit=crop', caption: 'الفرحة على وجوه متطوعي الجمعية', order: 2 }
                ],
                category: 'أخبار',
                author: 'رنا محمود',
                featured: false,
                status: 'published',
                publishedAt: '2026-06-15T08:30:00.000Z'
            },
            {
                id: 103,
                title: 'مشروع إفطار صائم وتوزيع وجبات الإفطار الساخنة',
                summary: 'مؤسسة نور الخيرية تسعد بتقديم وجبات إفطار صائم طازجة للمستحقين طوال شهر رمضان المبارك.',
                content: 'تواصل الجمعية تنفيذ مشروع إفطار صائم اليومي، حيث يتم إعداد وتعبئة وتوزيع الوجبات الساخنة والصحية بمشاركة فريق من الطهاة والمتطوعين.\n\nنشكر كل الداعمين والمساهمين في استمرارية هذا الخير وإدخال البهجة والسرور على قلوب الصائمين.',
                image: 'https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=800&h=450&fit=crop',
                images: [
                    { id: 1031, url: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?w=500&h=350&fit=crop', caption: 'تعبئة الوجبات الطازجة', order: 1 }
                ],
                category: 'فعاليات',
                author: 'كريم هاني',
                featured: false,
                status: 'published',
                publishedAt: '2026-05-30T16:00:00.000Z'
            }
        ]),
        gallery: loadFromStorage(STORAGE_KEYS.gallery, [
            { id: 1, title: 'توزيع المساعدات', description: 'فريق العمل أثناء توزيع المساعدات الغذائية', image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop', eventId: 102, order: 1 },
            { id: 2, title: 'تجهيز طرود الغذاء', description: 'فرز وتعبئة المواد الغذائية بالكراتين', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop', eventId: 102, order: 2 },
            { id: 3, title: 'القافلة الطبية بأسوان', description: 'توافد الأهالي لتلقي العلاج والكشف الطبي مجاناً', image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop', eventId: 101, order: 1 },
            { id: 4, title: 'كشف الأطفال بالقافلة', description: 'أطباء الأطفال يفحصون الحالات بقرية أسوان', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&h=600&fit=crop', eventId: 101, order: 2 },
            { id: 5, title: 'إعداد وجبات الإفطار', description: 'متطوعو المطبخ الخيري يجهزون وجبات الإفطار الساخنة', image: 'https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=800&h=600&fit=crop', eventId: 103, order: 1 },
            { id: 6, title: 'تعبئة وتغليف الوجبات', description: 'اللمسات النهائية قبل توزيع وجبات الإفطار', image: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?w=800&h=600&fit=crop', eventId: 103, order: 2 }
        ]),
        contactMessages: loadFromStorage(STORAGE_KEYS.contactMessages, []),
        campaigns: [],
        donations: [],
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
        content: (() => {
            const fallbackContent = {
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
                    useLiveApi: true,
                    goldPrice: 7700,
                    silverPrice: 129
                },
                heroSlides: [
                    { id: 1, title: 'معاً نصنع الأمل ونبني المستقبل', subtitle: 'نعمل على توفير حياة كريمة للفئات الأكثر احتياجاً من خلال برامج تنموية مستدامة', image: '', ctaText: 'تبرع الآن', ctaLink: '/donate', ctaIcon: 'fa-solid fa-heart', active: true },
                    { id: 2, title: 'زكاتك تصل لمستحقيها', subtitle: 'نضمن وصول زكاتك إلى مستحقيها بشفافية كاملة من خلال شبكة موثوقة من الشركاء المحليين', image: '', ctaText: 'احسب زكاتك', ctaLink: '/zakat', ctaIcon: 'fa-solid fa-calculator', active: true },
                    { id: 3, title: 'تطوع معنا واغتنم الأجر', subtitle: 'انضم إلى فريق المتطوعين لدينا وشارك في صنع الأثر الإيجابي في حياة المحتاجين', image: '', ctaText: 'انضم كمتطوع', ctaLink: '/volunteer', ctaIcon: 'fa-solid fa-handshake', active: true },
                ],
            };
            const loaded = loadFromStorage(STORAGE_KEYS.content, fallbackContent);
            if (loaded) {
                if (!loaded.zakatConfig) {
                    loaded.zakatConfig = { ...fallbackContent.zakatConfig };
                } else {
                    if (loaded.zakatConfig.goldPrice < 5000) {
                        loaded.zakatConfig.goldPrice = 7700;
                        loaded.zakatConfig.useLiveApi = true;
                    }
                    if (loaded.zakatConfig.silverPrice < 80) {
                        loaded.zakatConfig.silverPrice = 129;
                        loaded.zakatConfig.useLiveApi = true;
                    }
                    if (loaded.zakatConfig.useLiveApi === undefined) {
                        loaded.zakatConfig.useLiveApi = true;
                    }
                }
            }
            return loaded;
        })(),
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

        // ── Blog Posts ──
        case 'ADD_BLOG_POST':
            return { ...state, blogPosts: [...state.blogPosts, action.payload] };
        case 'UPDATE_BLOG_POST':
            return { ...state, blogPosts: state.blogPosts.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
        case 'DELETE_BLOG_POST':
            return { ...state, blogPosts: state.blogPosts.filter(p => p.id !== action.payload) };

        // ── Gallery ──
        case 'ADD_GALLERY_ITEM':
            return { ...state, gallery: [...state.gallery, action.payload] };
        case 'UPDATE_GALLERY_ITEM':
            return { ...state, gallery: state.gallery.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) };
        case 'DELETE_GALLERY_ITEM':
            return { ...state, gallery: state.gallery.filter(g => g.id !== action.payload) };

        // ── Contact Messages ──
        case 'ADD_CONTACT_MESSAGE':
            return { ...state, contactMessages: [action.payload, ...state.contactMessages] };
        case 'UPDATE_CONTACT_MESSAGE':
            return { ...state, contactMessages: state.contactMessages.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) };

        // ── Campaigns ──
        case 'ADD_CAMPAIGN':
            return { ...state, campaigns: [...state.campaigns, action.payload] };
        case 'UPDATE_CAMPAIGN':
            return { ...state, campaigns: state.campaigns.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
        case 'DELETE_CAMPAIGN':
            return { ...state, campaigns: state.campaigns.filter(c => c.id !== action.payload) };
        case 'TOGGLE_CAMPAIGN_STATUS':
            return {
                ...state,
                campaigns: state.campaigns.map(c =>
                    c.id === action.payload
                        ? { ...c, status: c.status === 'active' ? 'completed' : 'active' }
                        : c
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
                        ? { ...p, status: p.status === 'active' ? 'inactive' : p.status === 'inactive' ? 'draft' : 'active' }
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
                campaigns: [],
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

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.blogPosts, state.blogPosts);
    }, [state.blogPosts]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.gallery, state.gallery);
    }, [state.gallery]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.contactMessages, state.contactMessages);
    }, [state.contactMessages]);

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

    // ── Backend Sync Helpers ──
    const refreshAdminData = useCallback(async () => {
        try {
            const [programs, projectsRes, campaigns] = await Promise.all([
                getPrograms(),
                getProjects({ limit: 1000, showAll: true }),
                getCampaigns(),
            ]);
            const projects = projectsRes?.data || [];
            dispatch({ type: 'SYNC_STATE', payload: { programs, projects, campaigns } });
        } catch (e) {
            console.warn('Failed to refresh admin data', e);
        }
    }, []);

    useEffect(() => {
        refreshAdminData();
    }, [refreshAdminData]);

    // ── Derived State (Computed in real-time from raw state) ──
    const derivedState = useMemo(() => {
        // 1. Projects with auto-calculated raised & donors (matched by projectId or title)
        const derivedProjects = (state.projects || []).map(proj => {
            return {
                ...proj,
                raised: Number(proj.raised || 0),
                donors: Number(proj.donorsCount || proj.donors || 0),
                image: proj.imageUrl || proj.image
            };
        });

        // 2. Programs with linked project count & total raised
        const derivedPrograms = (state.programs || []).map(prog => {
            const linkedProjects = derivedProjects.filter(p =>
                p.programId === prog.id || p.program === prog.name || p.program === prog.title
            );
            const raised = linkedProjects.reduce((sum, p) => sum + (p.raised || 0), 0);
            return { ...prog, projectCount: linkedProjects.length, raised };
        });

        // 3. Dynamic Donation Categories for donor views
        const donationCategories = derivedPrograms.map(prog => {
            const items = derivedProjects
                .filter(p => p.programId === prog.id)
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.donationAmount || 0,
                    goal: p.goal || 0,
                    raised: p.raised || 0,
                    donorsCount: p.donors || 0,
                    status: p.status || 'active',
                    isHighlighted: p.isHighlighted || false,
                    image: p.image || p.imageUrl
                }));
            return {
                id: prog.id,
                name: prog.name,
                icon: prog.icon || 'fa-solid fa-folder',
                color: prog.color || '#00b16a',
                isHighlighted: prog.isHighlighted || false,
                items
            };
        });

        // 4. Campaigns with auto-calculated raised & donors
        const derivedCampaigns = (state.campaigns || []).map(camp => {
            return {
                ...camp,
                raised: Number(camp.raised || 0),
                donorsCount: Number(camp.donorsCount || 0)
            };
        });

        // 5. Dashboard summary stats
        const dashboardStats = {
            totalDonations: derivedProjects.reduce((sum, p) => sum + p.raised, 0) + derivedCampaigns.reduce((sum, c) => sum + c.raised, 0),
            totalProjects: derivedProjects.length,
            activeProjects: derivedProjects.filter(p => p.status === 'active' || p.status === 'ACTIVE').length,
            beneficiaries: (state.beneficiaries || []).length,
            totalPrograms: derivedPrograms.length,
            pendingDisbursements: (state.disbursements || []).filter(d => d.status === 'pending').length,
        };

        return { ...state, projects: derivedProjects, programs: derivedPrograms, campaigns: derivedCampaigns, dashboardStats, donationCategories };
    }, [state]);

    const api = {
        refreshAdminData,
        createProgram: async (data) => { const res = await apiCreateProgram(data); await refreshAdminData(); return res; },
        updateProgram: async (id, data) => { const res = await apiUpdateProgram(id, data); await refreshAdminData(); return res; },
        deleteProgram: async (id) => { const res = await apiDeleteProgram(id); await refreshAdminData(); return res; },
        toggleProgramHighlight: async () => {},
        createProject: async (data) => { const res = await apiCreateProject(data); await refreshAdminData(); return res; },
        updateProject: async (id, data) => { const res = await apiUpdateProject(id, data); await refreshAdminData(); return res; },
        deleteProject: async (id) => { const res = await apiDeleteProject(id); await refreshAdminData(); return res; },
        toggleProjectHighlight: async (id, isHighlighted) => { const res = await apiToggleProjectHighlight(id, isHighlighted); await refreshAdminData(); return res; },
    };

    return (
        <AdminDataContext.Provider value={{ state: derivedState, dispatch, api }}>
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
    addCampaign: (campaign) => ({ type: 'ADD_CAMPAIGN', payload: campaign }),
    updateCampaign: (campaign) => ({ type: 'UPDATE_CAMPAIGN', payload: campaign }),
    deleteCampaign: (id) => ({ type: 'DELETE_CAMPAIGN', payload: id }),
    toggleCampaignStatus: (id) => ({ type: 'TOGGLE_CAMPAIGN_STATUS', payload: id }),
    resetAll: () => ({ type: 'RESET_ALL' }),
};

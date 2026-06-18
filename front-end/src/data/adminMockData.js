/**
 * Admin Mock Data — Centralized mock data for all admin pages.
 * When migrating to a real API, replace imports from this file
 * with API calls in the corresponding hooks.
 */

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardRecentDonations = [];

export const dashboardPendingTasks = [];

export const dashboardActivities = [];

// ─── Donations ───────────────────────────────────────────────
export const donationsList = [];

// ─── Beneficiaries ────────────────────────────────────────────
export const beneficiariesList = [];

// ─── Finance ──────────────────────────────────────────────────
export const financeMonthlyData = [];

export const financeDisbursements = [];

// ─── Reports ──────────────────────────────────────────────────
export const recentReports = [];

export const reportTypes = [
    { title: 'تقرير التبرعات', desc: 'تحليل شامل للتبرعات والمتبرعين', icon: 'fa-solid fa-coins', color: 'success' },
    { title: 'تقرير المستفيدين', desc: 'إحصائيات المستفيدين والحالات', icon: 'fa-solid fa-users', color: 'primary' },
    { title: 'تقرير المشاريع', desc: 'أداء المشاريع ونسب الإنجاز', icon: 'fa-solid fa-folder-open', color: 'warning' },
    { title: 'التقرير المالي', desc: 'الإيرادات والمصروفات والميزانية', icon: 'fa-solid fa-chart-pie', color: 'info' },
];

// ─── Settings ─────────────────────────────────────────────────
export const settingsUsers = [];

export const settingsIntegrations = [
    { name: 'فودافون كاش', icon: 'fa-solid fa-mobile-screen', status: 'connected', desc: 'بوابة الدفع الإلكتروني', color: 'error' },
    { name: 'فوري', icon: 'fa-solid fa-credit-card', status: 'connected', desc: 'نقاط الدفع', color: 'primary' },
    { name: 'PayMob', icon: 'fa-solid fa-coins', status: 'disconnected', desc: 'معالج المدفوعات', color: 'info' },
    { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', status: 'connected', desc: 'إشعارات واتساب', color: 'success' },
];

export const settingsNotifications = [
    { label: 'تبرع جديد', desc: 'إشعار عند استلام تبرع جديد', enabled: true },
    { label: 'طلب صرف', desc: 'إشعار عند وجود طلب صرف معلق', enabled: true },
    { label: 'حالة جديدة', desc: 'إشعار عند إضافة مستفيد جديد', enabled: false },
    { label: 'تقرير أسبوعي', desc: 'ملخص أسبوعي بالنشاطات', enabled: true },
];

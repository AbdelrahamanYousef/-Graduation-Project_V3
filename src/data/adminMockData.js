/**
 * Admin Mock Data — Centralized mock data for all admin pages.
 * When migrating to a real API, replace imports from this file
 * with API calls in the corresponding hooks.
 */

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardRecentDonations = [
    { id: 1, donor: 'أحمد محمد', amount: 500, project: 'كسوة الشتاء', time: 'منذ 5 دقائق', type: 'صدقة' },
    { id: 2, donor: 'سارة علي', amount: 1000, project: 'كفالة الأيتام', time: 'منذ 15 دقيقة', type: 'زكاة' },
    { id: 3, donor: 'محمود حسن', amount: 200, project: 'تبرع عام', time: 'منذ 30 دقيقة', type: 'صدقة' },
    { id: 4, donor: 'فاطمة أحمد', amount: 2000, project: 'إفطار الصائمين', time: 'منذ ساعة', type: 'وقف' },
    { id: 5, donor: 'خالد عبدالله', amount: 350, project: 'القافلة الطبية', time: 'منذ ساعتين', type: 'صدقة' },
];

export const dashboardPendingTasks = [
    { id: 1, title: 'مراجعة طلب استحقاق جديد', priority: 'high', assignee: 'سارة' },
    { id: 2, title: 'اعتماد صرف دفعة مشروع الشتاء', priority: 'medium', assignee: 'أحمد' },
    { id: 3, title: 'تحديث بيانات 5 مستفيدين', priority: 'low', assignee: 'محمد' },
    { id: 4, title: 'مراجعة تقرير الربع الثالث', priority: 'medium', assignee: 'فاطمة' },
];

export const dashboardActivities = [
    { id: 1, action: 'تمت إضافة مشروع جديد', user: 'محمد أحمد', time: 'منذ 10 دقائق', icon: 'fa-solid fa-plus', color: 'primary' },
    { id: 2, action: 'تم اعتماد طلب استحقاق', user: 'سارة علي', time: 'منذ 30 دقيقة', icon: 'fa-solid fa-check', color: 'success' },
    { id: 3, action: 'تم تحديث بيانات مستفيد', user: 'أحمد خالد', time: 'منذ ساعة', icon: 'fa-solid fa-pen', color: 'info' },
    { id: 4, action: 'تم إغلاق دفعة توزيع', user: 'فاطمة حسن', time: 'منذ ساعتين', icon: 'fa-solid fa-box', color: 'warning' },
];

// ─── Donations ───────────────────────────────────────────────
export const donationsList = [
    { id: 1, donor: 'أحمد محمد', project: 'مشروع المياه النظيفة', amount: 5000, date: '2024-01-15', method: 'بطاقة ائتمان', status: 'completed' },
    { id: 2, donor: 'فاطمة علي', project: 'كفالة يتيم', amount: 1500, date: '2024-01-14', method: 'فودافون كاش', status: 'completed' },
    { id: 3, donor: 'خالد عبدالله', project: 'القافلة الطبية', amount: 10000, date: '2024-01-13', method: 'تحويل بنكي', status: 'pending' },
    { id: 4, donor: 'سارة أحمد', project: 'تجهيز فصول دراسية', amount: 2500, date: '2024-01-12', method: 'بطاقة ائتمان', status: 'completed' },
    { id: 5, donor: 'محمود حسن', project: 'إفطار صائم', amount: 500, date: '2024-01-11', method: 'فوري', status: 'completed' },
    { id: 6, donor: 'نورة السيد', project: 'مشروع المياه النظيفة', amount: 3000, date: '2024-01-10', method: 'بطاقة ائتمان', status: 'refunded' },
];

// ─── Beneficiaries ────────────────────────────────────────────
export const beneficiariesList = [
    { id: 1, name: 'عائلة محمد أحمد', type: 'أسرة', program: 'رعاية الأيتام', status: 'active', cases: 2, location: 'القاهرة' },
    { id: 2, name: 'فاطمة السيد', type: 'فرد', program: 'الرعاية الصحية', status: 'active', cases: 1, location: 'الجيزة' },
    { id: 3, name: 'عائلة حسن علي', type: 'أسرة', program: 'التعليم', status: 'pending', cases: 3, location: 'الإسكندرية' },
    { id: 4, name: 'أحمد محمود', type: 'فرد', program: 'الإغاثة العاجلة', status: 'inactive', cases: 1, location: 'المنيا' },
    { id: 5, name: 'عائلة خالد عمر', type: 'أسرة', program: 'رعاية الأيتام', status: 'active', cases: 4, location: 'أسوان' },
];

// ─── Finance ──────────────────────────────────────────────────
export const financeMonthlyData = [
    { month: 'يناير', income: 450000, expenses: 380000 },
    { month: 'فبراير', income: 520000, expenses: 410000 },
    { month: 'مارس', income: 480000, expenses: 420000 },
    { month: 'أبريل', income: 610000, expenses: 490000 },
];

export const financeDisbursements = [
    { id: 1, beneficiary: 'عائلة محمد أحمد', amount: 2500, type: 'دعم شهري', date: '2024-01-15', status: 'pending' },
    { id: 2, beneficiary: 'فاطمة السيد', amount: 5000, type: 'علاج طبي', date: '2024-01-14', status: 'approved' },
    { id: 3, beneficiary: 'مدرسة النور', amount: 15000, type: 'مستلزمات تعليمية', date: '2024-01-13', status: 'completed' },
    { id: 4, beneficiary: 'عائلة حسن علي', amount: 3000, type: 'إغاثة عاجلة', date: '2024-01-12', status: 'completed' },
];

// ─── Reports ──────────────────────────────────────────────────
export const recentReports = [
    { id: 1, title: 'تقرير التبرعات الشهري', type: 'donations', period: 'يناير 2024', generated: '2024-01-31', icon: 'fa-solid fa-coins', color: 'success' },
    { id: 2, title: 'تقرير المستفيدين', type: 'beneficiaries', period: 'الربع الأول 2024', generated: '2024-01-15', icon: 'fa-solid fa-users', color: 'primary' },
    { id: 3, title: 'تقرير المشاريع', type: 'projects', period: 'السنة المالية 2023', generated: '2024-01-01', icon: 'fa-solid fa-folder-open', color: 'warning' },
    { id: 4, title: 'التقرير المالي', type: 'finance', period: 'ديسمبر 2023', generated: '2024-01-05', icon: 'fa-solid fa-chart-pie', color: 'info' },
];

export const reportTypes = [
    { title: 'تقرير التبرعات', desc: 'تحليل شامل للتبرعات والمتبرعين', icon: 'fa-solid fa-coins', color: 'success' },
    { title: 'تقرير المستفيدين', desc: 'إحصائيات المستفيدين والحالات', icon: 'fa-solid fa-users', color: 'primary' },
    { title: 'تقرير المشاريع', desc: 'أداء المشاريع ونسب الإنجاز', icon: 'fa-solid fa-folder-open', color: 'warning' },
    { title: 'التقرير المالي', desc: 'الإيرادات والمصروفات والميزانية', icon: 'fa-solid fa-chart-pie', color: 'info' },
];

// ─── Settings ─────────────────────────────────────────────────
export const settingsUsers = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@nour.org', role: 'مدير', status: 'active' },
    { id: 2, name: 'فاطمة علي', email: 'fatma@nour.org', role: 'محاسب', status: 'active' },
    { id: 3, name: 'خالد عبدالله', email: 'khaled@nour.org', role: 'منسق برامج', status: 'active' },
    { id: 4, name: 'سارة أحمد', email: 'sara@nour.org', role: 'موظف', status: 'inactive' },
];

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

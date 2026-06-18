// Mock data for Nour Charity System
// Egyptian market - EGP currency, Arabic names, governorates

export const impactStats = {
    totalDonations: 0,
    beneficiaries: 0,
    projects: 0,
    donors: 0,
};

export const programs = [];

export const projects = [];

export const donationTypes = [
    { id: 'sadaqah', name: 'صدقة جارية', nameEn: 'Sadaqah Jariyah', icon: 'fa-solid fa-hand-holding-heart' },
    { id: 'zakat', name: 'زكاة المال', nameEn: 'Zakat al-Mal', icon: 'fa-solid fa-star-and-crescent' },
    { id: 'kafala', name: 'كفالة يتيم', nameEn: 'Orphan Sponsorship', icon: 'fa-solid fa-children' },
    { id: 'waqf', name: 'سهم في وقف', nameEn: 'Waqf Share', icon: 'fa-solid fa-mosque' },
    { id: 'fidya', name: 'فدية صيام', nameEn: 'Fidya', icon: 'fa-solid fa-bowl-food' },
];

export const paymentMethods = [
    { id: 'card', name: 'بطاقة بنكية', nameEn: 'Credit Card', icon: 'fa-solid fa-credit-card' },
    { id: 'vodafone', name: 'فودافون كاش', nameEn: 'Vodafone Cash', icon: 'fa-solid fa-mobile-screen' },
    { id: 'insta', name: 'InstaPay', nameEn: 'InstaPay', icon: 'fa-solid fa-bolt' },
    { id: 'fawry', name: 'فوري', nameEn: 'Fawry', icon: 'fa-solid fa-store' },
    { id: 'bank', name: 'تحويل بنكي', nameEn: 'Bank Transfer', icon: 'fa-solid fa-building-columns' },
];

export const donationAmounts = [50, 100, 200, 500, 1000, 5000];

export const updates = [];

export const testimonials = [];

const categoryColors = {
    'food-boxes': ['#e8f5e9', '#4caf50'],
    'iftar': ['#fff3e0', '#ff9800'],
    'education': ['#e3f2fd', '#2196f3'],
    'food-support': ['#fce4ec', '#e91e63'],
    'relief': ['#f3e5f5', '#9c27b0'],
    'human-cases': ['#fff8e1', '#ffc107'],
    'urgent': ['#fbe9e7', '#ff5722'],
    'economic': ['#e0f2f1', '#009688'],
    'social': ['#e8eaf6', '#3f51b5'],
    'engineering': ['#fff3e0', '#ff6f00'],
    'winter': ['#e1f5fe', '#03a9f4'],
    'health': ['#fce4ec', '#f44336'],
};

export { categoryColors };
export const donationCategories = [
    {
        id: 'food-boxes',
        name: 'كراتين طعام',
        icon: 'fa-solid fa-box-open',
        items: [
            { id: 'fb-13', title: 'كرتونة طعام (13 كجم)', price: 540 },
            { id: 'fb-10', title: 'كرتونة طعام (10 كجم)', price: 445 },
            { id: 'fb-7', title: 'كرتونة طعام (7.5 كجم)', price: 335 },
            { id: 'fb-6', title: 'كرتونة طعام (6 كجم)', price: 260 },
        ],
    },
    {
        id: 'iftar',
        name: 'إفطار صائم',
        icon: 'fa-solid fa-utensils',
        items: [
            { id: 'if-1', title: 'لحمة', price: 85 },
            { id: 'if-2', title: 'كفتة', price: 65 },
            { id: 'if-3', title: 'فراخ', price: 80 },
        ],
    },
    {
        id: 'education',
        name: 'التعليم',
        icon: 'fa-solid fa-graduation-cap',
        items: [
            { id: 'ed-1', title: 'راجع مدرستي', price: 500 },
            { id: 'ed-2', title: 'التعليم حياة', price: 500 },
            { id: 'ed-3', title: 'حملات التوعية', price: 200 },
            { id: 'ed-4', title: 'تطوير المدارس', price: 1000 },
            { id: 'ed-5', title: 'اكفل تعليم طفل', price: 500 },
            { id: 'ed-6', title: 'شنطة أدوات مدرسية', price: 450 },
        ],
    },
    {
        id: 'food-support',
        name: 'الدعم الغذائي',
        icon: 'fa-solid fa-bowl-food',
        items: [
            { id: 'fs-1', title: 'لقمة كريمة', price: 20 },
            { id: 'fs-2', title: 'لحوم صدقات بلدي', price: 380 },
            { id: 'fs-3', title: 'مشروع مطبخ الكرم', price: 1000 },
        ],
    },
    {
        id: 'relief',
        name: 'الدعم الإغاثي الدولي',
        icon: 'fa-solid fa-earth-asia',
        items: [
            { id: 'rl-1', title: 'مساعدات غزة', price: 500 },
        ],
    },
    {
        id: 'human-cases',
        name: 'حالات إنسانية',
        icon: 'fa-solid fa-hand-holding-heart',
        items: [
            { id: 'hc-1', title: 'تشييد أسقف للمنازل', price: 500 },
            { id: 'hc-2', title: 'وصلات مياه وكهرباء', price: 250 },
            { id: 'hc-3', title: 'فك كرب غارمين', price: 250 },
            { id: 'hc-4', title: 'تجهيز يتيمات للزواج', price: 500 },
            { id: 'hc-5', title: 'تروسيكل لذوي الهمم', price: 500 },
            { id: 'hc-6', title: 'ماكينة خياطة', price: 500 },
        ],
    },
    {
        id: 'urgent',
        name: 'حالات عاجلة',
        icon: 'fa-solid fa-bell',
        items: [
            { id: 'ur-1', title: 'جهاز تنفس صناعي', price: 500 },
            { id: 'ur-2', title: 'مساعدة حالات طبية', price: 500 },
        ],
    },
    {
        id: 'economic',
        name: 'التمكين الاقتصادي',
        icon: 'fa-solid fa-briefcase',
        items: [
            { id: 'ec-1', title: 'مشغل خياطة للفتيات', price: 1000 },
            { id: 'ec-2', title: 'تدريب مهني', price: 200 },
            { id: 'ec-3', title: 'شنطة عدة', price: 150 },
        ],
    },
    {
        id: 'social',
        name: 'التمكين الاجتماعي',
        icon: 'fa-solid fa-people-group',
        items: [
            { id: 'so-1', title: 'قوافل السعادة', price: 500 },
            { id: 'so-2', title: 'المعسكرات الشبابية', price: 500 },
            { id: 'so-3', title: 'انت الحياة', price: 500 },
        ],
    },
    {
        id: 'engineering',
        name: 'القطاع الهندسي',
        icon: 'fa-solid fa-helmet-safety',
        items: [
            { id: 'en-1', title: 'سكن كريم', price: 500 },
        ],
    },
    {
        id: 'winter',
        name: 'كرمك دفا',
        icon: 'fa-solid fa-snowflake',
        items: [
            { id: 'wn-1', title: 'سقف', price: 500 },
            { id: 'wn-2', title: 'بطانية صوف', price: 350 },
            { id: 'wn-3', title: 'وجبة ساخنة', price: 65 },
            { id: 'wn-4', title: 'سرير ومرتبة', price: 2000 },
            { id: 'wn-5', title: 'لبس الشتاء', price: 550 },
        ],
    },
    {
        id: 'health',
        name: 'الصحة',
        icon: 'fa-solid fa-heart-pulse',
        items: [
            { id: 'he-1', title: 'تأهيل طفل من ذوي الإعاقة', price: 200 },
            { id: 'he-2', title: 'أطراف صناعية', price: 500 },
            { id: 'he-3', title: 'علاج شهري', price: 200 },
            { id: 'he-4', title: 'قافلة طبية', price: 500 },
            { id: 'he-5', title: 'علاج طفل في حضانات', price: 500 },
            { id: 'he-6', title: 'عملية مريض', price: 1000 },
        ],
    },
];

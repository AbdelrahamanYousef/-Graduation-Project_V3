// Mock data for Nour Charity System
// Egyptian market - EGP currency, Arabic names, governorates

export const impactStats = {
    totalDonations: 45750000,
    beneficiaries: 85400,
    projects: 120,
    donors: 15300,
};

export const programs = [
    { id: 1, name: 'كفالة الأيتام', nameEn: 'Orphan Sponsorship', icon: 'fa-solid fa-children', color: '#0B6B6B' },
    { id: 2, name: 'الرعاية الصحية', nameEn: 'Healthcare', icon: 'fa-solid fa-hospital', color: '#1E9E54' },
    { id: 3, name: 'سقيا الماء', nameEn: 'Water Projects', icon: 'fa-solid fa-faucet-drip', color: '#3498DB' },
    { id: 4, name: 'الإغاثة العاجلة (غزة والسودان)', nameEn: 'Emergency Relief (Gaza & Sudan)', icon: 'fa-solid fa-hand-holding-medical', color: '#C0392B' },
    { id: 5, name: 'ستر وتزويج', nameEn: 'Marriage Support', icon: 'fa-solid fa-ring', color: '#8E44AD' },
    { id: 6, name: 'إعمار البيوت', nameEn: 'House Renovation', icon: 'fa-solid fa-house-chimney', color: '#D35400' },
];

export const projects = [
    {
        id: 1,
        programId: 1,
        title: 'كفالة 500 يتيم في الصعيد',
        titleEn: 'Sponsor 500 Orphans in Upper Egypt',
        description: 'كفالة شهرية شاملة (تعليم، صحة، غذاء) للأيتام في قرى قنا وسوهاج. قال ﷺ: (أنا وكافل اليتيم في الجنة كهاتين).',
        location: 'قنا وسوهاج',
        goal: 1500000,
        raised: 850000,
        donors: 1240,
        image: 'https://placehold.co/600x400/0B6B6B/ffffff?text=Orphan+Sponsorship',
        status: 'active',
    },
    {
        id: 2,
        programId: 4,
        title: 'إغاثة طبية عاجلة لمستشفيات غزة',
        titleEn: 'Emergency Medical Aid for Gaza Hospitals',
        description: 'توفير المستلزمات الطبية والأدوات الجراحية للمستشفيات الميدانية في قطاع غزة.',
        location: 'غزة، فلسطين',
        goal: 5000000,
        raised: 3750000,
        donors: 8500,
        image: 'https://placehold.co/600x400/C0392B/ffffff?text=Gaza+Medical+Aid',
        status: 'active',
    },
    {
        id: 3,
        programId: 2,
        title: 'دعم مراكز غسيل الكلى',
        titleEn: 'Dialysis Center Support',
        description: 'توفير جلسات غسيل كلى لغير القادرين. تكلفة الجلسة الواحدة 750 جنيه تساهم في إنقاذ حياة.',
        location: 'القاهرة والجيزة',
        goal: 600000,
        raised: 120000,
        donors: 150,
        image: 'https://placehold.co/600x400/1E9E54/ffffff?text=Dialysis+Support',
        status: 'active',
    },
    {
        id: 4,
        programId: 6,
        title: 'أسقف تحمي من البرد والمطر',
        titleEn: 'Roofing Project',
        description: 'تركيب أسقف آمنة لـ 50 منزل متهالك في القرى الفقيرة قبل دخول الشتاء.',
        location: 'المنيا وبني سويف',
        goal: 400000,
        raised: 380000,
        donors: 620,
        image: 'https://placehold.co/600x400/D35400/ffffff?text=Roofing+Project',
        status: 'active', // Nearly funded
    },
    {
        id: 5,
        programId: 4,
        title: 'سلات غذائية للاجئين السودانيين',
        titleEn: 'Food Baskets for Sudan Refugees',
        description: 'توفير سلات غذائية تكفي الأسرة لمدة شهر للإخوة السودانيين النازحين.',
        location: 'الحدود المصرية السودانية',
        goal: 2000000,
        raised: 450000,
        donors: 310,
        image: 'https://placehold.co/600x400/C0392B/ffffff?text=Sudan+Food+Relief',
        status: 'active',
    },
    {
        id: 6,
        programId: 3,
        title: 'حفر 10 آبار ارتوازية',
        titleEn: 'Drilling 10 Artesian Wells',
        description: 'صدقة جارية توفر الماء العذب لقرى بأكملها تعاني من نقص المياه.',
        location: 'مطروح والوادي الجديد',
        goal: 800000,
        raised: 800000,
        donors: 1100,
        image: 'https://placehold.co/600x400/3498DB/ffffff?text=Clean+Water',
        status: 'completed',
    },
    {
        id: 7,
        programId: 5,
        title: 'تجهيز 20 عروسة يتيمة',
        titleEn: 'Marriage Support for 20 Orphan Brides',
        description: 'المساهمة في جهاز 20 فتاة يتيمة لإتمام زواجهن وإدخال السرور على قلوبهن.',
        location: 'الفيوم',
        goal: 300000,
        raised: 150000,
        donors: 280,
        image: 'https://placehold.co/600x400/8E44AD/ffffff?text=Brides+Support',
        status: 'active',
    },
];

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

export const updates = [
    {
        id: 1,
        projectId: 2,
        title: 'وصول قافلة المساعدات الثالثة إلى غزة',
        titleEn: '3rd Aid Convoy Reaches Gaza',
        date: '2024-02-10',
        icon: 'fa-solid fa-truck-medical',
    },
    {
        id: 2,
        projectId: 4,
        title: 'الانتهاء من تسقيف 30 منزلاً في بني سويف',
        titleEn: '30 Homes Roofed in Beni Suef',
        date: '2024-02-05',
        icon: 'fa-solid fa-house-chimney',
    },
    {
        id: 3,
        projectId: 1,
        title: 'حفل تكريم المتفوقين من الأيتام المكفولين',
        titleEn: 'Honoring Top Orphan Students',
        date: '2024-01-28',
        icon: 'fa-solid fa-award',
    },
];

export const testimonials = [
    {
        id: 1,
        name: 'أحمد محمد',
        nameEn: 'Ahmed Mohamed',
        role: 'متبرع منتظم',
        roleEn: 'Regular Donor',
        text: 'تجربتي مع نور كانت رائعة. أستطيع متابعة كل تبرعاتي ومعرفة أين تذهب أموالي بشفافية كاملة.',
        textEn: 'My experience with Nour has been amazing. I can track all my donations and know exactly where my money goes with full transparency.',
        avatarInitial: 'أ'
    },
    {
        id: 2,
        name: 'سارة أحمد',
        nameEn: 'Sara Ahmed',
        role: 'مديرة مشروع',
        roleEn: 'Project Manager',
        text: 'بفضل دعمكم استطعنا توفير كسوة الشتاء لأكثر من 500 أسرة. شكرًا لكل من ساهم في هذا العمل الخيري.',
        textEn: 'Thanks to your support, we were able to provide winter clothing for over 500 families. Thank you to everyone who contributed.',
        avatarInitial: 'س'
    },
    {
        id: 3,
        name: 'محمد علي',
        nameEn: 'Mohamed Ali',
        role: 'متطوع',
        roleEn: 'Volunteer',
        text: 'كمتطوع في نور، أشهد يوميًا على التأثير الحقيقي الذي تحدثه تبرعاتكم في حياة المحتاجين.',
        textEn: 'As a volunteer at Nour, I witness daily the real impact your donations make in the lives of those in need.',
        avatarInitial: 'م'
    },
];

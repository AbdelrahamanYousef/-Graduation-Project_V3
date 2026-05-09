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

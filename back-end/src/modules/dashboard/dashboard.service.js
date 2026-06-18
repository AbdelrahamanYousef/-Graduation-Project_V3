const prisma = require('../../lib/prisma');

async function getStats() {
    const [revenue, activeProjects, pendingCases, monthlyDonations] = await Promise.all([
        prisma.donation.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
        prisma.project.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'PENDING', deletedAt: null } }),
        prisma.donation.aggregate({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
            },
            _sum: { amount: true },
            _count: { id: true },
        }),
    ]);

    return {
        totalRevenue: revenue._sum.amount || 0,
        totalRevenueChange: "+0%", // mocked
        activeProjects,
        activeProjectsChange: "+0", // mocked
        pendingCases,
        pendingCasesChange: "-0", // mocked
        monthlyDonations: monthlyDonations._sum.amount || 0,
        monthlyDonationsChange: "+0%", // mocked
    };
}

async function getRecentDonations(limit = 5) {
    const data = await prisma.donation.findMany({
        where: { status: 'SUCCESS' },
        take: parseInt(limit) || 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, amount: true, fullName: true, isAnonymous: true, type: true, createdAt: true, project: { select: { title: true } } },
    });
    
    return data.map(d => ({
        id: d.id,
        donor: d.fullName || 'متبرع مجهول',
        amount: Number(d.amount),
        project: d.project?.title || 'عام',
        type: d.type === 'SADAQAH' ? 'صدقة' : d.type === 'ZAKAT' ? 'زكاة' : 'عام',
        time: d.createdAt.toISOString()
    }));
}

async function getProjectsSummary() {
    const projects = await prisma.project.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true, title: true, goal: true, raised: true, donorsCount: true, status: true },
        orderBy: { raised: 'desc' },
        take: 10,
    });
    
    return projects.map(p => ({
        id: p.id,
        title: p.title,
        titleEn: "",
        progress: Math.round((Number(p.raised) / Number(p.goal)) * 100),
        raised: Number(p.raised),
        goal: Number(p.goal),
        donors: p.donorsCount,
        status: p.status.toLowerCase()
    }));
}

async function getRecentActivity(limit = 10) {
    const [donations, disbursements] = await Promise.all([
        prisma.donation.findMany({ where: { status: 'SUCCESS' }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, fullName: true, createdAt: true, type: true } }),
        prisma.disbursement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { beneficiary: { select: { name: true } } } }),
    ]);

    const activities = [
        ...donations.map(d => ({ id: `don-${d.id}`, action: 'تم استلام تبرع جديد', user: d.fullName || 'متبرع مجهول', time: d.createdAt.toISOString(), icon: 'fa-solid fa-hand-holding-dollar', color: 'primary' })),
        ...disbursements.map(d => ({ id: `disb-${d.id}`, action: 'تم صرف مبلغ', user: d.beneficiary.name, time: d.createdAt.toISOString(), icon: 'fa-solid fa-money-bill-wave', color: 'success' })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, limit);

    return activities;
}

// Mocked pending tasks
const pendingTasksMock = [
    { id: 1, title: "مراجعة طلب استحقاق جديد", priority: "high", assignee: "سارة" },
    { id: 2, title: "تحديث بيانات مشروع كسوة الشتاء", priority: "medium", assignee: "أحمد" }
];

async function getPendingTasks() {
    return pendingTasksMock;
}

async function completeTask(id) {
    return { success: true };
}

module.exports = { getStats, getRecentDonations, getProjectsSummary, getRecentActivity, getPendingTasks, completeTask };

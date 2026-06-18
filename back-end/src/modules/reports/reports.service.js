const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    return prisma.report.findMany({
        include: { generatedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: parseInt(query.limit) || 20,
    });
}

async function create(data, userId) {
    return prisma.report.create({
        data: { title: data.title, type: data.type, period: data.period, generatedById: userId },
    });
}

async function getById(id) {
    const r = await prisma.report.findUnique({ where: { id }, include: { generatedBy: { select: { name: true } } } });
    if (!r) throw ApiError.notFound('Report not found');
    return r;
}

async function getQuickStats() {
    const [donations, users, beneficiaries, projects] = await Promise.all([
        prisma.donation.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: { id: true } }),
        prisma.user.count({ where: { role: 'USER', deletedAt: null } }),
        prisma.beneficiary.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
        prisma.project.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
    ]);
    return {
        totalDonations: donations._sum.amount || 0,
        donationCount: donations._count.id || 0,
        donorCount: users,
        activeBeneficiaries: beneficiaries,
        completedProjects: projects,
    };
}

module.exports = { list, create, getById, getQuickStats };

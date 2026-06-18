const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function listDisbursements(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.disbursement.findMany({
            where, skip, take: limit,
            include: {
                beneficiary: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.disbursement.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

async function createDisbursement(data) {
    const b = await prisma.beneficiary.findFirst({ where: { id: data.beneficiaryId, deletedAt: null } });
    if (!b) throw ApiError.notFound('Beneficiary not found');
    return prisma.disbursement.create({ data, include: { beneficiary: { select: { id: true, name: true } } } });
}

async function updateStatus(id, status, userId = null) {
    const d = await prisma.disbursement.findUnique({ where: { id } });
    if (!d) throw ApiError.notFound('Disbursement not found');

    const updateData = { status };
    if (status === 'APPROVED' && userId) updateData.approvedById = userId;

    return prisma.disbursement.update({ where: { id }, data: updateData });
}

async function getOverview(year) {
    const [revenue, expenses, pending] = await Promise.all([
        prisma.donation.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
        prisma.disbursement.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
        prisma.disbursement.count({ where: { status: 'PENDING' } }),
    ]);

    const totalRevenue = revenue._sum.amount ? Number(revenue._sum.amount) : 0;
    const totalExpenses = expenses._sum.amount ? Number(expenses._sum.amount) : 0;

    const y = parseInt(year) || new Date().getFullYear();
    const months = [];
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    for (let m = 0; m < 12; m++) {
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0, 23, 59, 59);

        const [income, expense] = await Promise.all([
            prisma.donation.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: start, lte: end } }, _sum: { amount: true } }),
            prisma.disbursement.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } }, _sum: { amount: true } }),
        ]);

        months.push({
            month: monthNames[m],
            income: Number(income._sum.amount || 0),
            expenses: Number(expense._sum.amount || 0),
        });
    }

    return {
        totalRevenue,
        revenueChange: "+0%", // mocked
        totalExpenses,
        expensesChange: "+0%", // mocked
        availableBalance: totalRevenue - totalExpenses,
        pendingRequests: pending,
        monthlyData: months
    };
}

async function getBudgets() {
    const programs = await prisma.program.findMany({
        where: { deletedAt: null },
        include: {
            beneficiaries: {
                select: {
                    disbursements: { where: { status: 'COMPLETED' }, select: { amount: true } }
                }
            }
        }
    });

    return programs.map(p => {
        let spent = 0;
        p.beneficiaries.forEach(b => {
            b.disbursements.forEach(d => { spent += Number(d.amount); });
        });
        
        const allocated = spent > 0 ? Math.round(spent * 1.5) : 50000; // Mock allocation logic
        const progress = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
        
        return {
            program: p.name,
            allocated,
            spent,
            progress
        };
    });
}

module.exports = { listDisbursements, createDisbursement, updateStatus, getOverview, getBudgets };

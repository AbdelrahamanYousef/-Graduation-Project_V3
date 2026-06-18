const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

/**
 * Generate reconciliation report for a period
 * Only counts SUCCESS donations
 */
async function generate(periodStart, periodEnd) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    if (isNaN(start) || isNaN(end) || start >= end) {
        throw ApiError.badRequest('Invalid period: periodStart must be before periodEnd');
    }

    const result = await prisma.donation.aggregate({
        where: {
            status: 'SUCCESS',
            paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
    });

    const reconciliation = await prisma.reconciliation.create({
        data: {
            periodStart: start,
            periodEnd: end,
            totalSystemAmount: result._sum.amount || 0,
            totalSuccessfulDonations: result._count.id || 0,
        },
    });

    return reconciliation;
}

/**
 * List all reconciliation records
 */
async function list() {
    return prisma.reconciliation.findMany({ orderBy: { createdAt: 'desc' } });
}

module.exports = { generate, list };

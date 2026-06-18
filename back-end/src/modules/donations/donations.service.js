const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');
const auditLog = require('../audit/auditLog.service');

/**
 * List donations with pagination and filters
 */
async function list(query = {}, userId = null) {
    const where = {};

    // If user-scoped, only show their donations
    if (userId) where.userId = userId;

    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status.toUpperCase();
    if (query.type) {
        let typeStr = query.type.toUpperCase();
        if (typeStr === 'KAFALA') typeStr = 'ORPHAN_SPONSORSHIP';
        else if (typeStr === 'WAQF') typeStr = 'SADAQAH_JARIYAH';
        where.type = typeStr;
    }
    if (query.search) {
        where.OR = [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { receiptNumber: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
        if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.donation.findMany({
            where, skip, take: limit,
            include: {
                project: { select: { id: true, title: true } },
                user: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.donation.count({ where }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

/**
 * Get donation by ID
 */
async function getById(id) {
    const donation = await prisma.donation.findUnique({
        where: { id },
        include: {
            project: { select: { id: true, title: true, program: { select: { name: true } } } },
            user: { select: { id: true, name: true, phone: true } },
        },
    });
    if (!donation) throw ApiError.notFound('Donation not found');
    return donation;
}

/**
 * Get donation statistics — only SUCCESS donations
 */
async function getStats() {
    const result = await prisma.donation.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
    });

    return {
        total: result._sum.amount || 0,
        count: result._count.id || 0,
        average: result._avg.amount || 0,
    };
}

/**
 * Refund a SUCCESS donation (ADMIN only)
 */
async function refund(donationId, reason, adminUser) {
    return prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({ where: { id: donationId } });
        if (!donation) throw ApiError.notFound('Donation not found');

        if (donation.status !== 'SUCCESS') {
            throw ApiError.badRequest(`Only SUCCESS donations can be refunded. Current status: ${donation.status}`);
        }

        if (donation.status === 'REFUNDED') {
            throw ApiError.conflict('Donation already refunded');
        }

        // Update donation
        const updated = await tx.donation.update({
            where: { id: donationId },
            data: { status: 'REFUNDED', refundReason: reason || 'Admin-initiated refund' },
        });

        // Reverse project raised amount if linked
        if (donation.projectId) {
            await tx.project.update({
                where: { id: donation.projectId },
                data: {
                    raised: { decrement: parseFloat(donation.amount) },
                    donorsCount: { decrement: 1 },
                },
            });
        }

        // Audit log
        await tx.auditLog.create({
            data: {
                actorId: adminUser.id,
                actorRole: 'ADMIN',
                action: 'DONATION_REFUNDED',
                entity: 'Donation',
                entityId: donationId,
                payload: {
                    amount: donation.amount.toString(),
                    reason: reason || 'Admin-initiated refund',
                },
            },
        });

        return updated;
    });
}

/**
 * Get reference data
 */
function getTypes() {
    return [
        { value: 'SADAQAH', label: 'صدقة', labelEn: 'Sadaqah' },
        { value: 'ZAKAT', label: 'زكاة', labelEn: 'Zakat' },
        { value: 'ORPHAN_SPONSORSHIP', label: 'كفالة يتيم', labelEn: 'Orphan Sponsorship' },
        { value: 'SADAQAH_JARIYAH', label: 'صدقة جارية', labelEn: 'Ongoing Charity' },
        { value: 'GENERAL', label: 'تبرع عام', labelEn: 'General Donation' },
    ];
}

function getPaymentMethods() {
    return [
        { value: 'CARD', label: 'بطاقة ائتمان', labelEn: 'Credit Card', icon: 'fa-solid fa-credit-card' },
        { value: 'VODAFONE_CASH', label: 'فودافون كاش', labelEn: 'Vodafone Cash', icon: 'fa-solid fa-mobile-screen' },
        { value: 'ORANGE_CASH', label: 'أورانج كاش', labelEn: 'Orange Cash', icon: 'fa-solid fa-mobile-screen' },
        { value: 'INSTAPAY', label: 'إنستاباي', labelEn: 'InstaPay', icon: 'fa-solid fa-building-columns' },
        { value: 'FAWRY', label: 'فوري', labelEn: 'Fawry', icon: 'fa-solid fa-barcode' },
        { value: 'BANK_TRANSFER', label: 'تحويل بنكي', labelEn: 'Bank Transfer', icon: 'fa-solid fa-building-columns' },
    ];
}

function getSuggestedAmounts() {
    return [50, 100, 200, 500, 1000, 5000];
}

module.exports = { list, getById, getStats, refund, getTypes, getPaymentMethods, getSuggestedAmounts };

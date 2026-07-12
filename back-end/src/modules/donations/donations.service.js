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
                campaign: { select: { id: true, title: true } },
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

        // Reverse project/campaign raised amount if linked
        if (donation.projectId) {
            const project = await tx.project.update({
                where: { id: donation.projectId },
                data: {
                    raised: { decrement: parseFloat(donation.amount) },
                    donorsCount: { decrement: 1 },
                },
            });
            await tx.project.update({
                where: { id: donation.projectId },
                data: { totalRaised: Number(project.raised) }
            });
        } else if (donation.campaignId) {
            const campaign = await tx.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    raised: { decrement: parseFloat(donation.amount) },
                    donorsCount: { decrement: 1 },
                },
            });
            await tx.campaign.update({
                where: { id: donation.campaignId },
                data: { totalRaised: Number(campaign.raised) }
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

const { generateOtp, sendDonationOtpEmail } = require('../../lib/email');

function generateReceiptNumber() {
    const prefix = 'NUR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

async function initiateDonation(userId, data) {
    const { amount, projectId, campaignId, paymentMethod, collectionAddress } = data;
    
    // 1. Validation
    if (!amount || amount < 10) {
        throw ApiError.badRequest('Minimum donation is 10 EGP');
    }
    if ((!projectId && !campaignId) || (projectId && campaignId)) {
        throw ApiError.badRequest('Must specify either projectId or campaignId');
    }
    
    let target;
    if (projectId) {
        target = await prisma.project.findUnique({ where: { id: String(projectId), deletedAt: null } });
    } else {
        target = await prisma.campaign.findUnique({ where: { id: String(campaignId), deletedAt: null } });
    }
    
    if (!target) {
        throw ApiError.notFound('Target not found');
    }
    if (target.status !== 'ACTIVE') {
        throw ApiError.badRequest('Target is not active');
    }
    
    // If FIXED_SHARES, amount must be a positive multiple of sharePrice
    if (target.amountConfig === 'FIXED_SHARES') {
        const sharePrice = Number(target.sharePrice) || 0;
        if (sharePrice > 0) {
            const remainder = amount % sharePrice;
            if (remainder !== 0) {
                throw ApiError.badRequest(`Amount must be a multiple of share price: ${sharePrice} EGP`);
            }
        }
    }
    
    // 2. Generate OTP and Fawry mock code if needed
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    let fawryCode = null;
    if (paymentMethod === 'FAWRY') {
        fawryCode = Math.floor(100000000 + Math.random() * 900000000).toString();
    }
    
    // Save to DonationOtp model
    await prisma.donationOtp.create({
        data: {
            userId,
            otpCode,
            expiresAt,
            amount: parseFloat(amount),
            projectId: projectId ? String(projectId) : null,
            campaignId: campaignId ? String(campaignId) : null,
            paymentMethod,
            collectionAddress: collectionAddress || null,
            fawryCode,
        }
    });
    
    // Get user email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    
    // Send email
    await sendDonationOtpEmail(user.email, otpCode, amount);
    
    return {
        success: true,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
        fawryCode,
    };
}

async function verifyDonation(userId, otpCode) {
    if (!otpCode) {
        throw ApiError.badRequest('Otp code is required');
    }
    
    // Find latest non-expired, unverified OTP
    const latestOtp = await prisma.donationOtp.findFirst({
        where: {
            userId,
            verified: false,
            expiresAt: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    if (!latestOtp || latestOtp.otpCode !== otpCode) {
        throw ApiError.badRequest('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }
    
    // Mark OTP as verified
    await prisma.donationOtp.update({
        where: { id: latestOtp.id },
        data: { verified: true }
    });
    
    // Determine status based on payment method
    let status = 'PENDING';
    if (latestOtp.paymentMethod === 'CREDIT_CARD' || latestOtp.paymentMethod === 'E_WALLET') {
        status = 'SUCCESS';
    }
    
    const receiptNumber = generateReceiptNumber();
    const transactionId = latestOtp.fawryCode || `TX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create Donation inside a transaction and update totals
    const donation = await prisma.$transaction(async (tx) => {
        const d = await tx.donation.create({
            data: {
                userId: latestOtp.userId,
                projectId: latestOtp.projectId,
                campaignId: latestOtp.campaignId,
                amount: latestOtp.amount,
                paymentMethod: latestOtp.paymentMethod,
                status,
                collectionAddress: latestOtp.collectionAddress,
                transactionId,
                receiptNumber,
                source: 'ONLINE',
                paidAt: status === 'SUCCESS' ? new Date() : null,
            },
            include: {
                project: { select: { id: true, title: true } },
                campaign: { select: { id: true, title: true } },
            }
        });
        
        if (status === 'SUCCESS') {
            if (latestOtp.projectId) {
                const project = await tx.project.update({
                    where: { id: latestOtp.projectId },
                    data: {
                        raised: { increment: latestOtp.amount },
                        donorsCount: { increment: 1 },
                    }
                });
                await tx.project.update({
                    where: { id: latestOtp.projectId },
                    data: { totalRaised: Number(project.raised) }
                });
            } else if (latestOtp.campaignId) {
                const campaign = await tx.campaign.update({
                    where: { id: latestOtp.campaignId },
                    data: {
                        raised: { increment: latestOtp.amount },
                        donorsCount: { increment: 1 },
                    }
                });
                await tx.campaign.update({
                    where: { id: latestOtp.campaignId },
                    data: { totalRaised: Number(campaign.raised) }
                });
            }
        }
        
        return d;
    });
    
    // Audit log
    await auditLog.log({
        actorId: userId,
        actorRole: 'USER',
        action: 'PAYMENT_CONFIRMED',
        entity: 'Donation',
        entityId: donation.id,
        payload: { outcome: status, amount: donation.amount.toString(), paymentMethod: donation.paymentMethod },
    });
    
    return {
        donation: {
            id: donation.id,
            amount: Number(donation.amount),
            status: donation.status.toLowerCase() === 'success' ? 'completed' : donation.status.toLowerCase(),
            receiptNumber: donation.receiptNumber,
            date: donation.createdAt.toISOString().split('T')[0]
        },
        fawryCode: latestOtp.fawryCode,
    };
}

async function createOfflineDonation(adminUserId, data) {
    const { amount, projectId, campaignId, donorUserId, fullName, notes } = data;
    
    if (!amount || amount <= 0) {
        throw ApiError.badRequest('Amount must be positive');
    }
    if ((!projectId && !campaignId) || (projectId && campaignId)) {
        throw ApiError.badRequest('Must specify either projectId or campaignId');
    }
    
    let target;
    if (projectId) {
        target = await prisma.project.findUnique({ where: { id: String(projectId), deletedAt: null } });
    } else {
        target = await prisma.campaign.findUnique({ where: { id: String(campaignId), deletedAt: null } });
    }
    if (!target) {
        throw ApiError.notFound('Target not found');
    }
    
    const receiptNumber = generateReceiptNumber();
    const transactionId = `CASH-OFF-${Date.now()}`;
    
    // Create completed cash donation
    const donation = await prisma.$transaction(async (tx) => {
        const d = await tx.donation.create({
            data: {
                userId: donorUserId || adminUserId,
                projectId: projectId ? String(projectId) : null,
                campaignId: campaignId ? String(campaignId) : null,
                amount: parseFloat(amount),
                paymentMethod: 'CASH_COLLECTION',
                status: 'SUCCESS',
                source: 'OFFLINE_CASH',
                fullName: fullName || null,
                notes: notes || null,
                receiptNumber,
                transactionId,
                paidAt: new Date(),
            },
            include: {
                project: { select: { id: true, title: true } },
                campaign: { select: { id: true, title: true } },
            }
        });
        
        if (projectId) {
            const project = await tx.project.update({
                where: { id: projectId },
                data: {
                    raised: { increment: parseFloat(amount) },
                    donorsCount: { increment: 1 },
                }
            });
            await tx.project.update({
                where: { id: projectId },
                data: { totalRaised: Number(project.raised) }
            });
        } else if (campaignId) {
            const campaign = await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    raised: { increment: parseFloat(amount) },
                    donorsCount: { increment: 1 },
                }
            });
            await tx.campaign.update({
                where: { id: campaignId },
                data: { totalRaised: Number(campaign.raised) }
            });
        }
        
        return d;
    });
    
    // Audit Log
    await auditLog.log({
        actorId: adminUserId,
        actorRole: 'ADMIN',
        action: 'DONATION_CREATED',
        entity: 'Donation',
        entityId: donation.id,
        payload: { amount: amount.toString(), paymentMethod: 'CASH_COLLECTION', source: 'OFFLINE_CASH', status: 'SUCCESS' },
    });
    
    return {
        id: donation.id,
        amount: Number(donation.amount),
        status: 'completed',
        receiptNumber: donation.receiptNumber,
        date: donation.createdAt.toISOString().split('T')[0]
    };
}

async function confirmPayment(donationId, adminUser) {
    return prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({ where: { id: donationId } });
        if (!donation) throw ApiError.notFound('Donation not found');

        if (donation.status !== 'PENDING') {
            throw ApiError.badRequest(`Donation is already ${donation.status}`);
        }

        const updated = await tx.donation.update({
            where: { id: donationId },
            data: { status: 'SUCCESS', paidAt: new Date() },
        });

        // Update target totals
        if (donation.projectId) {
            const project = await tx.project.update({
                where: { id: donation.projectId },
                data: {
                    raised: { increment: parseFloat(donation.amount) },
                    donorsCount: { increment: 1 },
                },
            });
            await tx.project.update({
                where: { id: donation.projectId },
                data: { totalRaised: Number(project.raised) }
            });
        } else if (donation.campaignId) {
            const campaign = await tx.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    raised: { increment: parseFloat(donation.amount) },
                    donorsCount: { increment: 1 },
                },
            });
            await tx.campaign.update({
                where: { id: donation.campaignId },
                data: { totalRaised: Number(campaign.raised) }
            });
        }

        // Audit log
        await tx.auditLog.create({
            data: {
                actorId: adminUser.id,
                actorRole: 'ADMIN',
                action: 'PAYMENT_CONFIRMED',
                entity: 'Donation',
                entityId: donationId,
                payload: {
                    amount: donation.amount.toString(),
                    paymentMethod: donation.paymentMethod,
                    status: 'SUCCESS',
                },
            },
        });

        return updated;
    });
}

module.exports = {
    list,
    getById,
    getStats,
    refund,
    getTypes,
    getPaymentMethods,
    getSuggestedAmounts,
    initiateDonation,
    verifyDonation,
    createOfflineDonation,
    confirmPayment
};

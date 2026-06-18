const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');
const auditLog = require('../audit/auditLog.service');

/**
 * Generate unique receipt number: NUR-{timestamp}-{random}
 */
function generateReceiptNumber() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NUR-${ts}-${rand}`;
}

/**
 * Validate Egyptian wallet phone number (11 digits, starts with 01)
 */
function validateWalletPhone(phone) {
    if (!phone || !/^01[0-9]{9}$/.test(phone)) {
        throw ApiError.badRequest('Invalid wallet phone: must be 11 digits starting with 01');
    }
}

/**
 * POST /payments/intents — Create a payment intent (Donation with status PENDING)
 */
async function createIntent(data, userId = null) {
    // Validate minimum amount
    if (parseFloat(data.amount) < 10) {
        throw ApiError.badRequest('Minimum donation is 10 EGP');
    }

    // Validate wallet phone if provided
    if (data.walletPhone) {
        validateWalletPhone(data.walletPhone);
    }

    // Idempotency check
    if (data.idempotencyKey) {
        const existing = await prisma.donation.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
        });
        if (existing) return existing;
    }

    // Validate project exists if provided
    if (data.projectId) {
        const project = await prisma.project.findFirst({
            where: { id: data.projectId, deletedAt: null },
        });
        if (!project) throw ApiError.notFound('Project not found');
    }

    // Generate simulated payment ID
    const simulatedPaymentId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create donation with PENDING status
    const donation = await prisma.donation.create({
        data: {
            userId: data.isAnonymous ? null : userId,
            projectId: data.projectId || null,
            amount: parseFloat(data.amount),
            type: data.type || 'GENERAL',
            paymentMethod: data.paymentMethod,
            status: 'PENDING',
            isAnonymous: data.isAnonymous || false,
            isRecurring: data.isRecurring || false,
            recurringFrequency: data.recurringFrequency || null,
            fullName: data.fullName || null,
            phone: data.phone || null,
            email: data.email || null,
            walletPhone: data.walletPhone || null,
            notes: data.notes || null,
            receiptNumber: generateReceiptNumber(),
            idempotencyKey: data.idempotencyKey || null,
            simulatedPaymentId,
        },
        include: { project: { select: { id: true, title: true } } },
    });

    // Audit log
    if (userId) {
        await auditLog.log({
            actorId: userId,
            actorRole: 'USER',
            action: 'DONATION_CREATED',
            entity: 'Donation',
            entityId: donation.id,
            payload: { amount: data.amount, paymentMethod: data.paymentMethod, status: 'PENDING' },
        });
    }

    return donation;
}

/**
 * POST /payments/:id/confirm — Simulate payment confirmation
 * @param {string} id - Donation ID
 * @param {string|null} explicitStatus - Force SUCCESS or FAILED (for testing). If null, random.
 * @param {string|null} userId - Actor ID for audit logging
 */
async function confirmPayment(id, explicitStatus = null, userId = null) {
    return prisma.$transaction(async (tx) => {
        // Find donation and lock for update
        const donation = await tx.donation.findUnique({ where: { id } });

        if (!donation) throw ApiError.notFound('Donation not found');

        // Prevent double confirmation
        if (donation.status !== 'PENDING') {
            throw ApiError.conflict(`Donation already ${donation.status.toLowerCase()} — cannot confirm again`);
        }

        // Decide outcome: explicit param or random (80% success)
        let outcome;
        if (explicitStatus && ['SUCCESS', 'FAILED'].includes(explicitStatus)) {
            outcome = explicitStatus;
        } else {
            outcome = Math.random() < 0.8 ? 'SUCCESS' : 'FAILED';
        }

        const updateData = { status: outcome };

        if (outcome === 'SUCCESS') {
            updateData.paidAt = new Date();
        }

        // Update donation status inside transaction
        const updated = await tx.donation.update({
            where: { id },
            data: updateData,
            include: { project: { select: { id: true, title: true } } },
        });

        // If SUCCESS and linked to a project, update project raised/donors
        if (outcome === 'SUCCESS' && donation.projectId) {
            await tx.project.update({
                where: { id: donation.projectId },
                data: {
                    raised: { increment: parseFloat(donation.amount) },
                    donorsCount: { increment: 1 },
                },
            });
        }

        // Audit log (outside tx is fine, non-critical)
        const actorId = userId || donation.userId;
        if (actorId) {
            await tx.auditLog.create({
                data: {
                    actorId,
                    actorRole: userId ? 'ADMIN' : 'USER',
                    action: 'PAYMENT_CONFIRMED',
                    entity: 'Donation',
                    entityId: donation.id,
                    payload: { outcome, amount: donation.amount.toString(), paymentMethod: donation.paymentMethod },
                },
            });
        }

        return updated;
    });
}

module.exports = { createIntent, confirmPayment };

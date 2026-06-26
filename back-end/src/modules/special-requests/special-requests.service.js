const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

/**
 * Submit a new special aid request (public / auth-optional)
 */
async function create(data) {
    const { name, email, phone, requestType, description, userId } = data;

    const request = await prisma.specialRequest.create({
        data: {
            name,
            email: email || null,
            phone,
            requestType,
            description,
            userId: userId || null,
            status: 'PENDING',
        },
    });

    // Create process log
    await prisma.specialRequestProcessLog.create({
        data: {
            specialRequestId: request.id,
            action: 'SUBMITTED',
            details: { notes: 'تم تقديم طلب المساعدة بنجاح' },
        },
    });

    return request;
}

/**
 * List all special requests with robust administrative filters (admin)
 */
async function list(query = {}) {
    const { status, aidType, name, dateFrom, dateTo } = query;
    const where = {};

    if (status) where.status = status;
    if (aidType) where.aidType = aidType;
    if (name) {
        where.name = {
            contains: name,
            mode: 'insensitive',
        };
    }

    // Filter by date range if provided
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    return prisma.specialRequest.findMany({
        where,
        include: {
            reviewedBy: { select: { id: true, name: true } },
            processLogs: {
                include: {
                    performedBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Fetch special requests of the logged-in user
 */
async function getMyRequests(userId) {
    return prisma.specialRequest.findMany({
        where: { userId },
        include: {
            processLogs: {
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Update request status (admin)
 */
async function updateStatus(id, adminUser, status, notes) {
    if (!notes || notes.trim() === '') {
        throw new Error('ملاحظات تغيير الحالة مطلوبة إجبارياً');
    }

    const request = await prisma.specialRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Aid request not found');

    const updateData = {
        status,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
    };

    if (status === 'REJECTED') {
        updateData.rejectionReason = notes;
    } else {
        updateData.adminNotes = notes;
    }

    const updated = await prisma.specialRequest.update({
        where: { id },
        data: updateData,
    });

    // Create process log
    await prisma.specialRequestProcessLog.create({
        data: {
            specialRequestId: id,
            action: status,
            performedById: adminUser.id,
            details: { notes },
        },
    });

    // Create notification for admin
    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: `تحديث حالة طلب المساعدة`,
            message: `تم تحديث حالة طلب المساعدة المقدم من ${request.name} إلى ${status}`,
            type: 'SPECIAL_REQUEST',
        },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: `SPECIAL_REQUEST_${status}`,
        entity: 'SpecialRequest',
        entityId: id,
        payload: { name: request.name, notes },
    });

    return updated;
}

/**
 * Allocate aid details (admin)
 */
async function allocateAid(id, adminUser, allocationData) {
    const { aidType, aidAmount, aidQuantity, distributionStatus } = allocationData;

    const request = await prisma.specialRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Aid request not found');
    if (request.status !== 'APPROVED') {
        throw new Error('يمكن فقط تخصيص المساعدات للطلبات المقبولة (APPROVED)');
    }

    const updated = await prisma.specialRequest.update({
        where: { id },
        data: {
            aidType,
            aidAmount: aidAmount ? parseFloat(aidAmount) : null,
            aidQuantity: aidQuantity || null,
            distributionStatus: distributionStatus || 'Assigned',
        },
    });

    // Create process log
    await prisma.specialRequestProcessLog.create({
        data: {
            specialRequestId: id,
            action: 'AID_ALLOCATED',
            performedById: adminUser.id,
            details: { aidType, aidAmount, aidQuantity, distributionStatus },
        },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'SPECIAL_REQUEST_ALLOCATION_UPDATED',
        entity: 'SpecialRequest',
        entityId: id,
        payload: { name: request.name, aidType, aidAmount, aidQuantity, distributionStatus },
    });

    return updated;
}

module.exports = { create, list, getMyRequests, updateStatus, allocateAid };

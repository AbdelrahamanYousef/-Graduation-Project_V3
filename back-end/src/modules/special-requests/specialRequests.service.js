const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

async function getById(id) {
    const request = await prisma.specialRequest.findUnique({
        where: { id },
        include: { reviewedBy: { select: { id: true, name: true } } },
    });
    if (!request) throw new Error('Special request not found');
    return request;
}

async function create(data) {
    const request = await prisma.specialRequest.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            requestType: data.requestType,
            description: data.description,
            status: 'PENDING',
        },
    });

    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', status: 'ACTIVE', deletedAt: null },
        select: { id: true },
    });

    if (admins.length > 0) {
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                title: 'طلب خاص جديد',
                message: `${data.name}: ${data.requestType}`,
                type: 'SPECIAL_REQUEST',
            })),
        });
    }

    return request;
}

async function list(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.aidType) where.aidType = query.aidType;
    if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
        if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    return prisma.specialRequest.findMany({
        where,
        include: {
            reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

async function approve(id, adminUser, data = {}) {
    const request = await prisma.specialRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Special request not found');
    if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be approved');

    const updated = await prisma.specialRequest.update({
        where: { id },
        data: {
            status: 'APPROVED',
            aidType: data.aidType || null,
            adminNotes: data.adminNotes || null,
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
        },
    });

    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم الموافقة على طلب خاص',
            message: `تمت الموافقة على طلب ${request.name} - ${request.requestType}${data.aidType ? ' (نوع المساعدة: ' + data.aidType + ')' : ''}`,
            type: 'SPECIAL_REQUEST',
        },
    });

    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'SPECIAL_REQUEST_APPROVED',
        entity: 'SpecialRequest',
        entityId: id,
        payload: { name: request.name, requestType: request.requestType, aidType: data.aidType },
    });

    return updated;
}

async function reject(id, adminUser, reason) {
    const request = await prisma.specialRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Special request not found');
    if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be rejected');

    const updated = await prisma.specialRequest.update({
        where: { id },
        data: {
            status: 'REJECTED',
            rejectionReason: reason || null,
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
        },
    });

    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم رفض طلب خاص',
            message: `تم رفض طلب ${request.name}${reason ? ': ' + reason : ''}`,
            type: 'SPECIAL_REQUEST',
        },
    });

    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'SPECIAL_REQUEST_REJECTED',
        entity: 'SpecialRequest',
        entityId: id,
        payload: { name: request.name, reason },
    });

    return updated;
}

module.exports = { getById, create, list, approve, reject };

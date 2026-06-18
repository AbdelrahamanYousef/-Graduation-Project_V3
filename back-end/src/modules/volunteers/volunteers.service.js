const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

/**
 * Submit a new volunteer application (public)
 */
async function create(data) {
    return prisma.volunteerApplication.create({ data });
}

/**
 * List volunteer applications (admin)
 */
async function list(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;

    return prisma.volunteerApplication.findMany({
        where,
        include: {
            reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Approve a volunteer application (admin)
 */
async function approve(id, adminUser) {
    const app = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!app) throw new Error('Volunteer application not found');
    if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be approved');

    const updated = await prisma.volunteerApplication.update({
        where: { id },
        data: {
            status: 'APPROVED',
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
        },
    });

    // Create notification for the admin who approved
    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم قبول طلب تطوع',
            message: `تم قبول طلب تطوع ${app.name} في مجال ${app.area}`,
            type: 'VOLUNTEER',
        },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'VOLUNTEER_APPROVED',
        entity: 'VolunteerApplication',
        entityId: id,
        payload: { name: app.name, area: app.area },
    });

    return updated;
}

/**
 * Reject a volunteer application (admin)
 */
async function reject(id, adminUser, reason) {
    const app = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!app) throw new Error('Volunteer application not found');
    if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be rejected');

    const updated = await prisma.volunteerApplication.update({
        where: { id },
        data: {
            status: 'REJECTED',
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
            rejectionReason: reason || null,
        },
    });

    // Create notification
    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم رفض طلب تطوع',
            message: `تم رفض طلب تطوع ${app.name}${reason ? ': ' + reason : ''}`,
            type: 'VOLUNTEER',
        },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'VOLUNTEER_REJECTED',
        entity: 'VolunteerApplication',
        entityId: id,
        payload: { name: app.name, reason },
    });

    return updated;
}

module.exports = { create, list, approve, reject };

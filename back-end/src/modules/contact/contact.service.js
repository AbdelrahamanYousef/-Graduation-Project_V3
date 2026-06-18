const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

/**
 * Create a new contact message (public)
 * Creates admin notification on submission
 */
async function create(data) {
    const message = await prisma.contactMessage.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            subject: data.subject,
            message: data.message,
            status: 'NEW',
        },
    });

    // Create notification for all ADMIN users
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', status: 'ACTIVE', deletedAt: null },
        select: { id: true },
    });

    if (admins.length > 0) {
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                title: 'رسالة تواصل جديدة',
                message: `${data.name}: ${data.subject}`,
                type: 'CONTACT',
            })),
        });
    }

    return message;
}

/**
 * List contact messages (admin)
 */
async function list(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;

    return prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Update contact message status (admin)
 */
async function updateStatus(id, status, adminUser) {
    const message = await prisma.contactMessage.update({
        where: { id },
        data: { status },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'CONTACT_STATUS_CHANGED',
        entity: 'ContactMessage',
        entityId: id,
        payload: { newStatus: status },
    });

    return message;
}

module.exports = { create, list, updateStatus };

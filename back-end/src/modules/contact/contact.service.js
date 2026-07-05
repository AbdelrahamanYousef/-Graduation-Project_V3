const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

/**
 * Create a new contact message (public)
 * Creates admin notification on submission
 */
async function create(data, userId = null) {
    const message = await prisma.contactMessage.create({
        data: {
            userId,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            subject: data.subject,
            message: data.message,
            contactMethod: data.contactMethod || data.preferredContact || null,
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

/**
 * Reply to a contact message (admin)
 */
async function reply(id, replyText, adminUser) {
    const message = await prisma.contactMessage.findUnique({
        where: { id },
    });
    if (!message) {
        const error = new Error('الرسالة غير موجودة');
        error.status = 404;
        throw error;
    }

    const emailHelper = require('../../lib/email');
    const emailResult = await emailHelper.sendContactReplyEmail(
        message.email,
        message.name,
        message.subject,
        replyText
    );

    if (!emailResult.success) {
        const error = new Error(`فشل إرسال البريد الإلكتروني: ${emailResult.error}`);
        error.status = 500;
        throw error;
    }

    // Transactional: Update status in DB only after successful email sending
    const updatedMessage = await prisma.contactMessage.update({
        where: { id },
        data: { status: 'RESOLVED' },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'CONTACT_REPLIED',
        entity: 'ContactMessage',
        entityId: id,
        payload: { replyText },
    });

    return updatedMessage;
}

module.exports = { create, list, updateStatus, reply };

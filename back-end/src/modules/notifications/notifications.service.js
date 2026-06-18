const prisma = require('../../lib/prisma');

async function list(userId) {
    const where = {};
    if (userId) where.userId = userId;
    return prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
}

async function markRead(id) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

async function markAllRead(userId) {
    const where = { isRead: false };
    if (userId) where.userId = userId;
    return prisma.notification.updateMany({ where, data: { isRead: true } });
}

async function clearAll(userId) {
    const where = {};
    if (userId) where.userId = userId;
    return prisma.notification.deleteMany({ where });
}

async function create(data) {
    return prisma.notification.create({ data });
}

module.exports = { list, markRead, markAllRead, clearAll, create };

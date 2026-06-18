const prisma = require('../../lib/prisma');

/**
 * Create an audit log entry
 * @param {{ actorId: string, actorRole: string, action: string, entity: string, entityId: string, payload?: object }}
 */
async function log({ actorId, actorRole, action, entity, entityId, payload = null }) {
    return prisma.auditLog.create({
        data: { actorId, actorRole, action, entity, entityId, payload },
    });
}

/**
 * List audit logs (admin only) with pagination
 */
async function list(query = {}) {
    const where = {};
    if (query.entity) where.entity = query.entity;
    if (query.entityId) where.entityId = query.entityId;
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = query.action;

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 30, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip,
            take: limit,
            include: { actor: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

module.exports = { log, list };

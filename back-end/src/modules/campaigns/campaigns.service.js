const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.status) where.status = query.status.toUpperCase();

    const campaigns = await prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(c => {
        let daysLeft = null;
        if (c.endDate) {
            daysLeft = Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
        }
        return {
            id: c.id,
            title: c.title,
            description: c.description,
            imageUrl: c.imageUrl,
            goal: Number(c.goal),
            raised: Number(c.raised),
            donorsCount: c.donorsCount,
            status: c.status.toLowerCase(),
            startDate: c.startDate,
            endDate: c.endDate,
            featured: c.featured,
            category: c.category,
            amountConfig: c.amountConfig,
            sharePrice: c.sharePrice ? Number(c.sharePrice) : null,
            daysLeft,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        };
    });
}

async function getById(id) {
    const campaign = await prisma.campaign.findFirst({ where: { id, deletedAt: null } });
    if (!campaign) throw ApiError.notFound('Campaign not found');
    return campaign;
}

async function create(data) {
    if (data.goal != null) data.goal = parseFloat(data.goal);
    if (data.raised != null) data.raised = parseFloat(data.raised);
    return prisma.campaign.create({ data });
}

async function update(id, data) {
    await getById(id);
    if (data.goal != null) data.goal = parseFloat(data.goal);
    if (data.raised != null) data.raised = parseFloat(data.raised);
    return prisma.campaign.update({ where: { id }, data });
}

async function remove(id) {
    await getById(id);
    return prisma.campaign.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, getById, create, update, remove };

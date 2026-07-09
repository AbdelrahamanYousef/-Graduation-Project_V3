const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.programId) where.programId = query.programId;
    if (query.status) where.status = query.status.toUpperCase();
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    if (query.featured) where.featured = query.featured === 'true' || query.featured === true;
    if (query.isHighlighted !== undefined) where.isHighlighted = query.isHighlighted === 'true' || query.isHighlighted === true;
    if (query.showAll !== 'true') where.status = 'ACTIVE';

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.project.findMany({
            where, skip, take: limit,
            include: { program: { select: { id: true, name: true, icon: true, color: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
    ]);

    const mappedData = data.map(p => {
        let daysLeft = null;
        if (p.endDate) {
            const diff = new Date(p.endDate) - new Date();
            daysLeft = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
        }
        return {
            id: p.id,
            programId: p.programId,
            program: p.program?.name || '',
            programEn: "",
            title: p.title,
            titleEn: "",
            description: p.description || '',
            descriptionEn: "",
            location: p.location || '',
            locationEn: "",
            goal: Number(p.goal),
            raised: Number(p.raised),
            donors: p.donorsCount,
            daysLeft,
            donationAmount: p.donationAmount ? Number(p.donationAmount) : null,
            image: p.imageUrl || null,
            status: p.status.toLowerCase(),
            featured: p.featured,
            isHighlighted: p.isHighlighted
        };
    });

    return { data: mappedData, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const project = await prisma.project.findFirst({
        where: { id, deletedAt: null },
        include: { program: true, donations: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, fullName: true, isAnonymous: true, createdAt: true } } },
    });
    if (!project) throw ApiError.notFound('Project not found');
    return project;
}

async function create(data) {
    return prisma.project.create({ data, include: { program: { select: { id: true, name: true } } } });
}

async function update(id, data) {
    await getById(id);
    return prisma.project.update({ where: { id }, data, include: { program: { select: { id: true, name: true } } } });
}

async function remove(id) {
    await getById(id);
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, getById, create, update, remove };

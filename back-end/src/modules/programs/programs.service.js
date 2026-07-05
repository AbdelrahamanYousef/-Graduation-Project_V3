const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.status) where.status = query.status.toUpperCase();

    const programs = await prisma.program.findMany({
        where,
        include: { 
            _count: { select: { projects: true } },
            projects: {
                select: { raised: true }
            }
        },
        orderBy: { createdAt: 'asc' },
    });

    return programs.map(p => {
        const totalDonations = p.projects.reduce((sum, proj) => sum + Number(proj.raised), 0);
        return {
            id: p.id,
            name: p.name,
            nameEn: "",
            icon: p.icon || "fa-solid fa-cube",
            color: p.color || "#1F2D3D",
            description: p.description || "",
            imageUrl: p.imageUrl || "",
            projectCount: p._count.projects,
            totalDonations,
            status: p.status.toLowerCase(),
            isHighlighted: p.isHighlighted
        };
    });
}

async function getById(id) {
    const program = await prisma.program.findFirst({ where: { id, deletedAt: null }, include: { _count: { select: { projects: true, beneficiaries: true } } } });
    if (!program) throw ApiError.notFound('Program not found');
    return program;
}

async function create(data) {
    return prisma.program.create({ data });
}

async function update(id, data) {
    await getById(id);
    return prisma.program.update({ where: { id }, data });
}

async function remove(id) {
    await getById(id);
    return prisma.program.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, getById, create, update, remove };

const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.beneficiary.findMany({
            where, skip, take: limit,
            include: { program: { select: { id: true, name: true } }, _count: { select: { disbursements: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.beneficiary.count({ where }),
    ]);

    const mappedData = data.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type === 'FAMILY' ? 'أسرة' : b.type === 'INDIVIDUAL' ? 'فرد' : 'مؤسسة',
        program: b.program?.name || '',
        status: b.status.toLowerCase(),
        cases: b.membersCount || 0,
        location: b.governorate || '',
        phone: b.phone || '',
        nationalId: b.nationalId || '',
        address: b.address || '',
        notes: b.notes || '',
        monthlyAid: b.monthlyAid ? Number(b.monthlyAid) : 0,
        startDate: b.startDate ? b.startDate.toISOString().split('T')[0] : b.createdAt.toISOString().split('T')[0]
    }));

    return { data: mappedData, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const b = await prisma.beneficiary.findFirst({
        where: { id, deletedAt: null },
        include: { program: true, disbursements: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!b) throw ApiError.notFound('Beneficiary not found');
    return b;
}

async function create(data) {
    return prisma.beneficiary.create({ data, include: { program: { select: { id: true, name: true } } } });
}

async function update(id, data) {
    await getById(id);
    return prisma.beneficiary.update({ where: { id }, data });
}

async function remove(id) {
    await getById(id);
    return prisma.beneficiary.update({ where: { id }, data: { deletedAt: new Date() } });
}

async function getStats() {
    const [total, active, pending] = await Promise.all([
        prisma.beneficiary.count({ where: { deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'PENDING', deletedAt: null } }),
    ]);
    const sum = await prisma.beneficiary.aggregate({
        where: { deletedAt: null, status: 'ACTIVE' },
        _sum: { monthlyAid: true },
    });
    
    // Group by program for byCategory mock or actual
    const grouped = await prisma.beneficiary.groupBy({
        by: ['programId'],
        _count: { id: true },
        where: { deletedAt: null }
    });
    
    const byCategory = {};
    for (const g of grouped) {
        if (g.programId) {
            const prog = await prisma.program.findUnique({ where: { id: g.programId } });
            if (prog) {
                // Map names to keys roughly or just use name
                const key = prog.name.includes('أيتام') ? 'orphan' : 
                            prog.name.includes('طب') ? 'medical' : 
                            prog.name.includes('سكن') ? 'housing' : 'emergency';
                byCategory[key] = (byCategory[key] || 0) + g._count.id;
            }
        }
    }

    return { 
        total, 
        active, 
        pending, // Contract doesn't explicitly have pending in the example JSON, but it's fine
        totalMonthlyAid: sum._sum.monthlyAid ? Number(sum._sum.monthlyAid) : 0,
        byCategory: Object.keys(byCategory).length > 0 ? byCategory : { "orphan": 0, "medical": 0, "housing": 0, "emergency": 0 }
    };
}

module.exports = { list, getById, create, update, remove, getStats };

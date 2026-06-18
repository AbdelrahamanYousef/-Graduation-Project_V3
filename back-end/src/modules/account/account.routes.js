const { Router } = require('express');
const prisma = require('../../lib/prisma');
const { authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authUser);

// Get user profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { avatarUrl, ...rest } = user;
        res.json({ user: { ...rest, avatar: avatarUrl } });
    } catch (e) { next(e); }
});

// Update user profile
router.put('/profile', validate({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(10).optional(),
    }).partial(),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body,
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true },
        });
        const { avatarUrl, ...rest } = user;
        res.json({ user: { ...rest, avatar: avatarUrl } });
    } catch (e) { next(e); }
});

// Get user's donation history
router.get('/donations', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.donation.findMany({
                where: { userId: req.user.id },
                include: { project: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
                skip, take: limit,
            }),
            prisma.donation.count({ where: { userId: req.user.id } }),
        ]);

        const mapped = data.map(d => ({
            id: d.id,
            date: d.createdAt.toISOString().split('T')[0],
            project: d.project?.title || 'عام',
            amount: Number(d.amount),
            status: d.status.toLowerCase() === 'success' ? 'completed' : d.status.toLowerCase()
        }));

        res.json(mapped);
    } catch (e) { next(e); }
});

// Get user donation stats
router.get('/stats', async (req, res, next) => {
    try {
        const [result, activeSubs] = await Promise.all([
            prisma.donation.aggregate({
                where: { userId: req.user.id, status: 'SUCCESS' },
                _sum: { amount: true },
                _count: { id: true }
            }),
            prisma.donation.count({
                where: { userId: req.user.id, isRecurring: true, status: 'SUCCESS' }
            })
        ]);
        res.json({
            totalDonated: result._sum.amount ? Number(result._sum.amount) : 0,
            donationsCount: result._count.id || 0,
            activeSubscriptions: activeSubs,
        });
    } catch (e) { next(e); }
});

module.exports = router;

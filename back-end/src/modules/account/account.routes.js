const { Router } = require('express');
const prisma = require('../../lib/prisma');
const { authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const ApiError = require('../../shared/ApiError');


const router = Router();
router.use(authUser);

// Get user profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, emailNotifications: true, createdAt: true },
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
        avatarUrl: z.string().nullable().optional(),
    }).partial(),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body,
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, emailNotifications: true },
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

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Change password
router.put('/profile/change-password', validate({
    body: z.object({
        oldPassword: z.string().min(1),
        newPassword: passwordSchema,
    }),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(req.body.oldPassword, user.passwordHash);
        if (!valid) {
            return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
        }

        const hashed = await bcrypt.hash(req.body.newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: hashed }
        });

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (e) { next(e); }
});

// Update notification preferences
router.put('/profile/notifications', validate({
    body: z.object({
        emailNotifications: z.boolean(),
    }),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { emailNotifications: req.body.emailNotifications },
            select: { id: true, emailNotifications: true }
        });
        res.json({ message: 'تم تحديث تفضيلات الإشعارات بنجاح', emailNotifications: user.emailNotifications });
    } catch (e) { next(e); }
});

module.exports = router;

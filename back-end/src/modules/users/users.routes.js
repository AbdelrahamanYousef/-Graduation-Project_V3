const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const ApiError = require('../../shared/ApiError');
const { z } = require('zod');

const router = Router();
router.use(authAdmin);

// List users
router.get('/', async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (e) { next(e); }
});

// Create user
router.post('/', validate({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['USER', 'ADMIN']),
    }),
}), async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role },
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        });
        res.status(201).json(user);
    } catch (e) { next(e); }
});

// Update user
router.put('/:id', validate({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        role: z.enum(['USER', 'ADMIN']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    }).partial(),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: req.body,
            select: { id: true, name: true, email: true, role: true, status: true },
        });
        res.json(user);
    } catch (e) { next(e); }
});

// Delete user (soft)
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) throw ApiError.badRequest('Cannot delete yourself');
        await prisma.user.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
        res.json({ success: true });
    } catch (e) { next(e); }
});

module.exports = router;

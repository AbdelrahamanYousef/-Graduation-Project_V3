const { Router } = require('express');
const service = require('./contact.service');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public: submit contact message
router.post('/', validate({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(2),
        message: z.string().min(10),
        preferredContact: z.enum(['email', 'phone', 'whatsapp']).optional(),
    }),
}), async (req, res, next) => {
    try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
});

// Admin: list contact messages
router.get('/', authAdmin, async (req, res, next) => {
    try { res.json(await service.list(req.query)); } catch (e) { next(e); }
});

// Admin: update contact status
router.patch('/:id/status', authAdmin, validate({
    body: z.object({
        status: z.enum(['IN_PROGRESS', 'RESOLVED']),
    }),
}), async (req, res, next) => {
    try {
        res.json(await service.updateStatus(req.params.id, req.body.status, req.user));
    } catch (e) { next(e); }
});

module.exports = router;

const { Router } = require('express');
const service = require('./volunteers.service');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public: submit volunteer application
router.post('/apply', validate({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        area: z.enum(['MEDICAL', 'EDUCATION', 'COMMUNITY', 'TECH', 'ADMIN', 'FIELD']),
        message: z.string().optional(),
    }),
}), async (req, res, next) => {
    try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
});

// Admin: list volunteer applications
router.get('/', authAdmin, async (req, res, next) => {
    try { res.json(await service.list(req.query)); } catch (e) { next(e); }
});

// Admin: approve volunteer application
router.patch('/:id/approve', authAdmin, async (req, res, next) => {
    try { res.json(await service.approve(req.params.id, req.user)); } catch (e) { next(e); }
});

// Admin: reject volunteer application
router.patch('/:id/reject', authAdmin, validate({
    body: z.object({
        reason: z.string().optional(),
    }),
}), async (req, res, next) => {
    try { res.json(await service.reject(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); }
});

module.exports = router;

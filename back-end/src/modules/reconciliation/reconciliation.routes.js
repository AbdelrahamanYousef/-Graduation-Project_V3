const { Router } = require('express');
const service = require('./reconciliation.service');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authAdmin);

// POST /reconciliation — generate a new reconciliation report
router.post('/', validate({
    body: z.object({
        periodStart: z.string().datetime({ offset: true }).or(z.string().date()),
        periodEnd: z.string().datetime({ offset: true }).or(z.string().date()),
    }),
}), async (req, res, next) => {
    try {
        res.status(201).json(await service.generate(req.body.periodStart, req.body.periodEnd));
    } catch (e) { next(e); }
});

// GET /reconciliation — list all reconciliation records
router.get('/', async (req, res, next) => {
    try { res.json(await service.list()); } catch (e) { next(e); }
});

module.exports = router;

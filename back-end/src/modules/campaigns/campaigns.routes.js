const { Router } = require('express');
const ctrl = require('./campaigns.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

const campaignSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    goal: z.union([z.string(), z.number()]).transform(Number),
    raised: z.union([z.string(), z.number()]).transform(Number).optional(),
    donorsCount: z.number().int().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'UPCOMING']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().nullable(),
    featured: z.boolean().optional(),
    category: z.string().optional(),
});

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authAdmin, validate({ body: campaignSchema }), ctrl.create);
router.put('/:id', authAdmin, validate({ body: campaignSchema.partial() }), ctrl.update);
router.delete('/:id', authAdmin, ctrl.remove);

module.exports = router;

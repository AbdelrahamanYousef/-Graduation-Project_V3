const { Router } = require('express');
const ctrl = require('./projects.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

const projectSchema = z.object({
    programId: z.string().min(1),
    title: z.string().min(2),
    description: z.string().optional().nullable(),
    goal: z.number().positive(),
    location: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'PENDING']).optional(),
    isHighlighted: z.boolean().optional(),
    donationAmount: z.number().optional().nullable(),
});

router.get('/featured', ctrl.getFeatured);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.post('/', authAdmin, validate({ body: projectSchema }), ctrl.create);
router.put('/:id', authAdmin, validate({ body: projectSchema.partial() }), ctrl.update);
router.put('/:id/featured', authAdmin, validate({ body: z.object({ featured: z.boolean() }) }), ctrl.toggleFeatured);
router.put('/:id/highlight', authAdmin, validate({ body: z.object({ isHighlighted: z.boolean() }) }), ctrl.toggleHighlight);
router.delete('/:id', authAdmin, ctrl.remove);

module.exports = router;

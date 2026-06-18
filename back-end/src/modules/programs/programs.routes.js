const { Router } = require('express');
const ctrl = require('./programs.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

const programSchema = z.object({
    name: z.string().min(2),
    icon: z.string().optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authAdmin, validate({ body: programSchema }), ctrl.create);
router.put('/:id', authAdmin, validate({ body: programSchema.partial() }), ctrl.update);
router.delete('/:id', authAdmin, ctrl.remove);

module.exports = router;

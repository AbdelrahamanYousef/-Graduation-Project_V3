const { Router } = require('express');
const ctrl = require('./beneficiaries.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

const schema = z.object({
    name: z.string().min(2),
    type: z.enum(['FAMILY', 'INDIVIDUAL', 'INSTITUTION']).optional(),
    phone: z.string().optional(),
    nationalId: z.string().optional(),
    governorate: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    programId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    monthlyAid: z.number().optional(),
    membersCount: z.number().int().optional(),
});

router.use(authAdmin);
router.get('/', ctrl.list);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getById);
router.post('/', validate({ body: schema }), ctrl.create);
router.put('/:id', validate({ body: schema.partial() }), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

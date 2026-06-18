const { Router } = require('express');
const ctrl = require('./reports.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authAdmin);

router.get('/quick-stats', ctrl.getQuickStats);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validate({
    body: z.object({
        title: z.string().min(2),
        type: z.enum(['DONATIONS', 'BENEFICIARIES', 'PROJECTS', 'FINANCE']),
        period: z.string().min(1),
    }),
}), ctrl.create);

module.exports = router;

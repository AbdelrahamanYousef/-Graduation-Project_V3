const { Router } = require('express');
const ctrl = require('./finance.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authAdmin);

router.get('/overview', ctrl.getOverview);
router.get('/budgets', ctrl.getBudgets);
router.get('/', ctrl.listDisbursements);

router.post('/', validate({
    body: z.object({
        beneficiaryId: z.string().min(1),
        amount: z.number().positive(),
        type: z.string().min(1),
    }),
}), ctrl.createDisbursement);

router.put('/:id/approve', ctrl.approve);
router.put('/:id/reject', ctrl.reject);
router.put('/:id/complete', ctrl.complete);

module.exports = router;

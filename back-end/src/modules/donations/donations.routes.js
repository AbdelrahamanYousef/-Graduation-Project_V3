const { Router } = require('express');
const ctrl = require('./donations.controller');
const { authAdmin, authUser, optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public reference endpoints
router.get('/types', ctrl.getTypes);
router.get('/payment-methods', ctrl.getPaymentMethods);
router.get('/amounts', ctrl.getSuggestedAmounts);

// Create donation (Simulated)
router.post('/', optionalAuth, validate({
    body: z.object({
        amount: z.number().min(10, 'Minimum donation is 10 EGP'),
        type: z.enum(['sadaqah', 'zakat', 'kafala', 'waqf', 'fidya', 'SADAQAH', 'ZAKAT', 'ORPHAN_SPONSORSHIP', 'SADAQAH_JARIYAH', 'GENERAL']).optional(),
        projectId: z.number().nullable().optional().or(z.string().nullable().optional()),
        paymentMethod: z.string(),
        isRecurring: z.boolean().optional(),
        isAnonymous: z.boolean().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }),
}), ctrl.createDonation);

// New donation flow with OTP verification
router.post('/initiate', authUser, ctrl.initiate);
router.post('/verify', authUser, ctrl.verify);
router.post('/offline', authAdmin, ctrl.createOffline);

// Admin endpoints
router.get('/', authAdmin, ctrl.list);
router.get('/stats', authAdmin, ctrl.getStats);
router.get('/:id', authAdmin, ctrl.getById);
router.patch('/:id/confirm', authAdmin, ctrl.confirmPayment);

// Admin refund endpoint (Part 3)
router.post('/:id/refund', authAdmin, validate({
    body: z.object({
        reason: z.string().min(2, 'Refund reason is required'),
    }),
}), ctrl.refund);

module.exports = router;

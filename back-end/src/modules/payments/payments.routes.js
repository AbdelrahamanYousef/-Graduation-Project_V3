const { Router } = require('express');
const ctrl = require('./payments.controller');
const { optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// POST /payments/intents — create a payment intent (donation in PENDING state)
router.post('/intents', optionalAuth, validate({
    body: z.object({
        amount: z.number().min(10, 'Minimum donation is 10 EGP'),
        paymentMethod: z.enum(['CARD', 'VODAFONE_CASH', 'ORANGE_CASH', 'INSTAPAY', 'FAWRY', 'BANK_TRANSFER']),
        walletPhone: z.string().regex(/^01[0-9]{9}$/, 'Must be 11 digits starting with 01').optional(),
        type: z.enum(['SADAQAH', 'ZAKAT', 'ORPHAN_SPONSORSHIP', 'SADAQAH_JARIYAH', 'GENERAL']).optional(),
        projectId: z.string().optional(),
        isAnonymous: z.boolean().optional(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        notes: z.string().optional(),
        idempotencyKey: z.string().optional(),
    }),
}), ctrl.createIntent);

// POST /payments/:id/confirm — simulate payment result
router.post('/:id/confirm', optionalAuth, validate({
    body: z.object({
        status: z.enum(['SUCCESS', 'FAILED']).optional(), // optional explicit status for testing
    }).optional(),
}), ctrl.confirmPayment);

module.exports = router;

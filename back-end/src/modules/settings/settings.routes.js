const { Router } = require('express');
const prisma = require('../../lib/prisma');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authAdmin);

// Get org settings
router.get('/', async (req, res, next) => {
    try {
        let settings = await prisma.orgSettings.findUnique({ where: { id: 'singleton' } });
        if (!settings) {
            settings = await prisma.orgSettings.create({ data: { id: 'singleton' } });
        }
        res.json({
            maintenanceMode: false,
            socialLinks: {
                facebook: 'https://facebook.com/nourcharity',
                twitter: 'https://twitter.com/nourcharity',
                instagram: 'https://instagram.com/nourcharity',
                whatsapp: settings.phone || '+201000000000'
            },
            contactInfo: {
                email: settings.email || 'info@nourcharity.org',
                phone: settings.phone || '+201000000000',
                address: settings.address || 'القاهرة، مصر'
            }
        });
    } catch (e) { next(e); }
});

// Update org settings
router.put('/', validate({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
        notifyNewDonation: z.boolean().optional(),
        notifyDisbursement: z.boolean().optional(),
        notifyNewBeneficiary: z.boolean().optional(),
        notifyWeeklyReport: z.boolean().optional(),
    }).partial(),
}), async (req, res, next) => {
    try {
        const settings = await prisma.orgSettings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...req.body },
            update: req.body,
        });
        res.json(settings);
    } catch (e) { next(e); }
});

module.exports = router;

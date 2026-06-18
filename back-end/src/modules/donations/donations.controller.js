const service = require('./donations.service');

const paymentService = require('../payments/payments.service');

async function list(req, res, next) {
    try {
        const userId = req.user?.role === 'ADMIN' ? null : req.user?.id;
        const result = await service.list(req.query, userId);
        
        // Map to exact contract response shape
        const mapped = result.data.map(d => ({
            id: d.id,
            donor: d.fullName || d.user?.name || 'متبرع مجهول',
            project: d.project?.title || 'عام',
            amount: Number(d.amount),
            date: d.createdAt.toISOString().split('T')[0],
            method: service.getPaymentMethods().find(m => m.value === d.paymentMethod)?.label || d.paymentMethod,
            status: d.status.toLowerCase() === 'success' ? 'completed' : d.status.toLowerCase(),
            type: d.type.toLowerCase()
        }));

        res.json(mapped);
    } catch (e) { next(e); }
}

async function createDonation(req, res, next) {
    try {
        const userId = req.user?.id || null;
        
        // Map type if it's the lowercase frontend version
        let typeStr = req.body.type ? req.body.type.toUpperCase() : 'GENERAL';
        if (typeStr === 'SADAQAH') typeStr = 'SADAQAH';
        else if (typeStr === 'ZAKAT') typeStr = 'ZAKAT';
        else if (typeStr === 'KAFALA') typeStr = 'ORPHAN_SPONSORSHIP';
        else if (typeStr === 'WAQF') typeStr = 'SADAQAH_JARIYAH';
        else if (typeStr === 'FIDYA') typeStr = 'GENERAL'; // No fidya enum in schema
        
        // Call the intent service which handles the creation + simulated wait
        const payload = {
            ...req.body,
            projectId: req.body.projectId ? String(req.body.projectId) : null,
            type: typeStr
        };
        
        const donation = await paymentService.createIntent(payload, userId);
        
        // Auto-confirm it since it's simulated as per contract
        const confirmed = await paymentService.confirmPayment(donation.id, 'SUCCESS', userId);
        
        res.status(201).json({
            id: confirmed.id,
            amount: Number(confirmed.amount),
            type: req.body.type || 'sadaqah',
            status: 'pending', // Contract says return pending
            date: confirmed.createdAt.toISOString().split('T')[0],
            receiptNumber: confirmed.receiptNumber
        });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); }
}

async function getStats(req, res, next) {
    try { res.json(await service.getStats()); } catch (e) { next(e); }
}

async function refund(req, res, next) {
    try {
        const result = await service.refund(req.params.id, req.body.reason, req.user);
        res.json(result);
    } catch (e) { next(e); }
}

async function getTypes(req, res) { res.json(service.getTypes()); }
async function getPaymentMethods(req, res) { res.json(service.getPaymentMethods()); }
async function getSuggestedAmounts(req, res) { res.json(service.getSuggestedAmounts()); }

module.exports = { list, getById, getStats, refund, getTypes, getPaymentMethods, getSuggestedAmounts, createDonation };

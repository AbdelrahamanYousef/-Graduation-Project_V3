const service = require('./payments.service');

async function createIntent(req, res, next) {
    try {
        const userId = req.user?.id || null;
        const donation = await service.createIntent(req.body, userId);
        res.status(201).json(donation);
    } catch (e) { next(e); }
}

async function confirmPayment(req, res, next) {
    try {
        const userId = req.user?.id || null;
        const explicitStatus = req.body.status || null; // optional: 'SUCCESS' or 'FAILED'
        const result = await service.confirmPayment(req.params.id, explicitStatus, userId);
        res.json(result);
    } catch (e) { next(e); }
}

module.exports = { createIntent, confirmPayment };

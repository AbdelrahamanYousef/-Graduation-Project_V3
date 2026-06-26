const { Router } = require('express');
const service = require('./specialRequests.service');
const { authAdmin, optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

router.post('/apply', optionalAuth, validate({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    requestType: z.string().min(2),
    description: z.string().min(10),
  }),
}), async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    res.status(201).json(await service.create(req.body, userId));
  } catch (e) { next(e); }
});

router.get('/', authAdmin, async (req, res, next) => {
  try { res.json(await service.list(req.query)); } catch (e) { next(e); }
});

router.get('/:id', authAdmin, async (req, res, next) => {
  try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); }
});

router.patch('/:id/approve', authAdmin, validate({
  body: z.object({
    aidType: z.enum(['CASH', 'MONTHLY_ALLOWANCE', 'FINANCIAL_AID', 'FOOD', 'MEDICAL', 'EDUCATIONAL', 'OTHER']).optional(),
    adminNotes: z.string().optional(),
  }),
}), async (req, res, next) => {
  try { res.json(await service.approve(req.params.id, req.user, req.body)); } catch (e) { next(e); }
});

router.patch('/:id/reject', authAdmin, validate({
  body: z.object({ reason: z.string().optional() }),
}), async (req, res, next) => {
  try { res.json(await service.reject(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); }
});

router.patch('/:id/contact', authAdmin, validate({
  body: z.object({
    contactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']),
    notes: z.string().optional(),
  }),
}), async (req, res, next) => {
  try { res.json(await service.contact(req.params.id, req.user, req.body)); } catch (e) { next(e); }
});

router.patch('/:id/respond', authAdmin, validate({
  body: z.object({
    response: z.enum(['ACCEPTED', 'DECLINED', 'WITHDRAWN', 'COMPLETED']),
    notes: z.string().optional(),
  }),
}), async (req, res, next) => {
  try { res.json(await service.recordResponse(req.params.id, req.user, req.body)); } catch (e) { next(e); }
});

module.exports = router;

const { Router } = require('express');
const service = require('./volunteers.service');
const { authAdmin, authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public / auth-optional: submit volunteer application
router.post('/apply', authUser, validate({
    body: z.object({
        name: z.string().min(2).regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'الاسم يجب أن يحتوي على أحرف ومسافات فقط'),
        email: z.string().email('البريد الإلكتروني غير صالح'),
        phone: z.string().regex(/^01[0125]\d{8}$/, 'رقم الهاتف يجب أن يكون رقم مصري صالح مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015'),
        area: z.enum(['MEDICAL', 'EDUCATION', 'COMMUNITY', 'TECH', 'ADMIN', 'FIELD']),
        message: z.string().optional().nullable(),
        cvFile: z.string().optional().nullable(),
        cvUrl: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
    }),
}), async (req, res, next) => {
    try { res.status(201).json(await service.create({ ...req.body, userId: req.user.id })); } catch (e) { next(e); }
});

// User: fetch my applications
router.get('/my-applications', authUser, async (req, res, next) => {
    try { res.json(await service.getMyApplications(req.user.id)); } catch (e) { next(e); }
});

// Admin: list volunteer applications
router.get('/', authAdmin, async (req, res, next) => {
    try { res.json(await service.list(req.query)); } catch (e) { next(e); }
});

// Admin: approve volunteer application with mandatory notes
router.patch('/:id/approve', authAdmin, validate({
    body: z.object({
        notes: z.string().min(1, 'ملاحظات القبول مطلوبة إجبارياً'),
    }),
}), async (req, res, next) => {
    try { res.json(await service.approve(req.params.id, req.user, req.body.notes)); } catch (e) { next(e); }
});

// Admin: reject volunteer application with mandatory reason
router.patch('/:id/reject', authAdmin, validate({
    body: z.object({
        reason: z.string().min(1, 'سبب الرفض مطلوب إجبارياً'),
    }),
}), async (req, res, next) => {
    try { res.json(await service.reject(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); }
});

// Admin: log call outcome for a volunteer
router.patch('/:id/log-call', authAdmin, validate({
    body: z.object({
        outcome: z.enum([
            'Call Successful - Onboarding Initiated',
            'Candidate Refused / Changed their Mind',
            'No Answer / Try Again Later'
        ], { errorMap: () => ({ message: 'الرجاء اختيار نتيجة مكالمة صالحة' }) }),
        notes: z.string().optional().nullable(),
    }),
}), async (req, res, next) => {
    try { res.json(await service.logCall(req.params.id, req.user, req.body.outcome, req.body.notes)); } catch (e) { next(e); }
});

// Admin: request additional info from volunteer applicant
router.patch('/:id/request-info', authAdmin, validate({
    body: z.object({
        message: z.string().min(1, 'الرسالة مطلوبة إجبارياً'),
    }),
}), async (req, res, next) => {
    try { res.json(await service.requestInfo(req.params.id, req.user, req.body.message)); } catch (e) { next(e); }
});

// Volunteer: submit additional info / response (authenticated user)
router.patch('/:id/submit-info', authUser, validate({
    body: z.object({
        response: z.string().min(1, 'الرسالة مطلوبة إجبارياً'),
    }),
}), async (req, res, next) => {
    try { res.json(await service.submitInfo(req.params.id, req.user.id, req.body.response)); } catch (e) { next(e); }
});

module.exports = router;

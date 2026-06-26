const { Router } = require('express');
const service = require('./special-requests.service');
const { authAdmin, authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public / auth-optional: submit a new special aid request
router.post('/', validate({
    body: z.object({
        name: z.string().min(2).regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'الاسم يجب أن يحتوي على أحرف ومسافات فقط'),
        email: z.string().email('البريد الإلكتروني غير صالح').optional().nullable().or(z.literal('')),
        phone: z.string().regex(/^01[0125]\d{8}$/, 'رقم الهاتف يجب أن يكون رقم مصري صالح مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015'),
        requestType: z.string().min(2, 'نوع المساعدة مطلوب'),
        description: z.string().min(10, 'تفاصيل الطلب يجب أن تكون 10 أحرف على الأقل'),
        userId: z.string().optional().nullable(),
    }),
}), async (req, res, next) => {
    try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
});

// User: fetch my requests
router.get('/my-requests', authUser, async (req, res, next) => {
    try { res.json(await service.getMyRequests(req.user.id)); } catch (e) { next(e); }
});

// Admin: list all requests with filters
router.get('/', authAdmin, async (req, res, next) => {
    try { res.json(await service.list(req.query)); } catch (e) { next(e); }
});

// Admin: update request status
router.patch('/:id/status', authAdmin, validate({
    body: z.object({
        status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], { errorMap: () => ({ message: 'الحالة غير صالحة' }) }),
        notes: z.string().min(1, 'ملاحظات تغيير الحالة مطلوبة إجبارياً'),
    }),
}), async (req, res, next) => {
    try { res.json(await service.updateStatus(req.params.id, req.user, req.body.status, req.body.notes)); } catch (e) { next(e); }
});

// Admin: allocate aid for approved requests
router.patch('/:id/allocate', authAdmin, validate({
    body: z.object({
        aidType: z.string().min(1, 'نوع المساعدة المخصصة مطلوب'),
        aidAmount: z.number().nonnegative('المبلغ المالي يجب أن يكون أكبر من أو يساوي الصفر').optional().nullable(),
        aidQuantity: z.string().optional().nullable(),
        distributionStatus: z.enum(['Assigned', 'Disbursed', 'Delivered'], { errorMap: () => ({ message: 'حالة التوزيع غير صالحة' }) }),
    }),
}), async (req, res, next) => {
    try { res.json(await service.allocateAid(req.params.id, req.user, req.body)); } catch (e) { next(e); }
});

module.exports = router;

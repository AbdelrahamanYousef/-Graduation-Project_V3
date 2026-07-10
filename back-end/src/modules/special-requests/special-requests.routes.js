const { Router } = require('express');
const service = require('./special-requests.service');
const { authUser, authAdmin, authRoles, optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Submit online request (User/Guest) / offline request (Admin)
router.post('/', optionalAuth, validate({
    body: z.object({
        name: z.string().min(2).optional().nullable(),
        email: z.string().email().optional().nullable().or(z.literal('')),
        phone: z.string().optional().nullable(),
        requestType: z.string().min(2, 'نوع المساعدة مطلوب'),
        description: z.string().min(10, 'تفاصيل الطلب يجب أن تكون 10 أحرف على الأقل'),
        source: z.enum(['ONLINE', 'OFFLINE']).optional(),
        offlineName: z.string().optional().nullable(),
        offlinePhone: z.string().optional().nullable(),
        offlineNationalId: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
    }),
}), async (req, res, next) => {
    try {
        const actor = req.user || null;
        res.status(201).json(await service.create(req.body, actor));
    } catch (e) { next(e); }
});

// Admin: list all requests with filters
router.get('/', authRoles(['ADMIN']), async (req, res, next) => {
    try {
        res.json(await service.list(req.query));
    } catch (e) { next(e); }
});

// User: fetch my requests
router.get('/my-requests', authUser, async (req, res, next) => {
    try {
        res.json(await service.getMyRequests(req.user.id));
    } catch (e) { next(e); }
});

// Researcher: list requests assigned to me
router.get('/assigned', authRoles(['RESEARCHER']), async (req, res, next) => {
    try {
        res.json(await service.getAssignedRequests(req.user.id));
    } catch (e) { next(e); }
});

// Get detail of a specific case with guards (Admin, Assigned Researcher, or Applicant Owner)
router.get('/:id', authUser, async (req, res, next) => {
    try {
        res.json(await service.getById(req.params.id, req.user));
    } catch (e) { next(e); }
});

// Admin: Assign researcher to a request
router.patch('/:id/assign', authRoles(['ADMIN']), validate({
    body: z.object({
        researcherId: z.string().min(1, 'معرف الباحث الميداني مطلوب'),
    }),
}), async (req, res, next) => {
    try {
        res.json(await service.assignResearcher(req.params.id, req.body.researcherId, req.user));
    } catch (e) { next(e); }
});

// Add document to a case (Admin, Assigned Researcher, or Applicant Owner)
router.post('/:id/documents', authUser, validate({
    body: z.object({
        docType: z.enum(['ID', 'MEDICAL', 'OTHER']),
        fileUrl: z.string().min(1, 'رابط الملف مطلوب'),
    }),
}), async (req, res, next) => {
    try {
        res.status(201).json(await service.uploadDocument(req.params.id, req.body, req.user));
    } catch (e) { next(e); }
});

// Submit field report (Admin / Assigned Researcher)
router.post('/:id/field-report', authRoles(['ADMIN', 'RESEARCHER']), validate({
    body: z.object({
        visitDate: z.string().min(1, 'تاريخ الزيارة مطلوب'),
        housingCondition: z.string().min(2, 'حالة السكن مطلوبة'),
        incomeEstimate: z.number().nonnegative('تقدير الدخل مطلوب ويجب أن يكون صفراً أو أكثر'),
        researcherNotes: z.string().min(5, 'ملاحظات الباحث مطلوبة'),
        recommendation: z.enum(['APPROVE', 'REJECT']),
    }),
}), async (req, res, next) => {
    try {
        res.status(201).json(await service.submitFieldReport(req.params.id, req.body, req.user));
    } catch (e) { next(e); }
});

// Admin: Make final decision (APPROVED / REJECTED)
router.patch('/:id/status', authRoles(['ADMIN']), validate({
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        notes: z.string().min(1, 'ملاحظات القرار مطلوبة إجبارياً'),
    }),
}), async (req, res, next) => {
    try {
        res.json(await service.updateStatus(req.params.id, req.user, req.body.status, req.body.notes));
    } catch (e) { next(e); }
});

// Admin: Allocate aid details (Admin only)
router.patch('/:id/allocate', authRoles(['ADMIN']), validate({
    body: z.object({
        aidType: z.string().min(1, 'نوع المساعدة المخصصة مطلوب'),
        aidAmount: z.number().nonnegative('المبلغ المالي يجب أن يكون أكبر من أو يساوي الصفر').optional().nullable(),
        aidQuantity: z.string().optional().nullable(),
        distributionStatus: z.enum(['Assigned', 'Disbursed', 'Delivered']),
    }),
}), async (req, res, next) => {
    try {
        res.json(await service.allocateAid(req.params.id, req.user, req.body));
    } catch (e) { next(e); }
});

// Set case status to PENDING_DOCS (Admin / Assigned Researcher)
router.patch('/:id/set-pending-docs', authRoles(['ADMIN', 'RESEARCHER']), async (req, res, next) => {
    try {
        res.json(await service.setPendingDocs(req.params.id, req.user));
    } catch (e) { next(e); }
});

module.exports = router;

const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');
const ApiError = require('../../shared/ApiError');

/**
 * Submit a new help request
 */
async function create(data, actor = null) {
    const { name, email, phone, requestType, description } = data;

    let source = 'ONLINE';
    let userId = null;
    let offlineName = null;
    let offlinePhone = null;
    let offlineNationalId = null;

    if (actor && actor.role === 'ADMIN') {
        source = data.source || 'OFFLINE';
        offlineName = data.offlineName || null;
        offlinePhone = data.offlinePhone || null;
        offlineNationalId = data.offlineNationalId || null;
        userId = data.userId || null;
    } else if (actor) {
        userId = actor.id;
    }

    if (userId) {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            if (actor && actor.role === 'ADMIN') {
                throw ApiError.badRequest('المستفيد المختار غير موجود في النظام');
            } else {
                userId = null;
            }
        }
    }

    const request = await prisma.helpRequest.create({
        data: {
            source,
            name: source === 'ONLINE' ? (name || null) : null,
            email: source === 'ONLINE' ? (email || null) : null,
            phone: source === 'ONLINE' ? (phone || null) : null,
            requestType,
            description,
            offlineName: source === 'OFFLINE' ? offlineName : null,
            offlinePhone: source === 'OFFLINE' ? offlinePhone : null,
            offlineNationalId: source === 'OFFLINE' ? offlineNationalId : null,
            userId,
            status: 'NEW',
        },
    });

    // Create process log
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: request.id,
            action: 'SUBMITTED',
            performedById: actor ? actor.id : null,
            details: 'تم تقديم طلب المساعدة بنجاح',
        },
    });

    // Create notification for all ADMIN users
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', status: 'ACTIVE', deletedAt: null },
        select: { id: true },
    });

    if (admins.length > 0) {
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                title: 'طلب مساعدة جديد',
                message: `${source === 'ONLINE' ? name : offlineName}: ${requestType}`,
                type: 'SPECIAL_REQUEST',
                isForAdmin: true,
            })),
        });
    }

    return request;
}

/**
 * List all help requests with filters (Admin only)
 */
async function list(query = {}) {
    const { status, name, dateFrom, dateTo } = query;
    const where = {};

    if (status) where.status = status;
    if (name) {
        where.OR = [
            { name: { contains: name } },
            { offlineName: { contains: name } }
        ];
    }

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    return prisma.helpRequest.findMany({
        where,
        include: {
            reviewedBy: { select: { id: true, name: true } },
            assignedResearcher: { select: { id: true, name: true } },
            processLogs: {
                include: {
                    performedBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            user: { select: { id: true, name: true } },
            documents: true,
            fieldReports: {
                include: {
                    researcher: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Fetch help requests of the logged-in user
 */
async function getMyRequests(userId) {
    return prisma.helpRequest.findMany({
        where: { userId },
        include: {
            processLogs: {
                orderBy: { createdAt: 'desc' },
            },
            documents: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Fetch help requests assigned to the logged-in researcher
 */
async function getAssignedRequests(researcherId) {
    return prisma.helpRequest.findMany({
        where: { assignedResearcherId: researcherId },
        include: {
            processLogs: {
                orderBy: { createdAt: 'desc' },
            },
            documents: true,
            user: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get help request details by ID with access/redaction guards
 */
async function getById(id, actor) {
    const request = await prisma.helpRequest.findUnique({
        where: { id },
        include: {
            reviewedBy: { select: { id: true, name: true } },
            assignedResearcher: { select: { id: true, name: true } },
            processLogs: {
                include: {
                    performedBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            user: { select: { id: true, name: true } },
            documents: true,
            fieldReports: {
                include: {
                    researcher: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!request) throw ApiError.notFound('Aid request not found');

    if (actor.role === 'ADMIN') {
        return request;
    }

    if (actor.role === 'RESEARCHER') {
        if (request.assignedResearcherId !== actor.id) {
            throw ApiError.forbidden('Access denied: not assigned to this case');
        }
        return request;
    }

    if (actor.role === 'USER') {
        if (request.userId !== actor.id) {
            throw ApiError.forbidden('Access denied: not your request');
        }
        // Redact sensitive field reports details
        const redactedRequest = { ...request };
        delete redactedRequest.fieldReports;
        return redactedRequest;
    }

    throw ApiError.forbidden('Access denied');
}

/**
 * Assign a researcher to a case
 */
async function assignResearcher(id, researcherId, adminUser) {
    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');

    // Terminal state guard
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        throw ApiError.conflict('Cannot assign researcher to a finalized request');
    }

    const researcher = await prisma.user.findUnique({
        where: { id: researcherId, deletedAt: null, role: 'RESEARCHER' }
    });
    if (!researcher) throw ApiError.badRequest('Invalid researcher ID');

    const updated = await prisma.helpRequest.update({
        where: { id },
        data: {
            assignedResearcherId: researcherId,
            status: 'FIELD_RESEARCH'
        }
    });

    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: 'ASSIGNED',
            performedById: adminUser.id,
            details: `تم تعيين الباحث الميداني ${researcher.name} وتغيير الحالة إلى دراسة ميدانية`,
        }
    });

    // Notify researcher
    await prisma.notification.create({
        data: {
            userId: researcherId,
            title: 'حالة مساعدة جديدة تم تعيينها لك',
            message: `تم تعيين الحالة رقم ${id} لك لمتابعتها`,
            type: 'SPECIAL_REQUEST',
            isForAdmin: false,
        }
    });

    return updated;
}

/**
 * Upload a document attachment to a case
 */
async function uploadDocument(id, documentData, actor) {
    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');

    // Terminal state guard
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        throw ApiError.conflict('Cannot upload documents to a finalized request');
    }

    // Ownership check
    if (actor.role === 'RESEARCHER' && request.assignedResearcherId !== actor.id) {
        throw ApiError.forbidden('Access denied: not assigned to this case');
    }
    if (actor.role === 'USER' && request.userId !== actor.id) {
        throw ApiError.forbidden('Access denied: not your request');
    }
    if (actor.role !== 'ADMIN' && actor.role !== 'RESEARCHER' && actor.role !== 'USER') {
        throw ApiError.forbidden('Access denied');
    }

    const document = await prisma.requestDocument.create({
        data: {
            helpRequestId: id,
            docType: documentData.docType,
            fileUrl: documentData.fileUrl
        }
    });

    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: 'DOCUMENT_UPLOADED',
            performedById: actor.id,
            details: `تم رفع مستند من نوع ${documentData.docType}`,
        }
    });

    // PENDING_DOCS transition logic
    if (request.status === 'PENDING_DOCS') {
        const report = await prisma.fieldReport.findFirst({
            where: { helpRequestId: id }
        });
        const targetStatus = report ? 'REVIEW' : 'FIELD_RESEARCH';

        await prisma.helpRequest.update({
            where: { id },
            data: { status: targetStatus }
        });

        await prisma.helpRequestProcessLog.create({
            data: {
                helpRequestId: id,
                action: targetStatus,
                performedById: actor.id,
                details: `تم استلام المستندات وتغيير حالة الطلب إلى ${targetStatus === 'REVIEW' ? 'مراجعة الإدارة' : 'دراسة ميدانية'}`,
            }
        });
    }

    return document;
}

/**
 * Submit a field report
 */
async function submitFieldReport(id, reportData, researcherUser) {
    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');

    // Terminal state guard
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        throw ApiError.conflict('Cannot submit a field report on a finalized request');
    }

    // Ownership check
    if (researcherUser.role === 'RESEARCHER' && request.assignedResearcherId !== researcherUser.id) {
        throw ApiError.forbidden('Access denied: not assigned to this case');
    }

    const { visitDate, housingCondition, incomeEstimate, researcherNotes, recommendation } = reportData;

    const report = await prisma.fieldReport.create({
        data: {
            helpRequestId: id,
            researcherId: researcherUser.id,
            visitDate: new Date(visitDate),
            housingCondition,
            incomeEstimate: parseFloat(incomeEstimate),
            researcherNotes,
            recommendation
        }
    });

    // Update status to REVIEW
    await prisma.helpRequest.update({
        where: { id },
        data: { status: 'REVIEW' }
    });

    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: 'REVIEW',
            performedById: researcherUser.id,
            details: `تم تقديم التقرير الميداني وتغيير حالة الطلب إلى مراجعة الإدارة`,
        }
    });

    return report;
}

/**
 * Update request status (Admin only final decision)
 */
async function updateStatus(id, adminUser, status, notes) {
    if (!notes || notes.trim() === '') {
        throw ApiError.badRequest('ملاحظات تغيير الحالة مطلوبة إجبارياً');
    }

    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');

    const updateData = {
        status,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
    };

    if (status === 'REJECTED') {
        updateData.rejectionReason = notes;
    } else {
        updateData.adminNotes = notes;
    }

    const updated = await prisma.helpRequest.update({
        where: { id },
        data: updateData,
    });

    // Create process log
    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: status,
            performedById: adminUser.id,
            details: notes,
        },
    });

    // Notify applicant if exists
    if (request.userId) {
        await prisma.notification.create({
            data: {
                userId: request.userId,
                title: `تحديث حالة طلب المساعدة`,
                message: `تم تحديث حالة طلب المساعدة الخاص بك إلى ${status === 'APPROVED' ? 'مقبول' : 'مرفوض'}`,
                type: 'SPECIAL_REQUEST',
                isForAdmin: false,
            },
        });
    }

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: `HELP_REQUEST_${status}`,
        entity: 'HelpRequest',
        entityId: id,
        payload: { name: request.name || request.offlineName, notes },
    });

    return updated;
}

/**
 * Allocate aid details (Admin only)
 */
async function allocateAid(id, adminUser, allocationData) {
    const { aidType, aidAmount, aidQuantity, distributionStatus } = allocationData;

    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');
    if (request.status !== 'APPROVED') {
        throw ApiError.badRequest('يمكن فقط تخصيص المساعدات للطلبات المقبولة (APPROVED)');
    }

    const updated = await prisma.helpRequest.update({
        where: { id },
        data: {
            aidType,
            aidAmount: aidAmount ? parseFloat(aidAmount) : null,
            aidQuantity: aidQuantity || null,
            distributionStatus: distributionStatus || 'Assigned',
        },
    });

    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: 'AID_ALLOCATED',
            performedById: adminUser.id,
            details: `تم تخصيص ${aidType} بقيمة ${aidAmount || 0} ج.م وبكمية ${aidQuantity || 'غير محددة'}`,
        },
    });

    return updated;
}

/**
 * Put case into PENDING_DOCS status
 */
async function setPendingDocs(id, actor) {
    const request = await prisma.helpRequest.findUnique({ where: { id } });
    if (!request) throw ApiError.notFound('Aid request not found');

    // Terminal state guard
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        throw ApiError.conflict('Cannot set a finalized request to pending docs');
    }

    // Ownership check
    if (actor.role === 'RESEARCHER' && request.assignedResearcherId !== actor.id) {
        throw ApiError.forbidden('Access denied: not assigned to this case');
    }

    const updated = await prisma.helpRequest.update({
        where: { id },
        data: { status: 'PENDING_DOCS' }
    });

    await prisma.helpRequestProcessLog.create({
        data: {
            helpRequestId: id,
            action: 'PENDING_DOCS',
            performedById: actor.id,
            details: 'تم تعليق الطلب وتغيير الحالة إلى بانتظار المستندات',
        }
    });

    return updated;
}

module.exports = {
    create,
    list,
    getMyRequests,
    getAssignedRequests,
    getById,
    assignResearcher,
    uploadDocument,
    submitFieldReport,
    updateStatus,
    allocateAid,
    setPendingDocs
};

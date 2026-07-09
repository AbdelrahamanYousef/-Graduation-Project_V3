const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');
const { sendVolunteerApprovalEmail } = require('../../lib/email');

/**
 * Submit a new volunteer application (public / auth-optional)
 */
async function create(data) {
    const { name, email, phone, area, message, cvFile, cvUrl, userId } = data;

    const app = await prisma.volunteerApplication.create({
        data: {
            name,
            email,
            phone,
            area,
            message: message || null,
            cvFile: cvFile || null,
            cvUrl: cvUrl || null,
            userId: userId || null,
            status: 'PENDING',
        },
    });

    // Create process log
    await prisma.volunteerProcessLog.create({
        data: {
            volunteerId: app.id,
            action: 'SUBMITTED',
            details: { notes: 'تم تقديم طلب التطوع بنجاح' },
        },
    });

    return app;
}

/**
 * List volunteer applications (admin)
 */
async function list(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;

    return prisma.volunteerApplication.findMany({
        where,
        include: {
            reviewedBy: { select: { id: true, name: true } },
            processLogs: {
                include: {
                    performedBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Fetch volunteer applications of the logged-in user
 */
async function getMyApplications(userId) {
    return prisma.volunteerApplication.findMany({
        where: { userId },
        include: {
            processLogs: {
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Approve a volunteer application (admin)
 */
async function approve(id, adminUser, notes) {
    if (!notes || notes.trim() === '') {
        throw new Error('ملاحظات القبول مطلوبة إجبارياً');
    }

    const app = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!app) throw new Error('Volunteer application not found');
    if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be approved');

    const updated = await prisma.volunteerApplication.update({
        where: { id },
        data: {
            status: 'APPROVED',
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
            adminNotes: notes,
        },
    });

    // Log to process logs
    await prisma.volunteerProcessLog.create({
        data: {
            volunteerId: id,
            action: 'APPROVED',
            performedById: adminUser.id,
            details: { notes },
        },
    });

    // Create notification for the admin who approved
    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم قبول طلب تطوع',
            message: `تم قبول طلب تطوع ${app.name} في مجال ${app.area}`,
            type: 'VOLUNTEER',
            isForAdmin: true,
        },
    });

    // Create notification for the user who applied
    if (app.userId) {
        await prisma.notification.create({
            data: {
                userId: app.userId,
                title: 'تحديث حالة طلب التطوع',
                message: `تم قبول طلب التطوع الخاص بك في مجال ${app.area}`,
                type: 'VOLUNTEER',
                isForAdmin: false,
            },
        });
    }

    // Send automated email if candidate has an email
    if (app.email) {
        await sendVolunteerApprovalEmail(app.email, app.name);
    }

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'VOLUNTEER_APPROVED',
        entity: 'VolunteerApplication',
        entityId: id,
        payload: { name: app.name, area: app.area, notes },
    });

    return updated;
}

/**
 * Reject a volunteer application (admin)
 */
async function reject(id, adminUser, reason) {
    if (!reason || reason.trim() === '') {
        throw new Error('سبب الرفض مطلوب إجبارياً');
    }

    const app = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!app) throw new Error('Volunteer application not found');
    if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be rejected');

    const updated = await prisma.volunteerApplication.update({
        where: { id },
        data: {
            status: 'REJECTED',
            reviewedById: adminUser.id,
            reviewedAt: new Date(),
            rejectionReason: reason,
        },
    });

    // Log to process logs
    await prisma.volunteerProcessLog.create({
        data: {
            volunteerId: id,
            action: 'REJECTED',
            performedById: adminUser.id,
            details: { notes: reason },
        },
    });

    // Create notification
    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            title: 'تم رفض طلب تطوع',
            message: `تم رفض طلب تطوع ${app.name}: ${reason}`,
            type: 'VOLUNTEER',
            isForAdmin: true,
        },
    });

    // Create notification for the user who applied
    if (app.userId) {
        await prisma.notification.create({
            data: {
                userId: app.userId,
                title: 'تحديث حالة طلب التطوع',
                message: `تم رفض طلب التطوع الخاص بك: ${reason}`,
                type: 'VOLUNTEER',
                isForAdmin: false,
            },
        });
    }

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'VOLUNTEER_REJECTED',
        entity: 'VolunteerApplication',
        entityId: id,
        payload: { name: app.name, reason },
    });

    return updated;
}

/**
 * Log a phone call outcome for a volunteer (admin)
 */
async function logCall(id, adminUser, outcome, notes) {
    if (!outcome || outcome.trim() === '') {
        throw new Error('نتيجة المكالمة مطلوبة إجبارياً');
    }

    const app = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!app) throw new Error('Volunteer application not found');

    // Determine new status based on call outcome
    let newStatus = app.status;
    if (outcome === 'Call Successful - Onboarding Initiated') {
        newStatus = 'Accepted - Onboarding';
    } else if (outcome === 'Candidate Refused / Changed their Mind') {
        newStatus = 'Withdrawn by Applicant';
    } else if (outcome === 'No Answer / Try Again Later') {
        newStatus = 'No Answer - Try Later';
    }

    const updated = await prisma.volunteerApplication.update({
        where: { id },
        data: {
            status: newStatus,
        },
    });

    // Log to process logs
    await prisma.volunteerProcessLog.create({
        data: {
            volunteerId: id,
            action: 'PHONE_CALL',
            performedById: adminUser.id,
            details: { outcome, notes: notes || null },
        },
    });

    // Audit log
    await auditLog.log({
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'VOLUNTEER_CALL_LOGGED',
        entity: 'VolunteerApplication',
        entityId: id,
        payload: { name: app.name, outcome, notes },
    });

    return updated;
}

module.exports = { create, list, getMyApplications, approve, reject, logCall };

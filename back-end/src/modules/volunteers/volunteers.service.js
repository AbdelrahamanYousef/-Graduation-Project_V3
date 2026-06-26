const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

async function create(data, userId) {
  const app = await prisma.volunteerApplication.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      area: data.area,
      message: data.message || null,
      cvFile: data.cvFile || null,
      cvUrl: data.cvUrl || null,
      userId: userId || null,
      status: 'PENDING',
    },
  });

  await prisma.volunteerProcessLog.create({
    data: {
      volunteerId: app.id,
      action: 'SUBMITTED',
      performedById: userId || null,
      details: { name: data.name, area: data.area },
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', status: 'ACTIVE', deletedAt: null },
    select: { id: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: 'طلب تطوع جديد',
        message: `${data.name} — ${data.area}`,
        type: 'VOLUNTEER',
      })),
    });
  }

  return app;
}

async function list(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
  }

  return prisma.volunteerApplication.findMany({
    where,
    include: {
      reviewedBy: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      processLogs: {
        include: { performedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id) {
  const app = await prisma.volunteerApplication.findUnique({
    where: { id },
    include: {
      reviewedBy: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      processLogs: {
        include: { performedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!app) throw new Error('Volunteer application not found');
  return app;
}

async function approve(id, adminUser, data = {}) {
  const app = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!app) throw new Error('Volunteer application not found');
  if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be approved');

  const updated = await prisma.volunteerApplication.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      adminNotes: data.adminNotes || null,
      nextSteps: data.nextSteps || null,
    },
  });

  await prisma.volunteerProcessLog.create({
    data: {
      volunteerId: id,
      action: 'APPROVED',
      performedById: adminUser.id,
      details: { adminNotes: data.adminNotes, nextSteps: data.nextSteps },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'تم قبول طلب تطوع',
      message: `تم قبول طلب تطوع ${app.name} في مجال ${app.area}`,
      type: 'VOLUNTEER',
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'VOLUNTEER_APPROVED',
    entity: 'VolunteerApplication',
    entityId: id,
    payload: { name: app.name, area: app.area, adminNotes: data.adminNotes, nextSteps: data.nextSteps },
  });

  return updated;
}

async function reject(id, adminUser, reason) {
  const app = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!app) throw new Error('Volunteer application not found');
  if (app.status !== 'PENDING') throw new Error('Only PENDING applications can be rejected');

  const updated = await prisma.volunteerApplication.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      rejectionReason: reason || null,
    },
  });

  await prisma.volunteerProcessLog.create({
    data: {
      volunteerId: id,
      action: 'REJECTED',
      performedById: adminUser.id,
      details: { reason },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'تم رفض طلب تطوع',
      message: `تم رفض طلب تطوع ${app.name}${reason ? ': ' + reason : ''}`,
      type: 'VOLUNTEER',
    },
  });

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

async function contact(id, adminUser, data) {
  const app = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!app) throw new Error('Volunteer application not found');
  if (app.status !== 'APPROVED') throw new Error('Only APPROVED applications can be contacted');

  const updated = await prisma.volunteerApplication.update({
    where: { id },
    data: {
      status: 'CONTACTED',
      contactMethod: data.contactMethod,
      contactedAt: new Date(),
      responseNotes: data.notes || null,
    },
  });

  await prisma.volunteerProcessLog.create({
    data: {
      volunteerId: id,
      action: 'CONTACTED',
      performedById: adminUser.id,
      details: { contactMethod: data.contactMethod, notes: data.notes },
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'VOLUNTEER_CONTACTED',
    entity: 'VolunteerApplication',
    entityId: id,
    payload: { contactMethod: data.contactMethod },
  });

  return updated;
}

async function recordResponse(id, adminUser, data) {
  const app = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!app) throw new Error('Volunteer application not found');
  if (app.status !== 'CONTACTED') throw new Error('Only CONTACTED applications can record a response');

  let newStatus;
  if (data.response === 'ACCEPTED') newStatus = 'CONFIRMED';
  else if (data.response === 'DECLINED' || data.response === 'WITHDRAWN') newStatus = 'WITHDRAWN';
  else if (data.response === 'CHANGED_MIND') newStatus = 'PENDING';
  else throw new Error('Invalid response value. Use ACCEPTED, DECLINED, WITHDRAWN, or CHANGED_MIND');

  const updated = await prisma.volunteerApplication.update({
    where: { id },
    data: {
      status: newStatus,
      applicantResponse: data.response,
      respondedAt: new Date(),
      responseNotes: data.notes || null,
    },
  });

  await prisma.volunteerProcessLog.create({
    data: {
      volunteerId: id,
      action: 'RESPONDED',
      performedById: adminUser.id,
      details: { response: data.response, notes: data.notes, newStatus },
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'VOLUNTEER_RESPONSE_RECORDED',
    entity: 'VolunteerApplication',
    entityId: id,
    payload: { response: data.response, newStatus },
  });

  return updated;
}

module.exports = { create, list, getById, approve, reject, contact, recordResponse };

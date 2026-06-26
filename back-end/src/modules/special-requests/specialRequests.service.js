const prisma = require('../../lib/prisma');
const auditLog = require('../audit/auditLog.service');

async function getById(id) {
  const request = await prisma.specialRequest.findUnique({
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
  if (!request) throw new Error('Special request not found');
  return request;
}

async function create(data, userId) {
  const request = await prisma.specialRequest.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      requestType: data.requestType,
      description: data.description,
      userId: userId || null,
      status: 'PENDING',
    },
  });

  await prisma.specialRequestProcessLog.create({
    data: {
      specialRequestId: request.id,
      action: 'SUBMITTED',
      performedById: userId || null,
      details: { name: data.name, requestType: data.requestType },
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
        title: 'طلب خاص جديد',
        message: `${data.name}: ${data.requestType}`,
        type: 'SPECIAL_REQUEST',
      })),
    });
  }

  return request;
}

async function list(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.aidType) where.aidType = query.aidType;
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
  }

  return prisma.specialRequest.findMany({
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

async function approve(id, adminUser, data = {}) {
  const request = await prisma.specialRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Special request not found');
  if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be approved');

  const updated = await prisma.specialRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      aidType: data.aidType || null,
      adminNotes: data.adminNotes || null,
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.specialRequestProcessLog.create({
    data: {
      specialRequestId: id,
      action: 'APPROVED',
      performedById: adminUser.id,
      details: { aidType: data.aidType, adminNotes: data.adminNotes },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'تم الموافقة على طلب خاص',
      message: `تمت الموافقة على طلب ${request.name} - ${request.requestType}${data.aidType ? ' (نوع المساعدة: ' + data.aidType + ')' : ''}`,
      type: 'SPECIAL_REQUEST',
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'SPECIAL_REQUEST_APPROVED',
    entity: 'SpecialRequest',
    entityId: id,
    payload: { name: request.name, requestType: request.requestType, aidType: data.aidType },
  });

  return updated;
}

async function reject(id, adminUser, reason) {
  const request = await prisma.specialRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Special request not found');
  if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be rejected');

  const updated = await prisma.specialRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || null,
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.specialRequestProcessLog.create({
    data: {
      specialRequestId: id,
      action: 'REJECTED',
      performedById: adminUser.id,
      details: { reason },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'تم رفض طلب خاص',
      message: `تم رفض طلب ${request.name}${reason ? ': ' + reason : ''}`,
      type: 'SPECIAL_REQUEST',
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'SPECIAL_REQUEST_REJECTED',
    entity: 'SpecialRequest',
    entityId: id,
    payload: { name: request.name, reason },
  });

  return updated;
}

async function contact(id, adminUser, data) {
  const request = await prisma.specialRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Special request not found');
  if (request.status !== 'APPROVED') throw new Error('Only APPROVED requests can be contacted');

  const updated = await prisma.specialRequest.update({
    where: { id },
    data: {
      status: 'CONTACTED',
      contactMethod: data.contactMethod,
      contactedAt: new Date(),
      responseNotes: data.notes || null,
    },
  });

  await prisma.specialRequestProcessLog.create({
    data: {
      specialRequestId: id,
      action: 'CONTACTED',
      performedById: adminUser.id,
      details: { contactMethod: data.contactMethod, notes: data.notes },
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'SPECIAL_REQUEST_CONTACTED',
    entity: 'SpecialRequest',
    entityId: id,
    payload: { contactMethod: data.contactMethod },
  });

  return updated;
}

async function recordResponse(id, adminUser, data) {
  const request = await prisma.specialRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Special request not found');
  if (request.status !== 'CONTACTED') throw new Error('Only CONTACTED requests can record a response');

  let newStatus;
  if (data.response === 'ACCEPTED') newStatus = 'CONFIRMED';
  else if (data.response === 'COMPLETED') newStatus = 'COMPLETED';
  else if (data.response === 'DECLINED' || data.response === 'WITHDRAWN') newStatus = 'REJECTED';
  else throw new Error('Invalid response value. Use ACCEPTED, DECLINED, WITHDRAWN, or COMPLETED');

  const updated = await prisma.specialRequest.update({
    where: { id },
    data: {
      status: newStatus,
      applicantResponse: data.response,
      respondedAt: new Date(),
      responseNotes: data.notes || null,
    },
  });

  await prisma.specialRequestProcessLog.create({
    data: {
      specialRequestId: id,
      action: 'RESPONDED',
      performedById: adminUser.id,
      details: { response: data.response, notes: data.notes, newStatus },
    },
  });

  await auditLog.log({
    actorId: adminUser.id,
    actorRole: 'ADMIN',
    action: 'SPECIAL_REQUEST_RESPONSE_RECORDED',
    entity: 'SpecialRequest',
    entityId: id,
    payload: { response: data.response, newStatus },
  });

  return updated;
}

module.exports = { getById, create, list, approve, reject, contact, recordResponse };

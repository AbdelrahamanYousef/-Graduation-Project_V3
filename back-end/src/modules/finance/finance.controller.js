const service = require('./finance.service');

async function listDisbursements(req, res, next) { try { res.json(await service.listDisbursements(req.query)); } catch (e) { next(e); } }
async function createDisbursement(req, res, next) { try { res.status(201).json(await service.createDisbursement(req.body)); } catch (e) { next(e); } }
async function approve(req, res, next) { try { res.json(await service.updateStatus(req.params.id, 'APPROVED', req.user.id)); } catch (e) { next(e); } }
async function reject(req, res, next) { try { res.json(await service.updateStatus(req.params.id, 'REJECTED')); } catch (e) { next(e); } }
async function complete(req, res, next) { try { res.json(await service.updateStatus(req.params.id, 'COMPLETED')); } catch (e) { next(e); } }
async function getOverview(req, res, next) { try { res.json(await service.getOverview(req.query.year)); } catch (e) { next(e); } }
async function getBudgets(req, res, next) { try { res.json(await service.getBudgets()); } catch (e) { next(e); } }

module.exports = { listDisbursements, createDisbursement, approve, reject, complete, getOverview, getBudgets };

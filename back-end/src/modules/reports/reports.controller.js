const service = require('./reports.service');

async function list(req, res, next) { try { res.json(await service.list(req.query)); } catch (e) { next(e); } }
async function create(req, res, next) { try { res.status(201).json(await service.create(req.body, req.user.id)); } catch (e) { next(e); } }
async function getById(req, res, next) { try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); } }
async function getQuickStats(req, res, next) { try { res.json(await service.getQuickStats()); } catch (e) { next(e); } }

module.exports = { list, create, getById, getQuickStats };

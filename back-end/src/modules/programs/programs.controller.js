const service = require('./programs.service');

async function list(req, res, next) {
    try { res.json(await service.list(req.query)); } catch (e) { next(e); }
}
async function getById(req, res, next) {
    try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); }
}
async function create(req, res, next) {
    try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
}
async function update(req, res, next) {
    try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); }
}
async function remove(req, res, next) {
    try { await service.remove(req.params.id); res.json({ success: true }); } catch (e) { next(e); }
}

module.exports = { list, getById, create, update, remove };

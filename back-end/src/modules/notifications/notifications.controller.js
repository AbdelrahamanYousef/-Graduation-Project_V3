const service = require('./notifications.service');

async function list(req, res, next) {
    try { res.json(await service.list(req.user?.id)); } catch (e) { next(e); }
}
async function markRead(req, res, next) {
    try { res.json(await service.markRead(req.params.id)); } catch (e) { next(e); }
}
async function markAllRead(req, res, next) {
    try { res.json(await service.markAllRead(req.user?.id)); } catch (e) { next(e); }
}
async function clearAll(req, res, next) {
    try { res.json(await service.clearAll(req.user?.id)); } catch (e) { next(e); }
}

module.exports = { list, markRead, markAllRead, clearAll };

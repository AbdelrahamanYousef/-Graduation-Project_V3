const service = require('./dashboard.service');

async function getStats(req, res, next) { try { res.json(await service.getStats()); } catch (e) { next(e); } }
async function getRecentDonations(req, res, next) { try { res.json(await service.getRecentDonations()); } catch (e) { next(e); } }
async function getProjectsSummary(req, res, next) { try { res.json(await service.getProjectsSummary()); } catch (e) { next(e); } }
async function getRecentActivity(req, res, next) { try { res.json(await service.getRecentActivity()); } catch (e) { next(e); } }
async function getPendingTasks(req, res, next) { try { res.json(await service.getPendingTasks()); } catch (e) { next(e); } }
async function completeTask(req, res, next) { try { res.json(await service.completeTask(req.params.id)); } catch (e) { next(e); } }

module.exports = { getStats, getRecentDonations, getProjectsSummary, getRecentActivity, getPendingTasks, completeTask };

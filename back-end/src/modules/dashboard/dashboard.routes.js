const { Router } = require('express');
const ctrl = require('./dashboard.controller');
const { authAdmin } = require('../../middleware/auth');

const router = Router();
router.use(authAdmin);

router.get('/stats', ctrl.getStats);
router.get('/recent-donations', ctrl.getRecentDonations);
router.get('/pending-tasks', ctrl.getPendingTasks);
router.put('/tasks/:id/complete', ctrl.completeTask);
router.get('/activity', ctrl.getRecentActivity);
router.get('/projects-summary', ctrl.getProjectsSummary);

module.exports = router;

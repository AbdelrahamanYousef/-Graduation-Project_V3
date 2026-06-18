const { Router } = require('express');
const ctrl = require('./notifications.controller');
const { optionalAuth } = require('../../middleware/auth');

const router = Router();
router.use(optionalAuth); // works for both admin and donor

router.get('/', ctrl.list);
router.put('/:id/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);
router.delete('/', ctrl.clearAll);

module.exports = router;

const router = require('express').Router();
const controller = require('./ai.controller');
const { optionalAuth } = require('../../middleware/auth');

router.post('/chat', optionalAuth, controller.chat);
router.post('/recommend', controller.recommend);

module.exports = router;

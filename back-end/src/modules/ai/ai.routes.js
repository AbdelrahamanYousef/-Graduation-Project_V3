const router = require('express').Router();
const controller = require('./ai.controller');

router.post('/chat', controller.chat);
router.post('/recommend', controller.recommend);

module.exports = router;

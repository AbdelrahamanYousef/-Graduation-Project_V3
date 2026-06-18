const { Router } = require('express');
const auditService = require('./auditLog.service');
const { authAdmin } = require('../../middleware/auth');

const router = Router();

router.get('/', authAdmin, async (req, res, next) => {
    try {
        res.json(await auditService.list(req.query));
    } catch (e) { next(e); }
});

module.exports = router;

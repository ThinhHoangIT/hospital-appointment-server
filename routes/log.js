const Router = require('koa-router');
const logController = require('../controllers/log');

const router = new Router();

router.get('/', logController.getAllLogs);
router.get('/collection', logController.getLogsByCollection);
router.get('/:id', logController.getLogById);

module.exports = router;

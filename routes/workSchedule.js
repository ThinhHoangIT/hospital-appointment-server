const Router = require('koa-router');
const workScheduleController = require('../controllers/workSchedule');

const router = new Router();

router.get('/', workScheduleController.getAllWorkSchedules);
router.get('/:id', workScheduleController.getWorkScheduleById);
router.post('/', workScheduleController.createWorkSchedule);
router.put('/:id', workScheduleController.updateWorkSchedule);
router.delete('/:id', workScheduleController.deleteWorkSchedule);

module.exports = router;

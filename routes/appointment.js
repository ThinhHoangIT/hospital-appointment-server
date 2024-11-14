const Router = require('koa-router');
const appointmentController = require('../controllers/appointment');

const router = new Router();

router.get('/', appointmentController.getAllAppointments);
router.get(
  '/appointment-by-user/:id',
  appointmentController.getAppointmentsByUserId,
);
router.put('/update-status/:id', appointmentController.updateAppointmentStatus);
router.post('/', appointmentController.createAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;

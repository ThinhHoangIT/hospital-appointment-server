const Router = require('koa-router');
const medicationController = require('../controllers/medication');

const router = new Router();

router.get('/', medicationController.getAllMedications);
router.get('/:id', medicationController.getMedicationById);
router.post('/', medicationController.createMedication);
router.put('/:id', medicationController.updateMedication);
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;

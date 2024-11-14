const Router = require('koa-router');
const invoiceController = require('../controllers/invoice');

const router = new Router();

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getAllInvoiceById);
router.get(
  '/get-by-appointment/:id',
  invoiceController.getInvoiceByAppointmentId,
);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);

module.exports = router;

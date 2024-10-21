const Router = require('koa-router');
const employeeController = require('../controllers/employee');

const router = new Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// auth
router.post('/auth/login', employeeController.login);
router.post('/auth/refresh-token', employeeController.refreshToken);

module.exports = router;

const Router = require('koa-router');
const userController = require('../controllers/user');

const router = new Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
// change password
router.patch('/change-password', userController.changePassword);
// forgot password
router.post('/forgot-password', userController.forgetPassword);
// confirm forgot password
router.post('/confirm-forgot-password', userController.confirmForgetPassword);
router.put('/update-status/:id', userController.updateUserStatus);

// auth
router.post('/auth/register', userController.createUser);
router.post('/auth/login', userController.login);
router.post('/auth/refresh-token', userController.refreshToken);

module.exports = router;

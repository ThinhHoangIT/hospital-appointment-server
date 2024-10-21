const Router = require('koa-router');
const reviewController = require('../controllers/review');

const router = new Router();

router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;

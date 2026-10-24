const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { placeOrder, getMyOrders, getMyOrder, cancelOrder } = require('../controllers/orderController');

router.use(protect);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;

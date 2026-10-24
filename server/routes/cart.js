const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeFromCart, applyCoupon } = require('../controllers/cartController');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.post('/coupon', applyCoupon);

module.exports = router;

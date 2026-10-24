const router = require('express').Router();
const {
  getPublicSettings,
  getPaymentMethods,
  getRates,
  getCategories,
  getCollections,
  getHome,
  getProducts,
  getProduct,
} = require('../controllers/publicController');

router.get('/settings', getPublicSettings);
router.get('/payment-methods', getPaymentMethods);
router.get('/rates', getRates);
router.get('/categories', getCategories);
router.get('/collections', getCollections);
router.get('/home', getHome);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);

module.exports = router;

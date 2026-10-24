const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { httpError } = require('../utils/helpers');

const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

const {
  uploadImages,
  getProducts, createProduct, updateProduct, deleteProduct,
  getRates, updateRates, createRate,
  getOrders, getOrder, updateOrderStatus,
  getDashboard,
  getSettings, updateSettings,
  makeCrud,
} = require('../controllers/adminController');

// Everything below requires a logged-in admin. Normal users get 403.
router.use(protect, adminOnly);

// ---------- generic CRUD ----------
router.use(
  '/categories',
  makeCrud(Category, {
    sort: { order: 1, name: 1 },
    beforeDelete: async (doc) => {
      if (await Product.exists({ category: doc._id }))
        throw httpError(400, 'This category still has products. Move or delete them first.');
    },
  })
);
router.use(
  '/collections',
  makeCrud(Collection, {
    sort: { order: 1, name: 1 },
    beforeDelete: (doc) => Product.updateMany({ collections: doc._id }, { $pull: { collections: doc._id } }),
  })
);
router.use('/banners', makeCrud(Banner, { sort: { order: 1, createdAt: -1 } }));
router.use('/coupons', makeCrud(Coupon));

// ---------- image upload ----------
router.post('/upload', upload.array('images', 8), uploadImages);

// ---------- products ----------
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ---------- metal rates ----------
router.get('/rates', getRates);
router.put('/rates', updateRates);
router.post('/rates', createRate);

// ---------- orders ----------
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/status', updateOrderStatus);

// ---------- dashboard ----------
router.get('/dashboard', getDashboard);

// ---------- settings ----------
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;

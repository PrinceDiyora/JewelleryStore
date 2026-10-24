const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Banner = require('../models/Banner');
const MetalRate = require('../models/MetalRate');
const Settings = require('../models/Settings');
const { ah, httpError } = require('../utils/helpers');
const { getPricingContext, withPrice } = require('../utils/pricing');
const { listMethods } = require('../utils/payment');

const byOrder = { order: 1, name: 1 };
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get(
  '/settings',
  ah(async (req, res) => {
    const s = await Settings.getSingleton();
    res.json({
      storeName: s.storeName,
      gstPercent: s.gstPercent,
      email: s.email,
      phone: s.phone,
      address: s.address,
    });
  })
);

router.get('/payment-methods', (req, res) => res.json(listMethods()));

router.get(
  '/rates',
  ah(async (req, res) => res.json(await MetalRate.find().sort({ metal: 1, purity: -1 }).lean()))
);

router.get(
  '/categories',
  ah(async (req, res) => res.json(await Category.find({ active: true }).sort(byOrder)))
);

router.get(
  '/collections',
  ah(async (req, res) => res.json(await Collection.find({ active: true }).sort(byOrder)))
);

router.get(
  '/home',
  ah(async (req, res) => {
    const [banners, categories, collections, featured, ctx] = await Promise.all([
      Banner.find({ active: true }).sort(byOrder),
      Category.find({ active: true }).sort(byOrder),
      Collection.find({ active: true }).sort(byOrder),
      Product.find({ active: true, featured: true }).sort({ createdAt: -1 }).limit(8).populate('category', 'name').lean(),
      getPricingContext(),
    ]);
    res.json({ banners, categories, collections, featured: featured.map((p) => withPrice(p, ctx)) });
  })
);

// Listing: search, filters, sorting, pagination.
// Price depends on today's rate, so price filter/sort run after pricing.
router.get(
  '/products',
  ah(async (req, res) => {
    const { search, category, collection, metal, purity, minPrice, maxPrice, sort = 'newest' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const q = { active: true };
    if (search) q.name = new RegExp(escapeRegex(search.trim()), 'i');
    if (category) q.category = category;
    if (collection) q.collections = collection;
    if (metal) q.metal = { $in: metal.split(',') };
    if (purity) q.purity = { $in: purity.split(',') };

    const [docs, ctx] = await Promise.all([
      Product.find(q).populate('category', 'name').lean(),
      getPricingContext(),
    ]);
    let items = docs.map((p) => withPrice(p, ctx));

    if (minPrice) items = items.filter((p) => p.finalPrice >= Number(minPrice));
    if (maxPrice) items = items.filter((p) => p.finalPrice <= Number(maxPrice));

    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      price_asc: (a, b) => a.finalPrice - b.finalPrice,
      price_desc: (a, b) => b.finalPrice - a.finalPrice,
      weight_asc: (a, b) => a.weight - b.weight,
      weight_desc: (a, b) => b.weight - a.weight,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    items.sort(sorters[sort] || sorters.newest);

    const total = items.length;
    res.json({
      items: items.slice((page - 1) * limit, page * limit),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

router.get(
  '/products/:id',
  ah(async (req, res) => {
    const [product, ctx] = await Promise.all([
      Product.findOne({ _id: req.params.id, active: true })
        .populate('category', 'name')
        .populate('collections', 'name')
        .lean(),
      getPricingContext(),
    ]);
    if (!product) throw httpError(404, 'This product is not available');
    const related = await Product.find({ active: true, category: product.category._id, _id: { $ne: product._id } })
      .limit(4)
      .populate('category', 'name')
      .lean();
    res.json({ ...withPrice(product, ctx), related: related.map((p) => withPrice(p, ctx)) });
  })
);

module.exports = router;

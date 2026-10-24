const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { ah } = require('../utils/helpers');
const { getPricingContext, withPrice } = require('../utils/pricing');

router.use(protect);

async function build(user) {
  await user.populate({ path: 'wishlist', match: { active: true }, populate: { path: 'category', select: 'name' } });
  const ctx = await getPricingContext();
  const items = user.wishlist.filter(Boolean).map((p) => withPrice(p, ctx));
  return { items, ids: items.map((p) => String(p._id)) };
}

router.get('/', ah(async (req, res) => res.json(await build(req.user))));

router.post(
  '/:productId',
  ah(async (req, res) => {
    if (!req.user.wishlist.some((id) => String(id) === req.params.productId)) {
      req.user.wishlist.push(req.params.productId);
      await req.user.save();
    }
    res.json(await build(req.user));
  })
);

router.delete(
  '/:productId',
  ah(async (req, res) => {
    req.user.wishlist = req.user.wishlist.filter((id) => String(id) !== req.params.productId);
    await req.user.save();
    res.json(await build(req.user));
  })
);

module.exports = router;

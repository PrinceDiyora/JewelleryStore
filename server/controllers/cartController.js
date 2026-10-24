const Product = require('../models/Product');
const { ah, httpError, round2 } = require('../utils/helpers');
const { getPricingContext, withPrice } = require('../utils/pricing');
const { validateCoupon } = require('../utils/coupons');

// Cart is stored per user; prices are re-calculated from today's rate on every read.
async function buildCart(user) {
  await user.populate('cart.product');
  const ctx = await getPricingContext();
  const items = [];
  for (const line of user.cart) {
    const p = line.product;
    if (!p || !p.active) continue;
    const priced = withPrice(p, ctx);
    items.push({
      product: priced,
      qty: line.qty,
      lineTotal: round2(priced.finalPrice * line.qty),
      inStock: p.stock >= line.qty,
    });
  }
  return {
    items,
    subtotal: round2(items.reduce((s, i) => s + i.lineTotal, 0)),
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}

exports.getCart = ah(async (req, res) => res.json(await buildCart(req.user)));

exports.addToCart = ah(async (req, res) => {
  const { productId } = req.body;
  const qty = Math.max(1, Number(req.body.qty) || 1);
  const product = await Product.findById(productId);
  if (!product || !product.active) throw httpError(404, 'This product is not available');
  if (product.stock < 1) throw httpError(400, 'This product is out of stock');

  const line = req.user.cart.find((l) => String(l.product) === String(productId));
  const newQty = Math.min((line ? line.qty : 0) + qty, product.stock, 10);
  if (line) line.qty = newQty;
  else req.user.cart.push({ product: product._id, qty: newQty });
  await req.user.save();
  res.json(await buildCart(req.user));
});

exports.updateCartItem = ah(async (req, res) => {
  const qty = Number(req.body.qty);
  const line = req.user.cart.find((l) => String(l.product) === req.params.productId);
  if (!line) throw httpError(404, 'Item is not in your cart');
  if (!(qty >= 1)) {
    req.user.cart = req.user.cart.filter((l) => l !== line);
  } else {
    const product = await Product.findById(req.params.productId);
    line.qty = Math.min(qty, product ? product.stock : qty, 10);
  }
  await req.user.save();
  res.json(await buildCart(req.user));
});

exports.removeFromCart = ah(async (req, res) => {
  req.user.cart = req.user.cart.filter((l) => String(l.product) !== req.params.productId);
  await req.user.save();
  res.json(await buildCart(req.user));
});

exports.applyCoupon = ah(async (req, res) => {
  const cart = await buildCart(req.user);
  if (!cart.items.length) throw httpError(400, 'Your cart is empty');
  const { coupon, discount } = await validateCoupon(req.body.code, cart.subtotal);
  res.json({ code: coupon.code, discount });
});

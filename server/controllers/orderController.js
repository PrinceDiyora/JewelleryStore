const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const crypto = require('crypto');
const { ah, httpError, round2 } = require('../utils/helpers');
const { getPricingContext, priceBreakup } = require('../utils/pricing');
const { validateCoupon } = require('../utils/coupons');
const { getMethod } = require('../utils/payment');
const { restock } = require('../utils/orders');

const REQUIRED_ADDRESS = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];

exports.placeOrder = ah(async (req, res) => {
  const { address = {}, couponCode, paymentMethod = 'COD', note = '' } = req.body;
  for (const f of REQUIRED_ADDRESS) {
    if (!String(address[f] || '').trim()) throw httpError(400, `Please enter the delivery ${f === 'line1' ? 'address' : f}`);
  }
  const method = getMethod(paymentMethod);
  if (!method) throw httpError(400, 'This payment method is not available');

  await req.user.populate('cart.product');
  if (!req.user.cart.length) throw httpError(400, 'Your cart is empty');

  // Re-price everything on the server at today's rate
  const ctx = await getPricingContext();
  const lines = req.user.cart.map((l) => {
    const p = l.product;
    if (!p || !p.active) throw httpError(400, 'An item in your cart is no longer available');
    if (p.stock < l.qty) throw httpError(400, `Only ${p.stock} left of ${p.name}. Please update your cart.`);
    const breakup = priceBreakup(p.toObject(), ctx);
    if (!breakup.available) throw httpError(400, `${p.name} cannot be ordered right now (rate not set)`);
    return { p, qty: l.qty, breakup };
  });

  const itemsTotal = round2(lines.reduce((s, l) => s + l.breakup.total * l.qty, 0));
  let discount = 0;
  let coupon = null;
  if (couponCode) ({ coupon, discount } = await validateCoupon(couponCode, itemsTotal));
  const total = round2(itemsTotal - discount);

  // Reduce stock (rolled back if any item runs out meanwhile)
  const done = [];
  try {
    for (const l of lines) {
      const r = await Product.updateOne({ _id: l.p._id, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
      if (!r.modifiedCount) throw httpError(400, `${l.p.name} just went out of stock`);
      done.push(l);
    }
  } catch (err) {
    for (const l of done) await Product.updateOne({ _id: l.p._id }, { $inc: { stock: l.qty } });
    throw err;
  }

  const payment = await method.prepare({ user: req.user, total });
  const order = await Order.create({
    orderNumber: `JW${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`,
    user: req.user._id,
    items: lines.map((l) => ({
      product: l.p._id,
      name: l.p.name,
      image: l.p.images[0] || '',
      metal: l.p.metal,
      purity: l.p.purity,
      weight: l.p.weight,
      qty: l.qty,
      unitPrice: l.breakup.total,
      breakup: l.breakup,
    })),
    address,
    itemsTotal,
    discount,
    couponCode: coupon ? coupon.code : '',
    total,
    paymentMethod,
    paymentStatus: payment.status,
    paymentInfo: payment.info,
    note,
    statusHistory: [{ status: 'Placed' }],
  });

  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  req.user.cart = [];
  await req.user.save();
  res.status(201).json(order);
});

exports.getMyOrders = ah(async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))
);

exports.getMyOrder = ah(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw httpError(404, 'Order not found');
  res.json(order);
});

exports.cancelOrder = ah(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'Placed') throw httpError(400, 'This order is already being processed and cannot be cancelled');
  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled' });
  await order.save();
  await restock(order);
  res.json(order);
});

// Verify Razorpay payment signature after the popup closes successfully
exports.verifyPayment = ah(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    throw httpError(400, 'Missing payment verification fields');

  // Find the order that was created for this Razorpay order
  const order = await Order.findOne({
    user: req.user._id,
    'paymentInfo.razorpayOrderId': razorpay_order_id,
  });
  if (!order) throw httpError(404, 'Order not found');
  if (order.paymentStatus === 'Paid') return res.json(order); // already verified

  // Verify HMAC-SHA256 signature: razorpay_order_id + "|" + razorpay_payment_id
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    order.paymentStatus = 'Failed';
    await order.save();
    throw httpError(400, 'Payment verification failed. Please contact support.');
  }

  order.paymentStatus = 'Paid';
  order.paymentInfo   = { ...order.paymentInfo, razorpay_payment_id, razorpay_signature };
  await order.save();
  res.json(order);
});


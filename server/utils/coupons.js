const Coupon = require('../models/Coupon');
const { httpError, round2 } = require('./helpers');

// Validates a coupon against an amount and returns the discount.
async function validateCoupon(code, amount) {
  const coupon = await Coupon.findOne({ code: String(code || '').trim().toUpperCase(), active: true });
  if (!coupon) throw httpError(400, 'This coupon code is not valid');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw httpError(400, 'This coupon has expired');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    throw httpError(400, 'This coupon has reached its usage limit');
  if (amount < coupon.minOrder)
    throw httpError(400, `Add items worth ₹${coupon.minOrder.toLocaleString('en-IN')} or more to use this coupon`);

  let discount = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value;
  if (coupon.type === 'percent' && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  discount = round2(Math.min(discount, amount));
  return { coupon, discount };
}

module.exports = { validateCoupon };

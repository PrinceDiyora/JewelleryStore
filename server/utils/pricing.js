const MetalRate = require('../models/MetalRate');
const Settings = require('../models/Settings');
const { round2 } = require('./helpers');

// Load today's rates + GST once per request
async function getPricingContext() {
  const [rates, settings] = await Promise.all([MetalRate.find().lean(), Settings.getSingleton()]);
  const map = {};
  rates.forEach((r) => (map[`${r.metal}-${r.purity}`] = r.ratePerGram));
  return { rates: map, gstPercent: settings.gstPercent, settings };
}

// Diamond jewellery is priced on its gold content; silver on the silver rate.
function rateFor(product, ctx) {
  const metal = product.metal === 'silver' ? 'silver' : 'gold';
  return ctx.rates[`${metal}-${product.purity}`] || 0;
}

// price = (rate x weight) + making charges (+ stone charges) + GST
function priceBreakup(product, ctx) {
  const rate = rateFor(product, ctx);
  const metalValue = rate * product.weight;
  const making =
    product.makingType === 'percent'
      ? (metalValue * (product.makingCharges || 0)) / 100
      : product.makingCharges || 0;
  const stone = product.stoneCharges || 0;
  const subtotal = metalValue + making + stone;
  const gst = (subtotal * ctx.gstPercent) / 100;
  return {
    available: rate > 0,
    rate,
    weight: product.weight,
    metalValue: round2(metalValue),
    making: round2(making),
    stone: round2(stone),
    subtotal: round2(subtotal),
    gstPercent: ctx.gstPercent,
    gst: round2(gst),
    total: round2(subtotal + gst),
  };
}

function withPrice(product, ctx) {
  const obj = product.toObject ? product.toObject() : product;
  const price = priceBreakup(obj, ctx);
  return { ...obj, price, finalPrice: price.total };
}

module.exports = { getPricingContext, priceBreakup, withPrice, rateFor };

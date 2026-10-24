const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const MetalRate = require('../models/MetalRate');
const Order = require('../models/Order');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { ah, httpError } = require('../utils/helpers');
const { publicUrl, removeFile } = require('../utils/storage');
const { getPricingContext, withPrice } = require('../utils/pricing');
const { restock } = require('../utils/orders');
const makeCrud = require('./crudController');

// ---------- image upload ----------
exports.uploadImages = ah(async (req, res) => {
  if (!req.files || !req.files.length) throw httpError(400, 'Please choose an image to upload');
  res.json({ urls: req.files.map(publicUrl) });
});

// ---------- products ----------
exports.getProducts = ah(async (req, res) => {
  const [docs, ctx] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).populate('category', 'name').populate('collections', 'name').lean(),
    getPricingContext(),
  ]);
  res.json(docs.map((p) => withPrice(p, ctx)));
});

exports.createProduct = ah(async (req, res) =>
  res.status(201).json(await Product.create(req.body))
);

exports.updateProduct = ah(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  const oldImages = product.images.slice();
  product.set(req.body);
  await product.save(); // runs validation (e.g. silver => 925)
  oldImages.filter((img) => !product.images.includes(img)).forEach(removeFile);
  res.json(product);
});

exports.deleteProduct = ah(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  product.images.forEach(removeFile);
  res.json({ message: 'Deleted' });
});

// ---------- daily metal rates ----------
exports.getRates = ah(async (req, res) =>
  res.json(await MetalRate.find().sort({ metal: 1, purity: -1 }))
);

// Update all rates in one go. Product prices follow automatically because
// they are calculated from these rates on every request.
exports.updateRates = ah(async (req, res) => {
  const { rates } = req.body;
  if (!Array.isArray(rates) || !rates.length) throw httpError(400, 'No rates sent');
  for (const r of rates) {
    const value = Number(r.ratePerGram);
    if (!(value >= 0)) throw httpError(400, 'Rates must be valid numbers');
    const doc = await MetalRate.findById(r._id);
    if (!doc || doc.ratePerGram === value) continue;
    doc.ratePerGram = value;
    doc.history = [...doc.history, { rate: value, at: new Date() }].slice(-30);
    await doc.save();
  }
  res.json(await MetalRate.find().sort({ metal: 1, purity: -1 }));
});

exports.createRate = ah(async (req, res) => {
  const { metal, purity, ratePerGram } = req.body;
  const doc = await MetalRate.create({ metal, purity, ratePerGram, history: [{ rate: ratePerGram }] });
  res.status(201).json(doc);
});

// ---------- orders ----------
exports.getOrders = ah(async (req, res) => {
  const q = req.query.status ? { status: req.query.status } : {};
  res.json(await Order.find(q).sort({ createdAt: -1 }).populate('user', 'name email phone'));
});

exports.getOrder = ah(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw httpError(404, 'Order not found');
  res.json(order);
});

exports.updateOrderStatus = ah(async (req, res) => {
  const { status } = req.body;
  if (!Order.STATUSES.includes(status)) throw httpError(400, 'Invalid status');
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.status === status) return res.json(order);
  if (order.status === 'Cancelled') throw httpError(400, 'Cancelled orders cannot be reopened');

  if (status === 'Cancelled') await restock(order);
  order.status = status;
  order.statusHistory.push({ status });
  if (status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid';
  await order.save();
  res.json(await order.populate('user', 'name email phone'));
});

// ---------- dashboard ----------
exports.getDashboard = ah(async (req, res) => {
  const settings = await Settings.getSingleton();
  const [totalOrders, users, revenueAgg, lowStock, recentOrders, byStatus, rates] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Product.find({ stock: { $lte: settings.lowStockThreshold } })
      .select('name stock images active')
      .sort({ stock: 1 })
      .limit(20),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    MetalRate.find().sort({ metal: 1, purity: -1 }),
  ]);
  res.json({
    totalOrders,
    users,
    revenue: revenueAgg[0] ? revenueAgg[0].total : 0,
    lowStock,
    lowStockThreshold: settings.lowStockThreshold,
    recentOrders,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    rates,
  });
});

// ---------- settings ----------
exports.getSettings = ah(async (req, res) => res.json(await Settings.getSingleton()));

exports.updateSettings = ah(async (req, res) => {
  const s = await Settings.getSingleton();
  ['storeName', 'gstPercent', 'lowStockThreshold', 'email', 'phone', 'address'].forEach((k) => {
    if (req.body[k] !== undefined) s[k] = req.body[k];
  });
  await s.save();
  res.json(s);
});

// ---------- generic CRUD router factory ----------
exports.makeCrud = makeCrud;

// Fills the database with demo data and test logins.
// Run:  npm run seed      (WARNING: wipes the collections listed below)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Collection = require('./models/Collection');
const Banner = require('./models/Banner');
const Coupon = require('./models/Coupon');
const MetalRate = require('./models/MetalRate');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all(
    [User, Product, Category, Collection, Banner, Coupon, MetalRate, Order, Settings].map((M) => M.deleteMany({}))
  );

  await User.create([
    { name: 'Shop Admin', email: 'admin@jewels.com', password: 'Admin@123', role: 'admin', phone: '9000000001' },
    { name: 'Demo Customer', email: 'customer@example.com', password: 'Customer@123', phone: '9000000002' },
  ]);

  await Settings.create({
    storeName: 'Aurelia Jewellers',
    gstPercent: 3,
    lowStockThreshold: 5,
    email: 'hello@aurelia.example',
    phone: '+91 90000 00000',
    address: 'Main Bazaar, Rajkot, Gujarat 360001',
  });

  // Placeholder rates - the admin updates these every morning
  await MetalRate.create([
    { metal: 'gold', purity: '22K', ratePerGram: 9500, history: [{ rate: 9500 }] },
    { metal: 'gold', purity: '18K', ratePerGram: 7800, history: [{ rate: 7800 }] },
    { metal: 'silver', purity: '925', ratePerGram: 115, history: [{ rate: 115 }] },
  ]);

  const [rings, necklaces, earrings, bangles] = await Category.create([
    { name: 'Rings', description: 'Bands, solitaires and everyday rings', order: 1 },
    { name: 'Necklaces', description: 'Chains, chokers and heirloom sets', order: 2 },
    { name: 'Earrings', description: 'Studs, jhumkas and hoops', order: 3 },
    { name: 'Bangles', description: 'Bangles and kadas in gold and silver', order: 4 },
  ]);

  const [bridal, daily, festive] = await Collection.create([
    { name: 'Bridal', description: 'Statement pieces for the wedding season', order: 1 },
    { name: 'Daily Wear', description: 'Light pieces made for every day', order: 2 },
    { name: 'Festive', description: 'Gold for Diwali, Dhanteras and family occasions', order: 3 },
  ]);

  await Banner.create([
    {
      title: 'Priced by the day, to the gram',
      subtitle: "Every piece follows today's gold and silver rate, its exact weight and a clear making charge.",
      link: '/products',
      ctaText: 'Browse all jewellery',
      order: 1,
    },
    {
      title: 'The bridal collection',
      subtitle: 'Temple necklaces, diamond sets and kadas for the big day.',
      link: `/products?collection=${bridal._id}`,
      ctaText: 'View bridal pieces',
      order: 2,
    },
    {
      title: 'Silver under one price tag',
      subtitle: '925 sterling silver, hallmarked and priced on the daily silver rate.',
      link: '/products?metal=silver',
      ctaText: 'Shop silver',
      order: 3,
    },
  ]);

  await Coupon.create([
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 5000, maxDiscount: 3000 },
    { code: 'FLAT500', type: 'flat', value: 500, minOrder: 10000 },
  ]);

  const P = (name, category, metal, purity, weight, makingType, makingCharges, stoneCharges, stock, featured, collections = [], description = '') => ({
    name, category: category._id, metal, purity, weight, makingType, makingCharges, stoneCharges, stock, featured,
    collections: collections.map((c) => c._id),
    description: description || `${name}, ${weight} g of ${metal === 'silver' ? '925 sterling silver' : `${purity} gold`}.`,
  });

  await Product.create([
    P('Classic Solitaire Band', rings, 'diamond', '18K', 4.2, 'fixed', 6500, 18000, 8, true, [bridal]),
    P('Plain Gold Band', rings, 'gold', '22K', 5.5, 'percent', 10, 0, 15, false, [daily]),
    P('Floral Cocktail Ring', rings, 'gold', '22K', 7.8, 'percent', 12, 0, 6, true, [festive]),
    P('Silver Midi Ring Set', rings, 'silver', '925', 6, 'fixed', 350, 0, 30, false, [daily]),
    P('Temple Haram Necklace', necklaces, 'gold', '22K', 42, 'percent', 14, 0, 3, true, [bridal, festive]),
    P('Delicate Chain Necklace', necklaces, 'gold', '18K', 9.5, 'fixed', 2200, 0, 12, false, [daily]),
    P('Oxidised Silver Choker', necklaces, 'silver', '925', 38, 'percent', 18, 0, 10, false, [festive]),
    P('Diamond Pendant Set', necklaces, 'diamond', '18K', 8.1, 'fixed', 7800, 32000, 4, true, [bridal]),
    P('Gold Jhumka Earrings', earrings, 'gold', '22K', 11.4, 'percent', 13, 0, 9, true, [festive]),
    P('Gold Stud Earrings', earrings, 'gold', '18K', 2.8, 'fixed', 1200, 0, 25, false, [daily]),
    P('Silver Hoop Earrings', earrings, 'silver', '925', 8, 'fixed', 400, 0, 2, false, [daily]),
    P('Diamond Studs', earrings, 'diamond', '18K', 3, 'fixed', 4000, 21000, 7, true, [bridal]),
    P('Plain Gold Bangle Pair', bangles, 'gold', '22K', 24, 'percent', 9, 0, 5, false, [festive]),
    P('Gold Kada', bangles, 'gold', '22K', 30, 'percent', 11, 0, 1, true, [bridal]),
    P("Silver Kids' Bangle", bangles, 'silver', '925', 14, 'fixed', 300, 0, 18, false, [daily]),
  ]);

  console.log('Seed complete.\n  Admin:    admin@jewels.com / Admin@123\n  Customer: customer@example.com / Customer@123');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

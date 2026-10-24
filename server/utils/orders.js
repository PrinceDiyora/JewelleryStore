const Product = require('../models/Product');

// Put stock back when an order is cancelled
exports.restock = async (order) => {
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
  }
};

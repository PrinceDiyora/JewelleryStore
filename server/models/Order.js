const mongoose = require('mongoose');

const { ObjectId, Mixed } = mongoose.Schema.Types;

// Items keep a snapshot of the price at the time of purchase,
// so later rate changes never alter old orders.
const itemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    image: String,
    metal: String,
    purity: String,
    weight: Number,
    qty: Number,
    unitPrice: Number,
    breakup: Mixed,
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: ObjectId, ref: 'User', required: true },
    items: [itemSchema],
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    itemsTotal: Number,
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: Number,
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentInfo: Mixed, // gateway ids etc. when an online gateway is added
    status: { type: String, enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
    statusHistory: [{ _id: false, status: String, at: { type: Date, default: Date.now } }],
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

schema.statics.STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

module.exports = mongoose.model('Order', schema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Aurelia Jewellers', trim: true },
    gstPercent: { type: Number, default: 3, min: 0, max: 100 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

// There is only ever one settings document
schema.statics.getSingleton = async function () {
  let s = await this.findOne();
  if (!s) s = await this.create({});
  return s;
};

module.exports = mongoose.model('Settings', schema);

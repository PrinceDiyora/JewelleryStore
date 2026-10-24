const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Coupon',
  new mongoose.Schema(
    {
      code: { type: String, required: [true, 'Coupon code is required'], unique: true, uppercase: true, trim: true },
      type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
      value: { type: Number, required: [true, 'Discount value is required'], min: 0 },
      minOrder: { type: Number, default: 0, min: 0 },
      maxDiscount: { type: Number, default: 0, min: 0 }, // 0 = no cap (percent coupons only)
      usageLimit: { type: Number, default: 0, min: 0 }, // 0 = unlimited
      usedCount: { type: Number, default: 0 },
      expiresAt: { type: Date, default: null },
      active: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    metal: { type: String, enum: ['gold', 'silver'], required: true },
    purity: { type: String, enum: ['18K', '22K', '925'], required: true },
    ratePerGram: { type: Number, required: [true, 'Rate is required'], min: 0 },
    history: [{ _id: false, rate: Number, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);
schema.index({ metal: 1, purity: 1 }, { unique: true });

module.exports = mongoose.model('MetalRate', schema);

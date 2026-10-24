const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

// NOTE: no price is stored. Price is always calculated from today's metal
// rate x weight + making charges + GST (see utils/pricing.js).
const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, default: '' },
    category: { type: ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    collections: [{ type: ObjectId, ref: 'Collection' }],
    metal: { type: String, enum: ['gold', 'silver', 'diamond'], required: [true, 'Metal is required'] },
    purity: { type: String, enum: ['18K', '22K', '925'], required: [true, 'Purity is required'] },
    weight: { type: Number, required: [true, 'Weight is required'], min: [0.01, 'Weight must be more than 0'] },
    makingType: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
    makingCharges: { type: Number, default: 0, min: 0 },
    stoneCharges: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [String],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.pre('validate', function (next) {
  if (this.metal === 'silver') this.purity = '925';
  else if (this.purity === '925') this.invalidate('purity', 'Gold and diamond jewellery must be 18K or 22K');
  next();
});

module.exports = mongoose.model('Product', schema);

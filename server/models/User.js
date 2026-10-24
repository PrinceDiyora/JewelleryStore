const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    cart: [
      {
        _id: false,
        product: { type: ObjectId, ref: 'Product' },
        qty: { type: Number, default: 1, min: 1 },
      },
    ],
    wishlist: [{ type: ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

schema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.cart;
    delete ret.wishlist;
    return ret;
  },
});

module.exports = mongoose.model('User', schema);

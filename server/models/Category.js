const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Category',
  new mongoose.Schema(
    {
      name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

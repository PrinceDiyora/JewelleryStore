const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Collection',
  new mongoose.Schema(
    {
      name: { type: String, required: [true, 'Collection name is required'], unique: true, trim: true },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

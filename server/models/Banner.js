const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Banner',
  new mongoose.Schema(
    {
      title: { type: String, required: [true, 'Banner title is required'], trim: true },
      subtitle: { type: String, default: '' },
      image: { type: String, default: '' },
      link: { type: String, default: '/products' },
      ctaText: { type: String, default: 'Shop now' },
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test')
  app.use(morgan('dev', { skip: (_req, res) => res.statusCode < 400 }));

// Uploaded images (local storage). Swap utils/storage.js for Cloudinary/S3 when deploying.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

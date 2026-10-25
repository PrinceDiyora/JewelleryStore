const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { UPLOAD_DIR } = require('../utils/storage');
const { httpError } = require('../utils/helpers');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});

module.exports = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB per file
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(httpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed')),
});

// ---------------------------------------------------------------------------
// Image storage helper. Today: local /uploads folder.
// To move to Cloudinary/S3 later, change only this file + middleware/upload.js
// (store absolute URLs in the database; the client already handles http URLs).
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.UPLOAD_DIR = UPLOAD_DIR;
exports.publicUrl = (file) => `/uploads/${file.filename}`;
exports.removeFile = (url) => {
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
  }
};

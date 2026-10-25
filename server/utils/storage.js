// ---------------------------------------------------------------------------
// Image storage — Cloudinary.
// Env vars required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// To revert to local storage, restore the original file and middleware/upload.js
// ---------------------------------------------------------------------------
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer-storage-cloudinary puts the final Cloudinary URL in file.path
exports.publicUrl = (file) => file.path;

// Delete an image from Cloudinary using its stored URL
exports.removeFile = (url) => {
  if (!url || !url.startsWith('http')) return;
  try {
    // URL pattern: https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/<public_id>.<ext>
    // public_id includes the folder, e.g. "jewellery/abc123"
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) cloudinary.uploader.destroy(match[1], () => {});
  } catch (_) {}
};

exports.cloudinary = cloudinary;

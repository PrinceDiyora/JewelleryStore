const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/storage');
const { httpError } = require('../utils/helpers');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jewellery',                                       // stored in a "jewellery" folder on Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }], // auto-compress & convert format
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB per file
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(httpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed')),
});

// Multer config — memory storage (we hand the buffer to Cloudinary/base64).
// Accepts common image types, up to 8 MB.

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|gif|webp|heic|heif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

module.exports = upload;

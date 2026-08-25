// Cloudinary helper with a graceful base64 fallback.
// If CLOUDINARY_* env vars are set, images are uploaded to Cloudinary and we
// store the hosted URL. If not, we fall back to a base64 data URL so the
// feature still works in dev / before Cloudinary is configured.

const cloudinary = require('cloudinary').v2;

let enabled = false;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  enabled = true;
}

// Takes a multer file (buffer) and returns a usable image URL.
async function uploadImage(file) {
  const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  if (!enabled) {
    // Fallback: return the data URL directly (stored in the DB).
    // Fine for low volume; switch on Cloudinary for production scale.
    return b64;
  }

  const res = await cloudinary.uploader.upload(b64, {
    folder: 'mithilavahan',
    resource_type: 'image',
    transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }],
  });
  return res.secure_url;
}

module.exports = { uploadImage, isCloudinaryEnabled: () => enabled };

const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../utils/cloudinary');

const router = express.Router();

// POST /api/uploads  (multipart form-data, field name: "image")
// Any logged-in user can upload (drivers for vehicle photos / QR).
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const url = await uploadImage(req.file);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;

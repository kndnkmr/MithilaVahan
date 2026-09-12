// Driver-specific actions: go online/offline, submit documents, update profile.

const User = require('../models/User');

// PUT /api/drivers/online  { isOnline: true/false }
async function setOnline(req, res) {
  const { isOnline } = req.body;
  if (req.user.driverStatus !== 'approved' && isOnline) {
    return res.status(403).json({ message: 'Account pending approval — cannot go online yet' });
  }
  req.user.isOnline = !!isOnline;
  await req.user.save();
  res.json({ message: isOnline ? 'You are online' : 'You are offline', isOnline: req.user.isOnline });
}

// PUT /api/drivers/documents  (submit verification doc URLs)
async function submitDocuments(req, res) {
  const { drivingLicense, rcBook, insurance, whatsappNumber, upiId, upiNumber, qrImage, city, email } = req.body;
  const u = req.user;
  if (drivingLicense !== undefined) u.documents.drivingLicense = drivingLicense;
  if (rcBook !== undefined) u.documents.rcBook = rcBook;
  if (insurance !== undefined) u.documents.insurance = insurance;
  if (whatsappNumber !== undefined) u.whatsappNumber = whatsappNumber;
  if (upiId !== undefined) u.upiId = upiId;
  if (upiNumber !== undefined) u.upiNumber = upiNumber;
  if (qrImage !== undefined) u.qrImage = qrImage;
  if (city !== undefined) u.city = city;
  // Email is optional + unique(sparse): set only when a non-empty value is given
  // (avoids empty-string collisions on the unique index).
  if (email !== undefined) {
    const e = String(email).trim().toLowerCase();
    u.email = e || undefined;
  }
  try {
    await u.save();
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: 'That email is already used by another account' });
    }
    throw err;
  }
  res.json({
    message: 'Details saved',
    documents: u.documents,
    upiId: u.upiId,
    upiNumber: u.upiNumber,
    qrImage: u.qrImage,
  });
}

module.exports = { setOnline, submitDocuments };

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
  const { drivingLicense, rcBook, insurance, whatsappNumber, upiId, qrImage, city } = req.body;
  const u = req.user;
  if (drivingLicense !== undefined) u.documents.drivingLicense = drivingLicense;
  if (rcBook !== undefined) u.documents.rcBook = rcBook;
  if (insurance !== undefined) u.documents.insurance = insurance;
  if (whatsappNumber !== undefined) u.whatsappNumber = whatsappNumber;
  if (upiId !== undefined) u.upiId = upiId;
  if (qrImage !== undefined) u.qrImage = qrImage;
  if (city !== undefined) u.city = city;
  await u.save();
  res.json({
    message: 'Details saved',
    documents: u.documents,
    upiId: u.upiId,
    qrImage: u.qrImage,
  });
}

module.exports = { setOnline, submitDocuments };

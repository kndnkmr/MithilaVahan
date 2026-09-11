const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { setOnline, submitDocuments } = require('../controllers/driverController');
const { driverReviews, driverProfile } = require('../controllers/tripController');

const router = express.Router();

// Public — a driver's recent reviews (trust display).
router.get('/:id/reviews', driverReviews);
// Public — full privacy-safe driver profile (trust page).
router.get('/:id/profile', driverProfile);

router.put('/online', protect, authorize('driver'), setOnline);
router.put('/documents', protect, authorize('driver'), submitDocuments);

module.exports = router;

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  requestTrip, availableTrips, myTrips, acceptTrip, updateStatus, cancelTrip, rateTrip,
  claimPaid, confirmPayment, sharedTrip, raiseSos,
} = require('../controllers/tripController');

const router = express.Router();

// PUBLIC — shareable trip status page (no auth). Must come before protected routes.
router.get('/share/:token', sharedTrip);

// PUBLIC — instant fare estimate for the booking form (no auth).
// ?mode=trip|hire|outstation & vehicleType= & distanceKm= & days= & tripType=
router.get('/estimate', async (req, res) => {
  const { estimateRange } = require('../utils/fare');
  const Settings = require('../models/Settings');
  const { mode, vehicleType } = req.query;
  const distanceKm = Number(req.query.distanceKm) || 0;
  const days = Number(req.query.days) || 1;
  const tripType = req.query.tripType === 'round-trip' ? 'round-trip' : 'one-way';
  const vt = vehicleType || 'car';

  // Use the admin-set fare guide row for this vehicle type if available.
  let rate;
  try {
    const s = await Settings.getSingleton();
    rate = (s.fareGuide || []).find((r) => r.vehicleType === vt);
  } catch (_) {}

  const range = estimateRange({
    mode: ['hire', 'outstation'].includes(mode) ? mode : 'trip',
    vehicleType: vt,
    distanceKm,
    days,
    tripType,
    rate,
  });
  res.json({ estimate: range });
});

router.post('/', protect, authorize('rider'), requestTrip);
router.get('/mine', protect, myTrips);
router.get('/available', protect, authorize('driver'), availableTrips);

router.put('/:id/accept', protect, authorize('driver'), acceptTrip);
router.put('/:id/status', protect, authorize('driver'), updateStatus);
router.put('/:id/cancel', protect, cancelTrip);
router.put('/:id/rate', protect, authorize('rider'), rateTrip);
router.put('/:id/claim-paid', protect, authorize('rider'), claimPaid);
router.put('/:id/confirm-payment', protect, authorize('driver'), confirmPayment);
router.put('/:id/sos', protect, authorize('rider'), raiseSos);

module.exports = router;

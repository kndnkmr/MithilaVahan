const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  requestTrip, availableTrips, myTrips, acceptTrip, updateStatus, cancelTrip, rateTrip,
  claimPaid, confirmPayment,
} = require('../controllers/tripController');

const router = express.Router();

router.post('/', protect, authorize('rider'), requestTrip);
router.get('/mine', protect, myTrips);
router.get('/available', protect, authorize('driver'), availableTrips);

router.put('/:id/accept', protect, authorize('driver'), acceptTrip);
router.put('/:id/status', protect, authorize('driver'), updateStatus);
router.put('/:id/cancel', protect, cancelTrip);
router.put('/:id/rate', protect, authorize('rider'), rateTrip);
router.put('/:id/claim-paid', protect, authorize('rider'), claimPaid);
router.put('/:id/confirm-payment', protect, authorize('driver'), confirmPayment);

module.exports = router;

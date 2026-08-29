const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createVehicle, myVehicles, updateVehicle, listVehicles, getVehicle,
} = require('../controllers/vehicleController');

const router = express.Router();

// Public browse (riders)
router.get('/', listVehicles);

// Driver-owned (must come before the public /:id route)
router.get('/mine', protect, authorize('driver', 'admin'), myVehicles);
router.post('/', protect, authorize('driver', 'admin'), createVehicle);
router.put('/:id', protect, authorize('driver', 'admin'), updateVehicle);

// Public single-vehicle detail (approved only) — keep last so it doesn't shadow /mine
router.get('/:id', getVehicle);

module.exports = router;

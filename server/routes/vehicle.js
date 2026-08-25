const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createVehicle, myVehicles, updateVehicle, listVehicles,
} = require('../controllers/vehicleController');

const router = express.Router();

// Public browse (riders)
router.get('/', listVehicles);

// Driver-owned
router.get('/mine', protect, authorize('driver', 'admin'), myVehicles);
router.post('/', protect, authorize('driver', 'admin'), createVehicle);
router.put('/:id', protect, authorize('driver', 'admin'), updateVehicle);

module.exports = router;

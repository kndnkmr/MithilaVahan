const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  stats, listDrivers, setDriverStatus, listVehicles, setVehicleStatus,
  addCity, updateCity, setSuspension,
} = require('../controllers/adminController');

const router = express.Router();

// Everything here requires an admin.
router.use(protect, authorize('admin'));

router.get('/stats', stats);

router.get('/drivers', listDrivers);
router.put('/drivers/:id/status', setDriverStatus);

router.get('/vehicles', listVehicles);
router.put('/vehicles/:id/status', setVehicleStatus);

router.post('/cities', addCity);
router.put('/cities/:id', updateCity);

router.put('/users/:id/suspension', setSuspension);

module.exports = router;

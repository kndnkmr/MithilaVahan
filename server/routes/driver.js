const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { setOnline, submitDocuments } = require('../controllers/driverController');

const router = express.Router();

router.put('/online', protect, authorize('driver'), setOnline);
router.put('/documents', protect, authorize('driver'), submitDocuments);

module.exports = router;

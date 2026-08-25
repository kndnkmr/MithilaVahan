const express = require('express');
const { protect } = require('../middleware/auth');
const { fileComplaint, myComplaints } = require('../controllers/complaintController');

const router = express.Router();

// Riders and drivers (any logged-in non-admin) can file + see their own.
router.post('/', protect, fileComplaint);
router.get('/mine', protect, myComplaints);

module.exports = router;

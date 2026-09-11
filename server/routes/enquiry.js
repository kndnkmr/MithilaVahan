const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { createEnquiry } = require('../controllers/enquiryController');

const router = express.Router();

// Public: anyone can submit a service enquiry (wedding/corporate/tour/other).
// optionalAuth links the user if they happen to be signed in.
router.post('/', optionalAuth, createEnquiry);

module.exports = router;

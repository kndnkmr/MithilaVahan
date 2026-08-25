const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, setEmergencyContact } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Throttle auth endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/emergency-contact', protect, setEmergencyContact);

module.exports = router;

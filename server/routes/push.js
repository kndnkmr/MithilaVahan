const express = require('express');
const { protect } = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const { isPushEnabled } = require('../utils/push');

const router = express.Router();

// GET /api/push/public-key  (client needs this before subscribing)
router.get('/public-key', (req, res) => {
  res.json({ publicKey: isPushEnabled() ? process.env.VAPID_PUBLIC_KEY : '' });
});

// POST /api/push/subscribe  (save a browser subscription)
router.post('/subscribe', protect, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Invalid subscription' });
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user: req.user._id, endpoint, keys },
    { upsert: true, new: true }
  );
  res.json({ message: 'Subscribed to push' });
});

// POST /api/push/unsubscribe
router.post('/unsubscribe', protect, async (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) await PushSubscription.deleteOne({ endpoint });
  res.json({ message: 'Unsubscribed' });
});

module.exports = router;

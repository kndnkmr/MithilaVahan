const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings  (public — commission + indicative fare guide for the UI)
router.get('/', async (req, res) => {
  const s = await Settings.getSingleton();
  res.json({ settings: { commissionPercent: s.commissionPercent, fareGuide: s.fareGuide } });
});

module.exports = router;

const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings  (public read — clients need commissionPercent to display fees)
router.get('/', async (req, res) => {
  const s = await Settings.getSingleton();
  res.json({ settings: { commissionPercent: s.commissionPercent } });
});

module.exports = router;

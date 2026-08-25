const express = require('express');
const City = require('../models/City');

const router = express.Router();

// GET /api/cities  (public — active cities with fare slabs)
router.get('/', async (req, res) => {
  const cities = await City.find({ isActive: true }).sort({ name: 1 });
  res.json({ cities });
});

module.exports = router;

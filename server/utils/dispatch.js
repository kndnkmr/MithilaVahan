// Nearest-driver dispatch.
//
// Given a pickup point, find the online + approved drivers in the city who are
// physically closest, using the 2dsphere index on User.currentLocation.
// Falls back gracefully: if the rider gave no usable coordinates, we return an
// empty list and the caller relies on the city-wide broadcast instead.

const User = require('../models/User');

// A [lng, lat] pair is "usable" only if it's a real point, not the [0,0] default.
function hasCoords(coords) {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    !(coords[0] === 0 && coords[1] === 0)
  );
}

/**
 * Find nearest online approved drivers to a pickup point.
 * @param {Object} opts
 * @param {string} opts.city        - restrict to drivers operating in this city
 * @param {number[]} opts.coordinates - pickup [lng, lat]
 * @param {number} [opts.maxMeters=15000] - search radius (default 15 km)
 * @param {number} [opts.limit=10]        - how many drivers to return
 * @returns {Promise<Array>} drivers sorted nearest-first (empty if no coords)
 */
async function findNearestDrivers({ city, coordinates, maxMeters = 15000, limit = 10 }) {
  if (!hasCoords(coordinates)) return [];

  // $near returns results already sorted by distance (nearest first) and
  // uses the 2dsphere index. We filter to bookable drivers in the city.
  const drivers = await User.find({
    role: 'driver',
    driverStatus: 'approved',
    isOnline: true,
    isSuspended: false,
    city,
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxMeters,
      },
    },
  })
    .select('_id name city')
    .limit(limit);

  return drivers;
}

module.exports = { findNearestDrivers, hasCoords };

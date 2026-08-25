// Simple, explainable fare estimation for the MVP.
// Point-to-point ('trip') uses per-km; duration ('hire') uses per-day.
// No external distance API needed — rider-provided/estimated distance is used,
// and this can be upgraded to a maps distance API later without changing callers.

function estimateFare({ mode, vehicle, distanceKm = 0, days = 1, tripType = 'one-way' }) {
  if (!vehicle) return 0;

  if (mode === 'hire') {
    const perDay = vehicle.perDayRate || 0;
    return Math.round(perDay * Math.max(1, days));
  }

  if (mode === 'outstation') {
    // Per-km over the journey distance. Round-trip covers the distance twice
    // (there and back), so double it. Base fare applies once as a pickup charge.
    const perKm = vehicle.perKmRate || 0;
    const base = vehicle.baseFare || 0;
    const km = Math.max(0, distanceKm) * (tripType === 'round-trip' ? 2 : 1);
    return Math.round(base + perKm * km);
  }

  // trip (in-city point-to-point)
  const base = vehicle.baseFare || 0;
  const perKm = vehicle.perKmRate || 0;
  return Math.round(base + perKm * Math.max(0, distanceKm));
}

module.exports = { estimateFare };

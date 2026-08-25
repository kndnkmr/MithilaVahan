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

// Indicative rates by vehicle type — used for the "instant estimate" shown on
// the booking form BEFORE a specific vehicle/driver is chosen. Individual
// owners set their own rates on their listing; the driver confirms the final
// fare. These are just so a rider sees a realistic number up front.
const INDICATIVE = {
  bike: { baseFare: 20, perKm: 7, perDay: 800 },
  auto: { baseFare: 30, perKm: 9, perDay: 1200 },
  car: { baseFare: 50, perKm: 11, perDay: 2500 },
  tempo: { baseFare: 80, perKm: 18, perDay: 3500 },
  bus: { baseFare: 500, perKm: 35, perDay: 9000 },
  truck: { baseFare: 300, perKm: 30, perDay: 6000 },
};

// Compute an indicative fare RANGE (low–high) for the booking form.
// Returns { low, high } rounded to the nearest ₹10, with a ±15% spread so it
// reads as an estimate, not a fixed price.
function estimateRange({ mode, vehicleType, distanceKm = 0, days = 1, tripType = 'one-way', rate }) {
  // Prefer an explicit rate (from the admin-set fare guide); else the static default.
  const r = rate || INDICATIVE[vehicleType] || INDICATIVE.car;
  const mid = estimateFare({
    mode,
    vehicle: { baseFare: r.baseFare, perKmRate: r.perKm, perDayRate: r.perDay },
    distanceKm,
    days,
    tripType,
  });
  if (!mid) return { low: 0, high: 0 };
  const round10 = (n) => Math.round(n / 10) * 10;
  return { low: round10(mid * 0.85), high: round10(mid * 1.15) };
}

module.exports = { estimateFare, estimateRange, INDICATIVE };

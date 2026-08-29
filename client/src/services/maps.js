// Lightweight maps helpers — no paid API.
//  - parse [lng, lat] from a pasted Google Maps link (best-effort)
//  - approximate straight-line (haversine) distance between two [lng,lat] points
//
// NOTE: haversine is straight-line, so it UNDER-counts real road distance.
// It's a rough estimate only; the driver confirms the final fare. When a real
// distance API is added later, swap haversineKm() for the API call — callers
// don't change.

// Try to extract coordinates from common Google Maps URL shapes.
// Handles ...@26.15,85.89,... and ...?q=26.15,85.89 and ...!3d26.15!4d85.89
export function coordsFromMapLink(link) {
  if (!link) return null;
  const s = String(link);
  // @lat,lng
  let m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return [parseFloat(m[2]), parseFloat(m[1])]; // [lng, lat]
  // q=lat,lng  or  query=lat,lng
  m = s.match(/[?&](?:q|query|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return [parseFloat(m[2]), parseFloat(m[1])];
  // !3dLAT!4dLNG
  const lat = s.match(/!3d(-?\d+\.\d+)/);
  const lng = s.match(/!4d(-?\d+\.\d+)/);
  if (lat && lng) return [parseFloat(lng[1]), parseFloat(lat[1])];
  return null;
}

// Approximate straight-line distance in km between two [lng, lat] points.
export function haversineKm(a, b) {
  if (!a || !b) return 0;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Build a navigable Google Maps link from whatever we have.
export function navLink({ mapLink, coordinates, address }) {
  if (mapLink) return mapLink;
  if (coordinates && !(coordinates[0] === 0 && coordinates[1] === 0)) {
    const [lng, lat] = coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return null;
}

// Default placeholder images per vehicle type (free Unsplash, verified URLs).
// Used when a vehicle owner hasn't uploaded their own photos yet — so the
// Browse page still looks populated and riders can search/recognise types.
//
// NOTE: these are generic representative photos, not the exact listed vehicle.
// Owner-uploaded photos always take precedence over these.

const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;

// All verified to return HTTP 200.
export const TYPE_IMAGE = {
  car: U('1503376780353-7e6692767b70'),    // car (sedan-style)
  auto: U('1601584115197-04ecc0da31d7'),   // auto-rickshaw / three-wheeler
  tempo: U('1570125909232-eb263c188f7e'),  // van / small commercial
  bus: U('1544620347-c4fd4a3d5957'),       // bus
  truck: U('1449965408869-eaa3f722e40d'),  // truck / commercial
  bike: U('1558618666-fcd25c85cd64'),      // motorbike
};

// A generic fallback if a type isn't in the map.
export const DEFAULT_VEHICLE_IMAGE = TYPE_IMAGE.car;

// Returns the best image for a vehicle: its own first photo, else a type placeholder.
export function vehicleImage(vehicle) {
  if (vehicle?.photos && vehicle.photos.length > 0) return vehicle.photos[0];
  return TYPE_IMAGE[vehicle?.type] || DEFAULT_VEHICLE_IMAGE;
}

// Vehicle listings: drivers create/manage their vehicles; riders browse approved ones.

const Vehicle = require('../models/Vehicle');
const { VEHICLE_TYPES } = require('../models/Vehicle');

// POST /api/vehicles  (driver adds a vehicle)
async function createVehicle(req, res) {
  try {
    const {
      type, model, registrationNumber, capacity, city,
      photos, perKmRate, perDayRate, baseFare, supportsTrip, supportsHire,
    } = req.body;

    if (!type || !model || !registrationNumber || !city) {
      return res.status(400).json({ message: 'Type, model, registration number, and city are required' });
    }
    if (!VEHICLE_TYPES.includes(type)) {
      return res.status(400).json({ message: `Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}` });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      type,
      model,
      registrationNumber,
      capacity: capacity || 1,
      city,
      photos: Array.isArray(photos) ? photos.slice(0, 6) : [],
      perKmRate: perKmRate || 0,
      perDayRate: perDayRate || 0,
      baseFare: baseFare || 0,
      supportsTrip: supportsTrip !== false,
      supportsHire: supportsHire !== false,
      // new listings await admin approval
      approvalStatus: 'pending',
    });

    res.status(201).json({ message: 'Vehicle added — pending admin approval', vehicle });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add vehicle', error: err.message });
  }
}

// GET /api/vehicles/mine  (driver's own vehicles)
async function myVehicles(req, res) {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ vehicles });
}

// PUT /api/vehicles/:id  (driver updates own vehicle)
async function updateVehicle(req, res) {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (String(vehicle.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your vehicle' });
    }

    const allowed = ['model', 'capacity', 'city', 'photos', 'perKmRate', 'perDayRate',
      'baseFare', 'supportsTrip', 'supportsHire', 'isActive'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) vehicle[key] = req.body[key];
    }
    // Editing a vehicle sends it back for re-approval (owner-edited, not admin).
    if (req.user.role !== 'admin') vehicle.approvalStatus = 'pending';

    await vehicle.save();
    res.json({ message: 'Vehicle updated', vehicle });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vehicle', error: err.message });
  }
}

// GET /api/vehicles  (public — riders browse approved, active vehicles)
// Filters: ?city= &type=
async function listVehicles(req, res) {
  const filter = { approvalStatus: 'approved', isActive: true };
  if (req.query.city) filter.city = req.query.city;
  if (req.query.type) filter.type = req.query.type;

  const vehicles = await Vehicle.find(filter)
    .populate('owner', 'name phone whatsappNumber ratingAvg ratingCount isOnline')
    .sort({ createdAt: -1 });

  res.json({ vehicles });
}

// GET /api/vehicles/:id  (public — a single approved vehicle for the detail page)
async function getVehicle(req, res) {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name phone whatsappNumber ratingAvg ratingCount isOnline');
    if (!vehicle || vehicle.approvalStatus !== 'approved' || !vehicle.isActive) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ vehicle });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load vehicle', error: err.message });
  }
}

module.exports = { createVehicle, myVehicles, updateVehicle, listVehicles, getVehicle };

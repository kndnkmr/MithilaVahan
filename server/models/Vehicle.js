// Vehicle model — a rentable vehicle listed by a driver/owner.
// Covers cars, autos, tempos, buses, trucks, etc.

const mongoose = require('mongoose');

// Supported vehicle categories. Kept as an enum so search/filter stays clean.
const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: { type: String, enum: VEHICLE_TYPES, required: true },

    // e.g. "Maruti Swift", "Mahindra Bolero Pickup", "Tata 407"
    model: { type: String, required: true, trim: true },

    // Vehicle registration number (e.g. BR06 AB 1234)
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },

    // Seating capacity (people) or load note for goods vehicles
    capacity: { type: Number, default: 1 },

    city: { type: String, required: true, trim: true, index: true },

    photos: { type: [String], default: [] },

    // ---- Pricing ----
    // Point-to-point fare uses per-km; full/half-day hire uses per-day.
    // Driver/admin set whichever apply to the vehicle type.
    perKmRate: { type: Number, default: 0 },
    perDayRate: { type: Number, default: 0 },
    baseFare: { type: Number, default: 0 }, // minimum/pickup charge

    // Which booking modes this vehicle supports
    supportsTrip: { type: Boolean, default: true }, // point-to-point
    supportsHire: { type: Boolean, default: true }, // day/multi-day with driver

    // Admin approves a listing before it appears to riders
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;

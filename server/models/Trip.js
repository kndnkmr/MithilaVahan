// Trip model — a ride/rental booking between a rider and a driver.
// Supports two modes: point-to-point "trip" and duration-based "hire".

const mongoose = require('mongoose');

const TRIP_STATUSES = [
  'requested', // rider created it, waiting for a driver to accept
  'accepted', // a driver accepted; heading to pickup
  'started', // trip in progress
  'completed', // finished
  'cancelled', // cancelled by rider/driver/admin
];

const tripSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Driver + vehicle are set once a driver accepts.
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },

    city: { type: String, required: true, trim: true, index: true },

    // 'trip' = point-to-point (per-km), 'hire' = book for a duration (per-day)
    mode: { type: String, enum: ['trip', 'hire'], default: 'trip' },

    vehicleType: { type: String, required: true }, // requested type (car/tempo/bus/...)

    pickup: {
      address: { type: String, required: true, trim: true },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    drop: {
      address: { type: String, trim: true, default: '' },
      coordinates: { type: [Number], default: [0, 0] },
    },

    // When the rider wants the vehicle (now, or a scheduled time)
    scheduledAt: { type: Date, default: Date.now },

    // For hire mode
    days: { type: Number, default: 1 },

    status: { type: String, enum: TRIP_STATUSES, default: 'requested', index: true },

    // Fare
    estimatedFare: { type: Number, default: 0 },
    finalFare: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },

    paymentMode: { type: String, enum: ['cash', 'upi'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },

    notes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, enum: ['rider', 'driver', 'admin', ''], default: '' },

    // Timestamps for lifecycle transitions
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Rating (rider rates driver after completion)
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
module.exports.TRIP_STATUSES = TRIP_STATUSES;

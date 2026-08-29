// Trip model — a ride/rental booking between a rider and a driver.
// Supports three modes:
//   'trip'       = in-city point-to-point (per-km)
//   'hire'       = book for a duration / per day
//   'outstation' = long inter-city journey (per-km, one-way or round-trip)

const mongoose = require('mongoose');

const TRIP_MODES = ['trip', 'hire', 'outstation'];

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

    mode: { type: String, enum: TRIP_MODES, default: 'trip' },

    vehicleType: { type: String, required: true }, // requested type (car/tempo/bus/...)

    pickup: {
      address: { type: String, required: true, trim: true },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      mapLink: { type: String, default: '' }, // optional Google Maps link the rider pasted
    },
    drop: {
      address: { type: String, trim: true, default: '' },
      coordinates: { type: [Number], default: [0, 0] },
      mapLink: { type: String, default: '' },
    },

    // For outstation: the destination town/place (free text, e.g. "Patna").
    destination: { type: String, trim: true, default: '' },

    // For outstation: one-way vs round-trip (driver waits & returns).
    tripType: { type: String, enum: ['one-way', 'round-trip'], default: 'one-way' },

    // When the rider wants the vehicle (now, or a scheduled time).
    // Outstation trips are almost always scheduled for a future date/time.
    scheduledAt: { type: Date, default: Date.now },

    // For hire mode
    days: { type: Number, default: 1 },

    status: { type: String, enum: TRIP_STATUSES, default: 'requested', index: true },

    // Fare
    estimatedFare: { type: Number, default: 0 },
    finalFare: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },

    paymentMode: { type: String, enum: ['cash', 'upi'], default: 'cash' },
    // pending  -> not paid yet
    // claimed  -> rider says they've paid (UPI), awaiting driver confirmation
    // paid     -> driver confirmed receipt
    paymentStatus: { type: String, enum: ['pending', 'claimed', 'paid'], default: 'pending' },
    paidAt: { type: Date },

    // Commission snapshot, taken at completion from the platform Settings.
    // Recorded per trip so historical trips keep the rate that applied then,
    // even if the admin changes the platform commission later.
    commissionPercent: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 }, // computed = finalFare * commissionPercent / 100

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

    // --- Safety ---
    // Unguessable token for the public "share my trip" page (no login needed).
    // Generated when a driver accepts, so there's a driver+vehicle to show.
    shareToken: { type: String, unique: true, sparse: true, default: undefined },

    // Latest driver location, cached here so the public share page can read it
    // without touching the driver's User record. [lng, lat].
    lastDriverLocation: { type: [Number], default: undefined },
    lastDriverLocationAt: { type: Date },

    // SOS: raised by the rider during an active trip.
    sosRaisedAt: { type: Date },
    sosLocation: { type: [Number], default: undefined }, // [lng, lat] where SOS was pressed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
module.exports.TRIP_STATUSES = TRIP_STATUSES;
module.exports.TRIP_MODES = TRIP_MODES;

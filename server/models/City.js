// City model — the cities MithilaVahan operates in.
// City-scoped from day one so expansion is just adding a row.

const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    state: { type: String, default: 'Bihar', trim: true },

    // Approx center, used for map default + distance sanity checks
    center: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    // Optional fixed fare slabs for point-to-point (simpler than distance API for MVP).
    // e.g. [{ label: 'Within city', fare: 150 }, { label: 'Station to Airport', fare: 400 }]
    fareSlabs: [
      {
        label: { type: String, trim: true },
        fare: { type: Number, default: 0 },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);

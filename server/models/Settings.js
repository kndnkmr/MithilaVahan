// Platform-wide settings — a single document (singleton).
// Currently holds the commission percentage. Default 0 = fully free (no commission),
// so the platform behaves exactly like Promedicoz until an admin turns it on.

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // A fixed key so there's only ever one settings document.
    key: { type: String, default: 'platform', unique: true },

    // Percentage the platform charges per completed trip (0–100). 0 = free.
    // While money is direct rider→driver UPI, this is informational + recorded
    // per trip; when online payments are added later it becomes the actual split.
    commissionPercent: { type: Number, default: 0, min: 0, max: 100 },

    // Indicative fare guide shown to riders (per vehicle class). Admin-editable.
    // vehicleType maps a booking's requested type to one of these classes.
    fareGuide: {
      type: [
        {
          label: { type: String, trim: true }, // e.g. "Hatchback"
          vehicleType: { type: String, trim: true }, // maps to booking type: car/auto/tempo/bus/truck/bike
          baseFare: { type: Number, default: 0 },
          perKm: { type: Number, default: 0 },
          perDay: { type: Number, default: 0 },
        },
      ],
      default: undefined,
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Default indicative fares (used until an admin edits them).
const DEFAULT_FARE_GUIDE = [
  { label: 'Hatchback', vehicleType: 'car', baseFare: 50, perKm: 9, perDay: 2400 },
  { label: 'Sedan', vehicleType: 'car', baseFare: 50, perKm: 10, perDay: 2600 },
  { label: 'SUV', vehicleType: 'car', baseFare: 50, perKm: 13, perDay: 3000 },
  { label: 'Auto', vehicleType: 'auto', baseFare: 30, perKm: 9, perDay: 1200 },
  { label: 'Tempo / Van', vehicleType: 'tempo', baseFare: 80, perKm: 18, perDay: 3500 },
  { label: 'Bus', vehicleType: 'bus', baseFare: 500, perKm: 35, perDay: 9000 },
];

// Convenience: fetch (creating the default doc if missing).
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'platform' });
  if (!doc) doc = await this.create({ key: 'platform', fareGuide: DEFAULT_FARE_GUIDE });
  // Backfill fareGuide for an existing settings doc created before this field.
  if (!doc.fareGuide || doc.fareGuide.length === 0) {
    doc.fareGuide = DEFAULT_FARE_GUIDE;
    await doc.save();
  }
  return doc;
};

settingsSchema.statics.DEFAULT_FARE_GUIDE = DEFAULT_FARE_GUIDE;

module.exports = mongoose.model('Settings', settingsSchema);

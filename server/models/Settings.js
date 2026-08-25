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

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Convenience: fetch (creating the default doc if missing).
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'platform' });
  if (!doc) doc = await this.create({ key: 'platform' });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);

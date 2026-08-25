// User model — one schema for riders, drivers, and admins (role-based).
// Phone-first (common in tier-2/3 cities); email optional.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Phone is the primary identifier (10-digit Indian mobile, stored as +91XXXXXXXXXX)
    phone: { type: String, required: true, unique: true, trim: true },

    // Email optional (drivers may not have one)
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: undefined },

    password: { type: String, required: true, minlength: 6, select: false },

    role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },

    // The city this user operates in (drivers) or usually books from (riders)
    city: { type: String, trim: true },

    // ---- Driver-specific fields ----
    // Driver availability toggle — only online drivers receive trip requests.
    isOnline: { type: Boolean, default: false },

    // Last known location (for nearest-driver matching later). [lng, lat] GeoJSON order.
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    // Verification documents (URLs / Cloudinary ids)
    documents: {
      drivingLicense: { type: String, default: '' },
      rcBook: { type: String, default: '' }, // Registration Certificate
      insurance: { type: String, default: '' },
    },

    // Admin approves a driver before they can accept trips
    driverStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // WhatsApp number for click-to-chat (falls back to phone)
    whatsappNumber: { type: String, default: '' },
    upiId: { type: String, default: '' },
    qrImage: { type: String, default: '' }, // URL of the driver's UPI QR image (optional)

    // Admin can deactivate without deleting (keeps trip history)
    isSuspended: { type: Boolean, default: false },

    // Aggregate rating (updated when a trip is rated)
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Password reset
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpire: { type: Date, default: undefined },
  },
  { timestamps: true }
);

// Geospatial index for nearest-driver queries (Phase 2 dispatch)
userSchema.index({ currentLocation: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plaintext password against the stored hash
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

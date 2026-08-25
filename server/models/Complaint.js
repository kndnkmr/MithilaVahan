// Complaint / grievance filed by a rider or driver. Admin reviews and responds.

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['rider', 'driver'], required: true },

    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // Optional: which trip this is about.
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },

    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
      index: true,
    },

    adminResponse: { type: String, default: '' },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);

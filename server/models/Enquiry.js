// Service enquiry (wedding, corporate, tour package, or other) submitted from
// the public Services page. Unlike a complaint, an enquiry does NOT require the
// person to be logged in — a wedding/corporate/tour customer often has no
// account yet — so we capture their name + phone directly. If they happen to be
// logged in, we still link the user for convenience.

const mongoose = require('mongoose');

const ENQUIRY_TYPES = ['wedding', 'corporate', 'tour', 'other'];
const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const enquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ENQUIRY_TYPES, default: 'other', index: true },

    // Contact details (required — this is how the team follows up).
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    city: { type: String, trim: true, default: '' },
    // Free-form details: dates, number of vehicles, destination, guests, etc.
    details: { type: String, required: true, trim: true },

    // Optional structured hints (kept simple / all optional).
    date: { type: String, trim: true, default: '' }, // when they need it (free text)
    vehicleType: { type: String, trim: true, default: '' },

    // If a logged-in user submitted it, link them (optional).
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);

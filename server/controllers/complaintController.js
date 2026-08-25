// Complaints: users file them, admins review and respond.

const Complaint = require('../models/Complaint');
const Trip = require('../models/Trip');
const { emitToUser } = require('../socket');
const { sendPushToUser } = require('../utils/push');

// POST /api/complaints  (rider or driver files a complaint)
async function fileComplaint(req, res) {
  try {
    const { subject, message, tripId } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // If a trip is referenced, make sure it actually belongs to this user.
    let trip = null;
    if (tripId) {
      const t = await Trip.findById(tripId).select('rider driver');
      if (t && (String(t.rider) === String(req.user._id) || String(t.driver) === String(req.user._id))) {
        trip = t._id;
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      role: req.user.role === 'driver' ? 'driver' : 'rider',
      subject,
      message,
      trip,
    });

    res.status(201).json({ message: 'Complaint submitted. We’ll get back to you.', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit complaint', error: err.message });
  }
}

// GET /api/complaints/mine
async function myComplaints(req, res) {
  const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ complaints });
}

// GET /api/admin/complaints?status=
async function listComplaints(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const complaints = await Complaint.find(filter)
    .populate('user', 'name phone role')
    .sort({ createdAt: -1 });
  res.json({ complaints });
}

// PUT /api/admin/complaints/:id  { status, adminResponse }
async function updateComplaint(req, res) {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status && ['open', 'in-progress', 'resolved'].includes(status)) complaint.status = status;
    if (adminResponse !== undefined) {
      complaint.adminResponse = adminResponse;
      complaint.respondedAt = new Date();
    }
    await complaint.save();

    // Notify the user of the update.
    emitToUser(String(complaint.user), 'complaint:updated', complaint);
    sendPushToUser(complaint.user, {
      title: 'Update on your complaint',
      body: complaint.adminResponse
        ? 'Our team responded to your complaint.'
        : `Your complaint is now ${complaint.status}.`,
    });

    res.json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update complaint', error: err.message });
  }
}

module.exports = { fileComplaint, myComplaints, listComplaints, updateComplaint };

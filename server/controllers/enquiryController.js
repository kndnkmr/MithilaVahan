// Service enquiries: anyone (logged in or not) can submit one from the public
// Services page; admins review and manage them.

const Enquiry = require('../models/Enquiry');

const TYPES = ['wedding', 'corporate', 'tour', 'other'];

// POST /api/enquiries  (public — no auth required)
async function createEnquiry(req, res) {
  try {
    const { type, name, phone, city, details, date, vehicleType } = req.body;

    if (!name || !phone || !details) {
      return res.status(400).json({ message: 'Name, phone, and details are required' });
    }
    // Light phone sanity check (Indian 10-digit, tolerant of spaces/+91).
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const enquiry = await Enquiry.create({
      type: TYPES.includes(type) ? type : 'other',
      name: String(name).trim(),
      phone: String(phone).trim(),
      city: city || '',
      details: String(details).trim(),
      date: date || '',
      vehicleType: vehicleType || '',
      // req.user is set only if an auth token was sent; the route is public so
      // it may be undefined — that's fine.
      user: req.user?._id || null,
    });

    res.status(201).json({
      message: 'Enquiry received! Our team will contact you shortly.',
      enquiry,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit enquiry', error: err.message });
  }
}

// GET /api/admin/enquiries?status=&type=
async function listEnquiries(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  const enquiries = await Enquiry.find(filter)
    .populate('user', 'name phone')
    .sort({ createdAt: -1 });
  res.json({ enquiries });
}

// PUT /api/admin/enquiries/:id  { status, adminNote }
async function updateEnquiry(req, res) {
  try {
    const { status, adminNote } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    if (status && ['new', 'contacted', 'closed'].includes(status)) enquiry.status = status;
    if (adminNote !== undefined) enquiry.adminNote = adminNote;
    await enquiry.save();

    res.json({ message: 'Enquiry updated', enquiry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update enquiry', error: err.message });
  }
}

module.exports = { createEnquiry, listEnquiries, updateEnquiry };

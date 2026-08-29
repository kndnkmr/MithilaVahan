// Auth: register, login, get current user. Phone-first.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatPhone, isValidIndianPhone } = require('../utils/formatPhone');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Shape the user object sent to the client (never include password).
function publicUser(u) {
  return {
    id: u._id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    city: u.city,
    isOnline: u.isOnline,
    driverStatus: u.driverStatus,
    whatsappNumber: u.whatsappNumber,
    upiId: u.upiId,
    upiNumber: u.upiNumber,
    qrImage: u.qrImage,
    documents: u.documents,
    ratingAvg: u.ratingAvg,
    ratingCount: u.ratingCount,
    emergencyContactName: u.emergencyContactName,
    emergencyContactPhone: u.emergencyContactPhone,
    referralCode: u.referralCode,
    referralCount: u.referralCount,
  };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, phone, email, password, role, city, referralCode: refUsed } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }
    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Only allow rider/driver via public registration — admin is bootstrapped.
    const safeRole = role === 'driver' ? 'driver' : 'rider';

    const formattedPhone = formatPhone(phone);
    const exists = await User.findOne({ phone: formattedPhone });
    if (exists) {
      return res.status(400).json({ message: 'An account with this phone already exists' });
    }

    // Generate a short unique referral code (e.g. MV3F9K2Q).
    const genCode = () => 'MV' + Math.random().toString(36).slice(2, 8).toUpperCase();
    let referralCode = genCode();
    while (await User.exists({ referralCode })) referralCode = genCode();

    // Validate the referrer's code if one was used.
    let referredBy = '';
    if (refUsed) {
      const referrer = await User.findOne({ referralCode: String(refUsed).toUpperCase() });
      if (referrer) referredBy = referrer.referralCode;
    }

    const user = await User.create({
      name,
      phone: formattedPhone,
      email: email || undefined,
      password,
      role: safeRole,
      city: city || undefined,
      referralCode,
      referredBy,
      // drivers start unapproved; riders are usable immediately
      driverStatus: safeRole === 'driver' ? 'pending' : undefined,
    });

    // Credit the referrer.
    if (referredBy) {
      await User.updateOne({ referralCode: referredBy }, { $inc: { referralCount: 1 } });
    }

    res.status(201).json({
      message: 'Registration successful!',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone or email already in use' });
    }
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

// POST /api/auth/login  (login by phone)
async function login(req, res) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone: formatPhone(phone) }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid phone or password' });
    if (user.isSuspended) return res.status(403).json({ message: 'Account is deactivated' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid phone or password' });

    res.json({
      message: 'Login successful!',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}

// PUT /api/auth/emergency-contact  (rider sets their safety contact)
async function setEmergencyContact(req, res) {
  const { name, phone } = req.body;
  req.user.emergencyContactName = name || '';
  req.user.emergencyContactPhone = phone || '';
  await req.user.save();
  res.json({
    message: 'Emergency contact saved',
    emergencyContactName: req.user.emergencyContactName,
    emergencyContactPhone: req.user.emergencyContactPhone,
  });
}

module.exports = { register, login, getMe, setEmergencyContact, publicUser };

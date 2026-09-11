// Auth middleware: verify JWT (protect) and check roles (authorize).

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Bearer token and attaches req.user.
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized — no token' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    if (user.isSuspended) return res.status(403).json({ message: 'Account is deactivated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
}

// Like protect, but does NOT block when there's no/invalid token — it simply
// attaches req.user when a valid token is present. Use for public endpoints
// that want to link a logged-in user if one happens to be signed in.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended) req.user = user;
    }
  } catch (_) {
    // ignore — treat as anonymous
  }
  next();
}

// Restricts a route to one or more roles: authorize('driver', 'admin')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for your role' });
    }
    next();
  };
}

module.exports = { protect, optionalAuth, authorize };

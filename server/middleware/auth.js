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

// Restricts a route to one or more roles: authorize('driver', 'admin')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for your role' });
    }
    next();
  };
}

module.exports = { protect, authorize };

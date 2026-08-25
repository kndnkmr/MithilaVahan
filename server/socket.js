// Socket.io setup — JWT-authenticated, per-user rooms.
// Used for: pushing new trip requests to online drivers in a city,
// and live trip-status updates to the rider.

const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  // Authenticate every socket connection with the same JWT as the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.userId = String(user._id);
      socket.role = user.role;
      socket.city = user.city;
      next();
    } catch (err) {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    // Personal room, so we can target a specific user.
    socket.join(`user:${socket.userId}`);

    // Drivers also join a city room so we can broadcast new requests.
    if (socket.role === 'driver' && socket.city) {
      socket.join(`city:${socket.city}:drivers`);
    }

    // Driver can update their live location (used later for map/dispatch).
    socket.on('driver:location', async ({ lng, lat }) => {
      if (socket.role !== 'driver') return;
      try {
        await User.findByIdAndUpdate(socket.userId, {
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
        });
      } catch (_) {}
    });

    socket.on('disconnect', () => {});
  });

  console.log('Socket.io initialized.');
  return io;
}

// --- Emit helpers used by controllers ---

// Notify all online drivers in a city about a new trip request.
function emitNewTripToCity(city, trip) {
  if (!io) return;
  io.to(`city:${city}:drivers`).emit('trip:new', trip);
}

// Notify a specific user (rider or driver) about a trip status change.
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitNewTripToCity, emitToUser, getIo: () => io };

// MithilaVahan — backend entry point
// Connects MongoDB, mounts routes, starts Express + Socket.io.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');

const { initSocket } = require('./socket');
const { seedCities } = require('./utils/seedCities');
const { bootstrapAdmin } = require('./utils/bootstrapAdmin');

const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve locally-uploaded files (Cloudinary is preferred in production)
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicle'));
app.use('/api/trips', require('./routes/trip'));
app.use('/api/cities', require('./routes/city'));
app.use('/api/drivers', require('./routes/driver'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/push', require('./routes/push'));

// --- Health check ---
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    status: 'OK',
    service: 'MithilaVahan API',
    database: dbState === 1 ? 'Connected' : 'Disconnected',
    time: new Date().toISOString(),
  });
});

// --- 404 fallback ---
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// --- Socket.io (real-time trip requests + status) ---
initSocket(server);

// --- Start ---
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB successfully!');

    // One-time-ish setup helpers (idempotent)
    await seedCities();
    await bootstrapAdmin();

    server.listen(PORT, () => {
      console.log('MithilaVahan Server is running!');
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;

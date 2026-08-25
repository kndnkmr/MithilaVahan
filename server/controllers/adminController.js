// Admin: dashboard stats, approve drivers/vehicles, manage cities and users.

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const City = require('../models/City');

// GET /api/admin/stats
async function stats(req, res) {
  const [riders, drivers, pendingDrivers, vehicles, pendingVehicles, trips] = await Promise.all([
    User.countDocuments({ role: 'rider' }),
    User.countDocuments({ role: 'driver' }),
    User.countDocuments({ role: 'driver', driverStatus: 'pending' }),
    Vehicle.countDocuments({}),
    Vehicle.countDocuments({ approvalStatus: 'pending' }),
    Trip.countDocuments({}),
  ]);
  res.json({ riders, drivers, pendingDrivers, vehicles, pendingVehicles, trips });
}

// GET /api/admin/drivers?status=pending
async function listDrivers(req, res) {
  const filter = { role: 'driver' };
  if (req.query.status) filter.driverStatus = req.query.status;
  const drivers = await User.find(filter).sort({ createdAt: -1 });
  res.json({ drivers });
}

// PUT /api/admin/drivers/:id/status  { status: 'approved'|'rejected' }
async function setDriverStatus(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const driver = await User.findById(req.params.id);
  if (!driver || driver.role !== 'driver') {
    return res.status(404).json({ message: 'Driver not found' });
  }
  driver.driverStatus = status;
  if (status !== 'approved') driver.isOnline = false;
  await driver.save();
  res.json({ message: `Driver ${status}`, driver });
}

// GET /api/admin/vehicles?status=pending
async function listVehicles(req, res) {
  const filter = {};
  if (req.query.status) filter.approvalStatus = req.query.status;
  const vehicles = await Vehicle.find(filter)
    .populate('owner', 'name phone')
    .sort({ createdAt: -1 });
  res.json({ vehicles });
}

// PUT /api/admin/vehicles/:id/status  { status: 'approved'|'rejected' }
async function setVehicleStatus(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  vehicle.approvalStatus = status;
  await vehicle.save();
  res.json({ message: `Vehicle ${status}`, vehicle });
}

// POST /api/admin/cities  (add a city)
async function addCity(req, res) {
  const { name, state, center, fareSlabs } = req.body;
  if (!name) return res.status(400).json({ message: 'City name required' });
  const exists = await City.findOne({ name });
  if (exists) return res.status(400).json({ message: 'City already exists' });
  const city = await City.create({ name, state, center, fareSlabs });
  res.status(201).json({ message: 'City added', city });
}

// PUT /api/admin/cities/:id  (edit fare slabs / toggle active)
async function updateCity(req, res) {
  const city = await City.findById(req.params.id);
  if (!city) return res.status(404).json({ message: 'City not found' });
  const { fareSlabs, isActive, center, state } = req.body;
  if (fareSlabs !== undefined) city.fareSlabs = fareSlabs;
  if (isActive !== undefined) city.isActive = isActive;
  if (center !== undefined) city.center = center;
  if (state !== undefined) city.state = state;
  await city.save();
  res.json({ message: 'City updated', city });
}

// PUT /api/admin/users/:id/suspension  { isSuspended: bool }
async function setSuspension(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot suspend an admin' });
  user.isSuspended = !!req.body.isSuspended;
  if (user.isSuspended) user.isOnline = false;
  await user.save();
  res.json({ message: user.isSuspended ? 'User deactivated' : 'User reactivated', user });
}

module.exports = {
  stats, listDrivers, setDriverStatus, listVehicles, setVehicleStatus,
  addCity, updateCity, setSuspension,
};

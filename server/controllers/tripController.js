// Trip lifecycle: rider requests -> driver accepts -> started -> completed.
// Real-time updates via Socket.io; free phone alerts via Web Push.

const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const crypto = require('crypto');
const Settings = require('../models/Settings');
const { estimateFare } = require('../utils/fare');
const { emitNewTripToCity, emitToUser } = require('../socket');
const { sendPushToUser } = require('../utils/push');
const { findNearestDrivers } = require('../utils/dispatch');

// Populate helper so both parties always get readable data.
// The driver's upiId/qrImage are included so a UPI rider can see how to pay.
const POPULATE = [
  { path: 'rider', select: 'name phone whatsappNumber' },
  { path: 'driver', select: 'name phone whatsappNumber ratingAvg ratingCount upiId upiNumber qrImage' },
  { path: 'vehicle', select: 'type model registrationNumber capacity photos' },
];

// POST /api/trips  (rider requests a trip)
async function requestTrip(req, res) {
  try {
    const {
      city, mode, vehicleType, pickup, drop, destination, tripType,
      scheduledAt, days, distanceKm, paymentMode, notes, vehicleId,
    } = req.body;

    if (!city || !vehicleType || !pickup?.address) {
      return res.status(400).json({ message: 'City, vehicle type, and pickup address are required' });
    }

    // Normalize the mode to one the schema allows.
    const safeMode = ['hire', 'outstation'].includes(mode) ? mode : 'trip';

    // Outstation trips need a destination.
    if (safeMode === 'outstation' && !destination) {
      return res.status(400).json({ message: 'Destination is required for an outstation trip' });
    }

    const safeTripType = tripType === 'round-trip' ? 'round-trip' : 'one-way';

    // Optional: rider requested a specific vehicle. Estimate fare from it if given.
    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    }

    const estimatedFare = vehicle
      ? estimateFare({ mode: safeMode, vehicle, distanceKm, days, tripType: safeTripType })
      : 0;

    const trip = await Trip.create({
      rider: req.user._id,
      city,
      mode: safeMode,
      vehicleType,
      vehicle: vehicle ? vehicle._id : null,
      pickup: {
        address: pickup.address,
        coordinates: pickup.coordinates || [0, 0],
        mapLink: pickup.mapLink || '',
      },
      drop: drop
        ? { address: drop.address || '', coordinates: drop.coordinates || [0, 0], mapLink: drop.mapLink || '' }
        : undefined,
      destination: safeMode === 'outstation' ? destination : '',
      tripType: safeMode === 'outstation' ? safeTripType : 'one-way',
      scheduledAt: scheduledAt || Date.now(),
      days: days || 1,
      distanceKm: distanceKm || 0,
      estimatedFare,
      paymentMode: paymentMode === 'upi' ? 'upi' : 'cash',
      notes: notes || '',
      status: 'requested',
    });

    const populated = await Trip.findById(trip._id).populate(POPULATE);

    // --- Dispatch ---
    // 1) City-wide broadcast: any online driver in the city sees it in their
    //    available list (this is the reliable fallback + keeps the list fresh).
    emitNewTripToCity(city, populated);

    // 2) Nearest-driver targeting: if we have real pickup coordinates, find the
    //    closest online approved drivers and give them a direct, prioritized
    //    ping (socket event + Web Push) so the nearest driver reacts first.
    //    If there are no coords, this is a no-op and the broadcast alone applies.
    let notified = 0;
    try {
      const nearest = await findNearestDrivers({
        city,
        coordinates: trip.pickup?.coordinates,
      });
      for (const driver of nearest) {
        emitToUser(String(driver._id), 'trip:nearby', populated);
        sendPushToUser(driver._id, {
          title: 'New trip request nearby',
          body: `${vehicleType} pickup at ${trip.pickup.address}. Tap to accept.`,
        });
        notified += 1;
      }
    } catch (err) {
      // Dispatch is best-effort — never fail the booking if geo lookup errors.
      console.error('Nearest-driver dispatch failed:', err.message);
    }

    res.status(201).json({
      message: 'Trip requested — finding a driver',
      trip: populated,
      nearbyDriversNotified: notified,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to request trip', error: err.message });
  }
}

// GET /api/trips/available  (driver sees open requests in their city)
async function availableTrips(req, res) {
  if (req.user.driverStatus !== 'approved') {
    return res.status(403).json({ message: 'Your driver account is pending approval' });
  }
  // Offline drivers don't receive requests — being offline should genuinely
  // mean "off duty", so we return an empty list rather than stale requests.
  if (!req.user.isOnline) {
    return res.json({ trips: [] });
  }
  const trips = await Trip.find({
    status: 'requested',
    city: req.user.city,
  }).populate(POPULATE).sort({ createdAt: -1 });
  res.json({ trips });
}

// GET /api/trips/mine  (rider or driver — their own trips)
async function myTrips(req, res) {
  const key = req.user.role === 'driver' ? 'driver' : 'rider';
  const trips = await Trip.find({ [key]: req.user._id })
    .populate(POPULATE)
    .sort({ createdAt: -1 });
  res.json({ trips });
}

// PUT /api/trips/:id/accept  (driver accepts a request)
async function acceptTrip(req, res) {
  try {
    if (req.user.driverStatus !== 'approved') {
      return res.status(403).json({ message: 'Your driver account is pending approval' });
    }
    // Must be online to accept — prevents an off-duty driver grabbing a trip
    // from a stale list.
    if (!req.user.isOnline) {
      return res.status(403).json({ message: 'Go online before accepting a trip' });
    }

    const { vehicleId } = req.body;
    const vehicle = vehicleId ? await Vehicle.findById(vehicleId) : null;
    if (vehicleId && (!vehicle || String(vehicle.owner) !== String(req.user._id))) {
      return res.status(400).json({ message: 'Invalid vehicle selection' });
    }

    // Atomic claim: only succeeds if still 'requested' (prevents two drivers grabbing it).
    // Also mint a share token now so the rider can share a live trip link.
    const shareToken = crypto.randomBytes(12).toString('hex');
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, status: 'requested' },
      {
        driver: req.user._id,
        vehicle: vehicle ? vehicle._id : undefined,
        status: 'accepted',
        acceptedAt: new Date(),
        shareToken,
      },
      { new: true }
    ).populate(POPULATE);

    if (!trip) {
      return res.status(409).json({ message: 'This trip was already taken or cancelled' });
    }

    // Tell the rider a driver accepted.
    emitToUser(String(trip.rider._id), 'trip:updated', trip);
    sendPushToUser(trip.rider._id, {
      title: 'Driver assigned!',
      body: `${req.user.name} is on the way for your ${trip.vehicleType} trip.`,
    });

    res.json({ message: 'Trip accepted', trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept trip', error: err.message });
  }
}

// PUT /api/trips/:id/status  (driver moves accepted -> started -> completed)
async function updateStatus(req, res) {
  try {
    const { status, finalFare } = req.body;
    const trip = await Trip.findById(req.params.id).populate(POPULATE);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!trip.driver || String(trip.driver._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your trip' });
    }

    // Enforce a valid forward transition.
    const valid = {
      accepted: 'started',
      started: 'completed',
    };
    if (valid[trip.status] !== status) {
      return res.status(400).json({ message: `Cannot move from ${trip.status} to ${status}` });
    }

    trip.status = status;
    if (status === 'started') trip.startedAt = new Date();
    if (status === 'completed') {
      trip.completedAt = new Date();
      trip.finalFare = finalFare != null ? finalFare : trip.estimatedFare;

      // Snapshot the platform commission that applies right now, so this trip
      // keeps its rate even if the admin changes it later. Default 0 = free.
      const settings = await Settings.getSingleton();
      trip.commissionPercent = settings.commissionPercent;
      trip.platformFee = Math.round((trip.finalFare * settings.commissionPercent) / 100);
    }
    await trip.save();

    emitToUser(String(trip.rider._id), 'trip:updated', trip);
    sendPushToUser(trip.rider._id, {
      title: status === 'started' ? 'Trip started' : 'Trip completed',
      body: status === 'started'
        ? 'Your trip is underway. Have a safe ride!'
        : `Trip complete. Fare: ₹${trip.finalFare}.`,
    });

    res.json({ message: `Trip ${status}`, trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update trip', error: err.message });
  }
}

// PUT /api/trips/:id/cancel  (rider or driver cancels)
async function cancelTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id).populate(POPULATE);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isRider = String(trip.rider._id) === String(req.user._id);
    const isDriver = trip.driver && String(trip.driver._id) === String(req.user._id);
    if (!isRider && !isDriver && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your trip' });
    }
    if (['completed', 'cancelled'].includes(trip.status)) {
      return res.status(400).json({ message: `Trip already ${trip.status}` });
    }

    trip.status = 'cancelled';
    trip.cancellationReason = req.body.reason || '';
    trip.cancelledBy = req.user.role === 'admin' ? 'admin' : isRider ? 'rider' : 'driver';
    await trip.save();

    // Notify the other party.
    const notifyUserId = isRider
      ? trip.driver && trip.driver._id
      : trip.rider._id;
    if (notifyUserId) {
      emitToUser(String(notifyUserId), 'trip:updated', trip);
      sendPushToUser(notifyUserId, {
        title: 'Trip cancelled',
        body: `The ${trip.vehicleType} trip was cancelled.`,
      });
    }

    res.json({ message: 'Trip cancelled', trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel trip', error: err.message });
  }
}

// PUT /api/trips/:id/rate  (rider rates driver after completion)
async function rateTrip(req, res) {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be 1-5' });
    }
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (String(trip.rider) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your trip' });
    }
    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'You can only rate a completed trip' });
    }
    if (trip.rating) {
      return res.status(400).json({ message: 'Trip already rated' });
    }

    trip.rating = rating;
    trip.review = review || '';
    await trip.save();

    // Update the driver's aggregate rating.
    if (trip.driver) {
      const driver = await User.findById(trip.driver);
      if (driver) {
        const total = driver.ratingAvg * driver.ratingCount + rating;
        driver.ratingCount += 1;
        driver.ratingAvg = Math.round((total / driver.ratingCount) * 10) / 10;
        await driver.save();
      }
    }

    res.json({ message: 'Thanks for rating!', trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate trip', error: err.message });
  }
}

// PUT /api/trips/:id/claim-paid  (rider marks that they've paid via UPI)
// Money is direct rider->driver; this just records the rider's claim and
// pings the driver to confirm receipt.
async function claimPaid(req, res) {
  try {
    const trip = await Trip.findById(req.params.id).populate(POPULATE);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (String(trip.rider._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your trip' });
    }
    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'You can confirm payment once the trip is completed' });
    }
    if (trip.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    trip.paymentStatus = 'claimed';
    await trip.save();

    if (trip.driver) {
      emitToUser(String(trip.driver._id), 'trip:updated', trip);
      sendPushToUser(trip.driver._id, {
        title: 'Payment marked as sent',
        body: `${trip.rider.name} says they paid ₹${trip.finalFare}. Confirm when received.`,
      });
    }

    res.json({ message: 'Marked as paid — waiting for driver to confirm', trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment', error: err.message });
  }
}

// PUT /api/trips/:id/confirm-payment  (driver confirms they received the money)
async function confirmPayment(req, res) {
  try {
    const trip = await Trip.findById(req.params.id).populate(POPULATE);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (!trip.driver || String(trip.driver._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your trip' });
    }
    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'Trip is not completed yet' });
    }

    trip.paymentStatus = 'paid';
    trip.paidAt = new Date();
    await trip.save();

    emitToUser(String(trip.rider._id), 'trip:updated', trip);
    sendPushToUser(trip.rider._id, {
      title: 'Payment confirmed',
      body: `Your driver confirmed receiving ₹${trip.finalFare}. Thank you!`,
    });

    res.json({ message: 'Payment confirmed', trip });
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm payment', error: err.message });
  }
}

// GET /api/trips/share/:token  (PUBLIC — no auth)
// Returns a deliberately MINIMAL, safe payload for the shareable trip page.
// Never includes phone numbers, exact rider identity, or payment info.
async function sharedTrip(req, res) {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token })
      .populate('driver', 'name ratingAvg')
      .populate('vehicle', 'type model registrationNumber');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Only expose live location while the trip is actually in progress.
    const active = ['accepted', 'started'].includes(trip.status);

    res.json({
      trip: {
        status: trip.status,
        vehicleType: trip.vehicleType,
        mode: trip.mode,
        destination: trip.mode === 'outstation' ? trip.destination : '',
        pickup: trip.pickup?.address || '',
        // driver first name only — enough for reassurance, not full identity
        driverName: trip.driver ? String(trip.driver.name).split(' ')[0] : '',
        driverRating: trip.driver?.ratingAvg || 0,
        vehicle: trip.vehicle
          ? { model: trip.vehicle.model, plate: trip.vehicle.registrationNumber, type: trip.vehicle.type }
          : null,
        driverLocation: active ? trip.lastDriverLocation || null : null,
        pickupCoordinates:
          trip.pickup?.coordinates &&
          !(trip.pickup.coordinates[0] === 0 && trip.pickup.coordinates[1] === 0)
            ? trip.pickup.coordinates
            : null,
        sosActive: !!trip.sosRaisedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load shared trip', error: err.message });
  }
}

// PUT /api/trips/:id/sos  (rider raises an SOS during an active trip)
async function raiseSos(req, res) {
  try {
    const { lng, lat } = req.body;
    const trip = await Trip.findById(req.params.id).populate(POPULATE);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (String(trip.rider._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your trip' });
    }
    if (!['accepted', 'started'].includes(trip.status)) {
      return res.status(400).json({ message: 'SOS is only available during an active trip' });
    }

    trip.sosRaisedAt = new Date();
    if (Number.isFinite(lng) && Number.isFinite(lat)) trip.sosLocation = [lng, lat];
    await trip.save();

    // Flag every admin (in-app + push) so the platform can act.
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const a of admins) {
      emitToUser(String(a._id), 'trip:sos', {
        tripId: String(trip._id),
        riderName: trip.rider.name,
        city: trip.city,
      });
      sendPushToUser(a._id, {
        title: '🚨 SOS raised',
        body: `${trip.rider.name} raised an SOS on a ${trip.vehicleType} trip in ${trip.city}.`,
      });
    }

    res.json({ message: 'SOS raised', shareToken: trip.shareToken });
  } catch (err) {
    res.status(500).json({ message: 'Failed to raise SOS', error: err.message });
  }
}

// GET /api/drivers/:id/reviews  (PUBLIC) — a driver's recent ratings/reviews.
// Powers the trust display when a rider is deciding.
async function driverReviews(req, res) {
  try {
    const driver = await User.findById(req.params.id).select('name ratingAvg ratingCount role');
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    const trips = await Trip.find({ driver: driver._id, rating: { $gte: 1 } })
      .select('rating review completedAt')
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({
      driver: {
        name: String(driver.name).split(' ')[0], // first name only for privacy
        ratingAvg: driver.ratingAvg,
        ratingCount: driver.ratingCount,
      },
      reviews: trips
        .filter((t) => t.review) // only ones with text
        .map((t) => ({ rating: t.rating, review: t.review, at: t.completedAt })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load reviews', error: err.message });
  }
}

module.exports = {
  requestTrip, availableTrips, myTrips, acceptTrip, updateStatus, cancelTrip, rateTrip,
  claimPaid, confirmPayment, sharedTrip, raiseSos, driverReviews,
};

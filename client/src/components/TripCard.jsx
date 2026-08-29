// Displays a single trip; shows role-appropriate actions.

import { useState } from 'react';
import { driverAPI } from '../services/api';
import { navLink } from '../services/maps';
import TripStatusGuide from './TripStatusGuide';

// Render ★ rating compactly.
function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500" title={`${value} / 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

const STATUS_STYLES = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  started: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

// Build a wa.me click-to-chat link (free, no API).
function waLink(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
}

// Compose an intuitive, role-aware WhatsApp opener so each side sends a message
// that makes sense for who they are and what they need — instead of one bland
// "regarding our trip" line for everyone.
function waMessage(trip, role) {
  const senderName = (role === 'rider' ? trip.rider?.name : trip.driver?.name) || '';
  const iAm = senderName ? ` This is ${senderName}.` : '';
  const where =
    trip.mode === 'outstation' && trip.destination
      ? ` to ${trip.destination}`
      : trip.mode === 'hire'
      ? ' (full-day hire)'
      : '';
  const pickup = trip.pickup?.address ? ` My pickup is: ${trip.pickup.address}.` : '';

  if (role === 'rider') {
    // Rider messaging the driver — help the driver find them.
    if (trip.status === 'accepted') {
      return `Hi, you accepted my MithilaVahan ${trip.vehicleType} trip${where}.${iAm}${pickup} Please let me know your ETA.`;
    }
    if (trip.status === 'started') {
      return `Hi, regarding my ongoing MithilaVahan ${trip.vehicleType} trip${where}.${iAm}`;
    }
    return `Hi, about my MithilaVahan ${trip.vehicleType} trip${where}.${iAm}${pickup}`;
  }

  // Driver messaging the rider — identify themselves and reassure.
  if (trip.status === 'accepted') {
    return `Hi, I'm your MithilaVahan driver for the ${trip.vehicleType} trip${where}.${iAm} I'm heading to your pickup${trip.pickup?.address ? ` at ${trip.pickup.address}` : ''}. Please share your exact location.`;
  }
  if (trip.status === 'started') {
    return `Hi, this is your MithilaVahan driver.${iAm} We're on the way${where}.`;
  }
  return `Hi, regarding your MithilaVahan ${trip.vehicleType} trip${where}.${iAm}`;
}

export default function TripCard({ trip, role, onAction }) {
  const other = role === 'rider' ? trip.driver : trip.rider;
  const [reviews, setReviews] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  const toggleReviews = async () => {
    if (!showReviews && reviews === null && trip.driver?._id) {
      try {
        const res = await driverAPI.reviews(trip.driver._id);
        setReviews(res.data.reviews || []);
      } catch {
        setReviews([]);
      }
    }
    setShowReviews((s) => !s);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium capitalize">
          {trip.vehicleType} ·{' '}
          {trip.mode === 'hire'
            ? `Hire (${trip.days}d)`
            : trip.mode === 'outstation'
            ? 'Outstation'
            : 'Trip'}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[trip.status]}`}>
          {trip.status}
        </span>
      </div>

      {/* Step-by-step guide for the current status + viewer role */}
      <TripStatusGuide status={trip.status} role={role} />

      <div className="text-sm text-gray-600 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Pickup: {trip.pickup?.address}</span>
          {navLink(trip.pickup || {}) && (
            <a href={navLink(trip.pickup)} target="_blank" rel="noreferrer"
              className="text-brand-600 font-medium text-xs whitespace-nowrap">🧭 Navigate</a>
          )}
        </div>
        {trip.mode === 'trip' && trip.drop?.address && (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Drop: {trip.drop.address}</span>
            {navLink(trip.drop || {}) && (
              <a href={navLink(trip.drop)} target="_blank" rel="noreferrer"
                className="text-brand-600 font-medium text-xs whitespace-nowrap">🧭 Navigate</a>
            )}
          </div>
        )}
        {trip.mode === 'outstation' && (
          <>
            <div>
              To: <b>{trip.destination}</b>{' '}
              <span className="text-gray-400">
                ({trip.tripType === 'round-trip' ? 'round trip' : 'one way'})
              </span>
            </div>
            {trip.distanceKm > 0 && <div>Approx distance: {trip.distanceKm} km</div>}
          </>
        )}
        <div>City: {trip.city}</div>
        {(trip.mode === 'outstation' || trip.mode === 'hire') && trip.scheduledAt && (
          <div>When: {new Date(trip.scheduledAt).toLocaleString('en-IN')}</div>
        )}
        {trip.estimatedFare > 0 && <div>Estimate: ₹{trip.estimatedFare}</div>}
        {trip.status === 'completed' && trip.finalFare > 0 && (
          <div className="font-medium text-gray-800">Fare: ₹{trip.finalFare}</div>
        )}
        {/* Platform fee only shown when a commission is actually in effect (> 0) */}
        {trip.status === 'completed' && trip.commissionPercent > 0 && (
          <div className="text-gray-500 text-xs">
            Platform fee ({trip.commissionPercent}%): ₹{trip.platformFee}
            {role === 'driver' && trip.finalFare > 0 && (
              <> · you keep ₹{trip.finalFare - trip.platformFee}</>
            )}
          </div>
        )}
      </div>

      {/* Payment (direct UPI) — shown once the trip is completed and paid by UPI */}
      {trip.status === 'completed' && trip.paymentMode === 'upi' && (
        <div className="mt-2 border-t pt-2 text-sm">
          {role === 'rider' && trip.paymentStatus !== 'paid' && (
            <div className="space-y-1">
              <div className="text-gray-600">
                Pay ₹{trip.finalFare} directly to your driver by UPI:
              </div>
              {trip.driver?.upiNumber && (
                <div className="font-medium">UPI number: {trip.driver.upiNumber}</div>
              )}
              {trip.driver?.upiId && (
                <div className="font-medium">UPI ID: {trip.driver.upiId}</div>
              )}
              {trip.driver?.qrImage && (
                <img src={trip.driver.qrImage} alt="Driver UPI QR"
                  className="w-32 h-32 object-contain border rounded-md" />
              )}
              {!trip.driver?.upiNumber && !trip.driver?.upiId && !trip.driver?.qrImage && (
                <div className="text-gray-400 text-xs">
                  Driver hasn't added UPI details — pay by cash or ask on WhatsApp.
                </div>
              )}
            </div>
          )}
          <div className="mt-1">
            {trip.paymentStatus === 'pending' && role === 'rider' && (
              <button onClick={() => onAction?.('claim-paid', trip)}
                className="bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition">I've paid</button>
            )}
            {trip.paymentStatus === 'claimed' && role === 'rider' && (
              <span className="text-yellow-700 text-xs">Waiting for the driver to confirm your payment…</span>
            )}
            {trip.paymentStatus === 'claimed' && role === 'driver' && (
              <button onClick={() => onAction?.('confirm-payment', trip)}
                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition">Payment received</button>
            )}
            {trip.paymentStatus === 'pending' && role === 'driver' && (
              <span className="text-gray-400 text-xs">Awaiting payment from rider.</span>
            )}
            {trip.paymentStatus === 'paid' && (
              <span className="text-green-700 text-xs">✓ Payment confirmed</span>
            )}
          </div>
        </div>
      )}

      {/* The other party once assigned. For riders, a richer driver trust card. */}
      {other && (
        <div className="mt-2 text-sm border-t pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Vehicle photo (rider view) */}
              {role === 'rider' && trip.vehicle?.photos?.[0] && (
                <img src={trip.vehicle.photos[0]} alt="" className="w-11 h-11 object-cover rounded-md border" />
              )}
              <div>
                <div>
                  {role === 'rider' ? 'Driver' : 'Rider'}: <b>{other.name}</b>
                </div>
                {role === 'rider' && (
                  <div className="text-xs text-gray-500">
                    {other.ratingCount > 0 ? (
                      <>
                        <Stars value={other.ratingAvg} /> {other.ratingAvg} ({other.ratingCount})
                      </>
                    ) : (
                      <span className="text-gray-400">New driver</span>
                    )}
                    {trip.vehicle?.model && <> · {trip.vehicle.model}</>}
                    {trip.vehicle?.registrationNumber && <> · {trip.vehicle.registrationNumber}</>}
                  </div>
                )}
              </div>
            </div>
            {other.phone && (
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <a
                  href={`tel:${other.phone}`}
                  className="inline-flex items-center gap-1 border border-brand-500 text-brand-600 font-medium rounded-full px-3 py-1 text-xs hover:bg-brand-50 transition whitespace-nowrap"
                  title={`Call the ${role === 'rider' ? 'driver' : 'rider'}`}
                >
                  📞 Call {role === 'rider' ? 'driver' : 'rider'}
                </a>
                <a
                  href={waLink(other.phone, waMessage(trip, role))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-green-600 text-white font-medium rounded-full px-3 py-1 text-xs hover:bg-green-700 transition whitespace-nowrap"
                  title={`Message the ${role === 'rider' ? 'driver' : 'rider'} on WhatsApp`}
                >
                  WhatsApp {role === 'rider' ? 'driver' : 'rider'}
                </a>
              </div>
            )}
          </div>

          {/* See reviews (rider view, when the driver has any rating history) */}
          {role === 'rider' && other.ratingCount > 0 && (
            <div className="mt-1">
              <button onClick={toggleReviews} className="text-brand-600 text-xs font-medium">
                {showReviews ? 'Hide reviews' : 'See reviews'}
              </button>
              {showReviews && (
                <div className="mt-1 space-y-1">
                  {reviews === null && <div className="text-xs text-gray-400">Loading…</div>}
                  {reviews?.length === 0 && <div className="text-xs text-gray-400">No written reviews yet.</div>}
                  {reviews?.map((r, i) => (
                    <div key={i} className="text-xs bg-gray-50 rounded p-2">
                      <Stars value={r.rating} /> <span className="text-gray-600">{r.review}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions — consistent rounded-lg shape; semantic colors kept */}
      {onAction && (
        <div className="mt-3 flex flex-wrap gap-2">
          {role === 'driver' && trip.status === 'requested' && (
            <button onClick={() => onAction('accept', trip)}
              className="bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition">Accept</button>
          )}
          {role === 'driver' && trip.status === 'accepted' && (
            <button onClick={() => onAction('start', trip)}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Start trip</button>
          )}
          {role === 'driver' && trip.status === 'started' && (
            <button onClick={() => onAction('complete', trip)}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition">Complete</button>
          )}
          {['requested', 'accepted'].includes(trip.status) && (
            <button onClick={() => onAction('cancel', trip)}
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:border-red-300 hover:text-red-600 transition">Cancel</button>
          )}
          {role === 'rider' && trip.status === 'completed' && !trip.rating && (
            <button onClick={() => onAction('rate', trip)}
              className="border border-brand-500 text-brand-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-50 transition">Rate driver</button>
          )}
          {role === 'rider' && trip.rating && (
            <span className="text-sm text-gray-400">You rated ★ {trip.rating}</span>
          )}
        </div>
      )}
    </div>
  );
}

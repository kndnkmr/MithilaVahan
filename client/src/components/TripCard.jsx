// Displays a single trip; shows role-appropriate actions.

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

export default function TripCard({ trip, role, onAction }) {
  const other = role === 'rider' ? trip.driver : trip.rider;

  return (
    <div className="bg-white border rounded-lg p-4">
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

      <div className="text-sm text-gray-600 space-y-0.5">
        <div>Pickup: {trip.pickup?.address}</div>
        {trip.mode === 'trip' && trip.drop?.address && <div>Drop: {trip.drop.address}</div>}
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
              {trip.driver?.upiId && (
                <div className="font-medium">UPI: {trip.driver.upiId}</div>
              )}
              {trip.driver?.qrImage && (
                <img src={trip.driver.qrImage} alt="Driver UPI QR"
                  className="w-32 h-32 object-contain border rounded-md" />
              )}
              {!trip.driver?.upiId && !trip.driver?.qrImage && (
                <div className="text-gray-400 text-xs">
                  Driver hasn't added UPI details — pay by cash or ask on WhatsApp.
                </div>
              )}
            </div>
          )}
          <div className="mt-1">
            {trip.paymentStatus === 'pending' && role === 'rider' && (
              <button onClick={() => onAction?.('claim-paid', trip)}
                className="bg-brand-500 text-white text-sm px-3 py-1.5 rounded-md">I've paid</button>
            )}
            {trip.paymentStatus === 'claimed' && role === 'rider' && (
              <span className="text-yellow-700 text-xs">Waiting for the driver to confirm your payment…</span>
            )}
            {trip.paymentStatus === 'claimed' && role === 'driver' && (
              <button onClick={() => onAction?.('confirm-payment', trip)}
                className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-md">Payment received</button>
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

      {/* The other party's contact once assigned */}
      {other && (
        <div className="mt-2 text-sm border-t pt-2 flex items-center justify-between">
          <span>
            {role === 'rider' ? 'Driver' : 'Rider'}: <b>{other.name}</b>
            {role === 'rider' && other.ratingCount > 0 && (
              <span className="text-gray-400"> · ★ {other.ratingAvg}</span>
            )}
          </span>
          {other.phone && (
            <a
              href={waLink(other.phone, `Hi, regarding our MithilaVahan ${trip.vehicleType} trip.`)}
              target="_blank"
              rel="noreferrer"
              className="text-green-600 font-medium"
            >
              WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      {onAction && (
        <div className="mt-3 flex flex-wrap gap-2">
          {role === 'driver' && trip.status === 'requested' && (
            <button onClick={() => onAction('accept', trip)}
              className="bg-brand-500 text-white text-sm px-3 py-1.5 rounded-md">Accept</button>
          )}
          {role === 'driver' && trip.status === 'accepted' && (
            <button onClick={() => onAction('start', trip)}
              className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-md">Start trip</button>
          )}
          {role === 'driver' && trip.status === 'started' && (
            <button onClick={() => onAction('complete', trip)}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-md">Complete</button>
          )}
          {['requested', 'accepted'].includes(trip.status) && (
            <button onClick={() => onAction('cancel', trip)}
              className="border text-gray-600 text-sm px-3 py-1.5 rounded-md">Cancel</button>
          )}
          {role === 'rider' && trip.status === 'completed' && !trip.rating && (
            <button onClick={() => onAction('rate', trip)}
              className="border text-brand-600 text-sm px-3 py-1.5 rounded-md">Rate driver</button>
          )}
          {role === 'rider' && trip.rating && (
            <span className="text-sm text-gray-400">You rated ★ {trip.rating}</span>
          )}
        </div>
      )}
    </div>
  );
}

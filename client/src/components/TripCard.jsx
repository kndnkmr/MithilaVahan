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
          {trip.vehicleType} · {trip.mode === 'hire' ? `Hire (${trip.days}d)` : 'Trip'}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[trip.status]}`}>
          {trip.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-0.5">
        <div>Pickup: {trip.pickup?.address}</div>
        {trip.mode === 'trip' && trip.drop?.address && <div>Drop: {trip.drop.address}</div>}
        <div>City: {trip.city}</div>
        {trip.estimatedFare > 0 && <div>Estimate: ₹{trip.estimatedFare}</div>}
        {trip.status === 'completed' && trip.finalFare > 0 && (
          <div className="font-medium text-gray-800">Fare paid: ₹{trip.finalFare}</div>
        )}
      </div>

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

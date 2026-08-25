// Public, no-login trip-tracking page. Opened from a shared link (/t/:token).
// Shows minimal safe info + a live map, polling the public endpoint.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tripAPI } from '../services/api';
import LiveTripMap from '../components/LiveTripMap';

const STATUS_LABEL = {
  accepted: 'Driver on the way',
  started: 'Trip in progress',
  completed: 'Trip completed',
  cancelled: 'Trip cancelled',
  requested: 'Finding a driver',
};

export default function SharedTrip() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stop = false;
    const load = () =>
      tripAPI
        .shared(token)
        .then((res) => !stop && setTrip(res.data.trip))
        .catch(() => !stop && setError('This trip link is invalid or has expired.'));

    load();
    // Poll every 8s (public page has no socket auth).
    const id = setInterval(load, 8000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [token]);

  if (error) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">{error}</div>;
  }
  if (!trip) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">Loading trip…</div>;
  }

  const active = ['accepted', 'started'].includes(trip.status);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-4">
        <div className="text-brand-600 font-bold text-lg">MithilaVahan</div>
        <div className="text-gray-500 text-sm">Live trip tracking</div>
      </div>

      {trip.sosActive && (
        <div className="bg-red-600 text-white text-center text-sm font-medium rounded-md p-2 mb-3">
          🚨 The rider has raised an SOS on this trip.
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 mb-3">
        <div className="text-lg font-semibold">{STATUS_LABEL[trip.status] || trip.status}</div>
        <div className="text-sm text-gray-600 mt-2 space-y-0.5">
          <div className="capitalize">Vehicle: {trip.vehicleType}
            {trip.vehicle?.model ? ` · ${trip.vehicle.model}` : ''}
            {trip.vehicle?.plate ? ` (${trip.vehicle.plate})` : ''}
          </div>
          {trip.driverName && (
            <div>
              Driver: {trip.driverName}
              {trip.driverRating > 0 && <span className="text-gray-400"> · ★ {trip.driverRating}</span>}
            </div>
          )}
          {trip.pickup && <div>Pickup: {trip.pickup}</div>}
          {trip.mode === 'outstation' && trip.destination && <div>To: {trip.destination}</div>}
        </div>
      </div>

      {active && (
        <LiveTripMap driver={trip.driverLocation || null} pickup={trip.pickupCoordinates || null} />
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        Shared for safety. This page shows only trip status and live location.
      </p>
    </div>
  );
}

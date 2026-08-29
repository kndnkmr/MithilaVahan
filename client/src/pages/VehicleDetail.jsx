// Vehicle detail view — photo gallery + full details, with a Book button.

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../services/seo';
import { TYPE_IMAGE } from '../data/vehicleImages';

const TYPE_EMOJI = { car: '🚗', auto: '🛺', tempo: '🚐', bus: '🚌', truck: '🚚', bike: '🏍️' };

function Stars({ value }) {
  const full = Math.round(value || 0);
  return <span className="text-amber-500">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>;
}

export default function VehicleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0); // active gallery image index

  useEffect(() => {
    vehicleAPI.get(id)
      .then((r) => setVehicle(r.data.vehicle))
      .catch(() => setError('This vehicle is not available.'));
  }, [id]);

  useSeo(
    vehicle ? `${vehicle.type} · ${vehicle.model} in ${vehicle.city} | MithilaVahan` : 'Vehicle | MithilaVahan',
    vehicle ? `Book a ${vehicle.type} (${vehicle.model}) with a driver in ${vehicle.city}.` : undefined
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">
        {error} <Link to="/vehicles" className="text-brand-600">Browse vehicles</Link>
      </div>
    );
  }
  if (!vehicle) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>;
  }

  // Gallery: owner photos if any, else a single type placeholder.
  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : [TYPE_IMAGE[vehicle.type] || TYPE_IMAGE.car];
  const isSample = !vehicle.photos || vehicle.photos.length === 0;

  const book = () => {
    const path = `/book?vehicleId=${vehicle._id}&type=${vehicle.type}&city=${encodeURIComponent(vehicle.city)}`;
    navigate(user?.role === 'rider' ? path : '/register');
  };

  const capUnit = vehicle.type === 'truck' || vehicle.type === 'tempo' ? 'capacity' : 'seats';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/vehicles" className="text-brand-600 text-sm">← Browse vehicles</Link>

      {/* Gallery */}
      <div className="mt-3">
        <div className="relative rounded-2xl overflow-hidden bg-brand-100 aspect-video">
          <img src={photos[active]} alt={vehicle.model} className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          {isSample && (
            <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
              Sample photo — owner hasn’t added photos yet
            </span>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-16 w-20 rounded-lg overflow-hidden border-2 shrink-0 ${i === active ? 'border-brand-500' : 'border-transparent'}`}>
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TYPE_EMOJI[vehicle.type] || '🚗'}</span>
          <h1 className="text-2xl font-bold capitalize">{vehicle.type} · {vehicle.model}</h1>
        </div>
        <div className="text-gray-500 mt-1">{vehicle.city} · {vehicle.capacity} {capUnit}</div>

        {/* Owner */}
        <div className="card p-4 mt-4">
          <div className="text-sm text-gray-500">Owner / driver</div>
          <div className="font-medium">{vehicle.owner?.name}</div>
          {vehicle.owner?.ratingCount > 0 ? (
            <div className="text-sm text-gray-500"><Stars value={vehicle.owner.ratingAvg} /> {vehicle.owner.ratingAvg} ({vehicle.owner.ratingCount})</div>
          ) : (
            <div className="text-sm text-gray-400">New on MithilaVahan</div>
          )}
          {vehicle.owner?.isOnline && <div className="text-xs text-green-600 mt-1">● Online now</div>}
        </div>

        {/* Rates */}
        <div className="card p-4 mt-4">
          <div className="text-sm text-gray-500 mb-2">Rates (indicative — driver confirms final fare)</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-bold text-brand-600">{vehicle.perKmRate ? `₹${vehicle.perKmRate}` : '—'}</div>
              <div className="text-xs text-gray-500">per km</div>
            </div>
            <div>
              <div className="font-bold text-brand-600">{vehicle.perDayRate ? `₹${vehicle.perDayRate}` : '—'}</div>
              <div className="text-xs text-gray-500">per day</div>
            </div>
            <div>
              <div className="font-bold text-brand-600">{vehicle.baseFare ? `₹${vehicle.baseFare}` : '—'}</div>
              <div className="text-xs text-gray-500">base fare</div>
            </div>
          </div>
        </div>

        {/* Supported modes */}
        <div className="text-sm text-gray-600 mt-4">
          Available for:{' '}
          {[vehicle.supportsTrip && 'in-city trips', vehicle.supportsHire && 'day hire & outstation']
            .filter(Boolean).join(' · ') || 'bookings'}
        </div>

        <button onClick={book} className="btn-primary w-full mt-6">Book this vehicle</button>
      </div>
    </div>
  );
}

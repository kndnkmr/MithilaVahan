// Rider-facing "Browse vehicles" — see listed, approved vehicles with photos
// and book a specific one. This is the "show me the vehicle" experience.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { vehicleImage } from '../data/vehicleImages';

const TYPE_EMOJI = { car: '🚗', auto: '🛺', tempo: '🚐', bus: '🚌', truck: '🚚', bike: '🏍️' };
const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

function Stars({ value }) {
  const full = Math.round(value || 0);
  return <span className="text-amber-500">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>;
}

export default function BrowseVehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(user?.city || '');
  const [type, setType] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cityAPI.list().then((r) => setCities(r.data.cities)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (city) params.city = city;
    if (type) params.type = type;
    vehicleAPI.list(params)
      .then((r) => setVehicles(r.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [city, type]);

  const book = (v) => {
    const path = `/book?vehicleId=${v._id}&type=${v.type}&city=${encodeURIComponent(v.city)}`;
    navigate(user?.role === 'rider' ? path : '/register');
  };

  return (
    <div>
      <SEO
        path="/vehicles"
        title="Browse Vehicles for Rent in Darbhanga & Muzaffarpur"
        description="See cars, autos, tempos, buses and trucks available with a driver in Mithilanchal — photos, capacity and rates. Book the one you want."
      />
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Browse vehicles</h1>
          <p className="text-brand-50">See what’s available near you and book the one you like</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="input max-w-[180px]">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input max-w-[180px]">
            <option value="">All vehicle types</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading vehicles…</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            No vehicles listed here yet. Try another city or type — or{' '}
            <button onClick={() => navigate('/book')} className="text-brand-600 font-medium">book by request</button>.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => (
              <div key={v._id} className="card overflow-hidden flex flex-col">
                {/* Photo — owner's photo, else a type placeholder */}
                <div className="relative h-44 bg-brand-100 cursor-pointer" onClick={() => navigate(`/vehicles/${v._id}`)}>
                  <img src={vehicleImage(v)} alt={v.model} loading="lazy" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="absolute top-2 left-2 text-2xl bg-white/85 rounded-lg w-10 h-10 flex items-center justify-center">
                    {TYPE_EMOJI[v.type] || '🚗'}
                  </span>
                  {(!v.photos || v.photos.length === 0) && (
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                      Sample photo
                    </span>
                  )}
                  {v.owner?.isOnline && (
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      ● Online
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <button onClick={() => navigate(`/vehicles/${v._id}`)} className="text-left font-semibold capitalize hover:text-brand-600">
                    {v.type} · {v.model}
                  </button>
                  <div className="text-sm text-gray-500">
                    {v.city} · {v.capacity} {v.type === 'truck' || v.type === 'tempo' ? 'capacity' : 'seats'}
                  </div>

                  {/* Owner + rating */}
                  <div className="text-sm text-gray-500 mt-1">
                    {v.owner?.name}
                    {v.owner?.ratingCount > 0 && (
                      <> · <Stars value={v.owner.ratingAvg} /> {v.owner.ratingAvg}</>
                    )}
                  </div>

                  {/* Rates */}
                  <div className="text-sm text-gray-700 mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                    {v.perKmRate > 0 && <span>₹{v.perKmRate}/km</span>}
                    {v.perDayRate > 0 && <span>₹{v.perDayRate}/day</span>}
                    {v.baseFare > 0 && <span className="text-gray-400">base ₹{v.baseFare}</span>}
                  </div>

                  <button onClick={() => book(v)}
                    className="btn-primary mt-4 w-full text-sm">
                    Book this vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

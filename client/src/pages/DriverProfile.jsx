// Public driver trust profile — privacy-safe: first name, rating, trips done,
// their approved vehicles, and recent reviews. No phone/exact identity. Builds
// trust in a specific local driver — something aggregators don't offer.

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { driverAPI } from '../services/api';
import { vehicleImage } from '../data/vehicleImages';
import SEO from '../components/SEO';

function Stars({ value }) {
  const full = Math.round(value || 0);
  return <span className="text-amber-500">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>;
}

const TYPE_EMOJI = { car: '🚗', auto: '🛺', tempo: '🚐', bus: '🚌', truck: '🚚', bike: '🏍️' };

export default function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    driverAPI.profile(id)
      .then((r) => setData(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>;
  if (notFound || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">
        Driver not found. <Link to="/vehicles" className="text-brand-600">Browse vehicles</Link>
      </div>
    );
  }

  const { driver, vehicles, reviews } = data;

  return (
    <div>
      <SEO
        path={`/d/${id}`}
        title={`${driver.name} — Driver on MithilaVahan`}
        description={`${driver.name} is a verified MithilaVahan driver${driver.city ? ` in ${driver.city}` : ''} with ${driver.tripsCompleted} trips completed.`}
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {driver.name?.[0] || '🚗'}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {driver.name}
              {driver.verified && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">✓ Verified</span>
              )}
            </h1>
            <div className="text-brand-50 text-sm mt-1">
              {driver.ratingCount > 0 ? (
                <><Stars value={driver.ratingAvg} /> {driver.ratingAvg} ({driver.ratingCount}) · </>
              ) : null}
              {driver.tripsCompleted} trips{driver.city ? ` · ${driver.city}` : ''}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Vehicles */}
        {vehicles?.length > 0 && (
          <section>
            <h2 className="font-bold text-lg mb-3">Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <button key={v._id} onClick={() => navigate(`/vehicles/${v._id}`)}
                  className="card overflow-hidden text-left hover:border-brand-400 transition">
                  <div className="h-32 bg-brand-100 relative">
                    <img src={vehicleImage(v)} alt={v.model} className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span className="absolute top-2 left-2 text-xl bg-white/85 rounded-lg w-9 h-9 flex items-center justify-center">
                      {TYPE_EMOJI[v.type] || '🚗'}
                    </span>
                    {v.isLuxury && (
                      <span className="absolute bottom-2 right-2 text-[11px] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">✨ Luxury</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-medium capitalize">{v.type} · {v.model}</div>
                    <div className="text-sm text-gray-500">{v.city} · {v.capacity} seats</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section>
          <h2 className="font-bold text-lg mb-3">Rider reviews</h2>
          {reviews?.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="card p-4">
                  <Stars value={r.rating} />
                  <p className="text-gray-700 text-sm mt-1">“{r.review}”</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {r.at ? new Date(r.at).toLocaleDateString('en-IN') : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No written reviews yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

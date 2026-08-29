import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cityAPI, tripAPI, vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCoordinates } from '../services/location';
import { haversineKm } from '../services/maps';
import { useT } from '../services/i18n';

const TYPE_EMOJI = { car: '🚗', auto: '🛺', tempo: '🚐', bus: '🚌', truck: '🚚', bike: '🏍️' };

const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

// A sensible default schedule value (~1 hour from now) in the local
// "YYYY-MM-DDTHH:mm" format that <input type="datetime-local"> expects.
function defaultSchedule() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RiderBook() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [searchParams] = useSearchParams();
  // Prefill from query params set when tapping cards/routes on Home.
  const preType = VEHICLE_TYPES.includes(searchParams.get('type')) ? searchParams.get('type') : 'car';
  const preMode = ['trip', 'hire', 'outstation'].includes(searchParams.get('mode'))
    ? searchParams.get('mode')
    : 'trip';
  const preTo = searchParams.get('to') || '';
  const preVehicleId = searchParams.get('vehicleId') || '';
  const preCity = searchParams.get('city') || '';

  const [cities, setCities] = useState([]);
  // The specific vehicle the rider picked from Browse (if any).
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form, setForm] = useState({
    city: preCity || user?.city || '',
    mode: preMode,
    vehicleType: preType,
    pickup: '',
    drop: '',
    days: 1,
    // Outstation fields
    destination: preTo,
    tripType: 'one-way',
    scheduledAt: '',
    distanceKm: '',
    paymentMode: 'cash',
    notes: '',
  });
  // Pickup/drop GPS coords [lng, lat] — power dispatch + approx distance. Optional.
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  // Live fare estimate range { low, high }
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    cityAPI.list().then((res) => setCities(res.data.cities)).catch(() => {});
    // Try to grab location up front so the nearest driver is found automatically.
    getCoordinates().then((c) => c && setPickupCoords(c));

    // If the rider picked a specific vehicle on the Browse page, load it to show
    // a summary and lock the vehicle type to match.
    if (preVehicleId) {
      vehicleAPI.list(preCity ? { city: preCity } : {})
        .then((res) => {
          const v = (res.data.vehicles || []).find((x) => x._id === preVehicleId);
          if (v) {
            setSelectedVehicle(v);
            setForm((f) => ({ ...f, vehicleType: v.type, city: v.city }));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Recompute the instant estimate whenever the inputs that affect fare change.
  useEffect(() => {
    const params = {
      mode: form.mode,
      vehicleType: form.vehicleType,
      distanceKm: form.distanceKm || 0,
      days: form.days || 1,
      tripType: form.tripType,
    };
    // For hire we don't need distance; for trip/outstation we need a distance to be useful.
    const canEstimate = form.mode === 'hire' || Number(form.distanceKm) > 0;
    if (!canEstimate) {
      setEstimate(null);
      return;
    }
    let active = true;
    tripAPI
      .estimate(params)
      .then((res) => active && setEstimate(res.data.estimate))
      .catch(() => active && setEstimate(null));
    return () => {
      active = false;
    };
  }, [form.mode, form.vehicleType, form.distanceKm, form.days, form.tripType]);

  const useMyLocation = async () => {
    setLocating(true);
    const c = await getCoordinates();
    setLocating(false);
    if (c) {
      setPickupCoords(c);
      toast.success('Location captured — nearest drivers will be notified first');
    } else {
      toast.error('Could not get location. Your request still goes to all city drivers.');
    }
  };

  // Fare slabs for the selected city (used as a helpful hint for point-to-point).
  const selectedCity = cities.find((c) => c.name === form.city);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Auto-fill an approximate distance when we have both pickup + drop coords
  // (straight-line; the driver confirms the final fare). Rider can override.
  useEffect(() => {
    if (form.mode === 'hire') return;
    if (pickupCoords && dropCoords) {
      const km = haversineKm(pickupCoords, dropCoords);
      if (km > 0) {
        // Bump straight-line up ~25% as a rough road-distance approximation.
        const approx = Math.max(1, Math.round(km * 1.25));
        setForm((f) => ({ ...f, distanceKm: String(approx) }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, dropCoords, form.mode]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.city || !form.pickup) {
      toast.error('City and pickup are required');
      return;
    }
    if (form.mode === 'outstation' && !form.destination) {
      toast.error('Please enter your destination');
      return;
    }
    setLoading(true);
    try {
      await tripAPI.request({
        city: form.city,
        mode: form.mode,
        vehicleType: form.vehicleType,
        pickup: { address: form.pickup, coordinates: pickupCoords || undefined },
        drop: form.mode === 'trip'
          ? { address: form.drop, coordinates: dropCoords || undefined }
          : undefined,
        destination: form.mode === 'outstation' ? form.destination : undefined,
        tripType: form.mode === 'outstation' ? form.tripType : undefined,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
        scheduledAt: form.scheduledAt || undefined,
        days: form.mode === 'hire' ? Number(form.days) : 1,
        paymentMode: form.paymentMode,
        notes: form.notes,
        vehicleId: selectedVehicle?._id || undefined,
      });
      toast.success(
        form.mode === 'outstation'
          ? 'Outstation trip requested! Finding a driver…'
          : 'Trip requested! Finding a driver…'
      );
      navigate('/trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('bookTitle')}</h1>

      {/* Selected vehicle summary (when booking a specific vehicle from Browse) */}
      {selectedVehicle && (
        <div className="card p-3 mb-4 flex items-center gap-3">
          {selectedVehicle.photos?.[0] ? (
            <img src={selectedVehicle.photos[0]} alt="" className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center text-2xl">
              {TYPE_EMOJI[selectedVehicle.type] || '🚗'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold capitalize">{selectedVehicle.type} · {selectedVehicle.model}</div>
            <div className="text-sm text-gray-500">
              {selectedVehicle.city}
              {selectedVehicle.owner?.name ? ` · ${selectedVehicle.owner.name}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedVehicle(null); navigate('/book'); }}
            className="text-gray-400 text-sm hover:text-red-600"
          >
            Change
          </button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 card p-5">
        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select value={form.city} onChange={set('city')} className="input" required>
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium mb-1">{t('bookingType')}</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['trip', t('inCity'), 'Point to point'],
              ['hire', t('hire'), 'Per day'],
              ['outstation', t('outstation'), 'Long trip'],
            ].map(([val, label, sub]) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm((f) => ({ ...f, mode: val }))}
                className={`rounded-md border py-2 px-1 text-center ${
                  form.mode === val
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600'
                }`}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className={`text-[11px] ${form.mode === val ? 'text-brand-50' : 'text-gray-400'}`}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle type */}
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle type</label>
          <select value={form.vehicleType} onChange={set('vehicleType')} className="input">
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>

        {/* Pickup / Drop */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Pickup location</label>
            <button
              type="button"
              onClick={useMyLocation}
              className="text-xs text-brand-600 font-medium disabled:opacity-50"
              disabled={locating}
            >
              {locating ? 'Locating…' : pickupCoords ? '📍 Location on' : '📍 Use my location'}
            </button>
          </div>
          <input value={form.pickup} onChange={set('pickup')} placeholder="e.g. Tower Chowk, Darbhanga"
            className="input" required />
          {pickupCoords && (
            <p className="text-xs text-gray-400 mt-1">
              📍 Location set — nearest drivers notified first.
            </p>
          )}
        </div>

        {/* In-city point-to-point: drop location + approx distance */}
        {form.mode === 'trip' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Drop location</label>
                <button type="button"
                  onClick={async () => {
                    const c = await getCoordinates();
                    if (c) { setDropCoords(c); toast.success('Drop location set'); }
                    else toast.error('Could not get location');
                  }}
                  className="text-xs text-brand-600 font-medium">
                  {dropCoords ? '📍 Drop set' : '📍 Use my location'}
                </button>
              </div>
              <input value={form.drop} onChange={set('drop')} placeholder="e.g. Darbhanga Junction"
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Approx. distance (km)</label>
              <input type="number" min={0} value={form.distanceKm} onChange={set('distanceKm')}
                placeholder="e.g. 6" className="input" />
              <p className="text-xs text-gray-400 mt-1">
                {pickupCoords && dropCoords
                  ? 'Auto-estimated from your locations — you can adjust. Final fare confirmed by driver.'
                  : 'Add distance (or Maps links above) to see an instant fare estimate.'}
              </p>
            </div>
          </>
        )}

        {/* Hire: number of days */}
        {form.mode === 'hire' && (
          <div>
            <label className="block text-sm font-medium mb-1">Number of days</label>
            <input type="number" min={1} value={form.days} onChange={set('days')}
              className="input" />
          </div>
        )}

        {/* Outstation: destination, one-way/round-trip, when, approx distance */}
        {form.mode === 'outstation' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Destination (where to?)</label>
              <input value={form.destination} onChange={set('destination')}
                placeholder="e.g. Patna, Kathmandu, Sitamarhi"
                className="input" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trip type</label>
              <div className="flex rounded-md border overflow-hidden">
                {[
                  ['one-way', 'One way'],
                  ['round-trip', 'Round trip'],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tripType: val }))}
                    className={`flex-1 py-2 text-sm ${
                      form.tripType === val ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.tripType === 'round-trip' && (
                <p className="text-xs text-gray-400 mt-1">
                  Driver waits at the destination and brings you back.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Approx. distance (km, optional)</label>
              <input type="number" min={0} value={form.distanceKm} onChange={set('distanceKm')}
                placeholder="e.g. 130"
                className="input" />
              <p className="text-xs text-gray-400 mt-1">
                Add distance for an instant estimate — the driver confirms the final fare.
              </p>
            </div>
          </>
        )}

        {/* When — Now vs Schedule (all modes) */}
        <div>
          <label className="block text-sm font-medium mb-1">{t('when')}</label>
          <div className="flex rounded-md border overflow-hidden mb-2">
            {[
              ['now', t('now')],
              ['later', t('schedule')],
            ].map(([val, label]) => {
              const isLater = val === 'later';
              const activeLater = !!form.scheduledAt;
              const active = isLater ? activeLater : !activeLater;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      // switching to Now clears the schedule; Schedule seeds a sensible default
                      scheduledAt: isLater ? f.scheduledAt || defaultSchedule() : '',
                    }))
                  }
                  className={`flex-1 py-2 text-sm ${active ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {form.scheduledAt && (
            <input type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')}
              className="input" />
          )}
        </div>

        {/* Instant fare estimate */}
        {estimate && estimate.high > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
            <div className="text-sm text-green-700">{t('estFare')}</div>
            <div className="text-xl font-bold text-green-800">
              ₹{estimate.low} – ₹{estimate.high}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Includes driver · final fare confirmed on the trip</div>
          </div>
        )}

        {/* Fare slab hint */}
        {form.mode === 'trip' && selectedCity?.fareSlabs?.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-md p-3 text-sm">
            <div className="font-medium text-brand-700 mb-1">Typical fares in {selectedCity.name}</div>
            <ul className="text-gray-600 space-y-0.5">
              {selectedCity.fareSlabs.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>{s.label}</span>
                  <span>₹{s.fare}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-1">Final fare is confirmed by the driver.</p>
          </div>
        )}

        {/* Payment */}
        <div>
          <label className="block text-sm font-medium mb-1">Payment</label>
          <div className="flex gap-3">
            {['cash', 'upi'].map((p) => (
              <label key={p} className="flex items-center gap-1.5 text-sm capitalize">
                <input type="radio" name="pay" checked={form.paymentMode === p}
                  onChange={() => setForm((f) => ({ ...f, paymentMode: p }))} />
                {p}
              </label>
            ))}
          </div>
        </div>

        <textarea value={form.notes} onChange={set('notes')} rows={2}
          placeholder="Notes for the driver (optional)"
          className="input" />

        <button disabled={loading} className="btn-primary w-full">
          {loading ? t('requesting') : t('requestTrip')}
        </button>
      </form>
    </div>
  );
}

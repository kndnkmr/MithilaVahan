import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cityAPI, tripAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCoordinates } from '../services/location';

const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

export default function RiderBook() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    city: user?.city || '',
    mode: 'trip',
    vehicleType: 'car',
    pickup: '',
    drop: '',
    days: 1,
    // Outstation fields
    destination: '',
    tripType: 'one-way',
    scheduledAt: '',
    distanceKm: '',
    paymentMode: 'cash',
    notes: '',
  });
  // Pickup GPS coords [lng, lat] — powers nearest-driver dispatch. Optional.
  const [pickupCoords, setPickupCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cityAPI.list().then((res) => setCities(res.data.cities)).catch(() => {});
    // Try to grab location up front so the nearest driver is found automatically.
    getCoordinates().then((c) => c && setPickupCoords(c));
  }, []);

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
        drop: form.mode === 'trip' ? { address: form.drop } : undefined,
        destination: form.mode === 'outstation' ? form.destination : undefined,
        tripType: form.mode === 'outstation' ? form.tripType : undefined,
        distanceKm: form.mode === 'outstation' && form.distanceKm ? Number(form.distanceKm) : undefined,
        scheduledAt: form.mode === 'outstation' && form.scheduledAt ? form.scheduledAt : undefined,
        days: form.mode === 'hire' ? Number(form.days) : 1,
        paymentMode: form.paymentMode,
        notes: form.notes,
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
      <h1 className="text-2xl font-bold mb-6">Book a ride, hire, or outstation trip</h1>

      <form onSubmit={submit} className="space-y-4 bg-white border rounded-lg p-5">
        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select value={form.city} onChange={set('city')} className="w-full border rounded-md px-3 py-2" required>
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium mb-1">Booking type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['trip', 'In-city', 'Point to point'],
              ['hire', 'Hire', 'Per day'],
              ['outstation', 'Outstation', 'Long trip'],
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
          <select value={form.vehicleType} onChange={set('vehicleType')} className="w-full border rounded-md px-3 py-2">
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
            className="w-full border rounded-md px-3 py-2" required />
          {pickupCoords && (
            <p className="text-xs text-gray-400 mt-1">
              Nearest available drivers will be notified first.
            </p>
          )}
        </div>

        {/* In-city point-to-point: drop location */}
        {form.mode === 'trip' && (
          <div>
            <label className="block text-sm font-medium mb-1">Drop location</label>
            <input value={form.drop} onChange={set('drop')} placeholder="e.g. Darbhanga Junction"
              className="w-full border rounded-md px-3 py-2" />
          </div>
        )}

        {/* Hire: number of days */}
        {form.mode === 'hire' && (
          <div>
            <label className="block text-sm font-medium mb-1">Number of days</label>
            <input type="number" min={1} value={form.days} onChange={set('days')}
              className="w-full border rounded-md px-3 py-2" />
          </div>
        )}

        {/* Outstation: destination, one-way/round-trip, when, approx distance */}
        {form.mode === 'outstation' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Destination (where to?)</label>
              <input value={form.destination} onChange={set('destination')}
                placeholder="e.g. Patna, Kathmandu, Sitamarhi"
                className="w-full border rounded-md px-3 py-2" required />
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
              <label className="block text-sm font-medium mb-1">Pickup date & time</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')}
                className="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Approx. distance (km, optional)</label>
              <input type="number" min={0} value={form.distanceKm} onChange={set('distanceKm')}
                placeholder="e.g. 130"
                className="w-full border rounded-md px-3 py-2" />
              <p className="text-xs text-gray-400 mt-1">
                Helps drivers quote — the final fare is confirmed by the driver.
              </p>
            </div>
          </>
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
          className="w-full border rounded-md px-3 py-2" />

        <button disabled={loading}
          className="w-full bg-brand-500 text-white py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60">
          {loading ? 'Requesting…' : 'Request trip'}
        </button>
      </form>
    </div>
  );
}

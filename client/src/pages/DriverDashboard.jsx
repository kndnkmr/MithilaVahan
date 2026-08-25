import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { driverAPI, tripAPI, vehicleAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { watchCoordinates } from '../services/location';
import TripCard from '../components/TripCard';

const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('requests');
  const [online, setOnline] = useState(user?.isOnline || false);

  const [available, setAvailable] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [cities, setCities] = useState([]);

  const approved = user?.driverStatus === 'approved';

  const loadAll = () => {
    tripAPI.mine().then((r) => setMyTrips(r.data.trips)).catch(() => {});
    vehicleAPI.mine().then((r) => setVehicles(r.data.vehicles)).catch(() => {});
    if (approved) tripAPI.available().then((r) => setAvailable(r.data.trips)).catch(() => {});
  };

  useEffect(() => {
    cityAPI.list().then((r) => setCities(r.data.cities)).catch(() => {});
    loadAll();

    // Real-time: new trip requests in the driver's city.
    const socket = getSocket();
    if (socket) {
      const addToAvailable = (trip) =>
        setAvailable((prev) => (prev.some((t) => t._id === trip._id) ? prev : [trip, ...prev]));

      // City-wide broadcast (fallback / keeps list fresh for everyone).
      const onNew = (trip) => addToAvailable(trip);
      // Targeted nearest-driver ping — louder toast since it's meant for you.
      const onNearby = (trip) => {
        addToAvailable(trip);
        toast('Trip request near you — accept fast!', { icon: '📍', duration: 6000 });
      };
      const onUpdate = (updated) => {
        setMyTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        // If a request was taken/cancelled, drop it from the available list.
        setAvailable((prev) => prev.filter((t) => t._id !== updated._id || updated.status === 'requested'));
      };
      socket.on('trip:new', onNew);
      socket.on('trip:nearby', onNearby);
      socket.on('trip:updated', onUpdate);
      return () => {
        socket.off('trip:new', onNew);
        socket.off('trip:nearby', onNearby);
        socket.off('trip:updated', onUpdate);
      };
    }
  }, []);

  // Stream location to the server (via driver:location) whenever it's useful:
  //  - while ONLINE, so nearest-driver dispatch has fresh coordinates
  //  - while on an ACTIVE trip (accepted/started), so the rider can watch the
  //    vehicle move on their map — even if the driver toggled offline meanwhile.
  const hasActiveTrip = myTrips.some((t) => ['accepted', 'started'].includes(t.status));
  useEffect(() => {
    if (!online && !hasActiveTrip) return;
    const socket = getSocket();
    if (!socket) return;
    const stop = watchCoordinates(([lng, lat]) => {
      socket.emit('driver:location', { lng, lat });
    });
    return stop;
  }, [online, hasActiveTrip]);

  const toggleOnline = async () => {
    try {
      const res = await driverAPI.setOnline(!online);
      setOnline(res.data.isOnline);
      updateUser({ isOnline: res.data.isOnline });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleTripAction = async (action, trip) => {
    try {
      if (action === 'accept') {
        // Prefer a matching approved vehicle if the driver has one.
        const match = vehicles.find((v) => v.type === trip.vehicleType && v.approvalStatus === 'approved');
        await tripAPI.accept(trip._id, { vehicleId: match?._id });
        setAvailable((prev) => prev.filter((t) => t._id !== trip._id));
      } else if (action === 'start') {
        await tripAPI.updateStatus(trip._id, { status: 'started' });
      } else if (action === 'complete') {
        const fare = window.prompt('Final fare (₹):', trip.estimatedFare || '');
        await tripAPI.updateStatus(trip._id, { status: 'completed', finalFare: Number(fare) || undefined });
      } else if (action === 'cancel') {
        await tripAPI.cancel(trip._id, { reason: window.prompt('Reason?') || '' });
      }
      toast.success('Done');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Driver dashboard</h1>
        <button
          onClick={toggleOnline}
          disabled={!approved}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            online ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          } disabled:opacity-50`}
        >
          {online ? '● Online' : 'Go online'}
        </button>
      </div>

      {!approved && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm mb-6">
          Your driver account is <b>{user.driverStatus}</b>. Add your vehicle and documents; an admin
          will approve you before you can accept trips.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 text-sm">
        {[
          ['requests', 'Requests'],
          ['active', 'My trips'],
          ['vehicles', 'My vehicles'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-md ${tab === key ? 'bg-brand-500 text-white' : 'bg-white border'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="space-y-3">
          {!approved ? (
            <p className="text-gray-500 text-sm">Approval pending — no requests yet.</p>
          ) : available.length === 0 ? (
            <p className="text-gray-500 text-sm">No open requests right now. Stay online.</p>
          ) : (
            available.map((t) => (
              <TripCard key={t._id} trip={t} role="driver" onAction={handleTripAction} />
            ))
          )}
        </div>
      )}

      {tab === 'active' && (
        <div className="space-y-3">
          {myTrips.length === 0 ? (
            <p className="text-gray-500 text-sm">No trips yet.</p>
          ) : (
            myTrips.map((t) => (
              <TripCard key={t._id} trip={t} role="driver" onAction={handleTripAction} />
            ))
          )}
        </div>
      )}

      {tab === 'vehicles' && (
        <VehiclesTab vehicles={vehicles} cities={cities} onChange={loadAll} defaultCity={user.city} />
      )}
    </div>
  );
}

// --- Vehicles sub-tab: list + add form ---
function VehiclesTab({ vehicles, cities, onChange, defaultCity }) {
  const [form, setForm] = useState({
    type: 'car', model: '', registrationNumber: '', capacity: 4,
    city: defaultCity || '', perKmRate: '', perDayRate: '', baseFare: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vehicleAPI.create({
        ...form,
        capacity: Number(form.capacity) || 1,
        perKmRate: Number(form.perKmRate) || 0,
        perDayRate: Number(form.perDayRate) || 0,
        baseFare: Number(form.baseFare) || 0,
      });
      toast.success('Vehicle added — pending approval');
      setForm((f) => ({ ...f, model: '', registrationNumber: '' }));
      onChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-sm">No vehicles yet. Add one below.</p>
        ) : (
          vehicles.map((v) => (
            <div key={v._id} className="bg-white border rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="font-medium capitalize">{v.type} · {v.model}</div>
                <div className="text-sm text-gray-500">{v.registrationNumber} · {v.city}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                v.approvalStatus === 'approved' ? 'bg-green-100 text-green-700'
                  : v.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {v.approvalStatus}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={addVehicle} className="bg-white border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Add a vehicle</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.type} onChange={set('type')} className="border rounded-md px-3 py-2 capitalize">
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.city} onChange={set('city')} className="border rounded-md px-3 py-2" required>
            <option value="">City</option>
            {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <input value={form.model} onChange={set('model')} placeholder="Model (e.g. Bolero)"
            className="border rounded-md px-3 py-2" required />
          <input value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="Reg. no (BR06 ...)"
            className="border rounded-md px-3 py-2" required />
          <input type="number" value={form.capacity} onChange={set('capacity')} placeholder="Capacity"
            className="border rounded-md px-3 py-2" />
          <input type="number" value={form.baseFare} onChange={set('baseFare')} placeholder="Base fare ₹"
            className="border rounded-md px-3 py-2" />
          <input type="number" value={form.perKmRate} onChange={set('perKmRate')} placeholder="Per km ₹"
            className="border rounded-md px-3 py-2" />
          <input type="number" value={form.perDayRate} onChange={set('perDayRate')} placeholder="Per day ₹"
            className="border rounded-md px-3 py-2" />
        </div>
        <button disabled={saving} className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
          {saving ? 'Adding…' : 'Add vehicle'}
        </button>
      </form>
    </div>
  );
}

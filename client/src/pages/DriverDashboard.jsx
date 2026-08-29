import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { driverAPI, tripAPI, vehicleAPI, cityAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { watchCoordinates } from '../services/location';
import TripCard from '../components/TripCard';
import OnboardingChecklist from '../components/OnboardingChecklist';

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
      } else if (action === 'confirm-payment') {
        await tripAPI.confirmPayment(trip._id);
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

      {/* Guided onboarding — shows until the driver is fully set up + approved */}
      <OnboardingChecklist user={user} vehicles={vehicles} onGoToTab={setTab} />

      {/* Tabs — horizontally scrollable so they never clip on small phones */}
      <div className="flex gap-2 mb-4 text-sm overflow-x-auto pb-1">
        {[
          ['requests', 'Requests'],
          ['active', 'My trips'],
          ['profile', 'Profile & Docs'],
          ['vehicles', 'My vehicles'],
          ['payment', 'Payment'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap shrink-0 transition ${
              tab === key ? 'bg-brand-500 text-white' : 'bg-white border text-gray-600 hover:border-brand-400'
            }`}
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

      {tab === 'profile' && <ProfileTab user={user} updateUser={updateUser} cities={cities} />}

      {tab === 'payment' && <PaymentTab user={user} updateUser={updateUser} />}
    </div>
  );
}

// --- Profile & Documents sub-tab: city, WhatsApp, and verification documents ---
function ProfileTab({ user, updateUser, cities }) {
  const [city, setCity] = useState(user.city || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  const [docs, setDocs] = useState({
    drivingLicense: user.documents?.drivingLicense || '',
    rcBook: user.documents?.rcBook || '',
    insurance: user.documents?.insurance || '',
  });
  const [uploading, setUploading] = useState('');
  const [saving, setSaving] = useState(false);

  const uploadDoc = async (key, file) => {
    if (!file) return;
    setUploading(key);
    try {
      const res = await uploadAPI.image(file);
      setDocs((d) => ({ ...d, [key]: res.data.url }));
      toast.success('Uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading('');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!city) return toast.error('Please select your city');
    setSaving(true);
    try {
      const res = await driverAPI.submitDocuments({
        city,
        whatsappNumber,
        drivingLicense: docs.drivingLicense,
        rcBook: docs.rcBook,
        insurance: docs.insurance,
      });
      // Update the cached user so the onboarding checklist ticks these off.
      updateUser({
        city,
        whatsappNumber,
        documents: res.data.documents,
      });
      toast.success('Profile & documents saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const DOC_FIELDS = [
    ['drivingLicense', 'Driving licence'],
    ['rcBook', 'RC book (vehicle registration)'],
    ['insurance', 'Insurance'],
  ];

  return (
    <form onSubmit={save} className="bg-white border rounded-lg p-4 space-y-4 max-w-md">
      <div>
        <h3 className="font-medium">Your details</h3>
        <p className="text-sm text-gray-500 mb-3">Riders and our team use these to reach and verify you.</p>
        <label className="block text-sm font-medium mb-1">City</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3" required>
          <option value="">Select your city</option>
          {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <label className="block text-sm font-medium mb-1">WhatsApp number</label>
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="10-digit WhatsApp number"
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <h3 className="font-medium">Documents</h3>
        <p className="text-sm text-gray-500 mb-3">Upload clear photos. Required before your account is approved.</p>
        <div className="space-y-3">
          {DOC_FIELDS.map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              {docs[key] ? (
                <img src={docs[key]} alt="" className="w-14 h-14 object-cover rounded-md border" />
              ) : (
                <div className="w-14 h-14 rounded-md border-2 border-dashed flex items-center justify-center text-gray-300 text-xl">📄</div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <label className="text-brand-600 text-sm cursor-pointer">
                  {uploading === key ? 'Uploading…' : docs[key] ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => uploadDoc(key, e.target.files?.[0])} disabled={uploading === key} />
                </label>
              </div>
              {docs[key] && <span className="text-green-600 text-sm">✓</span>}
            </div>
          ))}
        </div>
      </div>

      <button disabled={saving || uploading}
        className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
        {saving ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}

// --- Payment details sub-tab: driver's UPI ID + optional QR image ---
function PaymentTab({ user, updateUser }) {
  const [upiId, setUpiId] = useState(user.upiId || '');
  const [qrImage, setQrImage] = useState(user.qrImage || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const onQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.image(file);
      setQrImage(res.data.url);
      toast.success('QR uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await driverAPI.submitDocuments({ upiId, qrImage });
      updateUser({ upiId: res.data.upiId, qrImage: res.data.qrImage });
      toast.success('Payment details saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-white border rounded-lg p-4 space-y-3 max-w-md">
      <h3 className="font-medium">Your payment details</h3>
      <p className="text-sm text-gray-500">
        Riders pay you directly by UPI — the platform never holds your money and takes no cut.
      </p>
      <div>
        <label className="block text-sm font-medium mb-1">UPI ID</label>
        <input value={upiId} onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@upi" className="w-full border rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">UPI QR image (optional)</label>
        {qrImage && (
          <img src={qrImage} alt="Your UPI QR" className="w-32 h-32 object-contain border rounded-md mb-2" />
        )}
        <label className="inline-block border-2 border-dashed rounded-md px-4 py-2 text-sm text-gray-500 cursor-pointer hover:border-brand-400">
          {uploading ? 'Uploading…' : qrImage ? 'Replace QR image' : 'Upload your UPI QR'}
          <input type="file" accept="image/*" className="hidden" onChange={onQr} disabled={uploading} />
        </label>
        <p className="text-xs text-gray-400 mt-1">Riders scan this to pay you.</p>
      </div>
      <button disabled={saving || uploading}
        className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

// --- Vehicles sub-tab: list + add form ---
function VehiclesTab({ vehicles, cities, onChange, defaultCity }) {
  const [form, setForm] = useState({
    type: 'car', model: '', registrationNumber: '', capacity: 4,
    city: defaultCity || '', perKmRate: '', perDayRate: '', baseFare: '',
  });
  const [photos, setPhotos] = useState([]); // uploaded image URLs
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Upload selected image files, appending returned URLs to photos[].
  const onPhotos = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const res = await uploadAPI.image(file);
        setPhotos((prev) => [...prev, res.data.url]);
      }
      toast.success('Photo added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vehicleAPI.create({
        ...form,
        photos,
        capacity: Number(form.capacity) || 1,
        perKmRate: Number(form.perKmRate) || 0,
        perDayRate: Number(form.perDayRate) || 0,
        baseFare: Number(form.baseFare) || 0,
      });
      toast.success('Vehicle added — pending approval');
      setForm((f) => ({ ...f, model: '', registrationNumber: '' }));
      setPhotos([]);
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
              <div className="flex items-center gap-3">
                {v.photos?.[0] && (
                  <img src={v.photos[0]} alt="" className="w-12 h-12 object-cover rounded-md border" />
                )}
                <div>
                  <div className="font-medium capitalize">{v.type} · {v.model}</div>
                  <div className="text-sm text-gray-500">{v.registrationNumber} · {v.city}</div>
                </div>
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

        {/* Vehicle photos */}
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle photos</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-md border" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer text-gray-400 hover:border-brand-400">
              {uploading ? '…' : '＋'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPhotos} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Add up to 4 photos so riders can see your vehicle.</p>
        </div>

        <button disabled={saving || uploading} className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
          {saving ? 'Adding…' : 'Add vehicle'}
        </button>
      </form>
    </div>
  );
}

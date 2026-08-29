import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { driverAPI, tripAPI, vehicleAPI, cityAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { watchCoordinates } from '../services/location';
import TripCard from '../components/TripCard';
import OnboardingChecklist from '../components/OnboardingChecklist';
import { PromptModal } from '../components/Modal';

const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

// Tiny inline SVG shown if an uploaded image fails to load (so it degrades to a
// neat "image" glyph instead of a broken-image icon). Data URI = always loads.
const FALLBACK_DOC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23f3f4f6"/><text x="28" y="34" font-size="22" text-anchor="middle" fill="%239ca3af">🖼️</text></svg>'
  );

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('requests');
  const [online, setOnline] = useState(user?.isOnline || false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const contentRef = useRef(null);

  // Switch tab AND scroll the content into view — so tapping a tab or an
  // onboarding "Do this" button brings the relevant form onto the screen
  // (important on mobile, where the form otherwise appears below the fold).
  const goToTab = (key) => {
    setTab(key);
    // wait for the new tab content to render, then scroll to it
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const [available, setAvailable] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [cities, setCities] = useState([]);
  // Modal targets (null when closed)
  const [completeTrip, setCompleteTrip] = useState(null);
  const [cancelTrip, setCancelTrip] = useState(null);

  const approved = user?.driverStatus === 'approved';

  const loadAll = () => {
    tripAPI.mine().then((r) => setMyTrips(r.data.trips)).catch(() => {});
    vehicleAPI
      .mine()
      .then((r) => setVehicles(r.data.vehicles))
      .catch(() => {})
      .finally(() => setVehiclesLoaded(true));
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
    if (togglingOnline) return; // guard against rapid double-clicks
    setTogglingOnline(true);
    try {
      const res = await driverAPI.setOnline(!online);
      setOnline(res.data.isOnline);
      updateUser({ isOnline: res.data.isOnline });
      toast.success(res.data.message);
      // Going online: pull open requests right away so the driver sees them
      // without waiting for the next socket ping.
      if (res.data.isOnline) loadAll();
      else setAvailable([]); // going offline: clear the stale requests list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleTripAction = async (action, trip) => {
    // Actions needing input open a modal.
    if (action === 'complete') return setCompleteTrip(trip);
    if (action === 'cancel') return setCancelTrip(trip);
    try {
      if (action === 'accept') {
        // Prefer a matching approved vehicle if the driver has one.
        const match = vehicles.find((v) => v.type === trip.vehicleType && v.approvalStatus === 'approved');
        await tripAPI.accept(trip._id, { vehicleId: match?._id });
        setAvailable((prev) => prev.filter((t) => t._id !== trip._id));
        // Jump to "My trips" so the driver immediately sees Start/Complete for it.
        setTab('active');
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        toast.success('Trip accepted — head to the pickup point');
      } else if (action === 'start') {
        await tripAPI.updateStatus(trip._id, { status: 'started' });
        toast.success('Trip started — drive to the drop, then tap Complete');
      } else if (action === 'confirm-payment') {
        await tripAPI.confirmPayment(trip._id);
        toast.success('Payment confirmed');
      }
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const doComplete = async (values) => {
    const trip = completeTrip;
    setCompleteTrip(null);
    try {
      const finalFare = Number(values.finalFare) || undefined;
      await tripAPI.updateStatus(trip._id, { status: 'completed', finalFare });
      toast.success('Trip completed — collect the fare, then confirm payment');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const doCancel = async (values) => {
    const trip = cancelTrip;
    setCancelTrip(null);
    try {
      await tripAPI.cancel(trip._id, { reason: values.reason || '' });
      toast.success('Trip cancelled');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Driver dashboard</h1>
          {approved && (
            <p className="text-sm text-gray-500 mt-0.5">
              {online
                ? 'You are online — you can receive trip requests.'
                : 'You are offline — go online to receive trip requests.'}
            </p>
          )}
        </div>
        <button
          onClick={toggleOnline}
          disabled={!approved || togglingOnline}
          title={!approved ? 'Available once your account is approved' : online ? 'Tap to go offline' : 'Tap to go online'}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition inline-flex items-center gap-2 ${
            online
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span
            className={`w-2 h-2 rounded-full ${online ? 'bg-white' : 'bg-gray-500'}`}
            aria-hidden="true"
          />
          {togglingOnline ? 'Saving…' : online ? 'Online' : 'Go online'}
        </button>
      </div>

      {/* Guided onboarding — shows until the driver is fully set up + approved.
          Wait for the vehicle list to load first, otherwise the checklist
          briefly shows "Add a vehicle" as incomplete on the empty initial
          state and then flickers away once vehicles arrive. */}
      {vehiclesLoaded && (
        <OnboardingChecklist user={user} vehicles={vehicles} onGoToTab={goToTab} />
      )}

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
            onClick={() => goToTab(key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap shrink-0 transition ${
              tab === key ? 'bg-brand-500 text-white' : 'bg-white border text-gray-600 hover:border-brand-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={contentRef} className="scroll-mt-16">
      {tab === 'requests' && (
        <div className="space-y-3">
          {!approved ? (
            <p className="text-gray-500 text-sm">Approval pending — no requests yet.</p>
          ) : !online ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">You're offline. Go online to start receiving trip requests.</p>
              <button
                onClick={toggleOnline}
                disabled={togglingOnline}
                className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {togglingOnline ? 'Saving…' : 'Go online'}
              </button>
            </div>
          ) : available.length === 0 ? (
            <p className="text-gray-500 text-sm">No open requests right now. Stay online — new requests appear here automatically.</p>
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
        <VehiclesTab
          vehicles={vehicles}
          cities={cities}
          onChange={loadAll}
          onAdded={(v) => setVehicles((prev) => [v, ...prev])}
          defaultCity={user.city}
        />
      )}

      {tab === 'profile' && <ProfileTab user={user} updateUser={updateUser} cities={cities} />}

      {tab === 'payment' && <PaymentTab user={user} updateUser={updateUser} />}
      </div>

      {/* Modals */}
      <PromptModal
        open={!!completeTrip}
        title="Complete trip"
        description="Confirm the final fare the rider will pay. Leave as-is to use the estimate."
        fields={[{
          name: 'finalFare', label: 'Final fare (₹)', type: 'number', min: 0,
          defaultValue: completeTrip?.estimatedFare || '',
          placeholder: 'e.g. 150',
        }]}
        submitText="Complete trip"
        onCancel={() => setCompleteTrip(null)}
        onSubmit={doComplete}
      />
      <PromptModal
        open={!!cancelTrip}
        title="Cancel trip"
        description="Optionally tell the rider why."
        fields={[{ name: 'reason', label: 'Reason (optional)', type: 'textarea', placeholder: 'e.g. Vehicle issue' }]}
        submitText="Cancel trip"
        cancelText="Keep trip"
        onCancel={() => setCancelTrip(null)}
        onSubmit={doCancel}
      />
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
    ['drivingLicense', 'Driving licence', 'Your DL card (front). / आपका ड्राइविंग लाइसेंस।'],
    ['rcBook', 'RC book (vehicle registration)', 'Vehicle registration paper. / गाड़ी का RC (रजिस्ट्रेशन)।'],
    ['insurance', 'Insurance', 'Valid insurance paper. / बीमा (इंश्योरेंस) कागज़।'],
  ];

  return (
    <form onSubmit={save} className="card p-4 space-y-4 max-w-md">
      <div>
        <h3 className="font-medium">Your details</h3>
        <p className="text-sm text-gray-500 mb-3">Riders and our team use these to reach and verify you.</p>
        <label className="block text-sm font-medium mb-1">City</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="input mb-1" required>
          <option value="">Select your city</option>
          {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <p className="text-xs text-gray-400 mb-3">Where you drive. / आप कहाँ चलाते हैं।</p>
        <label className="block text-sm font-medium mb-1">WhatsApp number</label>
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="98765 43210"
          className="input"
        />
        <p className="text-xs text-gray-400 mt-1">Riders reach you here on WhatsApp. / यात्री यहाँ WhatsApp पर संपर्क करेंगे।</p>
      </div>

      <div>
        <h3 className="font-medium">Documents</h3>
        <p className="text-sm text-gray-500 mb-1">
          Take a clear photo of each paper with your phone and upload it. Required before your
          account is approved.
        </p>
        <p className="text-xs text-gray-400 mb-3">
          हर कागज़ की साफ़ फ़ोटो खींचकर अपलोड करें। अप्रूवल के लिए ज़रूरी है।
        </p>
        <div className="space-y-3">
          {DOC_FIELDS.map(([key, label, hint]) => (
            <div key={key} className="flex items-center gap-3">
              {docs[key] ? (
                <img src={docs[key]} alt="" className="w-14 h-14 object-cover rounded-md border"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DOC; }} />
              ) : (
                <div className="w-14 h-14 rounded-md border-2 border-dashed flex items-center justify-center text-gray-300 text-xl">📄</div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-gray-400">{hint}</div>
                <label className="text-brand-600 text-sm font-medium cursor-pointer">
                  {uploading === key ? 'Uploading…' : docs[key] ? 'Replace photo' : '📷 Upload photo'}
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
        className="btn-primary text-sm">
        {saving ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}

// --- Payment details sub-tab: driver's UPI number/ID + optional QR image ---
function PaymentTab({ user, updateUser }) {
  const [upiNumber, setUpiNumber] = useState(user.upiNumber || '');
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
      const res = await driverAPI.submitDocuments({ upiNumber, upiId, qrImage });
      updateUser({ upiNumber: res.data.upiNumber, upiId: res.data.upiId, qrImage: res.data.qrImage });
      toast.success('Payment details saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card p-4 space-y-3 max-w-md">
      <h3 className="font-medium">Your payment details</h3>
      <p className="text-sm text-gray-500">
        Riders pay you directly by UPI — the platform never holds your money and takes no cut.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">UPI number (mobile linked to UPI)</label>
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={upiNumber} onChange={(e) => setUpiNumber(e.target.value)}
          placeholder="98765 43210" className="input" />
        <p className="text-xs text-gray-400 mt-1">
          The mobile number where you receive UPI payments (PhonePe/GPay/Paytm).
          <span className="block">आप जिस मोबाइल नंबर पर UPI पैसे लेते हैं।</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">UPI ID (optional)</label>
        <input value={upiId} onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@okhdfcbank" className="input" />
        <p className="text-xs text-gray-400 mt-1">
          Only if you know it — otherwise the UPI number above is enough. / नहीं पता तो छोड़ दें।
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">UPI QR image (optional)</label>
        {qrImage && (
          <img src={qrImage} alt="Your UPI QR" className="w-32 h-32 object-contain border rounded-md mb-2"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DOC; }} />
        )}
        <label className="inline-block border-2 border-dashed rounded-md px-4 py-2 text-sm text-gray-500 cursor-pointer hover:border-brand-400">
          {uploading ? 'Uploading…' : qrImage ? 'Replace QR image' : 'Upload your UPI QR'}
          <input type="file" accept="image/*" className="hidden" onChange={onQr} disabled={uploading} />
        </label>
        <p className="text-xs text-gray-400 mt-1">Riders scan this to pay you.</p>
      </div>
      <button disabled={saving || uploading} className="btn-primary text-sm">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

// A single vehicle row in the driver's list. Tracks whether its photo failed
// to load so we can prompt the driver to re-upload — older photos were stored
// inline (base64) before image hosting was set up and can look broken; a fresh
// upload now goes to proper image hosting.
function VehicleRow({ v }) {
  const [photoBroken, setPhotoBroken] = useState(false);
  return (
    <div className="card p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {v.photos?.[0] && (
          <img
            src={v.photos[0]}
            alt=""
            className="w-12 h-12 object-cover rounded-md border"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_DOC;
              setPhotoBroken(true);
            }}
          />
        )}
        <div>
          <div className="font-medium capitalize">{v.type} · {v.model}</div>
          <div className="text-sm text-gray-500">{v.registrationNumber} · {v.city}</div>
          {photoBroken && (
            <div className="text-xs text-amber-600 mt-0.5">
              Photo didn’t load — edit this vehicle and re-upload it. / फोटो लोड नहीं हुई — दोबारा अपलोड करें।
            </div>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
        v.approvalStatus === 'approved' ? 'bg-green-100 text-green-700'
          : v.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {v.approvalStatus}
      </span>
    </div>
  );
}

// --- Vehicles sub-tab: list + add form ---
function VehiclesTab({ vehicles, cities, onChange, onAdded, defaultCity }) {
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
      const res = await vehicleAPI.create({
        ...form,
        photos,
        capacity: Number(form.capacity) || 1,
        perKmRate: Number(form.perKmRate) || 0,
        perDayRate: Number(form.perDayRate) || 0,
        baseFare: Number(form.baseFare) || 0,
      });
      toast.success('Vehicle added — pending approval');
      // Update the list immediately (so the onboarding checklist turns green
      // right away, without waiting for the refetch round-trip).
      if (res.data?.vehicle && onAdded) onAdded(res.data.vehicle);
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
          vehicles.map((v) => <VehicleRow key={v._id} v={v} />)
        )}
      </div>

      <form onSubmit={addVehicle} className="card p-4 space-y-3">
        <h3 className="font-medium">Add a vehicle</h3>

        {/* Plain-language intro so first-time drivers know what this is */}
        <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-sm text-brand-800">
          Add your vehicle so riders can find and book it. Fill the details below — most are on
          your vehicle papers (RC book). Not sure about a rate? Leave it and set it later.
          <span className="block text-brand-700 mt-1">
            अपनी गाड़ी जोड़ें ताकि यात्री उसे बुक कर सकें। नीचे दी गई जानकारी भरें — ज़्यादातर आपके RC बुक पर है।
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle type</label>
            <select value={form.type} onChange={set('type')} className="input capitalize">
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">What kind of vehicle is it? / गाड़ी किस प्रकार की है?</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select value={form.city} onChange={set('city')} className="input" required>
              <option value="">Select city</option>
              {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Where you drive most. / आप कहाँ चलाते हैं।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input value={form.model} onChange={set('model')} placeholder="Maruti Swift"
              className="input" required />
            <p className="text-xs text-gray-400 mt-1">The vehicle’s name/model. / गाड़ी का नाम।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration no.</label>
            <input value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="BR06 AB 1234"
              className="input" required />
            <p className="text-xs text-gray-400 mt-1">Number plate — on your RC book. / नंबर प्लेट (RC बुक पर)।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Seating capacity {(form.type === 'truck' || form.type === 'tempo') ? '/ load' : ''}
            </label>
            <input type="number" min={1} value={form.capacity} onChange={set('capacity')}
              className="input" />
            <p className="text-xs text-gray-400 mt-1">How many passengers can sit. / कितने यात्री बैठ सकते हैं।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base fare (₹)</label>
            <input type="number" min={0} value={form.baseFare} onChange={set('baseFare')}
              className="input" />
            <p className="text-xs text-gray-400 mt-1">Minimum/pickup charge. / न्यूनतम शुल्क।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Per km (₹)</label>
            <input type="number" min={0} value={form.perKmRate} onChange={set('perKmRate')}
              className="input" />
            <p className="text-xs text-gray-400 mt-1">Rate for each km. / प्रति किलोमीटर दर।</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Per day (₹)</label>
            <input type="number" min={0} value={form.perDayRate} onChange={set('perDayRate')}
              className="input" />
            <p className="text-xs text-gray-400 mt-1">Full-day hire rate. / पूरे दिन का किराया।</p>
          </div>
        </div>

        {/* Vehicle photos */}
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle photos</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-md border"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DOC; }} />
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

        <button disabled={saving || uploading} className="btn-primary text-sm">
          {saving ? 'Adding…' : 'Add vehicle'}
        </button>
      </form>
    </div>
  );
}

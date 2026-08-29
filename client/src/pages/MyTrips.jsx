import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { getCoordinates } from '../services/location';
import TripCard from '../components/TripCard';
import LiveTripMap from '../components/LiveTripMap';
import EmergencyContact from '../components/EmergencyContact';
import { ConfirmModal, PromptModal } from '../components/Modal';

// Build a wa.me link (free, no API).
function waLink(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
}

export default function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  // Latest driver location per trip: { [tripId]: [lng, lat] }
  const [driverLocations, setDriverLocations] = useState({});
  const [loading, setLoading] = useState(true);
  // Modal state — each holds the target trip (or null when closed).
  const [cancelTrip, setCancelTrip] = useState(null);
  const [rateTrip, setRateTrip] = useState(null);
  const [sosTrip, setSosTrip] = useState(null);

  const load = () => {
    tripAPI.mine()
      .then((res) => setTrips(res.data.trips))
      .catch(() => toast.error('Could not load trips'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Live updates: when a trip we're involved in changes, refresh it.
    const socket = getSocket();
    if (socket) {
      const onUpdate = (updated) => {
        setTrips((prev) => {
          const exists = prev.some((t) => t._id === updated._id);
          return exists ? prev.map((t) => (t._id === updated._id ? updated : t)) : [updated, ...prev];
        });
      };
      // Live driver location for a trip this rider is on.
      const onDriverLocation = ({ tripId, lng, lat }) => {
        setDriverLocations((prev) => ({ ...prev, [tripId]: [lng, lat] }));
      };
      socket.on('trip:updated', onUpdate);
      socket.on('trip:driver-location', onDriverLocation);
      return () => {
        socket.off('trip:updated', onUpdate);
        socket.off('trip:driver-location', onDriverLocation);
      };
    }
  }, []);

  const handleAction = async (action, trip) => {
    // Actions that need input/confirmation open a modal instead of blocking prompts.
    if (action === 'cancel') return setCancelTrip(trip);
    if (action === 'rate') return setRateTrip(trip);
    try {
      if (action === 'claim-paid') {
        await tripAPI.claimPaid(trip._id);
      } else if (action === 'confirm-payment') {
        await tripAPI.confirmPayment(trip._id);
      }
      toast.success('Done');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  // --- Modal confirm handlers ---
  const doCancel = async (values) => {
    const trip = cancelTrip;
    setCancelTrip(null);
    try {
      await tripAPI.cancel(trip._id, { reason: values.reason || '' });
      toast.success('Trip cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const doRate = async (values) => {
    const trip = rateTrip;
    const rating = Number(values.rating);
    if (!rating || rating < 1 || rating > 5) return toast.error('Enter a rating 1-5');
    setRateTrip(null);
    try {
      await tripAPI.rate(trip._id, { rating, review: values.review || '' });
      toast.success('Thanks for rating!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rate');
    }
  };

  const shareUrl = (trip) => `${window.location.origin}/t/${trip.shareToken}`;

  // Open a WhatsApp share of the live trip link (to anyone).
  const shareTrip = (trip) => {
    if (!trip.shareToken) return toast.error('Trip link not ready yet');
    const msg = `Follow my MithilaVahan trip live: ${shareUrl(trip)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // SOS: confirmed via modal, then flag the trip on the server (alerts admin)
  // and open a pre-filled WhatsApp alert to the rider's emergency contact.
  const doSos = async () => {
    const trip = sosTrip;
    setSosTrip(null);
    const coords = await getCoordinates();
    const [lng, lat] = coords || [];
    try {
      await tripAPI.sos(trip._id, coords ? { lng, lat } : {});
      toast.success('SOS raised. Alerting your contact…');
      const link = shareUrl(trip);
      const locLine = coords ? ` My location: https://maps.google.com/?q=${lat},${lng}` : '';
      const msg = `🚨 SOS — I need help. I'm on a MithilaVahan ${trip.vehicleType} trip. Track me: ${link}.${locLine}`;
      if (user.emergencyContactPhone) {
        window.open(waLink(user.emergencyContactPhone, msg), '_blank');
      } else {
        toast('Set an emergency contact below to auto-alert them next time.', { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not raise SOS');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading trips…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My trips</h1>

      {/* Rider safety: emergency contact (used by the SOS button) */}
      {user.role === 'rider' && <EmergencyContact user={user} />}

      {trips.length === 0 ? (
        <p className="text-gray-500">No trips yet.</p>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => {
            const active = ['accepted', 'started'].includes(t.status);
            const showMap = user.role === 'rider' && active;
            return (
              <div key={t._id} className="space-y-2">
                <TripCard trip={t} role={user.role} onAction={handleAction} />

                {/* Safety controls: only for the rider, only on an active trip */}
                {user.role === 'rider' && active && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareTrip(t)}
                      className="flex-1 border border-brand-500 text-brand-600 text-sm py-2 rounded-lg font-medium hover:bg-brand-50 transition"
                    >
                      🔗 Share trip
                    </button>
                    <button
                      onClick={() => setSosTrip(t)}
                      className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      🚨 SOS
                    </button>
                  </div>
                )}

                {showMap && (
                  <LiveTripMap
                    driver={driverLocations[t._id] || null}
                    pickup={
                      t.pickup?.coordinates &&
                      !(t.pickup.coordinates[0] === 0 && t.pickup.coordinates[1] === 0)
                        ? t.pickup.coordinates
                        : null
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <PromptModal
        open={!!cancelTrip}
        title="Cancel trip"
        description="Optionally tell us why you’re cancelling."
        fields={[{ name: 'reason', label: 'Reason (optional)', type: 'textarea', placeholder: 'e.g. Plan changed' }]}
        submitText="Cancel trip"
        cancelText="Keep trip"
        onCancel={() => setCancelTrip(null)}
        onSubmit={doCancel}
      />

      <PromptModal
        open={!!rateTrip}
        title="Rate your driver"
        description="How was your trip?"
        fields={[
          { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, required: true, placeholder: '5' },
          { name: 'review', label: 'Comment (optional)', type: 'textarea', placeholder: 'Anything to add?' },
        ]}
        submitText="Submit rating"
        onCancel={() => setRateTrip(null)}
        onSubmit={doRate}
      />

      <ConfirmModal
        open={!!sosTrip}
        title="Raise an SOS?"
        message="This alerts the MithilaVahan team immediately and opens a WhatsApp alert to your emergency contact. Use only if you feel unsafe."
        confirmText="Raise SOS"
        cancelText="Cancel"
        variant="danger"
        onCancel={() => setSosTrip(null)}
        onConfirm={doSos}
      />
    </div>
  );
}

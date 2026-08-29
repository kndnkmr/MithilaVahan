import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useT } from '../services/i18n';
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

// Shown during a slow load — after a few seconds, explains the free-tier wake-up.
function SlowHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <p className="text-center text-xs text-gray-400 mt-4">
      Taking a little longer than usual — starting up the server. This is quick after the first load.
    </p>
  );
}

export default function MyTrips() {
  const { user } = useAuth();
  const t = useT();
  const [trips, setTrips] = useState([]);
  // Latest driver location per trip: { [tripId]: [lng, lat] }
  const [driverLocations, setDriverLocations] = useState({});
  const [loading, setLoading] = useState(true);
  // Modal state — each holds the target trip (or null when closed).
  const [cancelTrip, setCancelTrip] = useState(null);
  const [rateTrip, setRateTrip] = useState(null);
  const [sosTrip, setSosTrip] = useState(null);
  const [sosBusy, setSosBusy] = useState(false);

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
        toast.success('Marked as paid — the driver will confirm.');
      } else if (action === 'confirm-payment') {
        await tripAPI.confirmPayment(trip._id);
        toast.success('Payment confirmed.');
      }
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
    if (sosBusy) return; // guard against double-taps on a safety action
    const trip = sosTrip;
    setSosTrip(null);
    setSosBusy(true);
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
    } finally {
      setSosBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('myTripsTitle')}</h1>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
        <SlowHint />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myTripsTitle')}</h1>

      {/* Rider safety: emergency contact (used by the SOS button) */}
      {user.role === 'rider' && <EmergencyContact user={user} />}

      {trips.length === 0 ? (
        <p className="text-gray-500">{t('noTripsYet')}</p>
      ) : (
        <div className="space-y-3">
          {trips.map((tr) => {
            const active = ['accepted', 'started'].includes(tr.status);
            const showMap = user.role === 'rider' && active;
            return (
              <div key={tr._id} className="space-y-2">
                <TripCard trip={tr} role={user.role} onAction={handleAction} />

                {/* Safety controls: only for the rider, only on an active trip */}
                {user.role === 'rider' && active && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareTrip(tr)}
                      className="flex-1 border border-brand-500 text-brand-600 text-sm py-2 rounded-lg font-medium hover:bg-brand-50 transition"
                    >
                      🔗 {t('shareTrip')}
                    </button>
                    <button
                      onClick={() => setSosTrip(tr)}
                      className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      🚨 {t('sos')}
                    </button>
                  </div>
                )}

                {showMap && (
                  <LiveTripMap
                    driver={driverLocations[tr._id] || null}
                    pickup={
                      tr.pickup?.coordinates &&
                      !(tr.pickup.coordinates[0] === 0 && tr.pickup.coordinates[1] === 0)
                        ? tr.pickup.coordinates
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
        title={t('cancelTripTitle')}
        description={t('cancelTripDesc')}
        fields={[{ name: 'reason', label: t('reasonOptional'), type: 'textarea', placeholder: 'e.g. Plan changed' }]}
        submitText={t('cancelTripTitle')}
        cancelText={t('keepTrip')}
        onCancel={() => setCancelTrip(null)}
        onSubmit={doCancel}
      />

      <PromptModal
        open={!!rateTrip}
        title={t('rateYourDriver')}
        description={t('howWasTrip')}
        fields={[
          { name: 'rating', label: t('ratingField'), type: 'number', min: 1, max: 5, required: true, placeholder: '5' },
          { name: 'review', label: t('commentOptional'), type: 'textarea', placeholder: 'Anything to add?' },
        ]}
        submitText={t('submitRating')}
        onCancel={() => setRateTrip(null)}
        onSubmit={doRate}
      />

      <ConfirmModal
        open={!!sosTrip}
        title={t('raiseSosTitle')}
        message={t('sosWarning')}
        confirmText={t('raiseSos')}
        cancelText={t('cancel')}
        variant="danger"
        onCancel={() => setSosTrip(null)}
        onConfirm={doSos}
      />
    </div>
  );
}

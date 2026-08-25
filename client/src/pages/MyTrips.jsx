import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import TripCard from '../components/TripCard';

export default function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
      socket.on('trip:updated', onUpdate);
      return () => socket.off('trip:updated', onUpdate);
    }
  }, []);

  const handleAction = async (action, trip) => {
    try {
      if (action === 'cancel') {
        const reason = window.prompt('Reason for cancelling? (optional)') || '';
        await tripAPI.cancel(trip._id, { reason });
      } else if (action === 'rate') {
        const rating = Number(window.prompt('Rate the driver 1-5:'));
        if (!rating || rating < 1 || rating > 5) return toast.error('Enter 1-5');
        const review = window.prompt('Any comment? (optional)') || '';
        await tripAPI.rate(trip._id, { rating, review });
      }
      toast.success('Done');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading trips…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My trips</h1>
      {trips.length === 0 ? (
        <p className="text-gray-500">No trips yet.</p>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => (
            <TripCard key={t._id} trip={t} role={user.role} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

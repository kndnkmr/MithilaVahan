// A gentle, dismissible prompt asking a logged-in user to enable free phone
// notifications for trip updates (driver assigned, trip started, etc.).
//
// Shows only when:
//   - the user is logged in,
//   - push is supported,
//   - permission is still 'default' (not already granted or blocked),
//   - the user hasn't dismissed it this browser.

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isPushSupported, pushPermission, subscribeToPush } from '../services/push';

const DISMISS_KEY = 'mv_push_dismissed';

export default function EnablePush() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return setShow(false);
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (!isPushSupported()) return;
    if (pushPermission() !== 'default') return; // granted or blocked → nothing to prompt
    setShow(true);
  }, [user]);

  if (!show) return null;

  const enable = async () => {
    setBusy(true);
    try {
      const res = await subscribeToPush();
      if (res.ok) {
        toast.success('Notifications on — you\u2019ll get trip updates on your phone');
        setShow(false);
      } else if (res.reason === 'denied') {
        toast('Notifications blocked. You can re-enable them in browser settings.');
        setShow(false);
      } else if (res.reason === 'not-configured' || res.reason === 'no-service-worker') {
        // Push not available in this environment (e.g. dev, or no VAPID keys) — hide quietly.
        setShow(false);
      } else {
        toast.error('Could not enable notifications');
      }
    } catch (_) {
      toast.error('Could not enable notifications');
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div className="bg-brand-50 border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-brand-800">
          🔔 Get trip updates on your phone — even when the app is closed.
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={enable}
            disabled={busy}
            className="bg-brand-500 text-white px-3 py-1 rounded-md text-xs font-medium disabled:opacity-60"
          >
            {busy ? 'Enabling…' : 'Enable'}
          </button>
          <button onClick={dismiss} className="text-gray-500 text-xs">Not now</button>
        </div>
      </div>
    </div>
  );
}

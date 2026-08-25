// Rider's emergency contact editor — the number the SOS button alerts.
// Collapsed by default; shows a gentle nudge if not yet set.

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmergencyContact({ user }) {
  const { updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.emergencyContactName || '');
  const [phone, setPhone] = useState(user.emergencyContactPhone || '');
  const [saving, setSaving] = useState(false);

  const hasContact = !!user.emergencyContactPhone;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.setEmergencyContact({ name, phone });
      updateUser({
        emergencyContactName: res.data.emergencyContactName,
        emergencyContactPhone: res.data.emergencyContactPhone,
      });
      toast.success('Emergency contact saved');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-5 bg-white border rounded-lg p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm"
      >
        <span className="font-medium">
          🛟 Emergency contact{' '}
          {hasContact ? (
            <span className="text-gray-400 font-normal">
              — {user.emergencyContactName || user.emergencyContactPhone}
            </span>
          ) : (
            <span className="text-red-500 font-normal">— not set</span>
          )}
        </span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <form onSubmit={save} className="mt-3 space-y-2">
          <p className="text-xs text-gray-500">
            The SOS button on an active trip alerts this person on WhatsApp with your live trip link.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact name (e.g. Papa, Bhaiya)"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <button
            disabled={saving}
            className="bg-brand-500 text-white text-sm px-4 py-1.5 rounded-md disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
}

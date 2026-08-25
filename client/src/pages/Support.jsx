// Support / Grievance page — a logged-in user files a complaint and sees status.

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { complaintAPI } from '../services/api';
import { getSocket } from '../services/socket';

const STATUS_STYLES = {
  open: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [complaints, setComplaints] = useState([]);

  const load = () => complaintAPI.mine().then((r) => setComplaints(r.data.complaints)).catch(() => {});

  useEffect(() => {
    load();
    const socket = getSocket();
    if (socket) {
      const onUpdate = () => load();
      socket.on('complaint:updated', onUpdate);
      return () => socket.off('complaint:updated', onUpdate);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error('Please fill both fields');
    setSaving(true);
    try {
      await complaintAPI.file({ subject, message });
      toast.success('Complaint submitted');
      setSubject('');
      setMessage('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Support & Grievance</h1>
      <p className="text-gray-600 mb-4">
        Have a problem with a trip, a driver, or the app? File a complaint and our team will
        respond. For emergencies during a trip, use the SOS button instead.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        You can also email us at{' '}
        <a href="mailto:support@mithilavahan.in" className="text-brand-600 font-medium">
          support@mithilavahan.in
        </a>
        .
      </p>

      <form onSubmit={submit} className="card p-5 space-y-3 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Driver did not arrive" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
            placeholder="Describe what happened…" className="input" />
        </div>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Submitting…' : 'Submit complaint'}
        </button>
      </form>

      <h2 className="font-semibold mb-3">Your complaints</h2>
      {complaints.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven’t filed any complaints.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c._id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.subject}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{c.message}</p>
              {c.adminResponse && (
                <div className="mt-2 bg-brand-50 border border-brand-100 rounded-md p-2 text-sm">
                  <span className="font-medium text-brand-700">Response: </span>
                  {c.adminResponse}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(c.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

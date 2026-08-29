import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, complaintAPI } from '../services/api';
import { getSocket } from '../services/socket';

export default function AdminDashboard() {
  const [tab, setTab] = useState('drivers');
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [commission, setCommission] = useState(0);
  const [savingCommission, setSavingCommission] = useState(false);
  const [fareGuide, setFareGuide] = useState([]);
  const [savingFares, setSavingFares] = useState(false);

  const loadStats = () => adminAPI.stats().then((r) => setStats(r.data)).catch(() => {});
  const loadDrivers = () => adminAPI.drivers().then((r) => setDrivers(r.data.drivers)).catch(() => {});
  const loadVehicles = () => adminAPI.vehicles().then((r) => setVehicles(r.data.vehicles)).catch(() => {});
  const loadComplaints = () => complaintAPI.all().then((r) => setComplaints(r.data.complaints)).catch(() => {});
  const loadSettings = () =>
    adminAPI.getSettings().then((r) => {
      setCommission(r.data.settings.commissionPercent);
      setFareGuide(r.data.settings.fareGuide || []);
    }).catch(() => {});

  useEffect(() => {
    loadStats();
    loadDrivers();
    loadVehicles();
    loadComplaints();
    loadSettings();

    // Live SOS alerts — a raised SOS is the one thing an admin must not miss.
    const socket = getSocket();
    if (socket) {
      const onSos = ({ riderName, city }) => {
        toast.error(`🚨 SOS: ${riderName} in ${city}. Contact them immediately.`, { duration: 15000 });
      };
      socket.on('trip:sos', onSos);
      return () => socket.off('trip:sos', onSos);
    }
  }, []);

  const saveCommission = async () => {
    setSavingCommission(true);
    try {
      const res = await adminAPI.updateSettings(Number(commission));
      setCommission(res.data.settings.commissionPercent);
      toast.success('Commission updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSavingCommission(false);
    }
  };

  const updateFareRow = (i, field, value) => {
    setFareGuide((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const saveFares = async () => {
    setSavingFares(true);
    try {
      const cleaned = fareGuide.map((r) => ({
        label: r.label,
        vehicleType: r.vehicleType,
        baseFare: Number(r.baseFare) || 0,
        perKm: Number(r.perKm) || 0,
        perDay: Number(r.perDay) || 0,
      }));
      const res = await adminAPI.updateSettings({ fareGuide: cleaned });
      setFareGuide(res.data.settings.fareGuide || []);
      toast.success('Fare guide updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSavingFares(false);
    }
  };

  const respondComplaint = async (id) => {
    const adminResponse = window.prompt('Your response to the user:');
    if (adminResponse == null) return;
    try {
      await complaintAPI.update(id, { adminResponse, status: 'resolved' });
      toast.success('Response sent');
      loadComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const setComplaintStatus = async (id, status) => {
    try {
      await complaintAPI.update(id, { status });
      toast.success(`Marked ${status}`);
      loadComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const setDriverStatus = async (id, status) => {
    try {
      await adminAPI.setDriverStatus(id, status);
      toast.success(`Driver ${status}`);
      loadDrivers();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const setVehicleStatus = async (id, status) => {
    try {
      await adminAPI.setVehicleStatus(id, status);
      toast.success(`Vehicle ${status}`);
      loadVehicles();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      status === 'approved' ? 'bg-green-100 text-green-700'
        : status === 'rejected' ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}>{status}</span>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin panel</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            ['Riders', stats.riders],
            ['Drivers', stats.drivers],
            ['Pending drivers', stats.pendingDrivers],
            ['Vehicles', stats.vehicles],
            ['Pending vehicles', stats.pendingVehicles],
            ['Trips', stats.trips],
          ].map(([label, val]) => (
            <div key={label} className="card p-3 text-center">
              <div className="text-xl font-bold text-brand-600">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs — scrollable on small screens */}
      <div className="flex gap-2 mb-4 text-sm overflow-x-auto pb-1">
        {[['drivers', 'Drivers'], ['vehicles', 'Vehicles'], ['complaints', 'Complaints'], ['settings', 'Settings']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap shrink-0 transition ${
              tab === key ? 'bg-brand-500 text-white' : 'bg-white border text-gray-600 hover:border-brand-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <div className="space-y-2">
          {drivers.map((d) => (
            <div key={d._id} className="card p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{d.name} <span className="text-gray-400 text-sm">· {d.city || 'no city'}</span></div>
                <div className="text-sm text-gray-500">{d.phone}</div>
                {/* Setup completeness (from the shared server rule) */}
                {d.setup && (
                  d.setup.complete ? (
                    <div className="text-xs text-green-600 mt-0.5">✓ Setup complete</div>
                  ) : (
                    <div className="text-xs text-amber-600 mt-0.5">
                      Needs: {d.setup.missing.join(', ')}
                    </div>
                  )
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={d.driverStatus} />
                {d.driverStatus !== 'approved' && (
                  <button onClick={() => setDriverStatus(d._id, 'approved')}
                    className="bg-green-600 text-white text-xs px-2 py-1 rounded">Approve</button>
                )}
                {d.driverStatus !== 'rejected' && (
                  <button onClick={() => setDriverStatus(d._id, 'rejected')}
                    className="border text-red-600 text-xs px-2 py-1 rounded">Reject</button>
                )}
              </div>
            </div>
          ))}
          {drivers.length === 0 && <p className="text-gray-500 text-sm">No drivers yet.</p>}
        </div>
      )}

      {tab === 'vehicles' && (
        <div className="space-y-2">
          {vehicles.map((v) => (
            <div key={v._id} className="card p-3 flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">{v.type} · {v.model}</div>
                <div className="text-sm text-gray-500">
                  {v.registrationNumber} · {v.city} · owner: {v.owner?.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={v.approvalStatus} />
                {v.approvalStatus !== 'approved' && (
                  <button onClick={() => setVehicleStatus(v._id, 'approved')}
                    className="bg-green-600 text-white text-xs px-2 py-1 rounded">Approve</button>
                )}
                {v.approvalStatus !== 'rejected' && (
                  <button onClick={() => setVehicleStatus(v._id, 'rejected')}
                    className="border text-red-600 text-xs px-2 py-1 rounded">Reject</button>
                )}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-gray-500 text-sm">No vehicles yet.</p>}
        </div>
      )}

      {tab === 'complaints' && (
        <div className="space-y-2">
          {complaints.length === 0 && <p className="text-gray-500 text-sm">No complaints yet.</p>}
          {complaints.map((c) => (
            <div key={c._id} className="card p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.subject}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.status === 'resolved' ? 'bg-green-100 text-green-700'
                    : c.status === 'in-progress' ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>{c.status}</span>
              </div>
              <div className="text-sm text-gray-500">
                {c.user?.name} ({c.role}) · {c.user?.phone}
              </div>
              <p className="text-sm text-gray-700 mt-1">{c.message}</p>
              {c.adminResponse && (
                <div className="mt-2 bg-brand-50 border border-brand-100 rounded-md p-2 text-sm">
                  <span className="font-medium text-brand-700">Your response: </span>{c.adminResponse}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => respondComplaint(c._id)}
                  className="bg-brand-500 text-white text-xs px-3 py-1 rounded">Respond & resolve</button>
                {c.status !== 'in-progress' && (
                  <button onClick={() => setComplaintStatus(c._id, 'in-progress')}
                    className="border text-xs px-3 py-1 rounded">Mark in-progress</button>
                )}
                {c.status !== 'resolved' && (
                  <button onClick={() => setComplaintStatus(c._id, 'resolved')}
                    className="border text-xs px-3 py-1 rounded">Mark resolved</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-6">
          {/* Commission */}
          <div className="card p-4 max-w-md space-y-3">
            <h3 className="font-medium">Platform commission</h3>
            <p className="text-sm text-gray-500">
              Percentage the platform charges per completed trip. Keep it at <b>0</b> to stay
              fully free (riders pay drivers directly by UPI/cash). Raising it starts recording a
              platform fee on new trips — historical trips keep the rate that applied when they
              completed.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number" min={0} max={100}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-24 border rounded-md px-3 py-2"
              />
              <span className="text-gray-600">%</span>
              <button onClick={saveCommission} disabled={savingCommission} className="btn-primary text-sm">
                {savingCommission ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Indicative fare guide */}
          <div className="card p-4">
            <h3 className="font-medium">Indicative fare guide</h3>
            <p className="text-sm text-gray-500 mb-3">
              Shown to riders on the home page and used for instant fare estimates. Each owner
              still sets their own rate; these are guidance figures.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th className="text-left py-1 pr-2">Label</th>
                    <th className="text-left py-1 pr-2">Type</th>
                    <th className="text-left py-1 pr-2">Base ₹</th>
                    <th className="text-left py-1 pr-2">Per km ₹</th>
                    <th className="text-left py-1 pr-2">Per day ₹</th>
                  </tr>
                </thead>
                <tbody>
                  {fareGuide.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 pr-2">
                        <input value={r.label} onChange={(e) => updateFareRow(i, 'label', e.target.value)}
                          className="border rounded px-2 py-1 w-28" />
                      </td>
                      <td className="py-1 pr-2">
                        <select value={r.vehicleType} onChange={(e) => updateFareRow(i, 'vehicleType', e.target.value)}
                          className="border rounded px-2 py-1">
                          {['car', 'auto', 'tempo', 'bus', 'truck', 'bike'].map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <input type="number" value={r.baseFare} onChange={(e) => updateFareRow(i, 'baseFare', e.target.value)}
                          className="border rounded px-2 py-1 w-20" />
                      </td>
                      <td className="py-1 pr-2">
                        <input type="number" value={r.perKm} onChange={(e) => updateFareRow(i, 'perKm', e.target.value)}
                          className="border rounded px-2 py-1 w-20" />
                      </td>
                      <td className="py-1 pr-2">
                        <input type="number" value={r.perDay} onChange={(e) => updateFareRow(i, 'perDay', e.target.value)}
                          className="border rounded px-2 py-1 w-24" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={saveFares} disabled={savingFares} className="btn-primary text-sm mt-3">
              {savingFares ? 'Saving…' : 'Save fares'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

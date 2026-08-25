import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('drivers');
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const loadStats = () => adminAPI.stats().then((r) => setStats(r.data)).catch(() => {});
  const loadDrivers = () => adminAPI.drivers().then((r) => setDrivers(r.data.drivers)).catch(() => {});
  const loadVehicles = () => adminAPI.vehicles().then((r) => setVehicles(r.data.vehicles)).catch(() => {});

  useEffect(() => {
    loadStats();
    loadDrivers();
    loadVehicles();
  }, []);

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
            <div key={label} className="bg-white border rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-brand-600">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 text-sm">
        {[['drivers', 'Drivers'], ['vehicles', 'Vehicles']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-md ${tab === key ? 'bg-brand-500 text-white' : 'bg-white border'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <div className="space-y-2">
          {drivers.map((d) => (
            <div key={d._id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{d.name} <span className="text-gray-400 text-sm">· {d.city || 'no city'}</span></div>
                <div className="text-sm text-gray-500">{d.phone}</div>
              </div>
              <div className="flex items-center gap-2">
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
            <div key={v._id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
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
    </div>
  );
}

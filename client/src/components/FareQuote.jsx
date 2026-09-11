// Standalone "Estimate my fare" widget — no login needed. Uses the public
// estimate API. Visitors pick a vehicle + trip type + distance (or a quick
// route preset) and see an instant range, then can jump to booking.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { useLang } from '../services/i18n';

const VEHICLE_TYPES = ['car', 'auto', 'tempo', 'bus', 'truck', 'bike'];

// A few popular Darbhanga routes with approx one-way km, for quick presets.
const PRESETS = [
  ['Patna', 140],
  ['Madhubani', 40],
  ['Muzaffarpur', 65],
  ['Janakpur', 60],
];

export default function FareQuote() {
  const navigate = useNavigate();
  const lang = useLang();
  const [vehicleType, setVehicleType] = useState('car');
  const [tripType, setTripType] = useState('one-way');
  const [distanceKm, setDistanceKm] = useState('');
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const km = Number(distanceKm);
    if (!km || km <= 0) { setEstimate(null); return; }
    let active = true;
    tripAPI
      .estimate({ mode: 'outstation', vehicleType, distanceKm: km, tripType })
      .then((r) => active && setEstimate(r.data.estimate))
      .catch(() => active && setEstimate(null));
    return () => { active = false; };
  }, [vehicleType, tripType, distanceKm]);

  const label = lang === 'hi'
    ? { title: 'किराया अनुमान लगाएँ', vehicle: 'वाहन', dist: 'दूरी (किमी, एक तरफ़)', oneway: 'वन-वे', round: 'राउंड-ट्रिप', book: 'बुक करें', hint: 'त्वरित रूट:' }
    : { title: 'Estimate your fare', vehicle: 'Vehicle', dist: 'Distance (km, one-way)', oneway: 'One-way', round: 'Round-trip', book: 'Book now', hint: 'Quick routes:' };

  return (
    <div className="card p-5 max-w-md mx-auto">
      <h3 className="font-semibold text-lg mb-3">💰 {label.title}</h3>

      {/* Quick route presets */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-gray-400 self-center">{label.hint}</span>
        {PRESETS.map(([name, km]) => (
          <button
            key={name}
            type="button"
            onClick={() => setDistanceKm(String(km))}
            className="text-xs border rounded-full px-2.5 py-1 text-gray-600 hover:border-brand-400"
          >
            {name} ({km}km)
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">{label.vehicle}</label>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input capitalize">
            {VEHICLE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">{label.dist}</label>
          <input type="number" min={1} value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="e.g. 140" className="input" />
        </div>
      </div>

      <div className="flex rounded-md border overflow-hidden mt-3">
        {[['one-way', label.oneway], ['round-trip', label.round]].map(([val, lbl]) => (
          <button key={val} type="button" onClick={() => setTripType(val)}
            className={`flex-1 py-2 text-sm ${tripType === val ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {estimate && estimate.high > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center mt-3">
          <div className="text-2xl font-bold text-green-700">
            ₹{estimate.low.toLocaleString('en-IN')} – ₹{estimate.high.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {lang === 'hi' ? 'अनुमानित — ड्राइवर अंतिम किराया तय करता है' : 'Indicative — the driver confirms the final fare'}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/book?mode=outstation')}
        className="btn-primary w-full mt-3"
      >
        {label.book} →
      </button>
    </div>
  );
}

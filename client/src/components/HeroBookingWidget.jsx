// Hero booking widget — a compact, tabbed "pick your trip" card for the top of
// the home page (Savaari-style, but original). Trip-type tabs across the top,
// then just the essential fields for that mode, and a Search button that opens
// the full booking form prefilled. Bilingual.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../services/i18n';

const AIRPORTS = ['Darbhanga Airport (DBR)', 'Patna Airport (PAT)', 'Gaya Airport (GAY)'];

export default function HeroBookingWidget() {
  const navigate = useNavigate();
  const lang = useLang();
  const [mode, setMode] = useState('trip');

  // Per-mode field state (kept simple — the full form collects the rest).
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('one-way');
  const [airportName, setAirportName] = useState(AIRPORTS[0]);
  const [airportDir, setAirportDir] = useState('drop');

  const L = (en, hi) => (lang === 'hi' ? hi : en);

  const TABS = [
    ['trip', L('Local', 'लोकल'), '🏙️'],
    ['outstation', L('Outstation', 'आउटस्टेशन'), '🛣️'],
    ['airport', L('Airport', 'एयरपोर्ट'), '✈️'],
    ['hire', L('Rental', 'किराया'), '📅'],
  ];

  const search = () => {
    const p = new URLSearchParams({ mode });
    if (mode === 'outstation' && destination) { p.set('to', destination); p.set('tripType', tripType); }
    if (mode === 'airport') { p.set('airportDir', airportDir); p.set('airportName', airportName); }
    // remaining details (pickup, exact location) are entered on the full form.
    navigate(`/book?${p.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl text-left max-w-2xl mx-auto mt-8 overflow-hidden">
      {/* Tabs — icon over label so long words (Outstation/आउटस्टेशन) never clip
          on narrow phones; inline on larger screens. */}
      <div className="flex border-b">
        {TABS.map(([val, label, icon]) => (
          <button
            key={val}
            type="button"
            onClick={() => setMode(val)}
            className={`flex-1 py-2.5 px-1 font-medium transition flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-sm ${
              mode === val
                ? 'text-brand-700 border-b-2 border-brand-500 bg-brand-50'
                : 'text-gray-500 hover:text-brand-600'
            }`}
          >
            <span>{icon}</span>
            <span className="leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="p-4 sm:p-5 space-y-3">
        {mode === 'trip' && (
          <p className="text-sm text-gray-500">{L('Quick point-to-point ride within your city.', 'शहर के भीतर तेज़ पॉइंट-टू-पॉइंट सवारी।')}</p>
        )}

        {mode === 'outstation' && (
          <>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={L('Where to? e.g. Patna, Kathmandu', 'कहाँ जाना है? जैसे पटना, काठमांडू')}
              className="input"
            />
            <div className="flex rounded-md border overflow-hidden">
              {[['one-way', L('One-way', 'वन-वे')], ['round-trip', L('Round-trip', 'राउंड-ट्रिप')]].map(([v, lbl]) => (
                <button key={v} type="button" onClick={() => setTripType(v)}
                  className={`flex-1 py-2 text-sm ${tripType === v ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'airport' && (
          <>
            <div className="flex rounded-md border overflow-hidden">
              {[['drop', L('To airport', 'एयरपोर्ट तक')], ['pickup', L('From airport', 'एयरपोर्ट से')]].map(([v, lbl]) => (
                <button key={v} type="button" onClick={() => setAirportDir(v)}
                  className={`flex-1 py-2 text-sm ${airportDir === v ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'}`}>
                  {lbl}
                </button>
              ))}
            </div>
            <select value={airportName} onChange={(e) => setAirportName(e.target.value)} className="input">
              {AIRPORTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </>
        )}

        {mode === 'hire' && (
          <p className="text-sm text-gray-500">{L('Keep a vehicle & driver by the hour or day — sightseeing, errands, events.', 'घंटे या दिन के हिसाब से वाहन व ड्राइवर — घूमना, काम, आयोजन।')}</p>
        )}

        <button onClick={search} className="btn-primary w-full text-base py-3">
          🔍 {L('Search & book', 'खोजें व बुक करें')}
        </button>
        <p className="text-xs text-gray-400 text-center">
          {L('You’ll see an instant fare estimate before you confirm.', 'पुष्टि से पहले तुरंत किराया अनुमान दिखेगा।')}
        </p>
      </div>
    </div>
  );
}

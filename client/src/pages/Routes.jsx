// Popular routes hub — a scannable index of Darbhanga → X routes with distance,
// time and an indicative one-way fare, grouped by category. This is the SEO/
// discovery counterpart to the tourism-focused Destinations page.

import { Link, useNavigate } from 'react-router-dom';
import { DESTINATIONS, CATEGORIES } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import FareQuote from '../components/FareQuote';

// Indicative one-way sedan fare (base ₹50 + ₹11/km, matching the /fares page),
// rounded — a realistic "from" price.
function fromFare(km) {
  const f = Math.round((50 + 11 * km) / 50) * 50;
  return `₹${f.toLocaleString('en-IN')}`;
}

// Airport transfers to/from Darbhanga Airport (DBR) — the cities & towns people
// most often fly in/out for. Approx one-way road distance to DBR.
const AIRPORT_ROUTES = [
  ['Darbhanga city', 8],
  ['Madhubani', 40],
  ['Samastipur', 55],
  ['Muzaffarpur', 70],
  ['Sitamarhi', 90],
  ['Saharsa', 95],
  ['Janakpur (Nepal)', 65],
  ['Begusarai', 110],
];

export default function RoutesHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const book = (name) => {
    const path = `/book?mode=outstation&to=${encodeURIComponent(name)}`;
    navigate(user?.role === 'rider' ? path : '/register');
  };

  // Airport transfer booking (to Darbhanga Airport by default).
  const bookAirport = () => {
    const path = '/book?mode=airport&airportDir=drop&airportName=' + encodeURIComponent('Darbhanga Airport (DBR)');
    navigate(user?.role === 'rider' ? path : '/register');
  };

  return (
    <div>
      <SEO
        path="/routes"
        title="Popular Taxi Routes & Airport Transfers from Darbhanga"
        description="One-way and round-trip taxi fares from Darbhanga to Patna, Bodh Gaya, Kathmandu, Janakpur and more, plus Darbhanga Airport (DBR) transfers to/from Muzaffarpur, Madhubani, Sitamarhi and nearby towns."
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Popular routes from Darbhanga</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            Fixed local drivers, transparent fares and live tracking — one-way or round-trip,
            to towns across Bihar, Jharkhand and Nepal.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Instant fare quote */}
        <FareQuote />

        {/* Airport transfers — Darbhanga Airport (DBR) to/from cities & towns */}
        <section>
          <h2 className="text-xl font-bold mb-1">✈️ Darbhanga Airport (DBR) transfers</h2>
          <p className="text-gray-500 text-sm mb-3">
            Reliable pickup & drop between Darbhanga Airport and nearby cities and towns — both ways.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Route (both ways)</th>
                  <th className="text-left px-4 py-3">Distance</th>
                  <th className="text-left px-4 py-3">From (one-way)</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {AIRPORT_ROUTES.map(([place, km]) => (
                  <tr key={place} className="border-t hover:bg-brand-50/40">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ✈️ {place} ⇄ Darbhanga Airport
                    </td>
                    <td className="px-4 py-3 text-gray-600">{km} km</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{fromFare(km)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={bookAirport}
                        className="bg-brand-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-brand-600">
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {CATEGORIES.map((cat) => {
          const routes = DESTINATIONS.filter((d) => d.category === cat);
          if (routes.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="text-xl font-bold mb-3">{cat}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">Route</th>
                      <th className="text-left px-4 py-3">Distance</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Time</th>
                      <th className="text-left px-4 py-3">From (one-way)</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((d) => (
                      <tr key={d.slug} className="border-t hover:bg-brand-50/40">
                        <td className="px-4 py-3">
                          <Link to={`/destinations/${d.slug}`} className="font-medium text-brand-700 hover:underline">
                            {d.emoji} Darbhanga → {d.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.km} km</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{d.time}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{fromFare(d.km)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => book(d.name)}
                            className="bg-brand-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-brand-600">
                            Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        <p className="text-xs text-gray-400">
          Fares are indicative and include a driver — each owner sets their own rate and the
          driver confirms the final fare. Round-trip is roughly double the one-way distance.
          Tolls, parking and border fees (for Nepal) are extra where applicable.
        </p>
      </div>
    </div>
  );
}

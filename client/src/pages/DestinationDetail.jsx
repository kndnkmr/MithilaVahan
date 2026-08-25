// Per-destination SEO page: /destinations/:slug
// Local content + fare guide + book button + FAQ, targeting searches like
// "Darbhanga to Patna taxi".

import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDestination, DESTINATIONS } from '../data/destinations';
import { useSeo } from '../services/seo';

// Indicative per-km by class (mirrors the server's guide) for the fare table.
const CLASSES = [
  ['Hatchback', 9],
  ['Sedan', 10],
  ['SUV', 13],
];

export default function DestinationDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dest = getDestination(slug);

  useSeo(
    dest ? `Darbhanga to ${dest.name} Taxi & Cab | MithilaVahan` : 'Destination | MithilaVahan',
    dest
      ? `Book a Darbhanga to ${dest.name} taxi with a driver — approx ${dest.km} km, ${dest.time}. One-way or round-trip. Live tracking, no commission.`
      : undefined
  );

  if (!dest) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">
        Destination not found. <Link to="/destinations" className="text-brand-600">See all destinations</Link>
      </div>
    );
  }

  const book = () => {
    const path = `/book?mode=outstation&to=${encodeURIComponent(dest.name)}`;
    navigate(user?.role === 'rider' ? path : '/register');
  };

  // Approx fares at this distance for each class (one-way).
  const fareRows = CLASSES.map(([cls, perKm]) => {
    const one = Math.round((50 + perKm * dest.km) / 10) * 10;
    return [cls, `₹${one.toLocaleString('en-IN')}`, `₹${(one * 2).toLocaleString('en-IN')}`];
  });

  const faqs = [
    [`How far is Darbhanga to ${dest.name}?`, `It is approximately ${dest.km} km by road and takes around ${dest.time} one-way, depending on traffic and route.`],
    ['One-way or round-trip?', `Both. Choose one-way for a drop, or round-trip if you want the driver to wait and bring you back.`],
    ['How do I pay?', 'You pay the driver directly by cash or UPI — MithilaVahan takes no commission.'],
    ['Can I track the cab?', 'Yes, you can watch your driver live on a map and share your trip link with family.'],
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link to="/destinations" className="text-brand-100 text-sm">← All destinations</Link>
          <h1 className="text-3xl font-bold mt-2">Darbhanga to {dest.name} taxi</h1>
          <p className="text-brand-50 mt-2">Approx {dest.km} km · {dest.time} · with a driver</p>
          <button onClick={book} className="mt-5 bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg">
            Book this trip
          </button>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-2">About the trip</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{dest.long}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Indicative fares (approx)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Vehicle</th>
                  <th className="text-left px-4 py-3">One-way</th>
                  <th className="text-left px-4 py-3">Round-trip</th>
                </tr>
              </thead>
              <tbody>
                {fareRows.map(([cls, one, round]) => (
                  <tr key={cls} className="border-t">
                    <td className="px-4 py-3 font-medium">{cls}</td>
                    <td className="px-4 py-3">{one}</td>
                    <td className="px-4 py-3">{round}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Indicative only — includes driver. Each owner sets their own rate; the driver confirms the final fare.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">FAQ</h2>
          <div className="space-y-3">
            {faqs.map(([q, a], i) => (
              <div key={i}>
                <div className="font-medium">{q}</div>
                <p className="text-gray-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <button onClick={book} className="bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold">
            Book Darbhanga → {dest.name}
          </button>
        </section>

        {/* Internal links to other destinations (SEO + discovery) */}
        <section>
          <h2 className="text-lg font-bold mb-3">Other popular trips</h2>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.filter((d) => d.slug !== dest.slug).slice(0, 8).map((d) => (
              <Link key={d.slug} to={`/destinations/${d.slug}`}
                className="border rounded-full px-3 py-1 text-sm text-gray-600 hover:border-brand-400">
                Darbhanga → {d.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

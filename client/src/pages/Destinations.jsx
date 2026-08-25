// "Places to Explore" — popular destinations from Darbhanga/Muzaffarpur.
// Each card prefills an outstation booking. Public page (also good for SEO).

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DESTINATIONS, CATEGORIES } from '../data/destinations';

export default function Destinations() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const book = (name) => {
    const path = `/book?mode=outstation&to=${encodeURIComponent(name)}`;
    if (user?.role === 'rider') navigate(path);
    else navigate('/register');
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Places to explore</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            Book an outstation trip from Darbhanga or Muzaffarpur — with a driver, one-way or
            round-trip. From nearby towns to pilgrimage sites, big cities and Nepal.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {CATEGORIES.map((cat) => {
          const items = DESTINATIONS.filter((d) => d.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-xl font-bold mb-4">{cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((d) => (
                  <div key={d.name} className="bg-white border rounded-xl p-5 flex flex-col">
                    <div className="text-3xl mb-2">{d.emoji}</div>
                    <div className="font-semibold text-lg">Darbhanga → {d.name}</div>
                    <div className="text-gray-400 text-sm mb-2">{d.km} km · {d.time}</div>
                    <p className="text-gray-600 text-sm flex-1">{d.desc}</p>
                    <button
                      onClick={() => book(d.name)}
                      className="mt-4 bg-brand-500 text-white text-sm py-2 rounded-md hover:bg-brand-600 transition"
                    >
                      Book this trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-gray-400 text-center">
          Distances and times are approximate (by road, from Darbhanga) and shown as a guide.
          The driver confirms the route and final fare.
        </p>
      </div>
    </div>
  );
}

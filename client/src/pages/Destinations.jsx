// "Places to Explore" — popular destinations from Darbhanga/Muzaffarpur.
// Each card prefills an outstation booking. Public page (also good for SEO).

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DESTINATIONS, CATEGORIES, HERO_IMG } from '../data/destinations';
import SEO from '../components/SEO';

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
      <SEO
        path="/destinations"
        title="Places to Explore from Darbhanga & Muzaffarpur"
        description="Book outstation taxis from Darbhanga & Muzaffarpur to Patna, Bodh Gaya, Kathmandu, Janakpur and more — with a driver, one-way or round-trip."
      />
      {/* Header */}
      <section
        className="relative text-white bg-brand-700 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/85 to-black/60" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
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
                  <div key={d.slug} className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition">
                    {/* Photo (falls back to an emoji tile if it fails to load) */}
                    <Link to={`/destinations/${d.slug}`} className="block relative h-40 bg-brand-100">
                      {d.img && (
                        <img
                          src={d.img}
                          alt={d.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <span className="absolute top-2 left-2 text-2xl bg-white/80 rounded-lg w-9 h-9 flex items-center justify-center">
                        {d.emoji}
                      </span>
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <Link to={`/destinations/${d.slug}`} className="font-semibold text-lg hover:text-brand-600">
                        Darbhanga → {d.name}
                      </Link>
                      <div className="text-gray-400 text-sm mb-2">{d.km} km · {d.time}</div>
                      <p className="text-gray-600 text-sm flex-1">{d.desc}</p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => book(d.name)}
                          className="flex-1 bg-brand-500 text-white text-sm py-2 rounded-md hover:bg-brand-600 transition"
                        >
                          Book this trip
                        </button>
                        <Link
                          to={`/destinations/${d.slug}`}
                          className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:border-brand-400"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
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

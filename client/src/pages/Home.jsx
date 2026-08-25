import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useT } from '../services/i18n';

const VEHICLE_TYPES = [
  { key: 'car', label: 'Car', hi: 'कार', emoji: '🚗' },
  { key: 'auto', label: 'Auto', hi: 'ऑटो', emoji: '🛺' },
  { key: 'tempo', label: 'Tempo', hi: 'टेम्पो', emoji: '🚐' },
  { key: 'bus', label: 'Bus', hi: 'बस', emoji: '🚌' },
  { key: 'truck', label: 'Truck', hi: 'ट्रक', emoji: '🚚' },
  { key: 'bike', label: 'Bike', hi: 'बाइक', emoji: '🏍️' },
];

// Indicative price guide (per-km for outstation, per-day for full-day hire).
// These are typical local rates shown for guidance — the driver confirms the
// final fare, and each owner sets their own rates on their listing.
const PRICE_GUIDE = [
  ['Hatchback', 'WagonR, Alto or similar', '₹9/km', '₹2,400'],
  ['Sedan', 'Dzire, Etios or similar', '₹10/km', '₹2,600'],
  ['SUV', 'Ertiga, Bolero, Innova', '₹13/km', '₹3,000'],
  ['Tempo / Van', 'Pickup, mini goods', '₹18/km', '₹3,500'],
];

// Popular outstation routes from Darbhanga (tappable → prefills booking).
const POPULAR_ROUTES = [
  ['Patna', '140 km', '~3.5 hrs'],
  ['Madhubani', '40 km', '~1 hr'],
  ['Saharsa', '90 km', '~2.5 hrs'],
  ['Muzaffarpur', '65 km', '~1.5 hrs'],
  ['Sitamarhi', '90 km', '~2.5 hrs'],
  ['Samastipur', '55 km', '~1.5 hrs'],
];

const FAQS = [
  ['How do I pay?', 'You pay the driver directly by cash or UPI after the trip — MithilaVahan takes no commission and never holds your money.'],
  ['Can I track my ride?', 'Yes. Once a driver accepts, you see them live on a map and can share your trip link with family for safety.'],
  ['Do you do outstation trips?', 'Yes — one-way or round-trip to Patna, Madhubani, Kathmandu and beyond, with a driver.'],
  ['Are drivers verified?', 'Every driver and vehicle is reviewed and approved by our team before they can accept trips.'],
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [openFaq, setOpenFaq] = useState(null);

  const go = (path) => {
    if (user?.role === 'rider') navigate(path);
    else if (!user) navigate('/register');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-white/15 rounded-full px-4 py-1 text-sm mb-4">
            🚕 Now serving Darbhanga & Muzaffarpur
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-brand-50 text-lg max-w-2xl mx-auto mb-8">
            {t('heroSub')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {user?.role === 'rider' && (
              <Link to="/book" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg shadow hover:shadow-lg transition">
                {t('bookRide')}
              </Link>
            )}
            {!user && (
              <>
                <Link to="/register" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg shadow hover:shadow-lg transition">
                  {t('getStarted')}
                </Link>
                <Link to="/login" className="border border-white/70 px-8 py-3 rounded-lg hover:bg-white/10 transition">
                  {t('login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Vehicle types — tappable */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-1 text-center">{t('whatNeed')}</h2>
        <p className="text-gray-500 text-center mb-8">{t('tapVehicle')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {VEHICLE_TYPES.map((v) => (
            <button
              key={v.key}
              onClick={() => go(`/book?type=${v.key}`)}
              className="bg-white border rounded-xl p-5 text-center hover:shadow-lg hover:border-brand-400 hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-2">{v.emoji}</div>
              <div className="font-semibold">{v.label}</div>
              <div className="text-gray-400 text-sm">{v.hi}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Booking modes */}
      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-6">
          {[
            ['🏙️', 'In-city rides', 'Quick point-to-point trips within your city.', '/book?mode=trip'],
            ['📅', 'Full-day hire', 'Book a vehicle with driver by the day.', '/book?mode=hire'],
            ['🛣️', 'Outstation trips', 'Long trips to Patna, Kathmandu & beyond — one-way or round-trip.', '/book?mode=outstation'],
          ].map(([icon, title, desc, path]) => (
            <button key={title} onClick={() => go(path)} className="text-center rounded-xl p-4 hover:bg-brand-50 transition">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-semibold text-lg mb-1">{title}</div>
              <p className="text-gray-600 text-sm">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Indicative price guide */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-1 text-center">Indicative fares in Darbhanga</h2>
        <p className="text-gray-500 text-center mb-8">
          Typical local rates — each owner sets their own, and the driver confirms the final fare.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Vehicle</th>
                <th className="text-left px-4 py-3">Example models</th>
                <th className="text-left px-4 py-3">Outstation /km</th>
                <th className="text-left px-4 py-3">Full-day</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_GUIDE.map(([cls, models, perKm, day]) => (
                <tr key={cls} className="border-t">
                  <td className="px-4 py-3 font-medium">{cls}</td>
                  <td className="px-4 py-3 text-gray-500">{models}</td>
                  <td className="px-4 py-3">{perKm}</td>
                  <td className="px-4 py-3">{day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Prices are indicative and include the driver. No hidden charges.
        </p>
      </section>

      {/* Popular routes */}
      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-1 text-center">{t('popularRoutes')}</h2>
          <p className="text-gray-500 text-center mb-6">{t('tapToBook')}</p>
          <div className="text-center mb-6">
            <Link to="/destinations" className="text-brand-600 font-medium text-sm hover:underline">
              See all places to explore →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR_ROUTES.map(([to, dist, time]) => (
              <button
                key={to}
                onClick={() => go(`/book?mode=outstation&to=${encodeURIComponent(to)}`)}
                className="border rounded-xl p-4 text-left hover:shadow-md hover:border-brand-400 transition"
              >
                <div className="font-semibold">Darbhanga → {to}</div>
                <div className="text-gray-500 text-sm">{dist} · {time}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why MithilaVahan (differentiators) */}
      <section className="bg-brand-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-8 text-center">Why MithilaVahan</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['📍', 'Live tracking', 'Watch your driver approach on a live map.'],
              ['🛟', 'SOS & trip sharing', 'Share your trip and raise an SOS to your emergency contact.'],
              ['💸', 'No commission', 'Pay the driver directly — we never take a cut.'],
              ['🏡', 'Local & verified', 'Mithilanchal drivers and vehicles, admin-approved.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="bg-white rounded-xl p-5">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-semibold">{title}</div>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local content */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-3">Travelling in and around Darbhanga</h2>
        <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
          <p>
            Darbhanga, the cultural heart of Mithilanchal, is known for Mithila (Madhubani)
            painting, Dhrupad music and the heritage of the Darbhanga Raj. Whether you're visiting
            the Raj Qila, Shyama Temple, or heading out to Madhubani for art, MithilaVahan makes it
            easy to get a car, tempo or bus with a trusted local driver.
          </p>
          <p>
            Need to reach Patna for work, the airport for a flight, or a wedding a few towns over?
            Book an outstation trip one-way or round-trip. Moving goods? Hire a tempo or truck by
            the day. It's local transport, run by locals — for Mithilanchal.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('faq')}</h2>
          <div className="space-y-2">
            {FAQS.map(([q, a], i) => (
              <div key={i} className="border rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left font-medium"
                >
                  {q}
                  <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="px-4 pb-3 text-sm text-gray-600">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">{t('ownVehicle')}</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          List your car, tempo, bus or truck and earn from local rides, day hires and
          outstation trips. Keep 100% of your fare.
        </p>
        {!user && (
          <Link to="/register" className="bg-brand-500 text-white px-8 py-3 rounded-lg inline-block shadow hover:bg-brand-600 transition">
            {t('registerDriver')}
          </Link>
        )}
      </section>
    </div>
  );
}

// Fleet / vehicle-type guide — helps riders pick the right vehicle (seats,
// luggage, best-for) and is good SEO. Each card can jump into booking prefilled.

import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const FLEET = [
  { emoji: '🚗', type: 'car', name: 'Car (hatchback / sedan)',
    seats: '4 passengers', luggage: '2–3 bags',
    bestFor: 'City rides, airport runs, small-family outstation trips.' },
  { emoji: '🚙', type: 'car', name: 'SUV', tag: 'luxury',
    seats: '6–7 passengers', luggage: '4–5 bags',
    bestFor: 'Bigger families, rough roads, comfortable long outstation journeys.' },
  { emoji: '🛺', type: 'auto', name: 'Auto',
    seats: '3 passengers', luggage: '1 bag',
    bestFor: 'Short, quick and cheap trips within the city.' },
  { emoji: '🚐', type: 'tempo', name: 'Tempo Traveller',
    seats: '9–12 passengers', luggage: 'Plenty',
    bestFor: 'Group tours, pilgrimages and family functions.' },
  { emoji: '🚌', type: 'bus', name: 'Bus',
    seats: '20+ passengers', luggage: 'Large',
    bestFor: 'Big groups, weddings and event transport.' },
  { emoji: '🚚', type: 'truck', name: 'Truck / goods carrier',
    seats: 'Driver + goods', luggage: 'Cargo',
    bestFor: 'Moving goods, furniture and materials across Mithilanchal.' },
];

export default function Fleet() {
  const navigate = useNavigate();
  return (
    <div>
      <SEO
        path="/fleet"
        title="Our Fleet — Cars, SUVs, Tempo Traveller, Bus & Trucks"
        description="Choose the right vehicle for your trip in Darbhanga & Muzaffarpur — cars, SUVs, autos, tempo travellers, buses and goods trucks, each with seats, luggage and best-for guidance."
      />

      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Our fleet</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            From a quick auto to a full bus — pick the vehicle that fits your trip. Every one comes
            with a verified local driver.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLEET.map((f) => (
            <div key={f.name} className="card p-5 flex flex-col">
              <div className="text-4xl mb-2">{f.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{f.name}</h3>
              <dl className="text-sm text-gray-600 space-y-1 flex-1">
                <div className="flex gap-2"><dt className="text-gray-400 w-20">Seats</dt><dd>{f.seats}</dd></div>
                <div className="flex gap-2"><dt className="text-gray-400 w-20">Luggage</dt><dd>{f.luggage}</dd></div>
                <div className="flex gap-2"><dt className="text-gray-400 w-20">Best for</dt><dd>{f.bestFor}</dd></div>
              </dl>
              <button
                onClick={() => navigate(f.tag === 'luxury' ? '/vehicles?tag=luxury' : `/book?type=${f.type}`)}
                className="mt-4 self-start bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600"
              >
                Book {f.name.split(' ')[0].toLowerCase()} →
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Availability depends on what local owners have listed in your city. Seats and luggage are
          typical figures and can vary by the specific vehicle.
        </p>
      </section>
    </div>
  );
}

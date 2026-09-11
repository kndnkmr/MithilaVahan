// Services page — a clear, Savaari-style overview of everything MithilaVahan
// offers. Fulfillable services route straight into the booking form (with the
// right mode/type prefilled); wedding/corporate/tour go to an enquiry form we
// handle personally.

import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const SERVICES = [
  {
    emoji: '🏙️',
    title: 'Local rides',
    desc: 'Quick point-to-point trips within Darbhanga or Muzaffarpur.',
    action: '/book?mode=trip',
    cta: 'Book now',
  },
  {
    emoji: '🛣️',
    title: 'Outstation',
    desc: 'One-way or round-trip to Patna, Bodh Gaya, Kathmandu and beyond, with a driver.',
    action: '/book?mode=outstation',
    cta: 'Book now',
  },
  {
    emoji: '✈️',
    title: 'Airport transfers',
    desc: 'On-time pickup and drop for Darbhanga, Patna & Gaya airports.',
    action: '/book?mode=airport',
    cta: 'Book now',
  },
  {
    emoji: '📅',
    title: 'Full-day hire',
    desc: 'Keep a vehicle with driver for the whole day — sightseeing, errands, events.',
    action: '/book?mode=hire',
    cta: 'Book now',
  },
  {
    emoji: '🚐',
    title: 'Tempo Traveller',
    desc: 'Spacious group travel for families and tours — 9 to 12 seaters with a driver.',
    action: '/book?type=tempo',
    cta: 'Book now',
  },
  {
    emoji: '🚙',
    title: 'Premium & luxury cars',
    desc: 'Travel in comfort — premium sedans and SUVs for special occasions.',
    action: '/vehicles',
    cta: 'Browse cars',
  },
  {
    emoji: '💒',
    title: 'Wedding & events',
    desc: 'Decorated cars and multiple vehicles for the baraat and guest pickups.',
    action: '/enquire?type=wedding',
    cta: 'Enquire now',
  },
  {
    emoji: '🏢',
    title: 'Corporate bookings',
    desc: 'Employee transport, client pickups and monthly tie-ups with easy billing.',
    action: '/enquire?type=corporate',
    cta: 'Enquire now',
  },
  {
    emoji: '🧭',
    title: 'Tour packages',
    desc: 'Multi-day trips around Mithilanchal, Bihar and Nepal with a route-savvy driver.',
    action: '/enquire?type=tour',
    cta: 'Enquire now',
  },
];

export default function Services() {
  const navigate = useNavigate();
  return (
    <div>
      <SEO
        path="/services"
        title="Our Services — Rides, Rentals, Airport, Weddings & Tours"
        description="Local rides, outstation trips, airport transfers, full-day hire, tempo traveller, luxury cars, wedding & corporate bookings, and tour packages across Mithilanchal."
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Our services</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            Everything you need to get around Mithilanchal — booked with local drivers you can
            trust, at fair, transparent fares.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="card p-5 flex flex-col">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
              <p className="text-gray-600 text-sm flex-1">{s.desc}</p>
              <button
                onClick={() => navigate(s.action)}
                className={`mt-4 self-start text-sm font-medium px-4 py-2 rounded-lg transition ${
                  s.cta === 'Enquire now'
                    ? 'border border-brand-500 text-brand-600 hover:bg-brand-50'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                {s.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            ['✅', 'Verified drivers'],
            ['📍', 'Live tracking'],
            ['₹', 'Transparent fares'],
            ['🤝', 'No commission'],
          ].map(([icon, label]) => (
            <div key={label}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            ['1', 'Choose your service', 'Pick a ride, rental, airport transfer, or enquire for weddings, corporate & tours.'],
            ['2', 'Get matched with a local driver', 'A verified local driver accepts. Track them live and coordinate by call or WhatsApp.'],
            ['3', 'Travel & pay directly', 'Enjoy the trip and pay the driver directly by cash or UPI — no hidden charges, no commission.'],
          ].map(([n, title, desc]) => (
            <div key={n} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">{n}</div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why MithilaVahan */}
      <section className="bg-brand-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Why book with MithilaVahan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ['🏠', 'Truly local', 'Built for Mithilanchal — drivers who know Darbhanga, Muzaffarpur and every route around.'],
              ['💸', 'No commission', 'You pay the driver directly. We don’t take a cut, so fares stay fair for everyone.'],
              ['🛡️', 'Safe & tracked', 'Verified drivers, live GPS tracking, SOS, and a shareable trip link for your family.'],
              ['🗣️', 'In your language', 'The whole app works in English and हिंदी, so it’s easy for everyone.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="card p-5">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            ['Do you serve my area?', 'We currently operate across Darbhanga and Muzaffarpur, with outstation trips all over Bihar, Jharkhand and Nepal. More cities are being added.'],
            ['How do I pay?', 'You pay the driver directly by cash or UPI after the trip. We never hold your money and take no commission.'],
            ['Are the drivers verified?', 'Yes. Every driver’s documents (licence, RC, insurance) and vehicle are reviewed and approved by our team before they can take trips.'],
            ['Can I book for a wedding, company, or a multi-day tour?', 'Yes — use the Enquire option on those services. Tell us your dates and needs and our team will call you back to arrange everything.'],
            ['Is there a cancellation charge?', 'Cancelling before a driver starts is free. See our Cancellation & Refund policy for details.'],
          ].map(([q, a], i) => (
            <div key={i} className="card p-4">
              <div className="font-medium mb-1">{q}</div>
              <p className="text-gray-600 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

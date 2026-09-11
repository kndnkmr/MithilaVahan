// Service enquiry form — for wedding, corporate, and tour-package requests
// that we handle personally rather than as instant bookings. Public (no login
// needed); if the user is signed in we prefill their name/phone.

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

// Per-type copy so the form feels tailored, not generic.
const TYPES = {
  wedding: {
    label: 'Wedding & Events',
    emoji: '💒',
    blurb: 'Decorated cars, multiple vehicles for the baraat, guest pickups — tell us your dates and needs and we’ll arrange it.',
    detailsPlaceholder: 'e.g. 2 decorated cars + 1 tempo for 12 guests, on 15 Dec, pickup from Laheriasarai…',
    datePlaceholder: 'Event date(s)',
    includes: [
      'Decorated cars on request',
      'Multiple vehicles coordinated for the baraat & guests',
      'Well-dressed, verified local drivers',
      'On-time arrival with a backup plan',
    ],
    faqs: [
      ['How early should I book?', 'For weddings, 1–2 weeks ahead is best so we can reserve enough vehicles for your dates.'],
      ['Can I get the car decorated?', 'Yes — mention it in your enquiry and we’ll arrange decoration for an add-on cost.'],
    ],
  },
  corporate: {
    label: 'Corporate Bookings',
    emoji: '🏢',
    blurb: 'Employee transport, client pickups, monthly tie-ups, event logistics — set up a corporate account with us.',
    detailsPlaceholder: 'e.g. Daily cab for 4 staff, Darbhanga to office, Mon–Sat, monthly billing…',
    datePlaceholder: 'Start date / duration',
    includes: [
      'Daily employee & client transport',
      'Monthly billing / consolidated invoices',
      'Priority allocation of vehicles',
      'A dedicated point of contact',
    ],
    faqs: [
      ['Do you offer monthly billing?', 'Yes — corporate accounts can be billed monthly with a single invoice. We’ll set this up when we call you.'],
      ['Can you handle regular daily trips?', 'Absolutely — fixed daily/weekly schedules are exactly what corporate bookings are for.'],
    ],
  },
  tour: {
    label: 'Tour Packages',
    emoji: '🧭',
    blurb: 'Multi-day trips around Mithilanchal, Bihar and Nepal — Janakpur, Bodh Gaya, Kathmandu and more, with a driver who knows the route.',
    detailsPlaceholder: 'e.g. 3-day trip: Darbhanga → Janakpur → Kathmandu for 4 people, mid-Jan…',
    datePlaceholder: 'Travel date(s)',
    includes: [
      'Custom multi-day itineraries',
      'Driver who knows the routes & stops',
      'Vehicle to suit your group size',
      'Transparent all-in pricing before you go',
    ],
    faqs: [
      ['Can you plan the full itinerary?', 'Yes — tell us the places and days and we’ll suggest a comfortable route and a clear price.'],
      ['Do you cover Nepal (Janakpur/Kathmandu)?', 'Yes, cross-border tours are popular from Darbhanga. We’ll guide you on the paperwork needed.'],
    ],
  },
  other: {
    label: 'Enquiry',
    emoji: '💬',
    blurb: 'Tell us what you need and our team will get back to you.',
    detailsPlaceholder: 'Describe what you need…',
    datePlaceholder: 'When do you need it?',
    includes: [],
    faqs: [],
  },
};

export default function Enquire() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = Object.keys(TYPES).includes(searchParams.get('type')) ? searchParams.get('type') : 'other';
  const info = TYPES[type];

  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    date: '',
    details: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    cityAPI.list().then((r) => setCities(r.data.cities)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.details.trim()) {
      return toast.error('Please fill your name, phone, and details');
    }
    if (String(form.phone).replace(/\D/g, '').length < 10) {
      return toast.error('Please enter a valid phone number');
    }
    setSaving(true);
    try {
      await enquiryAPI.create({ type, ...form });
      setDone(true);
      toast.success('Enquiry sent! We’ll contact you shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send enquiry');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-bold mb-2">Enquiry received</h1>
        <p className="text-gray-600 mb-6">
          Thanks, {form.name.split(' ')[0]}! Our team will call you on {form.phone} shortly to
          arrange your {info.label.toLowerCase()}.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/services" className="btn-primary">Back to services</Link>
          <button onClick={() => { setDone(false); setForm((f) => ({ ...f, details: '', date: '' })); }}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <SEO
        path={`/enquire?type=${type}`}
        title={`${info.label} — Enquiry`}
        description={info.blurb}
      />
      <div className="text-4xl mb-2">{info.emoji}</div>
      <h1 className="text-2xl font-bold mb-1">{info.label}</h1>
      <p className="text-gray-600 mb-6">{info.blurb}</p>

      <form onSubmit={submit} className="card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input value={form.name} onChange={set('name')} placeholder="Full name" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" inputMode="numeric" value={form.phone} onChange={set('phone')}
              placeholder="98765 43210" className="input" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select value={form.city} onChange={set('city')} className="input">
              <option value="">Select city</option>
              {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{info.datePlaceholder}</label>
            <input value={form.date} onChange={set('date')} placeholder="e.g. 15 Dec" className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <textarea value={form.details} onChange={set('details')} rows={4}
            placeholder={info.detailsPlaceholder} className="input" required />
        </div>

        <button disabled={saving} className="btn-primary w-full">
          {saving ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="text-xs text-gray-400 text-center">
          No account needed. We’ll call you back to confirm details and fare.
        </p>
      </form>

      {/* What's included */}
      {info.includes?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold mb-3">What’s included</h2>
          <ul className="space-y-2">
            {info.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {info.faqs?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold mb-3">Common questions</h2>
          <div className="space-y-3">
            {info.faqs.map(([q, a], i) => (
              <div key={i} className="card p-4">
                <div className="font-medium text-sm mb-1">{q}</div>
                <p className="text-gray-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Service enquiry form — for wedding, corporate, and tour-package requests
// that we handle personally rather than as instant bookings. Public (no login
// needed); if the user is signed in we prefill their name/phone. Bilingual.

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../services/i18n';
import SEO from '../components/SEO';

// Per-type copy — every string is { en, hi }.
const TYPES = {
  wedding: {
    label: { en: 'Wedding & Events', hi: 'शादी व आयोजन' },
    emoji: '💒',
    blurb: { en: 'Decorated cars, multiple vehicles for the baraat, guest pickups — tell us your dates and needs and we’ll arrange it.', hi: 'सजी हुई कारें, बारात के लिए कई वाहन, मेहमानों का पिकअप — अपनी तारीखें व ज़रूरतें बताएँ, हम व्यवस्था करेंगे।' },
    detailsPlaceholder: { en: 'e.g. 2 decorated cars + 1 tempo for 12 guests, on 15 Dec…', hi: 'जैसे: 12 मेहमानों के लिए 2 सजी कारें + 1 टेम्पो, 15 दिस.…' },
    datePlaceholder: { en: 'Event date(s)', hi: 'आयोजन की तारीख़(ें)' },
    includes: [
      { en: 'Decorated cars on request', hi: 'मांग पर सजी हुई कारें' },
      { en: 'Multiple vehicles coordinated for the baraat & guests', hi: 'बारात व मेहमानों के लिए कई वाहन' },
      { en: 'Well-dressed, verified local drivers', hi: 'सुव्यवस्थित, सत्यापित स्थानीय ड्राइवर' },
      { en: 'On-time arrival with a backup plan', hi: 'समय पर पहुँच, बैकअप योजना के साथ' },
    ],
    faqs: [
      [{ en: 'How early should I book?', hi: 'कितनी जल्दी बुक करना चाहिए?' }, { en: 'For weddings, 1–2 weeks ahead is best so we can reserve enough vehicles for your dates.', hi: 'शादी के लिए 1–2 हफ़्ते पहले सबसे अच्छा, ताकि हम पर्याप्त वाहन आरक्षित कर सकें।' }],
      [{ en: 'Can I get the car decorated?', hi: 'क्या कार सजवा सकते हैं?' }, { en: 'Yes — mention it in your enquiry and we’ll arrange decoration for an add-on cost.', hi: 'हाँ — पूछताछ में बताएँ, हम अतिरिक्त शुल्क पर सजावट की व्यवस्था करेंगे।' }],
    ],
  },
  corporate: {
    label: { en: 'Corporate Bookings', hi: 'कॉर्पोरेट बुकिंग' },
    emoji: '🏢',
    blurb: { en: 'Employee transport, client pickups, monthly tie-ups, event logistics — set up a corporate account with us.', hi: 'कर्मचारी परिवहन, क्लाइंट पिकअप, मासिक अनुबंध, आयोजन व्यवस्था — हमारे साथ कॉर्पोरेट खाता बनाएँ।' },
    detailsPlaceholder: { en: 'e.g. Daily cab for 4 staff, Darbhanga to office, Mon–Sat…', hi: 'जैसे: 4 कर्मचारियों के लिए रोज़ कैब, दरभंगा से ऑफ़िस, सोम–शनि…' },
    datePlaceholder: { en: 'Start date / duration', hi: 'शुरू तिथि / अवधि' },
    includes: [
      { en: 'Daily employee & client transport', hi: 'रोज़ का कर्मचारी व क्लाइंट परिवहन' },
      { en: 'Monthly billing / consolidated invoices', hi: 'मासिक बिलिंग / एकीकृत चालान' },
      { en: 'Priority allocation of vehicles', hi: 'वाहनों का प्राथमिकता आवंटन' },
      { en: 'A dedicated point of contact', hi: 'एक समर्पित संपर्क व्यक्ति' },
    ],
    faqs: [
      [{ en: 'Do you offer monthly billing?', hi: 'क्या मासिक बिलिंग है?' }, { en: 'Yes — corporate accounts can be billed monthly with a single invoice. We’ll set this up when we call you.', hi: 'हाँ — कॉर्पोरेट खातों का एक चालान से मासिक बिल बन सकता है। कॉल पर हम यह सेट कर देंगे।' }],
      [{ en: 'Can you handle regular daily trips?', hi: 'क्या नियमित रोज़ की यात्राएँ संभाल सकते हैं?' }, { en: 'Absolutely — fixed daily/weekly schedules are exactly what corporate bookings are for.', hi: 'बिलकुल — तय रोज़/साप्ताहिक शेड्यूल कॉर्पोरेट बुकिंग के लिए ही हैं।' }],
    ],
  },
  tour: {
    label: { en: 'Tour Packages', hi: 'टूर पैकेज' },
    emoji: '🧭',
    blurb: { en: 'Multi-day trips around Mithilanchal, Bihar and Nepal — Janakpur, Bodh Gaya, Kathmandu and more, with a driver who knows the route.', hi: 'मिथिलांचल, बिहार व नेपाल में कई दिनों की यात्राएँ — जनकपुर, बोधगया, काठमांडू और अधिक, रास्ता जानने वाले ड्राइवर के साथ।' },
    detailsPlaceholder: { en: 'e.g. 3-day trip: Darbhanga → Janakpur → Kathmandu for 4 people…', hi: 'जैसे: 3-दिन: दरभंगा → जनकपुर → काठमांडू, 4 लोगों के लिए…' },
    datePlaceholder: { en: 'Travel date(s)', hi: 'यात्रा की तारीख़(ें)' },
    includes: [
      { en: 'Custom multi-day itineraries', hi: 'कई दिनों के अनुकूलित कार्यक्रम' },
      { en: 'Driver who knows the routes & stops', hi: 'रास्ते व पड़ाव जानने वाला ड्राइवर' },
      { en: 'Vehicle to suit your group size', hi: 'आपके समूह के अनुसार वाहन' },
      { en: 'Transparent all-in pricing before you go', hi: 'यात्रा से पहले पारदर्शी सम्पूर्ण कीमत' },
    ],
    faqs: [
      [{ en: 'Can you plan the full itinerary?', hi: 'क्या पूरा कार्यक्रम बना सकते हैं?' }, { en: 'Yes — tell us the places and days and we’ll suggest a comfortable route and a clear price.', hi: 'हाँ — स्थान व दिन बताएँ, हम आरामदायक रास्ता व स्पष्ट कीमत सुझाएँगे।' }],
      [{ en: 'Do you cover Nepal (Janakpur/Kathmandu)?', hi: 'क्या नेपाल (जनकपुर/काठमांडू) कवर करते हैं?' }, { en: 'Yes, cross-border tours are popular from Darbhanga. We’ll guide you on the paperwork needed.', hi: 'हाँ, दरभंगा से सीमा-पार टूर लोकप्रिय हैं। ज़रूरी कागज़ात पर हम मार्गदर्शन देंगे।' }],
    ],
  },
  other: {
    label: { en: 'Enquiry', hi: 'पूछताछ' },
    emoji: '💬',
    blurb: { en: 'Tell us what you need and our team will get back to you.', hi: 'बताएँ आपको क्या चाहिए, हमारी टीम संपर्क करेगी।' },
    detailsPlaceholder: { en: 'Describe what you need…', hi: 'बताएँ आपको क्या चाहिए…' },
    datePlaceholder: { en: 'When do you need it?', hi: 'कब चाहिए?' },
    includes: [],
    faqs: [],
  },
};

const S = {
  yourName: { en: 'Your name', hi: 'आपका नाम' },
  fullName: { en: 'Full name', hi: 'पूरा नाम' },
  phone: { en: 'Phone', hi: 'फ़ोन' },
  city: { en: 'City', hi: 'शहर' },
  selectCity: { en: 'Select city', hi: 'शहर चुनें' },
  details: { en: 'Details', hi: 'विवरण' },
  send: { en: 'Send enquiry', hi: 'पूछताछ भेजें' },
  sending: { en: 'Sending…', hi: 'भेजा जा रहा है…' },
  noAccount: { en: 'No account needed. We’ll call you back to confirm details and fare.', hi: 'खाता ज़रूरी नहीं। हम विवरण व किराया पक्का करने के लिए आपको कॉल करेंगे।' },
  included: { en: 'What’s included', hi: 'इसमें क्या शामिल है' },
  common: { en: 'Common questions', hi: 'सामान्य प्रश्न' },
  received: { en: 'Enquiry received', hi: 'पूछताछ मिल गई' },
  back: { en: 'Back to services', hi: 'सेवाओं पर वापस' },
  another: { en: 'Send another', hi: 'एक और भेजें' },
  errFill: { en: 'Please fill your name, phone, and details', hi: 'कृपया नाम, फ़ोन और विवरण भरें' },
  errPhone: { en: 'Please enter a valid phone number', hi: 'कृपया सही फ़ोन नंबर डालें' },
  ok: { en: 'Enquiry sent! We’ll contact you shortly.', hi: 'पूछताछ भेज दी गई! हम जल्द संपर्क करेंगे।' },
};

export default function Enquire() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = useLang();
  const L = (o) => (o && (o[lang] || o.en)) || '';

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
      return toast.error(L(S.errFill));
    }
    if (String(form.phone).replace(/\D/g, '').length < 10) {
      return toast.error(L(S.errPhone));
    }
    setSaving(true);
    try {
      await enquiryAPI.create({ type, ...form });
      setDone(true);
      toast.success(L(S.ok));
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
        <h1 className="text-2xl font-bold mb-2">{L(S.received)}</h1>
        <p className="text-gray-600 mb-6">
          {lang === 'hi'
            ? `धन्यवाद, ${form.name.split(' ')[0]}! हमारी टीम जल्द ही ${form.phone} पर आपको कॉल करेगी।`
            : `Thanks, ${form.name.split(' ')[0]}! Our team will call you on ${form.phone} shortly to arrange your ${L(info.label).toLowerCase()}.`}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/services" className="btn-primary">{L(S.back)}</Link>
          <button onClick={() => { setDone(false); setForm((f) => ({ ...f, details: '', date: '' })); }}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
            {L(S.another)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <SEO
        path={`/enquire?type=${type}`}
        title={`${L(info.label)} — Enquiry`}
        description={L(info.blurb)}
      />
      <div className="text-4xl mb-2">{info.emoji}</div>
      <h1 className="text-2xl font-bold mb-1">{L(info.label)}</h1>
      <p className="text-gray-600 mb-6">{L(info.blurb)}</p>

      <form onSubmit={submit} className="card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{L(S.yourName)}</label>
            <input value={form.name} onChange={set('name')} placeholder={L(S.fullName)} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{L(S.phone)}</label>
            <input type="tel" inputMode="numeric" value={form.phone} onChange={set('phone')}
              placeholder="98765 43210" className="input" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{L(S.city)}</label>
            <select value={form.city} onChange={set('city')} className="input">
              <option value="">{L(S.selectCity)}</option>
              {cities.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{L(info.datePlaceholder)}</label>
            <input value={form.date} onChange={set('date')} placeholder="e.g. 15 Dec" className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{L(S.details)}</label>
          <textarea value={form.details} onChange={set('details')} rows={4}
            placeholder={L(info.detailsPlaceholder)} className="input" required />
        </div>

        <button disabled={saving} className="btn-primary w-full">
          {saving ? L(S.sending) : L(S.send)}
        </button>
        <p className="text-xs text-gray-400 text-center">{L(S.noAccount)}</p>
      </form>

      {/* What's included */}
      {info.includes?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold mb-3">{L(S.included)}</h2>
          <ul className="space-y-2">
            {info.includes.map((item) => (
              <li key={L(item)} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{L(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {info.faqs?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold mb-3">{L(S.common)}</h2>
          <div className="space-y-3">
            {info.faqs.map(([q, a], i) => (
              <div key={i} className="card p-4">
                <div className="font-medium text-sm mb-1">{L(q)}</div>
                <p className="text-gray-600 text-sm">{L(a)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

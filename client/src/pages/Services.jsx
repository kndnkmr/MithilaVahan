// Services page — a clear, Savaari-style overview of everything MithilaVahan
// offers. Fulfillable services route straight into the booking form (with the
// right mode/type prefilled); wedding/corporate/tour go to an enquiry form we
// handle personally. Bilingual (English / हिंदी) via useLang().

import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useLang } from '../services/i18n';

// Each string is { en, hi }; pick(str) resolves it for the current language.
const CTA_BOOK = { en: 'Book now', hi: 'बुक करें' };
const CTA_BROWSE = { en: 'Browse cars', hi: 'कारें देखें' };
const CTA_ENQUIRE = { en: 'Enquire now', hi: 'पूछताछ करें' };

const SERVICES = [
  { emoji: '🏙️', action: '/book?mode=trip', cta: CTA_BOOK,
    title: { en: 'Local rides', hi: 'शहर की सवारी' },
    desc: { en: 'Quick point-to-point trips within Darbhanga or Muzaffarpur.', hi: 'दरभंगा या मुजफ्फरपुर के भीतर तेज़ पॉइंट-टू-पॉइंट यात्राएँ।' } },
  { emoji: '🛣️', action: '/book?mode=outstation', cta: CTA_BOOK,
    title: { en: 'Outstation', hi: 'आउटस्टेशन' },
    desc: { en: 'One-way or round-trip to Patna, Bodh Gaya, Kathmandu and beyond, with a driver.', hi: 'पटना, बोधगया, काठमांडू और आगे तक — वन-वे या राउंड-ट्रिप, ड्राइवर के साथ।' } },
  { emoji: '✈️', action: '/book?mode=airport', cta: CTA_BOOK,
    title: { en: 'Airport transfers', hi: 'एयरपोर्ट ट्रांसफर' },
    desc: { en: 'On-time pickup and drop for Darbhanga, Patna & Gaya airports.', hi: 'दरभंगा, पटना व गया एयरपोर्ट के लिए समय पर पिकअप और ड्रॉप।' } },
  { emoji: '📅', action: '/book?mode=hire', cta: CTA_BOOK,
    title: { en: 'Full-day hire', hi: 'पूरे दिन का किराया' },
    desc: { en: 'Keep a vehicle with driver for the whole day — sightseeing, errands, events.', hi: 'पूरे दिन के लिए ड्राइवर सहित वाहन — घूमना, काम, आयोजन।' } },
  { emoji: '🚐', action: '/book?type=tempo', cta: CTA_BOOK,
    title: { en: 'Tempo Traveller', hi: 'टेम्पो ट्रैवलर' },
    desc: { en: 'Spacious group travel for families and tours — 9 to 12 seaters with a driver.', hi: 'परिवार व टूर के लिए बड़ी सवारी — 9 से 12 सीटर, ड्राइवर के साथ।' } },
  { emoji: '🚙', action: '/vehicles?tag=luxury', cta: CTA_BROWSE,
    title: { en: 'Premium & luxury cars', hi: 'प्रीमियम व लक्ज़री कारें' },
    desc: { en: 'Travel in comfort — premium sedans and SUVs for special occasions.', hi: 'आराम से यात्रा करें — खास मौकों के लिए प्रीमियम सेडान व SUV।' } },
  { emoji: '💒', action: '/enquire?type=wedding', cta: CTA_ENQUIRE,
    title: { en: 'Wedding & events', hi: 'शादी व आयोजन' },
    desc: { en: 'Decorated cars and multiple vehicles for the baraat and guest pickups.', hi: 'सजी हुई कारें और बारात व मेहमानों के लिए कई वाहन।' } },
  { emoji: '🏢', action: '/enquire?type=corporate', cta: CTA_ENQUIRE,
    title: { en: 'Corporate bookings', hi: 'कॉर्पोरेट बुकिंग' },
    desc: { en: 'Employee transport, client pickups and monthly tie-ups with easy billing.', hi: 'कर्मचारी परिवहन, क्लाइंट पिकअप और आसान बिलिंग के साथ मासिक अनुबंध।' } },
  { emoji: '🧭', action: '/enquire?type=tour', cta: CTA_ENQUIRE,
    title: { en: 'Tour packages', hi: 'टूर पैकेज' },
    desc: { en: 'Multi-day trips around Mithilanchal, Bihar and Nepal with a route-savvy driver.', hi: 'मिथिलांचल, बिहार व नेपाल में कई दिनों की यात्राएँ — रास्ता जानने वाले ड्राइवर के साथ।' } },
];

const REASSURE = [
  ['✅', { en: 'Verified drivers', hi: 'सत्यापित ड्राइवर' }],
  ['📍', { en: 'Live tracking', hi: 'लाइव ट्रैकिंग' }],
  ['₹', { en: 'Transparent fares', hi: 'पारदर्शी किराया' }],
  ['🤝', { en: 'No commission', hi: 'कोई कमीशन नहीं' }],
];

const STEPS = [
  ['1', { en: 'Choose your service', hi: 'अपनी सेवा चुनें' },
    { en: 'Pick a ride, rental, airport transfer, or enquire for weddings, corporate & tours.', hi: 'सवारी, किराया, एयरपोर्ट ट्रांसफर चुनें, या शादी/कॉर्पोरेट/टूर के लिए पूछताछ करें।' }],
  ['2', { en: 'Get matched with a local driver', hi: 'स्थानीय ड्राइवर से जुड़ें' },
    { en: 'A verified local driver accepts. Track them live and coordinate by call or WhatsApp.', hi: 'एक सत्यापित स्थानीय ड्राइवर स्वीकार करता है। लाइव ट्रैक करें और कॉल/WhatsApp पर बात करें।' }],
  ['3', { en: 'Travel & pay directly', hi: 'यात्रा करें व सीधे भुगतान करें' },
    { en: 'Enjoy the trip and pay the driver directly by cash or UPI — no hidden charges, no commission.', hi: 'यात्रा का आनंद लें और ड्राइवर को सीधे नकद या UPI से भुगतान करें — कोई छिपा शुल्क नहीं, कोई कमीशन नहीं।' }],
];

const WHY = [
  ['🏠', { en: 'Truly local', hi: 'पूरी तरह स्थानीय' },
    { en: 'Built for Mithilanchal — drivers who know Darbhanga, Muzaffarpur and every route around.', hi: 'मिथिलांचल के लिए बना — ड्राइवर जो दरभंगा, मुजफ्फरपुर और हर रास्ता जानते हैं।' }],
  ['💸', { en: 'No commission', hi: 'कोई कमीशन नहीं' },
    { en: 'You pay the driver directly. We don’t take a cut, so fares stay fair for everyone.', hi: 'आप ड्राइवर को सीधे भुगतान करते हैं। हम कमीशन नहीं लेते, इसलिए किराया सबके लिए उचित रहता है।' }],
  ['🛡️', { en: 'Safe & tracked', hi: 'सुरक्षित व ट्रैक्ड' },
    { en: 'Verified drivers, live GPS tracking, SOS, and a shareable trip link for your family.', hi: 'सत्यापित ड्राइवर, लाइव GPS ट्रैकिंग, SOS, और परिवार के लिए शेयर करने योग्य ट्रिप लिंक।' }],
  ['🗣️', { en: 'In your language', hi: 'आपकी भाषा में' },
    { en: 'The whole app works in English and हिंदी, so it’s easy for everyone.', hi: 'पूरा ऐप अंग्रेज़ी और हिंदी में चलता है, ताकि सबके लिए आसान हो।' }],
];

const FAQS = [
  [{ en: 'Do you serve my area?', hi: 'क्या आप मेरे इलाके में सेवा देते हैं?' },
    { en: 'We currently operate across Darbhanga and Muzaffarpur, with outstation trips all over Bihar, Jharkhand and Nepal. More cities are being added.', hi: 'हम अभी दरभंगा और मुजफ्फरपुर में सेवा देते हैं, और बिहार, झारखंड व नेपाल तक आउटस्टेशन यात्राएँ। और शहर जोड़े जा रहे हैं।' }],
  [{ en: 'How do I pay?', hi: 'भुगतान कैसे करूँ?' },
    { en: 'You pay the driver directly by cash or UPI after the trip. We never hold your money and take no commission.', hi: 'यात्रा के बाद आप ड्राइवर को सीधे नकद या UPI से भुगतान करते हैं। हम आपका पैसा नहीं रखते और कोई कमीशन नहीं लेते।' }],
  [{ en: 'Are the drivers verified?', hi: 'क्या ड्राइवर सत्यापित हैं?' },
    { en: 'Yes. Every driver’s documents (licence, RC, insurance) and vehicle are reviewed and approved by our team before they can take trips.', hi: 'हाँ। हर ड्राइवर के दस्तावेज़ (लाइसेंस, RC, बीमा) और वाहन की जाँच व अप्रूवल हमारी टीम करती है, तभी वे यात्राएँ ले सकते हैं।' }],
  [{ en: 'Can I book for a wedding, company, or a multi-day tour?', hi: 'क्या मैं शादी, कंपनी या कई दिनों के टूर के लिए बुक कर सकता हूँ?' },
    { en: 'Yes — use the Enquire option on those services. Tell us your dates and needs and our team will call you back to arrange everything.', hi: 'हाँ — उन सेवाओं पर पूछताछ विकल्प का उपयोग करें। अपनी तारीखें व ज़रूरतें बताएँ, हमारी टीम आपको कॉल करके सब व्यवस्था करेगी।' }],
  [{ en: 'Is there a cancellation charge?', hi: 'क्या रद्द करने का शुल्क है?' },
    { en: 'Cancelling before a driver starts is free. See our Cancellation & Refund policy for details.', hi: 'ड्राइवर के शुरू करने से पहले रद्द करना मुफ़्त है। विवरण के लिए हमारी रद्दीकरण व रिफंड नीति देखें।' }],
];

export default function Services() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (o) => (o && (o[lang] || o.en)) || '';

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {lang === 'hi' ? 'हमारी सेवाएँ' : 'Our services'}
          </h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            {lang === 'hi'
              ? 'मिथिलांचल में आने-जाने के लिए सब कुछ — भरोसेमंद स्थानीय ड्राइवरों के साथ, उचित व पारदर्शी किराए पर।'
              : 'Everything you need to get around Mithilanchal — booked with local drivers you can trust, at fair, transparent fares.'}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div key={s.emoji + L(s.title)} className="card p-5 flex flex-col">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <h3 className="font-semibold text-lg mb-1">{L(s.title)}</h3>
              <p className="text-gray-600 text-sm flex-1">{L(s.desc)}</p>
              <button
                onClick={() => navigate(s.action)}
                className={`mt-4 self-start text-sm font-medium px-4 py-2 rounded-lg transition ${
                  s.cta === CTA_ENQUIRE
                    ? 'border border-brand-500 text-brand-600 hover:bg-brand-50'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                {L(s.cta)} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {REASSURE.map(([icon, label]) => (
            <div key={icon}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm text-gray-600">{L(label)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {lang === 'hi' ? 'यह कैसे काम करता है' : 'How it works'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(([n, title, desc]) => (
            <div key={n} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">{n}</div>
              <h3 className="font-semibold mb-1">{L(title)}</h3>
              <p className="text-gray-600 text-sm">{L(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why MithilaVahan */}
      <section className="bg-brand-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">
            {lang === 'hi' ? 'MithilaVahan क्यों चुनें' : 'Why book with MithilaVahan'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map(([icon, title, desc]) => (
              <div key={icon} className="card p-5">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-semibold mb-1">{L(title)}</h3>
                <p className="text-gray-600 text-sm">{L(desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently asked questions'}
        </h2>
        <div className="space-y-4">
          {FAQS.map(([q, a], i) => (
            <div key={i} className="card p-4">
              <div className="font-medium mb-1">{L(q)}</div>
              <p className="text-gray-600 text-sm">{L(a)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Contact page — clear ways to reach MithilaVahan, service areas, and hours.
// Uses the support email; in-app support form is the primary channel for trip
// issues (it reaches admins in real time).

import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useLang } from '../services/i18n';

export default function Contact() {
  const lang = useLang();
  const L = (en, hi) => (lang === 'hi' ? hi : en);
  return (
    <div>
      <SEO
        path="/contact"
        title="Contact MithilaVahan — Support for Rides & Bookings"
        description="Reach MithilaVahan for bookings, support and enquiries across Darbhanga, Muzaffarpur and Mithilanchal. Email, WhatsApp, and in-app support."
      />

      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{L('Contact us', 'संपर्क करें')}</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            {L('We’re here to help with bookings, support and enquiries — in English or हिंदी.', 'बुकिंग, सहायता और पूछताछ में हम आपकी मदद के लिए हैं — अंग्रेज़ी या हिंदी में।')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Contact methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="mailto:support@mithilavahan.in" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">✉️</div>
            <div className="font-semibold mb-1">{L('Email', 'ईमेल')}</div>
            <div className="text-sm text-brand-600 break-all">support@mithilavahan.in</div>
          </a>
          <Link to="/support" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">🛠️</div>
            <div className="font-semibold mb-1">{L('In-app support', 'ऐप में सहायता')}</div>
            <div className="text-sm text-gray-600">{L('Raise a trip issue or grievance — it reaches our team instantly.', 'यात्रा से जुड़ी समस्या दर्ज करें — यह तुरंत हमारी टीम तक पहुँचती है।')}</div>
          </Link>
          <Link to="/enquire?type=other" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold mb-1">{L('Send an enquiry', 'पूछताछ भेजें')}</div>
            <div className="text-sm text-gray-600">{L('Weddings, corporate, tours or anything else — we’ll call you back.', 'शादी, कॉर्पोरेट, टूर या कुछ और — हम आपको कॉल करेंगे।')}</div>
          </Link>
        </div>

        {/* During a trip */}
        <div className="card p-5">
          <h2 className="font-semibold mb-2">{L('During a trip', 'यात्रा के दौरान')}</h2>
          <p className="text-sm text-gray-600">
            You can call or WhatsApp your driver directly from the trip screen. In an emergency,
            use the <b>SOS</b> button on an active trip — it alerts our team and your emergency
            contact with your live location.
          </p>
        </div>

        {/* Service areas + hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-2">{L('Where we operate', 'हम कहाँ सेवा देते हैं')}</h2>
            <p className="text-sm text-gray-600">
              Based in <b>Darbhanga</b>, serving <b>Muzaffarpur</b> and towns across Mithilanchal,
              with outstation trips all over Bihar, Jharkhand and Nepal. More cities are being added.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold mb-2">{L('Hours', 'समय')}</h2>
            <p className="text-sm text-gray-600">
              Bookings and rides run <b>24×7</b>. Support enquiries are answered through the day —
              we’ll get back to you as quickly as we can.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/book" className="btn-primary inline-block">{L('Book a ride now', 'अभी सवारी बुक करें')} →</Link>
        </div>
      </div>
    </div>
  );
}

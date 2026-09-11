// Contact page — clear ways to reach MithilaVahan, service areas, and hours.
// Uses the support email; in-app support form is the primary channel for trip
// issues (it reaches admins in real time).

import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Contact() {
  return (
    <div>
      <SEO
        path="/contact"
        title="Contact MithilaVahan — Support for Rides & Bookings"
        description="Reach MithilaVahan for bookings, support and enquiries across Darbhanga, Muzaffarpur and Mithilanchal. Email, WhatsApp, and in-app support."
      />

      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Contact us</h1>
          <p className="text-brand-50 max-w-2xl mx-auto">
            We’re here to help with bookings, support and enquiries — in English or हिंदी.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Contact methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="mailto:support@mithilavahan.in" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">✉️</div>
            <div className="font-semibold mb-1">Email</div>
            <div className="text-sm text-brand-600 break-all">support@mithilavahan.in</div>
          </a>
          <Link to="/support" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">🛠️</div>
            <div className="font-semibold mb-1">In-app support</div>
            <div className="text-sm text-gray-600">Raise a trip issue or grievance — it reaches our team instantly.</div>
          </Link>
          <Link to="/enquire?type=other" className="card p-5 hover:border-brand-400 transition">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold mb-1">Send an enquiry</div>
            <div className="text-sm text-gray-600">Weddings, corporate, tours or anything else — we’ll call you back.</div>
          </Link>
        </div>

        {/* During a trip */}
        <div className="card p-5">
          <h2 className="font-semibold mb-2">During a trip</h2>
          <p className="text-sm text-gray-600">
            You can call or WhatsApp your driver directly from the trip screen. In an emergency,
            use the <b>SOS</b> button on an active trip — it alerts our team and your emergency
            contact with your live location.
          </p>
        </div>

        {/* Service areas + hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-2">Where we operate</h2>
            <p className="text-sm text-gray-600">
              Based in <b>Darbhanga</b>, serving <b>Muzaffarpur</b> and towns across Mithilanchal,
              with outstation trips all over Bihar, Jharkhand and Nepal. More cities are being added.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold mb-2">Hours</h2>
            <p className="text-sm text-gray-600">
              Bookings and rides run <b>24×7</b>. Support enquiries are answered through the day —
              we’ll get back to you as quickly as we can.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/book" className="btn-primary inline-block">Book a ride now →</Link>
        </div>
      </div>
    </div>
  );
}

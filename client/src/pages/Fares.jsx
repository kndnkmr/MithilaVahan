// Fare transparency page — explains exactly how fares are worked out and shows
// an indicative rate table, so riders trust the numbers. Original content.

import { Link } from 'react-router-dom';
import LegalLayout, { H2, P, UL } from './legal/LegalLayout';

// Indicative rates (mirror server/utils/fare.js INDICATIVE). "From" guidance only.
const RATES = [
  ['Auto', '₹30', '₹9', '₹1,200'],
  ['Hatchback / small car', '₹50', '₹10', '₹2,200'],
  ['Sedan', '₹50', '₹11', '₹2,500'],
  ['SUV', '₹80', '₹14', '₹3,200'],
  ['Tempo Traveller', '₹80', '₹18', '₹3,500'],
  ['Bus', '₹500', '₹35', '₹9,000'],
  ['Truck / goods', '₹300', '₹30', '₹6,000'],
];

export default function Fares() {
  return (
    <LegalLayout
      title="Fares & pricing"
      subtitle="Simple, transparent, no commission — here’s exactly how it works."
    >
      <P>
        MithilaVahan doesn’t set a hidden meter or take a cut from your fare. Each vehicle
        owner sets their own rate, the app shows you an indicative estimate up front, and the
        driver confirms the final fare before you go. You pay the driver directly by cash or UPI.
      </P>

      <H2>How the fare is worked out</H2>
      <UL items={[
        'Local / in-city ride: a base fare (pickup charge) + a per-kilometre rate for the distance.',
        'Airport transfer: same per-km basis, between your location and the airport.',
        'Outstation: base fare + per-km over the journey. A round-trip covers the distance both ways, so it’s roughly double a one-way.',
        'Local hire: an hourly package (e.g. 4hr/40km, 8hr/80km) or a full-day rate.',
      ]} />

      <H2>Indicative rates (guide)</H2>
      <div className="overflow-x-auto not-prose">
        <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Vehicle</th>
              <th className="text-left px-4 py-3">Base fare</th>
              <th className="text-left px-4 py-3">Per km</th>
              <th className="text-left px-4 py-3">Per day</th>
            </tr>
          </thead>
          <tbody>
            {RATES.map(([v, base, km, day]) => (
              <tr key={v} className="border-t">
                <td className="px-4 py-3 font-medium">{v}</td>
                <td className="px-4 py-3">{base}</td>
                <td className="px-4 py-3">{km}</td>
                <td className="px-4 py-3">{day}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        These are typical local rates shown as a guide — the actual owner’s rate and the
        driver’s confirmed fare are what apply.
      </P>

      <H2>What may be extra</H2>
      <UL items={[
        'Tolls, state permits and parking, where applicable, are usually paid as actuals.',
        'Night travel (late-night/early-morning) may carry a small extra, agreed with the driver.',
        'Waiting time beyond what’s reasonable on a round-trip may be charged.',
        'Nepal trips (Janakpur, Kathmandu): border and permit fees are extra.',
      ]} />

      <H2>No commission, ever</H2>
      <P>
        Unlike large aggregators, MithilaVahan does not add a booking commission on top of your
        fare. The money goes to the local driver — which is fairer for them and often cheaper for you.
      </P>

      <div className="not-prose mt-6">
        <Link to="/book" className="btn-primary inline-block">Get an instant estimate →</Link>
      </div>
    </LegalLayout>
  );
}

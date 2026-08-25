import { Link } from 'react-router-dom';
import LegalLayout, { H2, P } from './LegalLayout';

export default function AboutUs() {
  return (
    <LegalLayout
      title="About MithilaVahan"
      subtitle="Local transport, run by locals — for Mithilanchal."
    >
      <P>
        MithilaVahan (मिथिला + वाहन — “vehicles of Mithila”) is a local ride and vehicle-rental
        platform built for Mithilanchal. We connect people who need to travel with local vehicle
        owners and drivers across Darbhanga, Muzaffarpur and the towns around them.
      </P>

      <H2>Why we exist</H2>
      <P>
        Big national apps focus on metros and leave smaller cities underserved — no easy way to
        book a tempo for goods, hire a bus for a wedding, or get a reliable car for an outstation
        trip to Patna or Kathmandu. MithilaVahan is built specifically for these local needs, in
        your region and your language.
      </P>

      <H2>What makes us different</H2>
      <P>
        We connect riders directly with local, verified drivers — you pay the driver directly by
        cash or UPI, with no commission taken by us. You get live tracking so you can watch your
        ride arrive, safety features like SOS and trip sharing, and support for everything from a
        quick in-city auto to a full-day bus hire or a long outstation trip.
      </P>

      <H2>For vehicle owners</H2>
      <P>
        If you own a car, auto, tempo, bus or truck, you can list it on MithilaVahan and earn from
        local rides, day hires and outstation trips — keeping 100% of your fare.{' '}
        <Link to="/register" className="text-brand-600 font-medium">Register as a driver</Link>.
      </P>

      <H2>Where we operate</H2>
      <P>
        We’re starting in Darbhanga and Muzaffarpur, and growing across Mithilanchal from there.
      </P>
    </LegalLayout>
  );
}

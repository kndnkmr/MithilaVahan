import LegalLayout, { H2, P, UL } from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How MithilaVahan handles your information."
      updated="August 2026"
    >
      <P>
        This policy explains what information MithilaVahan collects, why, and how we use it. We
        aim to collect only what we need to run the service.
      </P>

      <H2>What we collect</H2>
      <UL
        items={[
          'Account details: your name, phone number, city, and optional email.',
          'For drivers: vehicle details, documents (licence, RC, insurance) for verification, and payment details (UPI ID / QR) you choose to add.',
          'Trip details: pickup/drop, destination, timing, and status.',
          'Location: your device location (only when you allow it) to find nearby drivers and enable live tracking during a trip.',
          'Emergency contact: if you add one, it is used only for the SOS feature.',
        ]}
      />

      <H2>How we use it</H2>
      <UL
        items={[
          'To connect riders with drivers and run trips.',
          'To show live tracking and enable safety features (SOS, trip sharing).',
          'To send trip updates and notifications.',
          'To keep the platform safe and prevent misuse.',
        ]}
      />

      <H2>What we do NOT do</H2>
      <UL
        items={[
          'We do not sell your personal data.',
          'We do not collect or process your payment money — payments are made directly between rider and driver by cash/UPI.',
          'The public trip-share link deliberately shows only trip status, the driver’s first name, vehicle and live location — never phone numbers.',
        ]}
      />

      <H2>Location</H2>
      <P>
        Location is used only while relevant — to find nearby drivers when you book, and to show
        the driver moving during an active trip. You can deny location access; the app still works
        (it falls back to city-wide matching).
      </P>

      <H2>Data retention & your choices</H2>
      <P>
        You can update your details in your account. If you want your account deactivated, contact
        us. Trip records may be retained for operational and safety purposes.
      </P>

      <H2>Contact</H2>
      <P>For any privacy questions, reach us through the website’s contact options.</P>
    </LegalLayout>
  );
}

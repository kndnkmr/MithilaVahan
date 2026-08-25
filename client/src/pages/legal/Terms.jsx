import LegalLayout, { H2, P, UL } from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="The rules for using MithilaVahan."
      updated="August 2026"
    >
      <P>
        Welcome to MithilaVahan. By using our website or app, you agree to these terms. Please
        read them carefully. MithilaVahan is operated as a local transport marketplace serving
        Darbhanga, Muzaffarpur and nearby areas of Mithilanchal, Bihar.
      </P>

      <H2>1. What MithilaVahan is</H2>
      <P>
        MithilaVahan is an intermediary platform that connects riders who need transport with
        local vehicle owners and drivers who offer it. We do not own the vehicles, employ the
        drivers, or operate the trips ourselves. Each trip is a direct arrangement between the
        rider and the driver/owner.
      </P>

      <H2>2. Accounts</H2>
      <UL
        items={[
          'You must provide accurate details when registering (name, phone number, city).',
          'You are responsible for keeping your login secure.',
          'Drivers must be approved by our team, with valid documents, before accepting trips.',
          'You must be legally allowed to use the service and, for drivers, to operate the vehicle.',
        ]}
      />

      <H2>3. Bookings & fares</H2>
      <UL
        items={[
          'Fare estimates shown are indicative. The driver confirms the final fare for the trip.',
          'Payment is made directly to the driver by cash or UPI. MithilaVahan does not collect fares or hold your money.',
          'You are responsible for paying the agreed fare after the trip.',
        ]}
      />

      <H2>4. Conduct & safety</H2>
      <UL
        items={[
          'Riders and drivers must behave respectfully and lawfully.',
          'Do not use the platform for anything illegal or unsafe.',
          'Use the SOS and trip-sharing features responsibly; misuse may lead to account suspension.',
          'We may suspend or remove any account that violates these terms.',
        ]}
      />

      <H2>5. Our role & liability</H2>
      <P>
        Because MithilaVahan only connects riders and drivers, we are not liable for the conduct
        of any rider or driver, the condition of any vehicle, delays, disputes, or any loss during
        a trip. Riders and drivers deal with each other at their own discretion. We work to verify
        drivers and vehicles, but we cannot guarantee any outcome.
      </P>

      <H2>6. Changes</H2>
      <P>
        We may update these terms as the service grows. Continued use after changes means you
        accept the updated terms.
      </P>

      <H2>7. Contact</H2>
      <P>
        Questions about these terms? Reach us through the contact options on the website.
      </P>
    </LegalLayout>
  );
}

import LegalLayout, { H2, P, UL } from './LegalLayout';

export default function CancellationRefund() {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      subtitle="How cancellations and refunds work on MithilaVahan."
      updated="August 2026"
    >
      <H2>Cancellations</H2>
      <UL
        items={[
          'A rider can cancel a trip that is still Requested or Accepted, from the My Trips page.',
          'A driver can also cancel before starting, if something comes up.',
          'Please cancel as early as possible out of courtesy to the other person.',
        ]}
      />

      <H2>Refunds</H2>
      <P>
        MithilaVahan does not collect fares and never holds your money — payment is made directly
        to the driver by cash or UPI, only after the trip. Because of this, there is normally
        nothing for MithilaVahan to refund.
      </P>
      <UL
        items={[
          'If you cancel before paying, no money has changed hands — there is nothing to refund.',
          'If any advance or payment was made directly to a driver and a dispute arises, it is settled directly between the rider and the driver.',
          'MithilaVahan does not take any commission, so we do not deduct or hold any part of your fare.',
        ]}
      />

      <H2>Disputes</H2>
      <P>
        If you have a problem with a driver or a trip, contact us — while we are not a party to the
        payment, we take conduct seriously and can suspend accounts that misuse the platform.
      </P>
    </LegalLayout>
  );
}

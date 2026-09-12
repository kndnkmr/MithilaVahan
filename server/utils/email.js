// ============================================
// Email utility — Resend (mirrors the ProMedicoz setup)
// ============================================
// Resend is a simple email API (free tier ~100 emails/day). We use it to notify
// the admin when a vehicle/driver needs review, and the owner when their vehicle
// is approved/rejected.
//
// Setup (Render env vars):
//   RESEND_API_KEY  — from https://resend.com
//   FROM_EMAIL      — e.g. "MithilaVahan <noreply@mithilavahan.in>" (verified domain)
//                     or leave unset to use Resend's onboarding sender for testing
//   ADMIN_EMAIL     — where admin notifications go
//
// If RESEND_API_KEY is missing, every call no-ops gracefully (logged only) — the
// app keeps working, just without emails, until the key is set.

const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'MithilaVahan <onboarding@resend.dev>';
const SITE = 'https://mithilavahan.in';

async function sendEmail({ to, subject, html }) {
  try {
    if (!resend) {
      console.log('Email skipped (RESEND_API_KEY not set):', { to, subject });
      return { success: false, reason: 'no-api-key' };
    }
    if (!to) return { success: false, reason: 'no-recipient' };
    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    console.log('Email sent:', { to, subject, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message }; // never throw — email must not break the flow
  }
}

// Small shared shell so all emails look consistent (brand orange header).
function shell(title, bodyHtml) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #c9611b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 20px;">🚕 MithilaVahan</h1>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
      <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
      ${bodyHtml}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        Automated notification from MithilaVahan. Do not reply to this email.
      </p>
    </div>
  </div>`;
}

function row(label, value) {
  return `<p style="margin: 4px 0; color: #374151;"><strong>${label}:</strong> ${value || '—'}</p>`;
}

// Notify the admin that a new vehicle needs review.
async function notifyAdminNewVehicle(vehicle, owner) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) { console.log('ADMIN_EMAIL not set — admin vehicle email skipped'); return { success: false, reason: 'no-admin-email' }; }
  const html = shell('New vehicle awaiting approval', `
    <p style="color:#4b5563;">A vehicle owner just listed a vehicle. Please review it in the admin panel.</p>
    <div style="background:#f9f5f0; padding:16px; border-radius:8px; margin:16px 0;">
      ${row('Type', vehicle.type)}
      ${row('Model', vehicle.model)}
      ${row('Reg. no', vehicle.registrationNumber)}
      ${row('City', vehicle.city)}
      ${row('Owner', owner?.name)}
      ${row('Owner phone', owner?.phone)}
    </div>
    <a href="${SITE}/admin" style="display:inline-block; background:#c9611b; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Review in admin</a>
  `);
  return sendEmail({ to, subject: 'New vehicle awaiting approval — MithilaVahan', html });
}

// Notify the owner that their vehicle was approved or rejected.
async function notifyOwnerVehicleStatus(vehicle, owner, status) {
  if (!owner?.email) { console.log('Owner has no email — status email skipped:', owner?.name); return { success: false, reason: 'no-owner-email' }; }
  const approved = status === 'approved';
  const html = shell(
    approved ? 'Your vehicle is approved 🎉' : 'Update on your vehicle',
    `
    <p style="color:#4b5563;">Hi ${owner.name || 'there'},</p>
    <p style="color:#4b5563;">${
      approved
        ? `Your ${vehicle.type} (${vehicle.model}) is now approved and visible to riders. Go online to start receiving trips.`
        : `Your ${vehicle.type} (${vehicle.model}) listing was not approved this time. Please review the details/documents and re-submit, or contact support.`
    }</p>
    <div style="background:#f9f5f0; padding:16px; border-radius:8px; margin:16px 0;">
      ${row('Type', vehicle.type)}
      ${row('Model', vehicle.model)}
      ${row('Reg. no', vehicle.registrationNumber)}
      ${row('Status', status)}
    </div>
    <a href="${SITE}/driver" style="display:inline-block; background:#c9611b; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Open dashboard</a>
  `);
  return sendEmail({
    to: owner.email,
    subject: approved ? 'Your vehicle is approved — MithilaVahan' : 'Vehicle listing update — MithilaVahan',
    html,
  });
}

module.exports = { sendEmail, notifyAdminNewVehicle, notifyOwnerVehicleStatus };

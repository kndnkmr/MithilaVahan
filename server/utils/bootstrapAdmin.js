// Creates/promotes the first admin from env vars (idempotent).
// Set ADMIN_PHONE + ADMIN_PASSWORD in .env to use.

const User = require('../models/User');
const { formatPhone } = require('./formatPhone');

async function bootstrapAdmin() {
  const rawPhone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!rawPhone || !password) return; // nothing configured — skip

  const phone = formatPhone(rawPhone);
  const existing = await User.findOne({ phone });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Promoted existing user ${phone} to admin.`);
    }
    return;
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'Administrator',
    phone,
    password,
    role: 'admin',
  });
  console.log(`Admin account created for ${phone}.`);
}

module.exports = { bootstrapAdmin };

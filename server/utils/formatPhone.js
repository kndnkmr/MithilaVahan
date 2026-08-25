// Normalises Indian phone numbers to a consistent +91XXXXXXXXXX form.

function formatPhone(input) {
  if (!input) return input;
  // keep digits only
  let digits = String(input).replace(/\D/g, '');
  // drop leading country code / zeros
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(-10);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return '+91' + digits.slice(-10);
}

// Basic validity check for a 10-digit Indian mobile (starts 6-9)
function isValidIndianPhone(input) {
  const digits = String(input || '').replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits);
}

module.exports = { formatPhone, isValidIndianPhone };

// Shared "driver setup completeness" rule.
// Used by the admin drivers list (server) and mirrored on the client checklist,
// so both show the SAME steps and status. Keep this the single source of truth.

// steps a driver must complete before they can accept trips.
function getDriverSetup(driver, hasVehicle) {
  const docs = driver.documents || {};
  const steps = [
    {
      key: 'details',
      label: 'Add your details',
      done: !!(driver.city && driver.whatsappNumber),
    },
    {
      key: 'documents',
      label: 'Submit documents',
      done: !!(docs.drivingLicense && docs.rcBook && docs.insurance),
    },
    {
      key: 'vehicle',
      label: 'Add a vehicle',
      done: !!hasVehicle,
    },
    {
      key: 'payment',
      label: 'Add payment details (UPI)',
      done: !!(driver.upiNumber || driver.upiId),
    },
    {
      key: 'approval',
      label: 'Admin approval',
      done: driver.driverStatus === 'approved',
    },
  ];

  const missing = steps.filter((s) => !s.done).map((s) => s.label);
  return {
    steps,
    complete: missing.length === 0,
    missing,
    doneCount: steps.filter((s) => s.done).length,
    total: steps.length,
  };
}

module.exports = { getDriverSetup };

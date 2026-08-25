// Driver onboarding checklist — shows the steps a driver must complete before
// they can accept trips, with a progress bar and deep links to each step.
// Mirrors the server-side getDriverSetup rule so it stays consistent.

// Compute the steps from the current user + their vehicles.
function computeSteps(user, vehicles) {
  const docs = user?.documents || {};
  const hasVehicle = Array.isArray(vehicles) && vehicles.length > 0;
  return [
    { key: 'details', label: 'Add your details', hint: 'City & WhatsApp number', tab: 'payment',
      done: !!(user?.city && user?.whatsappNumber) },
    { key: 'documents', label: 'Submit documents', hint: 'Licence, RC, insurance', tab: 'payment',
      done: !!(docs.drivingLicense && docs.rcBook && docs.insurance) },
    { key: 'vehicle', label: 'Add a vehicle', hint: 'Type, model, photos, rates', tab: 'vehicles',
      done: hasVehicle },
    { key: 'payment', label: 'Add payment details', hint: 'Your UPI ID / QR', tab: 'payment',
      done: !!user?.upiId },
    { key: 'approval', label: 'Get approved', hint: 'Our team reviews your details', tab: null,
      done: user?.driverStatus === 'approved' },
  ];
}

export default function OnboardingChecklist({ user, vehicles, onGoToTab }) {
  const steps = computeSteps(user, vehicles);
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = done === total;

  // Once fully set up, don't clutter the dashboard.
  if (allDone) return null;

  const pct = Math.round((done / total) * 100);

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">Finish setting up to start earning</h3>
        <span className="text-sm text-gray-500">{done}/{total}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Complete these steps and get approved — then go online to accept trips.
      </p>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
              s.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s.done ? '✓' : i + 1}
            </span>
            <div className="flex-1">
              <div className={`text-sm font-medium ${s.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {s.label}
              </div>
              <div className="text-xs text-gray-400">{s.hint}</div>
            </div>
            {!s.done && s.tab && (
              <button
                onClick={() => onGoToTab(s.tab)}
                className="text-brand-600 text-sm font-medium shrink-0"
              >
                Do this →
              </button>
            )}
            {!s.done && !s.tab && (
              <span className="text-xs text-yellow-600 shrink-0">Pending</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

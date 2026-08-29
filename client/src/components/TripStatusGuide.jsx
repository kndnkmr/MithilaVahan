// A small step-by-step guide banner shown on a trip, tailored to the trip's
// current status and whether a rider or driver is viewing it. Bilingual so it
// helps local users. Keeps everyone clear on "what's happening / what to do next".

const GUIDE = {
  requested: {
    rider: {
      title: 'Finding you a driver…',
      body: 'We’ve sent your request to nearby drivers. You’ll be notified when one accepts.',
      hi: 'आपका अनुरोध पास के ड्राइवरों को भेज दिया गया है। स्वीकार होने पर आपको सूचना मिलेगी।',
    },
    driver: {
      title: 'New request',
      body: 'Tap Accept to take this trip. The nearest driver who accepts gets it.',
      hi: 'यह यात्रा लेने के लिए Accept दबाएँ।',
    },
  },
  accepted: {
    rider: {
      title: 'Driver is on the way',
      body: 'Your driver has accepted and is heading to your pickup. Track them on the map, or call/WhatsApp to share your exact spot.',
      hi: 'ड्राइवर आपके पिकअप की ओर आ रहा है। नक्शे पर देखें, या कॉल/WhatsApp पर सटीक जगह बताएँ।',
    },
    driver: {
      title: 'Head to pickup',
      body: 'Go to the rider’s pickup point. Call or WhatsApp them to confirm the exact location. Tap “Start trip” once the rider is with you.',
      hi: 'यात्री के पिकअप पर जाएँ। सटीक जगह के लिए कॉल/WhatsApp करें। यात्री के आने पर “Start trip” दबाएँ।',
    },
  },
  started: {
    rider: {
      title: 'Trip in progress',
      body: 'Enjoy your ride. You can share the trip link with family or use SOS if needed. Pay the driver after the trip.',
      hi: 'यात्रा चल रही है। ज़रूरत पर ट्रिप लिंक शेयर करें या SOS दबाएँ। यात्रा के बाद ड्राइवर को भुगतान करें।',
    },
    driver: {
      title: 'On the trip',
      body: 'Drive safely to the drop. Tap “Complete” at the end and enter the final fare.',
      hi: 'ड्रॉप तक सुरक्षित चलाएँ। अंत में “Complete” दबाएँ और अंतिम किराया डालें।',
    },
  },
  completed: {
    rider: {
      title: 'Trip completed',
      body: 'Please pay the driver (cash/UPI) if not done, confirm payment, and rate your driver.',
      hi: 'कृपया ड्राइवर को भुगतान करें (नकद/UPI), पुष्टि करें, और रेटिंग दें।',
    },
    driver: {
      title: 'Trip completed',
      body: 'Collect the fare (cash/UPI) and confirm payment received.',
      hi: 'किराया लें (नकद/UPI) और भुगतान की पुष्टि करें।',
    },
  },
};

export default function TripStatusGuide({ status, role }) {
  const g = GUIDE[status]?.[role];
  if (!g) return null;
  return (
    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 mb-2 text-sm">
      <div className="font-semibold text-brand-800">{g.title}</div>
      <div className="text-gray-600">{g.body}</div>
      <div className="text-gray-500 text-xs mt-0.5">{g.hi}</div>
    </div>
  );
}

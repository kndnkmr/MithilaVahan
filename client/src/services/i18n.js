// Lightweight bilingual support (English / हिंदी) — no i18n framework.
// A flat dictionary keyed by string id, with a tiny hook that reads the
// language from localStorage ('mv_lang') and re-renders on change.
//
// Rule: only fixed UI labels are translated. Anything a DRIVER types
// (names, vehicle models, addresses) is always shown as-is — never machine
// translated. The Hindi copy here should be proofread by a native speaker
// before being treated as final.

import { useSyncExternalStore } from 'react';

const KEY = 'mv_lang';

// --- change notification so the whole app re-renders on language switch ---
const listeners = new Set();
function emit() {
  listeners.forEach((l) => l());
}
export function setLang(lang) {
  localStorage.setItem(KEY, lang);
  emit();
}
export function getLang() {
  return localStorage.getItem(KEY) || 'en';
}
function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// The dictionary: id -> { en, hi }
const DICT = {
  // nav / common
  login: { en: 'Login', hi: 'लॉगिन' },
  register: { en: 'Register', hi: 'रजिस्टर' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  book: { en: 'Book', hi: 'बुक करें' },
  myTrips: { en: 'My Trips', hi: 'मेरी यात्राएँ' },
  getApp: { en: 'Get App', hi: 'ऐप लें' },
  explore: { en: 'Explore', hi: 'घूमें' },
  refer: { en: 'Refer', hi: 'रेफर करें' },
  support: { en: 'Support', hi: 'सहायता' },
  blog: { en: 'Blog', hi: 'ब्लॉग' },

  // home
  heroTitle: { en: 'Rent vehicles & book rides across Mithilanchal', hi: 'मिथिलांचल में वाहन किराए पर लें और सवारी बुक करें' },
  heroSub: { en: 'Cars, autos, tempos, buses and trucks — with a driver. Live tracking, verified drivers, pay directly — no commission.', hi: 'कार, ऑटो, टेम्पो, बस और ट्रक — ड्राइवर के साथ। लाइव ट्रैकिंग, सत्यापित ड्राइवर, सीधे भुगतान — कोई कमीशन नहीं।' },
  getStarted: { en: 'Get started', hi: 'शुरू करें' },
  bookRide: { en: 'Book a ride', hi: 'सवारी बुक करें' },
  whatNeed: { en: 'What do you need?', hi: 'आपको क्या चाहिए?' },
  tapVehicle: { en: 'Tap a vehicle to start booking', hi: 'बुकिंग शुरू करने के लिए वाहन चुनें' },
  popularRoutes: { en: 'Popular routes from Darbhanga', hi: 'दरभंगा से लोकप्रिय रूट' },
  tapToBook: { en: 'Tap to book an outstation trip', hi: 'आउटस्टेशन यात्रा बुक करने के लिए टैप करें' },
  ownVehicle: { en: 'Own a vehicle?', hi: 'क्या आपके पास वाहन है?' },
  registerDriver: { en: 'Register as a driver', hi: 'ड्राइवर के रूप में रजिस्टर करें' },
  faq: { en: 'Frequently asked questions', hi: 'अक्सर पूछे जाने वाले प्रश्न' },

  // booking form
  bookTitle: { en: 'Book a ride, hire, or outstation trip', hi: 'सवारी, किराया, या आउटस्टेशन यात्रा बुक करें' },
  city: { en: 'City', hi: 'शहर' },
  selectCity: { en: 'Select city', hi: 'शहर चुनें' },
  bookingType: { en: 'Booking type', hi: 'बुकिंग प्रकार' },
  inCity: { en: 'In-city', hi: 'शहर के अंदर' },
  hire: { en: 'Hire', hi: 'किराया' },
  outstation: { en: 'Outstation', hi: 'आउटस्टेशन' },
  vehicleType: { en: 'Vehicle type', hi: 'वाहन प्रकार' },
  pickup: { en: 'Pickup location', hi: 'पिकअप स्थान' },
  drop: { en: 'Drop location', hi: 'ड्रॉप स्थान' },
  destination: { en: 'Destination (where to?)', hi: 'गंतव्य (कहाँ जाना है?)' },
  when: { en: 'When', hi: 'कब' },
  now: { en: 'Now', hi: 'अभी' },
  schedule: { en: 'Schedule', hi: 'शेड्यूल' },
  estFare: { en: 'Estimated fare', hi: 'अनुमानित किराया' },
  payment: { en: 'Payment', hi: 'भुगतान' },
  requestTrip: { en: 'Request trip', hi: 'यात्रा अनुरोध करें' },
  requesting: { en: 'Requesting…', hi: 'अनुरोध हो रहा है…' },
  notesPlaceholder: { en: 'Notes for the driver (optional)', hi: 'ड्राइवर के लिए नोट (वैकल्पिक)' },
};

// The hook: const t = useT(); then t('login')
export function useT() {
  const lang = useSyncExternalStore(subscribe, getLang, () => 'en');
  return (id) => {
    const entry = DICT[id];
    if (!entry) return id;
    return entry[lang] || entry.en;
  };
}

// Non-hook access to current language (for one-off conditionals)
export function useLang() {
  return useSyncExternalStore(subscribe, getLang, () => 'en');
}

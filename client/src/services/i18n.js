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
  vehicles: { en: 'Vehicles', hi: 'वाहन' },

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

  // --- trip modes & status ---
  modeTrip: { en: 'Trip', hi: 'यात्रा' },
  modeOutstation: { en: 'Outstation', hi: 'आउटस्टेशन' },
  modeHire: { en: 'Hire', hi: 'किराया' },
  stRequested: { en: 'requested', hi: 'अनुरोधित' },
  stAccepted: { en: 'accepted', hi: 'स्वीकृत' },
  stStarted: { en: 'started', hi: 'शुरू' },
  stCompleted: { en: 'completed', hi: 'पूर्ण' },
  stCancelled: { en: 'cancelled', hi: 'रद्द' },

  // --- trip card details ---
  navigate: { en: 'Navigate', hi: 'रास्ता' },
  toLabel: { en: 'To', hi: 'गंतव्य' },
  roundTrip: { en: 'round trip', hi: 'राउंड ट्रिप' },
  oneWay: { en: 'one way', hi: 'वन-वे' },
  approxDistance: { en: 'Approx distance', hi: 'अनुमानित दूरी' },
  whenLabel: { en: 'When', hi: 'कब' },
  estimateLabel: { en: 'Estimate', hi: 'अनुमान' },
  fareLabel: { en: 'Fare', hi: 'किराया' },
  platformFee: { en: 'Platform fee', hi: 'प्लेटफ़ॉर्म शुल्क' },
  youKeep: { en: 'you keep', hi: 'आपको मिलेगा' },
  driverLabel: { en: 'Driver', hi: 'ड्राइवर' },
  riderLabel: { en: 'Rider', hi: 'यात्री' },
  newDriver: { en: 'New driver', hi: 'नया ड्राइवर' },
  loadingDots: { en: 'Loading…', hi: 'लोड हो रहा है…' },
  noWrittenReviews: { en: 'No written reviews yet.', hi: 'अभी कोई लिखित समीक्षा नहीं।' },
  seeReviews: { en: 'See reviews', hi: 'समीक्षाएँ देखें' },
  hideReviews: { en: 'Hide reviews', hi: 'समीक्षाएँ छिपाएँ' },

  // --- payment ---
  payByUpi: { en: 'Pay directly to your driver by UPI', hi: 'UPI से सीधे अपने ड्राइवर को भुगतान करें' },
  upiNumberLabel: { en: 'UPI number', hi: 'UPI नंबर' },
  upiIdLabel: { en: 'UPI ID', hi: 'UPI आईडी' },
  noUpiDetails: { en: "Driver hasn't added UPI details — pay by cash or ask on WhatsApp.", hi: 'ड्राइवर ने UPI जानकारी नहीं दी — नकद दें या WhatsApp पर पूछें।' },
  ivePaid: { en: "I've paid", hi: 'मैंने भुगतान कर दिया' },
  waitingConfirm: { en: 'Waiting for the driver to confirm your payment…', hi: 'ड्राइवर द्वारा भुगतान की पुष्टि का इंतज़ार…' },
  paymentReceived: { en: 'Payment received', hi: 'भुगतान मिल गया' },
  awaitingPayment: { en: 'Awaiting payment from rider.', hi: 'यात्री से भुगतान का इंतज़ार।' },
  paymentConfirmed: { en: '✓ Payment confirmed', hi: '✓ भुगतान की पुष्टि हुई' },

  // --- contact buttons (role-aware suffix appended in code) ---
  call: { en: 'Call', hi: 'कॉल' },
  whatsapp: { en: 'WhatsApp', hi: 'WhatsApp' },

  // --- trip actions ---
  accept: { en: 'Accept', hi: 'स्वीकारें' },
  startTrip: { en: 'Start trip', hi: 'यात्रा शुरू करें' },
  complete: { en: 'Complete', hi: 'पूरा करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  rateDriver: { en: 'Rate driver', hi: 'ड्राइवर को रेट करें' },
  youRated: { en: 'You rated', hi: 'आपने रेट किया' },

  // --- MyTrips ---
  myTripsTitle: { en: 'My trips', hi: 'मेरी यात्राएँ' },
  noTripsYet: { en: 'No trips yet.', hi: 'अभी कोई यात्रा नहीं।' },
  shareTrip: { en: 'Share trip', hi: 'यात्रा साझा करें' },
  sos: { en: 'SOS', hi: 'SOS' },
  cancelTripTitle: { en: 'Cancel trip', hi: 'यात्रा रद्द करें' },
  cancelTripDesc: { en: 'Optionally tell us why you’re cancelling.', hi: 'चाहें तो बताएँ कि आप क्यों रद्द कर रहे हैं।' },
  reasonOptional: { en: 'Reason (optional)', hi: 'कारण (वैकल्पिक)' },
  keepTrip: { en: 'Keep trip', hi: 'यात्रा रखें' },
  rateYourDriver: { en: 'Rate your driver', hi: 'अपने ड्राइवर को रेट करें' },
  howWasTrip: { en: 'How was your trip?', hi: 'आपकी यात्रा कैसी रही?' },
  ratingField: { en: 'Rating (1-5)', hi: 'रेटिंग (1-5)' },
  commentOptional: { en: 'Comment (optional)', hi: 'टिप्पणी (वैकल्पिक)' },
  submitRating: { en: 'Submit rating', hi: 'रेटिंग सबमिट करें' },
  raiseSosTitle: { en: 'Raise an SOS?', hi: 'SOS भेजें?' },
  sosWarning: { en: 'This alerts the MithilaVahan team immediately and opens a WhatsApp alert to your emergency contact. Use only if you feel unsafe.', hi: 'यह तुरंत MithilaVahan टीम को सूचित करता है और आपके आपातकालीन संपर्क को WhatsApp अलर्ट भेजता है। केवल असुरक्षित महसूस होने पर उपयोग करें।' },
  raiseSos: { en: 'Raise SOS', hi: 'SOS भेजें' },

  // --- Driver dashboard ---
  driverDashboard: { en: 'Driver dashboard', hi: 'ड्राइवर डैशबोर्ड' },
  online: { en: 'Online', hi: 'ऑनलाइन' },
  goOnline: { en: 'Go online', hi: 'ऑनलाइन जाएँ' },
  saving: { en: 'Saving…', hi: 'सहेजा जा रहा है…' },
  onlineHint: { en: 'You are online — you can receive trip requests.', hi: 'आप ऑनलाइन हैं — आपको यात्रा अनुरोध मिल सकते हैं।' },
  offlineHint: { en: 'You are offline — go online to receive trip requests.', hi: 'आप ऑफ़लाइन हैं — अनुरोध पाने के लिए ऑनलाइन जाएँ।' },
  tabRequests: { en: 'Requests', hi: 'अनुरोध' },
  tabActive: { en: 'My trips', hi: 'मेरी यात्राएँ' },
  tabProfile: { en: 'Profile & Docs', hi: 'प्रोफ़ाइल व दस्तावेज़' },
  tabVehicles: { en: 'My vehicles', hi: 'मेरे वाहन' },
  tabPayment: { en: 'Payment', hi: 'भुगतान' },
  approvalPending: { en: 'Approval pending — no requests yet.', hi: 'अनुमोदन लंबित — अभी कोई अनुरोध नहीं।' },
  offlinePrompt: { en: "You're offline. Go online to start receiving trip requests.", hi: 'आप ऑफ़लाइन हैं। यात्रा अनुरोध पाने के लिए ऑनलाइन जाएँ।' },
  noOpenRequests: { en: 'No open requests right now. Stay online — new requests appear here automatically.', hi: 'अभी कोई खुला अनुरोध नहीं। ऑनलाइन रहें — नए अनुरोध यहाँ अपने-आप दिखेंगे।' },
  completeTripTitle: { en: 'Complete trip', hi: 'यात्रा पूरी करें' },
  completeTripDesc: { en: 'Confirm the final fare the rider will pay. Leave as-is to use the estimate.', hi: 'यात्री जो अंतिम किराया देगा उसकी पुष्टि करें। अनुमान उपयोग करने के लिए वैसे ही छोड़ दें।' },
  finalFare: { en: 'Final fare (₹)', hi: 'अंतिम किराया (₹)' },

  // --- Auth (Login / Register) ---
  phone: { en: 'Phone number', hi: 'फ़ोन नंबर' },
  password: { en: 'Password', hi: 'पासवर्ड' },
  name: { en: 'Full name', hi: 'पूरा नाम' },
  iAmA: { en: 'I am a', hi: 'मैं हूँ' },
  rider: { en: 'Rider', hi: 'यात्री' },
  driverOwner: { en: 'Driver / Owner', hi: 'ड्राइवर / मालिक' },
  loggingIn: { en: 'Logging in…', hi: 'लॉगिन हो रहा है…' },
  creatingAccount: { en: 'Creating account…', hi: 'खाता बन रहा है…' },
  noAccount: { en: "Don't have an account?", hi: 'खाता नहीं है?' },
  haveAccount: { en: 'Already have an account?', hi: 'पहले से खाता है?' },
  createAccount: { en: 'Create account', hi: 'खाता बनाएँ' },
  welcomeBack: { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },

  // --- Driver: Profile & Documents tab ---
  yourDetails: { en: 'Your details', hi: 'आपकी जानकारी' },
  yourDetailsSub: { en: 'Riders and our team use these to reach and verify you.', hi: 'यात्री और हमारी टीम आपसे संपर्क व सत्यापन के लिए इनका उपयोग करते हैं।' },
  selectYourCity: { en: 'Select your city', hi: 'अपना शहर चुनें' },
  whatsappNumber: { en: 'WhatsApp number', hi: 'WhatsApp नंबर' },
  documents: { en: 'Documents', hi: 'दस्तावेज़' },
  documentsSub: { en: 'Take a clear photo of each paper with your phone and upload it. Required before your account is approved.', hi: 'हर कागज़ की साफ़ फ़ोटो खींचकर अपलोड करें। अप्रूवल के लिए ज़रूरी है।' },
  drivingLicence: { en: 'Driving licence', hi: 'ड्राइविंग लाइसेंस' },
  rcBook: { en: 'RC book (vehicle registration)', hi: 'RC बुक (गाड़ी रजिस्ट्रेशन)' },
  insurance: { en: 'Insurance', hi: 'बीमा (इंश्योरेंस)' },
  uploading: { en: 'Uploading…', hi: 'अपलोड हो रहा है…' },
  replacePhoto: { en: 'Replace photo', hi: 'फ़ोटो बदलें' },
  uploadPhoto: { en: '📷 Upload photo', hi: '📷 फ़ोटो अपलोड करें' },
  saveDetails: { en: 'Save details', hi: 'जानकारी सहेजें' },

  // --- Driver: Payment tab ---
  yourPaymentDetails: { en: 'Your payment details', hi: 'आपकी भुगतान जानकारी' },
  paymentSub: { en: 'Riders pay you directly by UPI — the platform never holds your money and takes no cut.', hi: 'यात्री आपको सीधे UPI से भुगतान करते हैं — प्लेटफ़ॉर्म आपका पैसा नहीं रखता और कोई कमीशन नहीं लेता।' },
  upiNumberField: { en: 'UPI number (mobile linked to UPI)', hi: 'UPI नंबर (UPI से जुड़ा मोबाइल)' },
  upiIdField: { en: 'UPI ID (optional)', hi: 'UPI आईडी (वैकल्पिक)' },
  upiQrField: { en: 'UPI QR image (optional)', hi: 'UPI QR इमेज (वैकल्पिक)' },
  replaceQr: { en: 'Replace QR image', hi: 'QR इमेज बदलें' },
  uploadQr: { en: 'Upload your UPI QR', hi: 'अपना UPI QR अपलोड करें' },
  qrScanHint: { en: 'Riders scan this to pay you.', hi: 'यात्री इसे स्कैन करके आपको भुगतान करते हैं।' },
  save: { en: 'Save', hi: 'सहेजें' },

  // --- Driver: Add vehicle form ---
  addVehicle: { en: 'Add a vehicle', hi: 'वाहन जोड़ें' },
  vehicleModel: { en: 'Model', hi: 'मॉडल' },
  registrationNo: { en: 'Registration no.', hi: 'रजिस्ट्रेशन नंबर' },
  seatingCapacity: { en: 'Seating capacity', hi: 'बैठने की क्षमता' },
  baseFareField: { en: 'Base fare (₹)', hi: 'बेस किराया (₹)' },
  perKmField: { en: 'Per km (₹)', hi: 'प्रति किमी (₹)' },
  perDayField: { en: 'Per day (₹)', hi: 'प्रति दिन (₹)' },
  vehiclePhotos: { en: 'Vehicle photos', hi: 'वाहन की फ़ोटो' },
  photosHint: { en: 'Add up to 4 photos so riders can see your vehicle.', hi: 'यात्री आपकी गाड़ी देख सकें, इसके लिए 4 तक फ़ोटो जोड़ें।' },
  addingBtn: { en: 'Adding…', hi: 'जोड़ा जा रहा है…' },
  addVehicleBtn: { en: 'Add vehicle', hi: 'वाहन जोड़ें' },
  noVehiclesYet: { en: 'No vehicles yet. Add one below.', hi: 'अभी कोई वाहन नहीं। नीचे जोड़ें।' },
  selectCityShort: { en: 'Select city', hi: 'शहर चुनें' },

  // --- Driver onboarding checklist ---
  obTitle: { en: 'Finish setting up to start earning', hi: 'कमाई शुरू करने के लिए सेटअप पूरा करें' },
  obSub: { en: 'Complete these steps and get approved — then go online to accept trips.', hi: 'ये चरण पूरे करें और अप्रूवल पाएँ — फिर ऑनलाइन जाकर यात्राएँ लें।' },
  obDoThis: { en: 'Do this', hi: 'यह करें' },
  obPendingStep: { en: 'Pending', hi: 'लंबित' },
  obDetails: { en: 'Add your details', hi: 'अपनी जानकारी जोड़ें' },
  obDetailsHint: { en: 'City & WhatsApp number', hi: 'शहर व WhatsApp नंबर' },
  obDocs: { en: 'Submit documents', hi: 'दस्तावेज़ जमा करें' },
  obDocsHint: { en: 'Licence, RC, insurance', hi: 'लाइसेंस, RC, बीमा' },
  obVehicle: { en: 'Add a vehicle', hi: 'वाहन जोड़ें' },
  obVehicleHint: { en: 'Type, model, photos, rates', hi: 'प्रकार, मॉडल, फ़ोटो, दरें' },
  obPayment: { en: 'Add payment details', hi: 'भुगतान जानकारी जोड़ें' },
  obPaymentHint: { en: 'UPI number or ID', hi: 'UPI नंबर या आईडी' },
  obApproval: { en: 'Get approved', hi: 'अप्रूवल पाएँ' },
  obApprovalHint: { en: 'Our team reviews your details', hi: 'हमारी टीम आपकी जानकारी जाँचती है' },
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

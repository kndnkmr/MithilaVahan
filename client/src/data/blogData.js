// Blog articles — original local travel content for Mithilanchal, tied to the
// routes/services MithilaVahan offers (so each article can lead to a booking).
// Content is written original (never copied). `image` reuses verified free
// Unsplash photos. `cta` links to a relevant booking/destination.
//
// To add an article: add an entry here AND add its /blog/<slug> to
// client/public/sitemap.xml.

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=1000&q=70&auto=format&fit=crop`;

export const ARTICLES = [
  {
    slug: 'darbhanga-to-patna-taxi-guide',
    title: 'Darbhanga to Patna by Taxi: Complete Travel Guide',
    description:
      'Distance, travel time, route, fares and tips for booking a Darbhanga to Patna taxi with a driver.',
    date: '2026-08-20',
    readTime: '4 min',
    image: IMG('1477587458883-47145ed94245'),
    cta: { label: 'Book Darbhanga → Patna', to: '/destinations/patna' },
    body: [
      { type: 'p', text: 'Patna is the most common outstation trip from Darbhanga — for the airport, hospitals, government offices, universities and pilgrimage to Takht Sri Patna Sahib. Here’s everything you need to plan the journey by road.' },
      { type: 'h', text: 'Distance and travel time' },
      { type: 'p', text: 'Darbhanga to Patna is roughly 140 km by road and usually takes about 3.5 hours, depending on traffic near Muzaffarpur and the Gandhi Setu / Ganga bridge approach into Patna. Leaving early in the morning avoids the worst of the city traffic.' },
      { type: 'h', text: 'Which vehicle to choose' },
      { type: 'p', text: 'For a family or a comfortable solo trip, a sedan or SUV is ideal. If you’re carrying luggage for a flight or moving between hospitals, an SUV gives more room. For groups, a tempo traveller works well.' },
      { type: 'h', text: 'One-way or round-trip?' },
      { type: 'p', text: 'If you’re dropping someone at the airport or staying in Patna, a one-way drop is cheaper. If you need the vehicle for the day (multiple stops, then back), a round-trip with the driver waiting is more convenient.' },
      { type: 'h', text: 'Booking tips' },
      { type: 'p', text: 'Book a day ahead for early-morning flights or trains. On MithilaVahan you can schedule the pickup time, see an instant fare estimate, track your driver live, and pay directly by cash or UPI — no commission.' },
    ],
  },
  {
    slug: 'places-to-visit-near-darbhanga',
    title: 'Top Places to Visit Near Darbhanga',
    description:
      'From Mithila art in Madhubani to pilgrimage sites and Janakpur across the Nepal border — great day trips and outings from Darbhanga.',
    date: '2026-08-18',
    readTime: '5 min',
    image: IMG('1524492412937-b28074a5d7da'),
    cta: { label: 'See all destinations', to: '/destinations' },
    body: [
      { type: 'p', text: 'Darbhanga sits at the heart of Mithilanchal, surrounded by places rich in art, faith and history. Here are some of the best trips you can make with a car or tempo and a local driver.' },
      { type: 'h', text: 'Madhubani — the home of Mithila art (~40 km)' },
      { type: 'p', text: 'Just an hour away, Madhubani is world-famous for its folk painting. Visit artist workshops, pick up authentic paintings, and soak in the local culture.' },
      { type: 'h', text: 'Sitamarhi — birthplace of Sita (~90 km)' },
      { type: 'p', text: 'A revered pilgrimage town believed to be where Sita was born. The Janaki Kund and temples make it a meaningful day trip.' },
      { type: 'h', text: 'Janakpur, Nepal — Janaki Mandir (~60 km)' },
      { type: 'p', text: 'Just across the border, Janakpur is home to the stunning Janaki Mandir. Carry a valid ID for the border crossing. It’s a short, rewarding trip.' },
      { type: 'h', text: 'Vaishali — ancient heritage (~90 km)' },
      { type: 'p', text: 'An ancient republic city sacred to Buddhists and Jains, with the Ashokan pillar and stupas. Pairs well as a full-day outing.' },
      { type: 'p', text: 'On MithilaVahan you can book any of these as an outstation trip, one-way or round-trip, with a verified local driver.' },
    ],
  },
  {
    slug: 'outstation-cab-tips',
    title: '7 Tips for a Comfortable Outstation Cab Trip',
    description:
      'Simple, practical tips to make your long-distance cab journey from Mithilanchal smooth, safe and fair.',
    date: '2026-08-15',
    readTime: '3 min',
    image: IMG('1519055548599-6d4d129508c4'),
    cta: { label: 'Book an outstation trip', to: '/book?mode=outstation' },
    body: [
      { type: 'p', text: 'A long road trip is much easier with a little planning. Here are seven tips for a comfortable outstation journey.' },
      { type: 'h', text: '1. Book a day in advance' },
      { type: 'p', text: 'For early departures and popular routes, booking ahead means a driver is ready and you’re not rushing.' },
      { type: 'h', text: '2. Confirm the fare upfront' },
      { type: 'p', text: 'Check the estimate and confirm the fare with the driver before starting, so there are no surprises. On MithilaVahan you also see an indicative estimate instantly.' },
      { type: 'h', text: '3. Share your trip' },
      { type: 'p', text: 'Use the trip-share link to let family follow your journey live, and keep an emergency contact saved for the SOS button.' },
      { type: 'h', text: '4. Plan rest stops' },
      { type: 'p', text: 'For journeys over 4-5 hours, agree on a couple of tea/food stops with the driver.' },
      { type: 'h', text: '5. Carry ID' },
      { type: 'p', text: 'Especially for cross-border trips to Nepal (Janakpur, Kathmandu), carry a valid photo ID.' },
      { type: 'h', text: '6. Choose the right vehicle' },
      { type: 'p', text: 'Match the vehicle to your group size and luggage — a sedan for a couple, an SUV or tempo for a family.' },
      { type: 'h', text: '7. Pay directly, keep it simple' },
      { type: 'p', text: 'Pay the driver directly by cash or UPI after the trip. MithilaVahan takes no commission.' },
    ],
  },
  {
    slug: 'hire-tempo-truck-goods-mithilanchal',
    title: 'Hiring a Tempo or Truck for Goods in Mithilanchal',
    description:
      'How to hire a tempo, pickup or truck with a driver for moving goods, shifting home, or events in and around Darbhanga and Muzaffarpur.',
    date: '2026-08-12',
    readTime: '3 min',
    image: IMG('1500382017468-9049fed747ef'),
    cta: { label: 'Hire a vehicle', to: '/book?mode=hire' },
    body: [
      { type: 'p', text: 'Sometimes you don’t need a ride — you need to move things. Whether it’s shifting home, transporting shop goods, or carrying materials for an event, a tempo, pickup or truck with a driver is the practical choice.' },
      { type: 'h', text: 'Pick the right size' },
      { type: 'p', text: 'A small tempo or pickup suits household shifting and small loads. For larger consignments, a full truck is better. Tell the driver roughly what you’re carrying so they bring the right vehicle.' },
      { type: 'h', text: 'Hire by the day' },
      { type: 'p', text: 'For multiple trips or a full day of loading and unloading, hiring by the day is simplest. Choose “Hire” on MithilaVahan and set the number of days.' },
      { type: 'h', text: 'Local drivers who know the routes' },
      { type: 'p', text: 'Our drivers are local to Mithilanchal, so they know the lanes, markets and shortcuts around Darbhanga and Muzaffarpur.' },
    ],
  },
  {
    slug: 'why-book-local-cab-mithilanchal',
    title: 'Why Book a Local Cab in Mithilanchal',
    description:
      'The advantages of booking with a local, verified driver for rides and rentals in Darbhanga, Muzaffarpur and nearby towns.',
    date: '2026-08-10',
    readTime: '3 min',
    image: IMG('1567157577867-05ccb1388e66'),
    cta: { label: 'Book a ride', to: '/book' },
    body: [
      { type: 'p', text: 'Big national apps focus on metros. For everyday travel in Mithilanchal, a local platform with local drivers simply works better. Here’s why.' },
      { type: 'h', text: 'Drivers who know the area' },
      { type: 'p', text: 'Local drivers know the roads, landmarks and shortcuts — from Tower Chowk to the railway station to villages around Darbhanga.' },
      { type: 'h', text: 'Fair, direct payment' },
      { type: 'p', text: 'You pay the driver directly by cash or UPI. MithilaVahan takes no commission, so pricing stays simple and fair for everyone.' },
      { type: 'h', text: 'Safety built in' },
      { type: 'p', text: 'Every driver and vehicle is verified before going live. During a trip you can track your driver on a map, share your trip with family, and raise an SOS if needed.' },
      { type: 'h', text: 'All kinds of vehicles' },
      { type: 'p', text: 'From an auto for a quick errand to a bus for a wedding or a truck for goods — book what you actually need, in your city and your language.' },
    ],
  },
  {
    slug: 'darbhanga-airport-taxi-guide',
    title: 'Darbhanga Airport (DBR) Taxi Guide: Pickup, Drop & Fares',
    description:
      'How to book a reliable taxi to or from Darbhanga Airport (DBR) — from Darbhanga city, Muzaffarpur, Madhubani and nearby towns, with fares and tips.',
    date: '2026-08-24',
    readTime: '4 min',
    image: IMG('1436491865332-7a61a109cc05'),
    cta: { label: 'Book an airport transfer', to: '/book?mode=airport' },
    body: [
      { type: 'p', text: 'Darbhanga Airport (DBR) has quickly become a key gateway for north Bihar, with flights to Delhi, Mumbai, Bengaluru and Kolkata. A pre-booked taxi takes the stress out of catching an early flight or getting home after landing.' },
      { type: 'h', text: 'From Darbhanga city' },
      { type: 'p', text: 'The airport is a short drive from the city centre. Book a car for a comfortable, on-time drop — and schedule it the night before so you’re never rushing for check-in.' },
      { type: 'h', text: 'From Muzaffarpur, Madhubani and beyond' },
      { type: 'p', text: 'Many flyers come from surrounding towns. An outstation-style airport transfer from Muzaffarpur (~65 km) or Madhubani (~40 km) is easy to book — one-way to the airport, or a pickup when you land.' },
      { type: 'h', text: 'Tips for airport trips' },
      { type: 'p', text: 'Always book with a buffer for traffic, keep your driver’s number handy (call or WhatsApp from the trip screen), and share your live trip link with family. For pickups, share your flight time so the driver can plan around delays.' },
      { type: 'h', text: 'How to book' },
      { type: 'p', text: 'On MithilaVahan, choose “Airport”, pick the direction (going to or coming from the airport), and select Darbhanga, Patna or Gaya airport. You’ll get an instant estimate and pay the driver directly.' },
    ],
  },
  {
    slug: 'darbhanga-to-kathmandu-by-road',
    title: 'Darbhanga to Kathmandu by Road: Route, Time & Tips',
    description:
      'Planning a road trip from Darbhanga to Kathmandu, Nepal? Here’s the route via Janakpur, travel time, border tips and how to book a comfortable cab.',
    date: '2026-08-22',
    readTime: '5 min',
    image: IMG('1506905925346-21bda4d32df4'),
    cta: { label: 'Book Darbhanga → Kathmandu', to: '/destinations/kathmandu' },
    body: [
      { type: 'p', text: 'Kathmandu is a bucket-list road trip from Mithilanchal — temples, heritage squares and Himalayan foothills, all reachable by car across the Nepal border. Here’s how to plan it.' },
      { type: 'h', text: 'The route' },
      { type: 'p', text: 'From Darbhanga you head towards the border near Janakpur, then on through the Nepali hills to Kathmandu — roughly 380 km, around 9 hours with stops. The final stretch is winding mountain road, so an experienced driver matters.' },
      { type: 'h', text: 'Border crossing' },
      { type: 'p', text: 'Carry a valid photo ID (and for longer stays, the right documents). The Indo-Nepal border is generally straightforward for Indian nationals, but plan for a short halt for formalities.' },
      { type: 'h', text: 'One-way or round-trip' },
      { type: 'p', text: 'Most travellers book a round-trip so the same driver and vehicle stay with them — convenient for a multi-day visit and for the return through the hills.' },
      { type: 'h', text: 'What to expect on fare' },
      { type: 'p', text: 'This is a long international road trip, so it’s priced by distance with the driver’s stay factored in. Border and permit fees are extra. You’ll see an indicative estimate and confirm the final fare with the driver.' },
    ],
  },
  {
    slug: 'darbhanga-junction-station-taxi',
    title: 'Reaching Darbhanga Junction: Station Taxi & Pickup Guide',
    description:
      'Getting to or from Darbhanga Junction railway station by taxi or auto — pickup points, fares, and tips for late-night trains.',
    date: '2026-08-19',
    readTime: '3 min',
    image: IMG('1474487548417-781cb71495f3'),
    cta: { label: 'Book a station ride', to: '/book?mode=trip' },
    body: [
      { type: 'p', text: 'Darbhanga Junction is one of the busiest stations in north Bihar. Whether you’re catching a train or arriving late at night, a pre-booked ride makes the trip smooth.' },
      { type: 'h', text: 'Pickup and drop' },
      { type: 'p', text: 'For a drop, book a car or auto and schedule it with time to spare before your train. For arrivals, share your train time so your driver is ready as you step out.' },
      { type: 'h', text: 'Late-night arrivals' },
      { type: 'p', text: 'Trains often arrive late at night. Booking in advance means a verified driver is waiting — safer than looking for transport on the platform at odd hours. Share your live trip link with family for peace of mind.' },
      { type: 'h', text: 'Onward outstation trips' },
      { type: 'p', text: 'Arriving in Darbhanga and heading onward to Madhubani, Sitamarhi or Janakpur? Book a direct outstation trip from the station instead of changing vehicles.' },
    ],
  },
  {
    slug: 'wedding-car-booking-darbhanga',
    title: 'Booking Wedding Cars in Darbhanga & Mithilanchal',
    description:
      'Decorated cars, baraat vehicles and guest transport for weddings in Darbhanga and Mithilanchal — how to plan and book it right.',
    date: '2026-08-16',
    readTime: '4 min',
    image: IMG('1519741497674-611481863552'),
    cta: { label: 'Enquire for a wedding', to: '/enquire?type=wedding' },
    body: [
      { type: 'p', text: 'A wedding needs transport that runs on time and looks the part — for the couple, the baraat and the guests. Here’s how to arrange it without last-minute stress in Mithilanchal.' },
      { type: 'h', text: 'Plan the vehicles early' },
      { type: 'p', text: 'Weddings fall in busy seasons, so vehicles book out. Send your enquiry 1-2 weeks ahead with your dates, number of cars, and pickup points so we can reserve enough vehicles.' },
      { type: 'h', text: 'Decorated cars and the baraat' },
      { type: 'p', text: 'You can request a decorated car for the couple, plus additional cars, SUVs or a tempo/bus for the baraat and guest pickups — all coordinated to arrive together.' },
      { type: 'h', text: 'Guest logistics' },
      { type: 'p', text: 'For out-of-town guests, arrange station and airport pickups so no one is left waiting. Local drivers know the venues and routes across Darbhanga and nearby towns.' },
      { type: 'h', text: 'How to book' },
      { type: 'p', text: 'Send a wedding enquiry on MithilaVahan with your dates and needs — our team calls you back to confirm vehicles, decoration and a clear price. No app or account needed to enquire.' },
    ],
  },
  {
    slug: 'chhath-puja-travel-darbhanga',
    title: 'Travelling Home for Chhath & Festivals in Mithilanchal',
    description:
      'Tips for booking cabs during Chhath Puja and the festive season in Darbhanga and Mithilanchal — when demand is high and roads are busy.',
    date: '2026-08-14',
    readTime: '3 min',
    image: IMG('1609619385002-f40f1df9b7eb'),
    cta: { label: 'Book your festival trip', to: '/book' },
    body: [
      { type: 'p', text: 'Chhath Puja brings families home to Mithilanchal from across the country. It’s the busiest travel season of the year — a little planning goes a long way.' },
      { type: 'h', text: 'Book early' },
      { type: 'p', text: 'During Chhath and the festive season, vehicles are in heavy demand and stations are crowded. Book your station pickup or outstation trip well in advance and schedule the exact time.' },
      { type: 'h', text: 'Station and airport pickups' },
      { type: 'p', text: 'Trains and flights run full and often late during the festival. A pre-booked, verified driver waiting for you beats hunting for transport with luggage and family in the rush.' },
      { type: 'h', text: 'Local trips for the rituals' },
      { type: 'p', text: 'For visiting ghats and relatives across town during Chhath, a full-day hire keeps a vehicle and driver with you through the day’s programme.' },
      { type: 'h', text: 'Travel safe' },
      { type: 'p', text: 'Share your live trip link with family, keep your driver’s WhatsApp handy, and save an emergency contact for the SOS button. Happy Chhath from MithilaVahan.' },
    ],
  },
];

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug);
}

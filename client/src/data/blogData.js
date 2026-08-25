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
];

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug);
}

// Popular destinations bookable from Darbhanga / Muzaffarpur.
// Distances/times are APPROXIMATE and by road from Darbhanga (shown as a guide).
// Descriptions are ORIGINAL short blurbs. `name` prefills the outstation booking.
// `long` is a slightly longer intro used on the per-destination SEO page.

// Derive a URL slug from a name (e.g. "Bodh Gaya" -> "bodh-gaya").
export function toSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const RAW = [
  // --- Nearby Mithilanchal / Bihar towns ---
  { name: 'Madhubani', category: 'Nearby', emoji: '🎨', km: 40, time: '~1 hr',
    desc: 'Home of world-famous Madhubani (Mithila) painting. A short hop for art, markets and culture.',
    long: 'Madhubani is the heart of Mithila art. A quick trip from Darbhanga makes it easy to visit workshops, buy authentic paintings, or attend a family function. Book a car or tempo with a driver for the day.' },
  { name: 'Muzaffarpur', category: 'Nearby', emoji: '🥭', km: 65, time: '~1.5 hrs',
    desc: 'The "Litchi land" of Bihar — a busy commercial hub with temples and bustling bazaars.',
    long: 'Muzaffarpur is a major commercial centre of north Bihar, famous for its litchis. Travel there for business, shopping, medical visits or onward connections — book a comfortable ride with a local driver.' },
  { name: 'Samastipur', category: 'Nearby', emoji: '🚉', km: 55, time: '~1.5 hrs',
    desc: 'A key railway junction town, handy for onward travel and local trade.',
    long: 'Samastipur is a busy railway junction and trade town. Whether you are catching a train or handling business, a pre-booked cab from Darbhanga keeps your day simple.' },
  { name: 'Sitamarhi', category: 'Nearby', emoji: '🛕', km: 90, time: '~2.5 hrs',
    desc: 'Believed to be the birthplace of Sita — an important pilgrimage stop near the Nepal border.',
    long: 'Sitamarhi holds deep significance as the believed birthplace of Sita. Plan a pilgrimage or a family visit with a driver who knows the route to the Janaki Kund and nearby temples.' },
  { name: 'Saharsa', category: 'Nearby', emoji: '🌾', km: 90, time: '~2.5 hrs',
    desc: 'Gateway to the Kosi region, known for its temples and riverine landscape.',
    long: 'Saharsa is the gateway to the Kosi region. Book a one-way drop or a round-trip with a driver for temple visits, family functions or work.' },

  // --- Pilgrimage & tourism ---
  { name: 'Bodh Gaya', category: 'Pilgrimage & Tourism', emoji: '☸️', km: 240, time: '~5.5 hrs',
    desc: 'Where the Buddha attained enlightenment — the Mahabodhi Temple draws visitors worldwide.',
    long: 'Bodh Gaya is among the most sacred Buddhist sites in the world. A round-trip with a driver from Darbhanga lets you visit the Mahabodhi Temple and monasteries comfortably, with rest stops on the way.' },
  { name: 'Vaishali', category: 'Pilgrimage & Tourism', emoji: '🏛️', km: 90, time: '~2.5 hrs',
    desc: 'An ancient city sacred to Buddhists and Jains, dotted with stupas and relics.',
    long: 'Vaishali is an ancient republic city rich in Buddhist and Jain heritage. It pairs well as a day trip — book a car with a driver to see the Ashokan pillar, stupas and museum.' },
  { name: 'Rajgir', category: 'Pilgrimage & Tourism', emoji: '⛰️', km: 220, time: '~5 hrs',
    desc: 'Hills, hot springs and a ropeway — a serene ancient capital with Buddhist and Jain sites.',
    long: 'Rajgir offers hills, hot springs, a ropeway to the Vishwa Shanti Stupa, and ancient sites. A round-trip cab makes a comfortable weekend outing from Mithilanchal.' },
  { name: 'Nalanda', category: 'Pilgrimage & Tourism', emoji: '📜', km: 210, time: '~5 hrs',
    desc: 'Ruins of the legendary ancient university — a UNESCO World Heritage Site.',
    long: 'Nalanda, the ruins of the great ancient university, is a UNESCO World Heritage Site. Combine it with Rajgir on a round-trip with a knowledgeable local driver.' },
  { name: 'Deoghar', category: 'Pilgrimage & Tourism', emoji: '🔱', km: 230, time: '~5.5 hrs',
    desc: 'One of the twelve Jyotirlingas at Baidyanath Dham — a major Shiva pilgrimage.',
    long: 'Deoghar is home to Baidyanath Dham, one of the twelve Jyotirlingas. Book a round-trip cab for a smooth pilgrimage, especially during Shravan when crowds are high.' },

  // --- Major cities ---
  { name: 'Patna', category: 'Major Cities', emoji: '🏙️', km: 140, time: '~3.5 hrs',
    desc: 'Bihar’s capital — for work, the airport, hospitals, museums and Takht Sri Patna Sahib.',
    long: 'Patna is Bihar’s capital and the most common outstation route from Darbhanga — for the airport, hospitals, government work, universities and Takht Sri Patna Sahib. Book a one-way drop or a round-trip with a reliable driver.' },
  { name: 'Ranchi', category: 'Major Cities', emoji: '🌲', km: 400, time: '~8 hrs',
    desc: 'Jharkhand’s green capital, known for waterfalls and a pleasant climate.',
    long: 'Ranchi, the green capital of Jharkhand, is known for waterfalls and cooler weather. For this long-haul trip, a round-trip with a driver and planned halts is the comfortable way to travel.' },
  { name: 'Kolkata', category: 'Major Cities', emoji: '🌉', km: 560, time: '~11 hrs',
    desc: 'The cultural capital of eastern India — a long-haul trip for travel, treatment or trade.',
    long: 'Kolkata is the cultural capital of eastern India, a common destination for medical treatment, education and trade. This is a long journey best done with an experienced driver and rest stops.' },

  // --- Nepal ---
  { name: 'Janakpur', category: 'Nepal', emoji: '🛕', km: 60, time: '~2 hrs',
    desc: 'Just across the border — the birthplace of Sita and the grand Janaki Mandir.',
    long: 'Janakpur, just across the Nepal border, is the birthplace of Sita and home to the magnificent Janaki Mandir. A short cross-border trip — carry valid ID for the border.' },
  { name: 'Kathmandu', category: 'Nepal', emoji: '🏔️', km: 380, time: '~9 hrs',
    desc: 'Nepal’s capital in the Himalayan foothills — temples, heritage and mountain views.',
    long: 'Kathmandu, Nepal’s capital, sits in the Himalayan foothills with temples, heritage squares and mountain views. This is a long international road trip — plan a round-trip with an experienced driver and carry valid ID.' },
];

export const DESTINATIONS = RAW.map((d) => ({ ...d, slug: toSlug(d.name) }));

export function getDestination(slug) {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export const CATEGORIES = ['Nearby', 'Pilgrimage & Tourism', 'Major Cities', 'Nepal'];

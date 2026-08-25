// Popular destinations bookable from Darbhanga / Muzaffarpur.
// Distances/times are APPROXIMATE and by road from Darbhanga (shown as a guide).
// Descriptions are original short blurbs. `name` is what prefills the outstation
// booking destination field.

export const DESTINATIONS = [
  // --- Nearby Mithilanchal / Bihar towns ---
  {
    name: 'Madhubani', category: 'Nearby', emoji: '🎨',
    km: 40, time: '~1 hr',
    desc: 'Home of world-famous Madhubani (Mithila) painting. A short hop for art, markets and local culture.',
  },
  {
    name: 'Muzaffarpur', category: 'Nearby', emoji: '🥭',
    km: 65, time: '~1.5 hrs',
    desc: 'The "Litchi land" of Bihar — a busy commercial hub with temples and bustling bazaars.',
  },
  {
    name: 'Samastipur', category: 'Nearby', emoji: '🚉',
    km: 55, time: '~1.5 hrs',
    desc: 'A key railway junction town, handy for onward travel and local trade.',
  },
  {
    name: 'Sitamarhi', category: 'Nearby', emoji: '🛕',
    km: 90, time: '~2.5 hrs',
    desc: 'Believed to be the birthplace of Sita — an important pilgrimage stop near the Nepal border.',
  },
  {
    name: 'Saharsa', category: 'Nearby', emoji: '🌾',
    km: 90, time: '~2.5 hrs',
    desc: 'Gateway to the Kosi region, known for its temples and riverine landscape.',
  },

  // --- Pilgrimage & tourism ---
  {
    name: 'Bodh Gaya', category: 'Pilgrimage & Tourism', emoji: '☸️',
    km: 240, time: '~5.5 hrs',
    desc: 'Where the Buddha attained enlightenment — the Mahabodhi Temple draws visitors worldwide.',
  },
  {
    name: 'Vaishali', category: 'Pilgrimage & Tourism', emoji: '🏛️',
    km: 90, time: '~2.5 hrs',
    desc: 'An ancient city sacred to Buddhists and Jains, dotted with stupas and relics.',
  },
  {
    name: 'Rajgir', category: 'Pilgrimage & Tourism', emoji: '⛰️',
    km: 220, time: '~5 hrs',
    desc: 'Hills, hot springs and a ropeway — a serene ancient capital with Buddhist and Jain sites.',
  },
  {
    name: 'Nalanda', category: 'Pilgrimage & Tourism', emoji: '📜',
    km: 210, time: '~5 hrs',
    desc: 'Ruins of the legendary ancient university — a UNESCO World Heritage Site.',
  },
  {
    name: 'Deoghar', category: 'Pilgrimage & Tourism', emoji: '🔱',
    km: 230, time: '~5.5 hrs',
    desc: 'One of the twelve Jyotirlingas at Baidyanath Dham — a major Shiva pilgrimage.',
  },

  // --- Major cities ---
  {
    name: 'Patna', category: 'Major Cities', emoji: '🏙️',
    km: 140, time: '~3.5 hrs',
    desc: 'Bihar’s capital — for work, the airport, hospitals, museums and Takht Sri Patna Sahib.',
  },
  {
    name: 'Ranchi', category: 'Major Cities', emoji: '🌲',
    km: 400, time: '~8 hrs',
    desc: 'Jharkhand’s green capital, known for waterfalls and a pleasant climate.',
  },
  {
    name: 'Kolkata', category: 'Major Cities', emoji: '🌉',
    km: 560, time: '~11 hrs',
    desc: 'The cultural capital of eastern India — a long-haul trip for travel, treatment or trade.',
  },

  // --- Nepal ---
  {
    name: 'Janakpur', category: 'Nepal', emoji: '🛕',
    km: 60, time: '~2 hrs',
    desc: 'Just across the border — the birthplace of Sita and the grand Janaki Mandir.',
  },
  {
    name: 'Kathmandu', category: 'Nepal', emoji: '🏔️',
    km: 380, time: '~9 hrs',
    desc: 'Nepal’s capital in the Himalayan foothills — temples, heritage and mountain views. (Carry valid ID.)',
  },
];

export const CATEGORIES = ['Nearby', 'Pilgrimage & Tourism', 'Major Cities', 'Nepal'];

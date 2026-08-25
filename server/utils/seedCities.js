// Seeds the initial launch cities (idempotent — safe to run on every startup).

const City = require('../models/City');

const INITIAL_CITIES = [
  {
    name: 'Darbhanga',
    state: 'Bihar',
    center: { lat: 26.1542, lng: 85.8918 },
    fareSlabs: [
      { label: 'Within city (short)', fare: 100 },
      { label: 'Within city (long)', fare: 200 },
      { label: 'Railway Station ↔ Airport', fare: 350 },
    ],
  },
  {
    name: 'Muzaffarpur',
    state: 'Bihar',
    center: { lat: 26.1209, lng: 85.3647 },
    fareSlabs: [
      { label: 'Within city (short)', fare: 100 },
      { label: 'Within city (long)', fare: 220 },
      { label: 'Station ↔ Bus Stand', fare: 300 },
    ],
  },
];

async function seedCities() {
  for (const c of INITIAL_CITIES) {
    // upsert by name — won't overwrite fare slabs an admin later edits,
    // only creates the city if it doesn't exist yet.
    await City.updateOne(
      { name: c.name },
      { $setOnInsert: c },
      { upsert: true }
    );
  }
  console.log('Cities seeded (Darbhanga, Muzaffarpur).');
}

module.exports = { seedCities, INITIAL_CITIES };

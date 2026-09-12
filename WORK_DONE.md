# MithilaVahan — Work Done & Operational State

A running log of what has been built and the current live/config state, so setup
steps aren't repeated. Newest entries first. See [README.md](./README.md) for the
feature overview and [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) for the deep dive.

---

## Live deployment & config state

| Thing | Value / State |
|-------|---------------|
| Live site | https://mithilavahan.in (+ www) |
| Frontend host | Vercel — root dir `client`, SPA rewrite in `client/vercel.json`, auto-deploys on push to `main` |
| Backend host | Render — service `mithilavahan-api`, root dir `server`, https://mithilavahan-api.onrender.com, **Free tier** (cold-starts after ~15 min idle) |
| Database | MongoDB Atlas (free M0), db `mithilavahan` |
| Repo | github.com/kndnkmr/MithilaVahan (branch `main`) |
| Web Push | **Enabled** — `VAPID_*` env vars set on Render; `/api/push/public-key` returns the key |
| Cloudinary | **Enabled** — `CLOUDINARY_*` env vars set on Render (shared account, `mithilavahan/` folder); uploads return hosted `res.cloudinary.com` URLs |
| Image fallback | If Cloudinary keys were absent, `server/utils/cloudinary.js` falls back to base64 (not the case in prod now) |
| SEO | Google Search Console verified (HTML-file method); sitemap `https://mithilavahan.in/sitemap.xml` submitted; homepage force-indexed |
| Deferred (paid) | Render Starter upgrade for `mithilavahan-api` (~$7/mo, removes cold start); distance-based auto-fare (maps API); online payment gateway |

**Verification quick-checks**
- Client build: `cd client && npm run build` (leaflet chunk-size warning is normal, not an error)
- Backend loads: `cd server && node -e "require('./server.js')"` (a MongoDB `uri undefined` error locally is expected — `MONGODB_URI` is only set on Render)
- Indexing: search `site:mithilavahan.in` on Google
- Push key live: `GET /api/push/public-key`
- Enquiry (public): `POST /api/enquiries` `{type,name,phone,details}` → 201
- Luxury filter: `GET /api/vehicles?luxury=true` → 200

**Booking modes:** `trip` (in-city), `hire` (per-day + hourly-package guidance), `outstation`
(one-way/round), `airport` (direction: pickup/drop).
**Public pages:** `/services`, `/routes`, `/fares`, `/fleet`, `/contact`, `/enquire?type=`,
`/vehicles?tag=luxury`, `/d/:id` (driver profile), `/blog` (11 articles), **`/book`** (guests can
fill it + see fares; auth required only at final submit, intent preserved via `?next=`).
**Public APIs:** `GET /api/trips/reviews` (testimonials), `GET /api/trips/estimate` (fare quote),
`GET /api/drivers/:id/profile` (driver trust page) — all render/behave gracefully if data is thin.

**Test accounts:** rider `9700000011` / `test123`; driver `9700000022` / `test123`.
⚠️ The driver test account was left **deactivated** during admin deactivate/reactivate testing —
reactivate it via **Admin → Drivers → Reactivate** if you need to log in as that driver.

---

## Changelog

### Usability overhaul (3 tiers) — easier for first-time users
- **Login wall removed (biggest win)** — `/book` is now a **public route**; guests can fill the
  whole form and see fares, and are asked to sign in **only at the final "Request trip"**. Intent
  is preserved: RiderBook sends `/login?next=<current /book url>`, and Login + Register honor
  `?next=` for riders, restoring the prefilled booking after auth. A guest hint banner explains this.
- **Booking form fully bilingual** — RiderBook was mostly hardcoded English; now every label,
  button, placeholder, toast switches EN/हिंदी (~28 new i18n keys). Vehicle dropdown shows friendly
  emoji+label instead of raw "car/auto/tempo".
- **Desktop navbar "Book" CTA for everyone** (guests included); removed the duplicate rider Book
  text link. **Mobile bottom-nav overlap fixed** (`main` got `pb-16 md:pb-0`).
- **Home decluttered** — removed the duplicate "Booking modes" grid (the hero tabs already cover
  it); replaced with a single "View all services" link.
- **Fares reconciled to one set** across Home / Fares / Routes / DestinationDetail
  (Hatchback ₹10/km, Sedan ₹11/km, SUV ₹14/km) — they previously disagreed.
- **Polish**: My Trips friendly empty state + "Book your first ride" CTA; Fleet luxury button
  label fixed (Browse vs Book); bigger fare-quote tap targets; bilingual headings on Contact + Routes.
- **Known follow-up:** Fares.jsx / Fleet.jsx bodies and Routes table headers are still English
  (deliberately deprioritised — core flows are bilingual; these are secondary info pages).

### Beyond Savaari — content engine, scheduling, fare quote, driver profiles
- **Blog expanded to 11 original articles** — added airport-taxi guide, Darbhanga→Kathmandu by
  road, Darbhanga Junction station guide, wedding-car booking, and Chhath/festival travel. All
  original Mithilanchal content, each leads to a booking/enquiry; all in `sitemap.xml`. This is
  the main ongoing SEO lever (Savaari ranks largely on volume of route/travel content).
- **Scheduled ("book for later") bookings surfaced** — RiderBook When toggle got helper text +
  a min datetime; TripCard shows a 🗓️ scheduled time line + a "Scheduled" badge for advance
  trips (bilingual). Detects advance trips as scheduledAt > 30 min after createdAt.
- **Instant fare-quote widget** — `FareQuote.jsx` (public, no login): vehicle + one-way/round +
  distance (or a route preset) → live ₹low–high via `GET /api/trips/estimate`. On Home and
  Routes. Bilingual.
- **Public driver profiles** — `GET /api/drivers/:id/profile` (privacy-safe: first name, rating,
  trips completed, approved vehicles, recent reviews — no phone/identity). `DriverProfile.jsx`
  at `/d/:id`; the driver's name on a trip card (rider view) links to it. A trust edge Savaari
  doesn't offer (they hide drivers behind the brand).

### Savaari-parity content + growth (testimonials, routes, fares, fleet, contact, install/share)
- **Real testimonials** — public `GET /api/trips/reviews` returns recent 4–5★ trips that have
  review text (rider first name + route label + rating, privacy-safe). `Testimonials.jsx` shows
  them on Home + Services and renders **nothing when there are none** (honest — no fake reviews).
- **Popular routes hub (`/routes`)** — scannable Darbhanga→X table (distance, time, "from" fare)
  grouped by category, each linking to its detailed route page. In sitemap.
- **Hourly local packages** — hire booking offers 4hr/40km, 8hr/80km, 12hr/120km buttons (add to
  notes); Services "Local hire & packages" card.
- **Fare transparency (`/fares`)** — how fares work, indicative rate table, what's extra (tolls/
  night/Nepal), no-commission promise.
- **Fleet guide (`/fleet`)** — each vehicle type with seats/luggage/best-for + book buttons.
- **Contact page (`/contact`)** — email (support@mithilavahan.in), in-app support, enquiry,
  during-trip (call/WhatsApp/SOS), service areas, hours.
- **1-click Install + Share (mirrors Promedicoz)** — shared `PwaContext` (canInstall/isInstalled/
  promptInstall) wrapped at app root so navbar/home/install don't fight over the one-time
  `beforeinstallprompt`. Home hero has Install (native prompt on Chromium, else `/install`) +
  Share (native share sheet, else `/install`). `InstallButton` refactored to `usePwa()`.
- **Home popular-search shortcuts** — hero row: Airport cab, Luxury car, Wedding car,
  Darbhanga→Patna (bilingual).
- Nav/footer wired for all new pages; new pages added to `sitemap.xml`.
- **Note:** `/fares` and `/fleet` are English-only so far (Services/Enquire are bilingual);
  a follow-up can translate them via the same inline `{en,hi}` + `useLang()` pattern.

### Services expansion — "better than Savaari" (Phases A/B/C + polish)
Goal: match Savaari's breadth (one-way/round, local, airport, tempo, luxury, wedding,
corporate, tour) while keeping MithilaVahan's edge (no commission, live tracking, local,
bilingual). Built in phases; every phase live-tested with regression checks.

- **Phase A — Airport transfers** — new `airport` booking mode with a direction toggle
  ("Going to airport" / "Coming from airport") and an airport picker (Darbhanga DBR, Patna PAT,
  Gaya GAY). Backend: `airport` mode + `airportDirection`/`airportName` on the Trip model,
  validated in `tripController`; fare reuses the per-km `trip` logic. Home service card +
  TripCard label ("Airport transfer"), bilingual. Backward-compatible — existing modes untouched.
- **Phase B — Services grid + enquiry system** —
  - **`/services`** page: 9-card Savaari-style grid. Local / Outstation / Airport / Hire /
    Tempo route into the booking form with the right mode/type prefilled; Luxury → the luxury
    browse; Wedding / Corporate / Tour → enquiry.
  - **Enquiry system**: new `Enquiry` model (type wedding|corporate|tour|other; name+phone+
    details required; status new|contacted|closed; adminNote). `POST /api/enquiries` is
    **public** (uses new `optionalAuth` middleware — links the user if signed in, never blocks).
    `/enquire?type=` form is per-type (tailored copy) with a success screen.
  - **Admin → Enquiries tab**: list, tap-to-WhatsApp the enquirer, mark contacted/closed.
    `GET /admin/enquiries`, `PUT /admin/enquiries/:id`.
  - Nav: "Services" in navbar + footer; "View all services" link on Home.
- **Phase C — information & trust layer** — Services page gained "How it works" (3 steps),
  "Why MithilaVahan" (4 cards), and a 5-question FAQ. Enquire pages gained per-type "What's
  included" bullets + 2 FAQs each. (Destination route pages already had fare tables + FAQs.)
- **Luxury vehicle tag** — owners tick "premium / luxury" when adding a vehicle (`isLuxury` on
  the Vehicle model); public list supports `?luxury=true`; BrowseVehicles supports
  `/vehicles?tag=luxury` (luxury heading, "✨ Luxury only" toggle, ✨ badge on cards).
- **Bilingual Services & Enquire pages** — both fully EN/हिंदी via inline `{en,hi}` strings +
  `useLang()` (chosen over 60+ flat dict keys for these prose-heavy pages).

### Discoverability, brand & ops
- **Cloudinary image hosting live** — reused the existing (Promedicoz) Cloudinary account;
  verified with a real upload returning a hosted URL. New vehicle photos / QR / documents
  are hosted, not base64. Added a bilingual "re-upload" hint on the driver's vehicle list
  when an old (pre-Cloudinary) photo fails to load.
- **Per-page SEO** — added `react-helmet-async`; each public page (Home, Browse Vehicles,
  Destinations + per-destination, Blog + per-article, About) sets its own title, description,
  canonical, and Open Graph/Twitter tags. Replaced the old client-only `useSeo` hook.
- **Social share image** — branded 1200×630 `og-image.png` (+ SVG source), plus static OG/
  Twitter tags in `index.html` so non-JS crawlers (WhatsApp/Facebook) get a preview card.
- **Brand logo** — reusable `Logo` component (SVG mark + wordmark) in navbar and footer;
  matching favicon / PWA `icon.svg`.
- **Auto-updating service worker (Promedicoz-matched)** — `sw.js` self-activates via
  `skipWaiting()` inside its own `install` handler (no fragile page-messaging handshake — that
  was what left devices stuck on an old cached build). `main.jsx` checks for a new build on
  load, every 15 min, and on tab focus/return, then reloads once (with an "Updating…" toast)
  when the new worker takes control. Cache bumped to `mithilavahan-v3`. Ends the "I don't see
  my changes" cache lag. NOTE: a device must load this SW once to adopt the new behaviour; if
  a user is stuck on a very old cache, one incognito load / cache clear fixes them.
- **Google Search Console** — verified via HTML file, sitemap submitted (26 URLs), homepage
  requested for indexing. (Google Business Profile intentionally skipped — a physical video
  verification is a poor fit for an online platform; organic web search is the right channel.)

### Driver, rider & admin behaviour
- **Meaningful driver online/offline** — offline drivers get an empty available list and are
  blocked from accepting (`isOnline` gate in `tripController`); auto-set offline on socket
  disconnect (no ghost drivers). Toggle shows a loading state, a status hint, and an offline
  empty-state with a one-tap "Go online".
- **Admin deactivate/reactivate** — admins can deactivate any **driver or rider** (blocks
  login via `authController`/`auth` middleware, excludes from dispatch, keeps history), with a
  confirm dialog and a "Deactivated" badge. New `GET /api/admin/riders` + a Riders tab.
- **Role-aware contact** — the trip card's WhatsApp message now differs by sender/receiver and
  trip stage (rider shares pickup; driver identifies themselves), and there's a tap-to-call
  button beside it ("Call driver" / "Call rider").
- **Rider polish** — specific paid/confirm toasts (not a generic "Done"), an SOS double-tap
  guard, a notice when a linked vehicle is no longer available, and hire-days validation.

### Earlier (Phase 1 + Phase 2 core)
- Phase 1: auth, driver+vehicle onboarding + admin approval, three booking modes, race-safe
  trip lifecycle, direct UPI/cash payment handshake, ratings, admin panel.
- Phase 2 core: safety (emergency contact + SOS + public share link), Web Push, PWA install,
  live GPS tracking (free Leaflet/OpenStreetMap), nearest-driver dispatch (`2dsphere`).
- In-app modals replaced `window.prompt/confirm` (`Modal.jsx`); in-app image viewer
  (`ImageViewer.jsx`) for documents; password show/hide; UPI number as a primary pay field;
  rider "Browse vehicles" page; bilingual per-status/per-role trip guide + onboarding checklist.

---

## Health check (last full run)

Full end-to-end verification against the **live** app passed:
- Client build ✓ · all backend modules load ✓
- All public routes + key files (og-image, sitemap, robots, manifest, sw, icon) 200 ✓
- Public API (push key, cities, vehicles, estimate) healthy; protected routes 401 unauth ✓
- Full trip lifecycle: request → (offline gate) → accept → start → complete → claim-paid →
  confirm-payment → rate; second rating correctly blocked ✓
- Cloudinary upload returns a hosted URL and the image is publicly reachable ✓

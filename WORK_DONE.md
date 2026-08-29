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

---

## Changelog

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
- **Auto-updating service worker** — registration in `main.jsx` checks for a new build on
  load / tab focus / hourly and reloads once when the new SW activates; `sw.js` handles the
  `SKIP_WAITING` message and cache version bump. Ends the "I don't see my changes" cache lag.
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

# How MithilaVahan Works — Technical Documentation

This document explains the architecture, data flow, and user journeys of MithilaVahan —
the "who talks to whom, and what happens at each step" behind the Phase 1 MVP.

For setup and API reference, see [README.md](./README.md).

---

## Architecture Overview

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│       VERCEL             │     │       RENDER             │     │    MONGODB ATLAS         │
│    (Frontend)            │────▶│    (Backend)             │────▶│    (Database)            │
│                          │◀───▶│                          │     │                          │
│ React + Vite + Tailwind  │ WS  │ Node + Express           │     │ users, vehicles,         │
│ Rider / Driver / Admin   │     │ + Socket.io (real-time)  │     │ trips, cities            │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

| Service | Role |
|---------|------|
| **Vercel** | Serves the React app (what riders/drivers/admins see) |
| **Render** | REST API + Socket.io server — all business logic and real-time events |
| **MongoDB Atlas** | Stores users, vehicles, trips, cities, push subscriptions |

Two channels run between the browser and the backend:
- **HTTP (Axios)** — request/response for everything (auth, booking, admin actions).
- **WebSocket (Socket.io)** — server-pushed events (new trip requests, trip status changes).

---

## Roles

| Role | Can do |
|------|--------|
| **Rider** | Register/login, request a trip or hire, see own trips, contact driver, rate after completion |
| **Driver / Owner** | Register/login, add vehicles, go online/offline, see & accept city requests, run the trip lifecycle |
| **Admin** | Approve/reject drivers & vehicles, add cities + fare slabs, suspend users, view stats |

A single `User` collection holds all three, separated by a `role` field. This keeps auth
and lookups simple (same pattern as ProMedicoz's doctor/patient/admin model).

---

## Database Structure

### `users`
```json
{
  "name": "Deepak Kumar",
  "phone": "+919822222222",       // primary identifier
  "email": null,                  // optional (many drivers have none)
  "password": "$2a$10$hashed…",
  "role": "driver",               // rider | driver | admin
  "city": "Darbhanga",
  "isOnline": false,              // driver availability toggle
  "currentLocation": { "type": "Point", "coordinates": [85.89, 26.15] },
  "documents": { "drivingLicense": "", "rcBook": "", "insurance": "" },
  "driverStatus": "approved",     // pending | approved | rejected
  "whatsappNumber": "",
  "upiId": "",
  "ratingAvg": 4.6,
  "ratingCount": 12
}
```

### `vehicles`
```json
{
  "owner": "<userId>",
  "type": "tempo",                // car | auto | tempo | bus | truck | bike
  "model": "Tata 407",
  "registrationNumber": "BR06AB1234",
  "capacity": 10,
  "city": "Darbhanga",
  "perKmRate": 18, "perDayRate": 2500, "baseFare": 100,
  "supportsTrip": true, "supportsHire": true,
  "approvalStatus": "approved"    // pending | approved | rejected
}
```

### `trips`
```json
{
  "rider": "<userId>",
  "driver": "<userId|null>",       // set when a driver accepts
  "vehicle": "<vehicleId|null>",
  "city": "Darbhanga",
  "mode": "trip",                  // trip (in-city) | hire (per-day) | outstation (inter-city)
  "destination": "",               // outstation only, e.g. "Patna"
  "tripType": "one-way",           // outstation only: one-way | round-trip
  "vehicleType": "car",
  "pickup": { "address": "Tower Chowk", "coordinates": [0,0] },
  "drop":   { "address": "Junction",    "coordinates": [0,0] },
  "days": 1,
  "status": "requested",           // requested→accepted→started→completed | cancelled
  "estimatedFare": 150, "finalFare": 0, "distanceKm": 0,
  "paymentMode": "cash",           // cash | upi
  "rating": null, "review": ""
}
```

### `cities`
```json
{
  "name": "Darbhanga", "state": "Bihar",
  "center": { "lat": 26.1542, "lng": 85.8918 },
  "fareSlabs": [ { "label": "Within city (short)", "fare": 100 } ],
  "isActive": true
}
```

---

## Security Model

- **Auth:** JWT signed with `JWT_SECRET`, 30-day expiry, sent as `Authorization: Bearer <token>`.
- **`protect` middleware:** verifies the token, loads the user, rejects suspended accounts.
- **`authorize(...roles)` middleware:** restricts a route to specific roles.
- **Passwords:** hashed with bcrypt (pre-save hook), never returned to the client.
- **Rate limiting:** auth endpoints capped (30 requests / 15 min) to slow brute-force.
- **Sockets:** authenticated with the same JWT before a connection is allowed.
- **Driver gating:** a driver can't go online or accept trips until `driverStatus === 'approved'`.
- **Public registration** only allows `rider`/`driver`; `admin` is created via `ADMIN_PHONE`/`ADMIN_PASSWORD` env (bootstrap), never through the API.

---

## Real-Time Rooms (Socket.io)

On connect, each authenticated socket joins:
- `user:<userId>` — a personal room, so the server can target one user (e.g. "your trip was accepted").
- `city:<City>:drivers` — **drivers only**, so a new request can be broadcast to every online driver in that city.

Emit helpers (in `server/socket.js`):
- `emitNewTripToCity(city, trip)` → `trip:new` to `city:<City>:drivers`
- `emitToUser(userId, event, payload)` → e.g. `trip:updated` to `user:<userId>`

The client (`client/src/services/socket.js`) connects once after login and pages subscribe
to the events they care about (`MyTrips` and `DriverDashboard` both listen for `trip:updated`;
the driver dashboard also listens for `trip:new`).

---

## User Journeys

### Journey 1: Driver onboarding
```
1. Register (role: driver)          → account created, driverStatus = 'pending'
2. Add a vehicle                    → vehicle created, approvalStatus = 'pending'
3. Admin reviews in /admin          → approves the driver AND the vehicle
4. Driver goes online               → allowed only now (approved); joins city:<City>:drivers room
```
A pending driver who tries `PUT /drivers/online` gets a `403` — the gate is enforced server-side,
not just hidden in the UI.

### Journey 2: Rider requests a trip
```
1. Rider fills the booking form (city, type, pickup/drop, payment)
2. POST /api/trips
   → Trip saved as 'requested'
   → fare estimated if a vehicle was pre-selected (utils/fare.js)
   → emitNewTripToCity(city, trip)  →  'trip:new'
3. Every online driver in that city sees the request appear live
```

### Nearest-driver dispatch (Phase 2)

The plain flow above broadcasts a new request to **every** online driver in the city
(`trip:new` → `city:<City>:drivers`). That still runs — it's the reliable fallback and
keeps every driver's available list fresh. On top of it, when the rider's pickup has real
GPS coordinates, the server **also** targets the closest drivers directly:

```
Rider requests a trip (with pickup [lng, lat] from the browser)
   → POST /api/trips saves the trip
   → emitNewTripToCity(...)                     ← city-wide broadcast (fallback)
   → findNearestDrivers({ city, coordinates })  ← utils/dispatch.js
        · $near on User.currentLocation (2dsphere index), sorted nearest-first
        · filters: role=driver, approved, online, not suspended, same city, within 15km
   → for each nearest driver:
        emitToUser(driverId, 'trip:nearby', trip)   ← prioritized socket ping
        sendPushToUser(driverId, …)                 ← Web Push "request nearby"
```

Key points:
- **Best-effort, never blocks a booking.** If the geo lookup errors, it's caught and the
  request still succeeds on the broadcast alone.
- **No coords → no-op.** `findNearestDrivers` returns `[]` for a missing/`[0,0]` point, so
  a rider who denies location still gets served city-wide.
- **Fresh location.** The driver dashboard streams `driver:location` over the socket while
  online (browser `watchPosition`), so the index reflects where drivers actually are.
- **No paid maps API.** This uses MongoDB's built-in geospatial query — free.

The response includes `nearbyDriversNotified` so the client/tests can see how many direct
pings went out.

**Verified** with an in-memory geo test (8/8): a near and a far driver inside the radius
are returned nearest-first; a driver beyond 15 km, an offline driver, a pending (unapproved)
driver, and an other-city driver are all correctly excluded; and a `[0,0]` pickup returns
an empty list (broadcast-only fallback).

### PWA / installable app (Phase 2)

MithilaVahan is installable on a phone home screen (no app store), via a standard web
manifest + service worker.
- `manifest.webmanifest` — name, `display: standalone`, theme color, and 192/512 icons
  (plus a `maskable` icon so Android doesn't clip it). Linked from `index.html` along with
  the `apple-touch-icon` and iOS meta tags.
- `sw.js` — **deliberately conservative** so it never serves stale trip/API data:
  `/api` and `/socket.io` are never cached; page navigations are **network-first** (cached
  shell only as an offline fallback); static assets are cache-first for speed. Registered in
  `main.jsx` **production-only** (skipped in dev to avoid fighting Vite's HMR).
- `InstallButton.jsx` — captures `beforeinstallprompt` (Android/Chrome) to trigger the native
  install; on iOS/Safari (no such event) it shows an "Add to Home Screen" hint; renders
  nothing once already installed (`display-mode: standalone`).

**If you change caching:** keep API/socket traffic uncached and navigations network-first —
a ride app must not show a stale trip. Bump the `CACHE` version string in `sw.js` when you
change cached assets so old caches are cleared.

### Live GPS tracking (Phase 2)

Once a trip is `accepted` or `started`, the rider can watch the driver's vehicle move on a
map — using **free OpenStreetMap tiles via Leaflet**, so there's no maps API key or billing.

```
Driver's browser (dashboard, while online OR on an active trip)
   → watchCoordinates() → socket.emit('driver:location', { lng, lat })

Server (socket.js, driver:location handler)
   → stores currentLocation (also used for nearest-driver dispatch)
   → finds the driver's active trip (status accepted|started)
   → io.to(user:<riderId>).emit('trip:driver-location', { tripId, lng, lat })

Rider's browser (MyTrips)
   → on 'trip:driver-location', updates driverLocations[tripId]
   → <LiveTripMap> renders the driver marker (+ pickup) and recenters on each update
```

Key points:
- **Rider-scoped.** Location is relayed only to the one rider on that driver's active trip
  (their personal `user:<id>` room), never broadcast.
- **Shown only while active.** The map appears for `accepted`/`started` trips and disappears
  once completed/cancelled.
- **Free maps.** `LiveTripMap` uses OpenStreetMap tiles through Leaflet/react-leaflet — no
  Google/Mapbox key, no billing. (Coords are stored `[lng, lat]`; Leaflet wants `[lat, lng]`,
  so the component flips them.)
- **Web MVP honesty.** Location updates only while the driver's browser tab is open (this is
  a web PWA, not a native app), and the free Render tier's cold start can delay the first
  fix. Good enough for an MVP; native apps / background location come later.

### Journey 3: Driver accepts (the race-safe part)
```
Driver clicks Accept
   → PUT /api/trips/:id/accept
   → findOneAndUpdate({ _id, status: 'requested' }, { driver, status: 'accepted' })
```
Because the update **only matches while status is still `requested`**, if two drivers tap
Accept at nearly the same moment, exactly one wins and the other gets a `409 already taken`.
This is the key correctness detail — no double-assignment.

On success:
- Rider receives `trip:updated` (live) + a Web Push "Driver assigned!"
- The request drops off other drivers' available lists.

### Journey 4: Trip lifecycle
```
accepted ──(driver: Start)──▶ started ──(driver: Complete + finalFare)──▶ completed
```
Each transition is validated server-side (you can't jump `accepted → completed`). The rider
is notified at every step. On completion the driver enters the final fare (paid directly,
cash or UPI — the platform holds no money).

### Journey 5: Rating
```
Rider rates a completed trip (1–5)
   → stored on the trip
   → driver.ratingAvg / ratingCount recalculated
```
One rating per trip (guarded), and only the rider on that trip can rate it.

### Journey 6: Cancellation
Either party (or admin) can cancel while a trip is `requested` or `accepted`. The reason and
who cancelled are recorded, and the other party is notified.

---

## Fare Logic (MVP)

`server/utils/fare.js` is deliberately simple and dependency-free:
- **trip (in-city point-to-point):** `baseFare + perKmRate × distanceKm`
- **hire (per day):** `perDayRate × days`
- **outstation (inter-city):** `baseFare + perKmRate × distanceKm`, with `distanceKm`
  doubled for a **round-trip** (the vehicle covers the route there and back). Outstation
  trips are usually scheduled (`scheduledAt`) for a future date/time and carry a free-text
  `destination` (e.g. "Patna", "Kathmandu") plus `tripType` (one-way / round-trip).

There is **no maps/distance API yet** — this keeps the MVP free and simple, and city fare
slabs give riders a realistic expectation up front. `estimateFare()` takes distance as an
argument, so swapping in a real distance API later needs no change to any caller.

---

## What Happens on Server Startup

```
1. Connect to MongoDB (MONGODB_URI)
2. seedCities()       → upsert Darbhanga + Muzaffarpur (won't overwrite admin-edited slabs)
3. bootstrapAdmin()   → create/promote the admin from ADMIN_PHONE/ADMIN_PASSWORD (if set)
4. initSocket()       → attach Socket.io to the HTTP server
5. Listen on PORT
```
All of these are idempotent — safe to run on every boot.

---

## Verification

During build, the whole flow was exercised end-to-end against an in-memory MongoDB:
health → city seed → register rider/driver/admin → driver-online gate → admin approves
driver → add + approve vehicle → public listing → request → available-to-driver → accept →
start → complete (with fare) → rate → auth/role guards. **19/19 checks passed.**

The frontend `vite build` compiles clean, and the backend boots and wires all
routes/middleware/sockets without error.

---

## Where Things Live (quick map)

| I want to change… | Look in |
|-------------------|---------|
| Who can hit an endpoint | `server/middleware/auth.js` + the route file |
| The booking rules / lifecycle | `server/controllers/tripController.js` |
| Fare math | `server/utils/fare.js` |
| Real-time events | `server/socket.js` (server) + `client/src/services/socket.js` |
| Nearest-driver dispatch | `server/utils/dispatch.js` + `tripController.requestTrip` |
| Browser geolocation | `client/src/services/location.js` (used by RiderBook + DriverDashboard) |
| Live tracking (relay) | `server/socket.js` `driver:location` handler → `trip:driver-location` |
| Live tracking (map) | `client/src/components/LiveTripMap.jsx` (Leaflet/OSM) + `MyTrips.jsx` |
| PWA (installable) | `client/public/manifest.webmanifest` + `client/public/sw.js` + `InstallButton.jsx` |
| Vehicle rules | `server/controllers/vehicleController.js` + `models/Vehicle.js` |
| Admin actions | `server/controllers/adminController.js` |
| Launch cities / fare slabs | `server/utils/seedCities.js` (initial) or `/api/admin/cities` (live) |
| The booking screen | `client/src/pages/RiderBook.jsx` |
| The driver screen | `client/src/pages/DriverDashboard.jsx` |
| A trip's card + actions | `client/src/components/TripCard.jsx` |
```

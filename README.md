# MithilaVahan — Vehicle Rental & Ride Platform for Mithilanchal

A city-scoped, two-sided marketplace (Ola/Uber style, **with-driver**) where local
vehicle owners rent out their cars, autos, tempos, buses and trucks, and locals book
rides or hire vehicles. Launching in **Darbhanga** and **Muzaffarpur** (Bihar), built
to expand city-by-city.

Built on the same stack and patterns as ProMedicoz (MERN + Vite + Tailwind + Socket.io
+ free Web Push), so deployment and maintenance knowledge carries over.

**Related docs:** [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) — the deeper technical walkthrough
(architecture, data model, real-time rooms, and step-by-step user journeys).

---

## Table of Contents

1. [What's in Phase 1](#whats-in-phase-1)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Local Setup](#local-setup)
6. [Environment Variables](#environment-variables)
7. [Running the App](#running-the-app)
8. [API Endpoints](#api-endpoints)
9. [How the Trip Flow Works](#how-the-trip-flow-works)
10. [Deployment](#deployment)
11. [Roadmap (Phase 2+)](#roadmap-phase-2)
12. [Documentation](#documentation)

---

## What's in Phase 1

Three roles: **Rider**, **Driver/Owner**, **Admin**.

- **Auth** — phone-first registration + login (JWT), rate-limited. Riders usable
  immediately; drivers start `pending`.
- **Driver + vehicle** — driver adds vehicles (type, model, reg. no, capacity, city,
  per-km / per-day / base fare), goes online/offline. Admin approves both the driver
  and each vehicle before they go live.
- **Rider booking (three modes)** — **In-city** point-to-point (pickup/drop),
  **Hire** (per day), and **Outstation** (long inter-city trip: destination,
  one-way/round-trip, scheduled pickup, per-km estimate). City fare-slab hints shown for
  in-city. Trip is broadcast to online drivers in that city (nearest first when GPS is on).
- **Trip lifecycle** — `requested → accepted → started → completed` (or `cancelled`),
  with an atomic "first driver to accept wins" claim.
- **Real-time** — Socket.io pushes new requests to a city's online drivers and status
  updates to the rider. Free **Web Push** (VAPID) for phone alerts. **Click-to-WhatsApp**
  (`wa.me`, no paid API) for rider↔driver contact.
- **Payments (direct UPI/cash)** — rider pays the driver directly. For UPI, the driver's
  UPI ID / QR is shown on the completed trip; rider taps **"I've paid"** → driver taps
  **"Payment received"** to close the loop. Platform never holds money. An **admin-controlled
  commission** (`commissionPercent`, default **0 = free**) is recorded per completed trip
  (snapshotted, so changing it never rewrites past trips) — so a commission can be turned on
  later without re-architecting. Automatic collection would need a payment gateway (deferred).
- **Ratings** — rider rates the driver after completion; driver's average updates.
- **Admin panel** — stats, approve/reject drivers and vehicles, add cities + fare slabs,
  suspend users.

All of the above is covered by an end-to-end test that was run green (19/19) during build.

---

## Tech Stack

### Backend (`server/`)
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database + modeling |
| JWT + bcryptjs | Auth + password hashing |
| Socket.io | Real-time trip requests / status |
| web-push | Free browser push (VAPID) |
| express-rate-limit | Brute-force protection on auth |
| cloudinary (optional) | Vehicle photo / document storage |

### Frontend (`client/`)
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI + build tool |
| Tailwind CSS | Styling |
| React Router v6 | Routing |
| Axios | API calls |
| socket.io-client | Live updates |
| react-hot-toast | Notifications |

---

## Project Structure

```
Mithilavahan/
├── README.md                 ← you are here
├── .gitignore
│
├── server/                   ← BACKEND
│   ├── .env.example          ← copy to .env and fill in
│   ├── server.js             ← entry: DB connect, routes, Socket.io
│   ├── socket.js             ← Socket.io auth + city/user rooms + emit helpers
│   ├── models/
│   │   ├── User.js           ← rider/driver/admin (role-based)
│   │   ├── Vehicle.js        ← rentable vehicle listing
│   │   ├── Trip.js           ← ride/hire booking + lifecycle
│   │   ├── City.js           ← supported cities + fare slabs
│   │   └── PushSubscription.js
│   ├── middleware/
│   │   └── auth.js           ← protect (JWT) + authorize (roles)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── tripController.js ← the core booking engine
│   │   ├── driverController.js
│   │   └── adminController.js
│   ├── routes/               ← auth, vehicle, trip, city, driver, admin, push
│   └── utils/
│       ├── formatPhone.js    ← +91 normalization
│       ├── fare.js           ← simple per-km / per-day estimate
│       ├── push.js           ← Web Push sender (no-op if unconfigured)
│       ├── seedCities.js     ← seeds Darbhanga + Muzaffarpur
│       └── bootstrapAdmin.js ← first admin from env
│
└── client/                   ← FRONTEND
    ├── index.html
    ├── vite.config.js        ← proxies /api + /socket.io to :5000 in dev
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx           ← routes + role guards
        ├── context/AuthContext.jsx
        ├── services/
        │   ├── api.js        ← all API calls
        │   └── socket.js     ← shared Socket.io client
        ├── components/
        │   ├── Navbar.jsx
        │   └── TripCard.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx / Register.jsx
            ├── RiderBook.jsx     ← booking flow
            ├── MyTrips.jsx
            ├── DriverDashboard.jsx
            └── AdminDashboard.jsx
```

---

## Prerequisites

- **Node.js** v18+ (`node --version`)
- **MongoDB** — either
  - MongoDB Atlas (free cloud tier, recommended) — https://www.mongodb.com/atlas, or
  - a local MongoDB (`mongodb://localhost:27017/mithilavahan`)

---

## Local Setup

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # then edit .env with your MongoDB URI + JWT secret

# 2. Frontend
cd ../client
npm install
```

---

## Environment Variables

All backend config lives in `server/.env` (copy from `.env.example`).

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | no (default 5000) | Backend port |
| `MONGODB_URI` | **yes** | MongoDB connection string |
| `JWT_SECRET` | **yes** | Long random string for signing tokens |
| `ADMIN_PHONE` / `ADMIN_PASSWORD` | no | Auto-create/promote the first admin on startup |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | no | Enable free Web Push (generate with the command below) |
| `CLOUDINARY_*` | no | Vehicle photo / document storage |
| `CLIENT_URL` | no | Frontend origin (CORS) in production |

Generate VAPID keys once:
```bash
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

---

## Running the App

Two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev        # or: npm start
# → "MithilaVahan Server is running! URL: http://localhost:5000"
#   "Connected to MongoDB successfully!"

# Terminal 2 — frontend
cd client
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173**.

Quick test flow:
1. Register a **rider** (choose "I want to ride") → you land on the booking page.
2. In another browser/incognito, register a **driver** (choose "I have a vehicle").
3. Log in as **admin** (the phone/password you set in `.env`) → `/admin` → approve the
   driver, then add + approve a vehicle for them (driver adds it first from their dashboard).
4. As the **driver**, go online. As the **rider**, request a trip in the same city.
5. Watch the request appear on the driver dashboard in real time → accept → start → complete.
6. As the rider, rate the driver.

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (rider/driver) |
| POST | `/api/auth/login` | Public | Login by phone |
| GET | `/api/auth/me` | Protected | Current user |

### Cities & Settings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cities` | Public | Active cities + fare slabs |
| GET | `/api/settings` | Public | Platform settings (commission percent) |

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/vehicles?city=&type=` | Public | Approved, active vehicles |
| GET | `/api/vehicles/mine` | Driver | Own vehicles |
| POST | `/api/vehicles` | Driver | Add a vehicle (→ pending) |
| PUT | `/api/vehicles/:id` | Driver | Update own vehicle (→ pending) |

### Trips
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/trips` | Rider | Request a trip/hire |
| GET | `/api/trips/mine` | Protected | My trips (rider or driver) |
| GET | `/api/trips/available` | Driver | Open requests in my city |
| PUT | `/api/trips/:id/accept` | Driver | Accept a request (atomic) |
| PUT | `/api/trips/:id/status` | Driver | started / completed |
| PUT | `/api/trips/:id/cancel` | Rider/Driver | Cancel |
| PUT | `/api/trips/:id/rate` | Rider | Rate completed trip |
| PUT | `/api/trips/:id/claim-paid` | Rider | Mark a UPI trip as paid (→ awaiting driver confirm) |
| PUT | `/api/trips/:id/confirm-payment` | Driver | Confirm payment received |

### Driver
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/api/drivers/online` | Driver | Go online/offline |
| PUT | `/api/drivers/documents` | Driver | Submit docs / WhatsApp / UPI |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard counts |
| GET | `/api/admin/drivers?status=` | Admin | List drivers |
| PUT | `/api/admin/drivers/:id/status` | Admin | Approve/reject driver |
| GET | `/api/admin/vehicles?status=` | Admin | List vehicles |
| PUT | `/api/admin/vehicles/:id/status` | Admin | Approve/reject vehicle |
| POST | `/api/admin/cities` | Admin | Add a city |
| PUT | `/api/admin/cities/:id` | Admin | Edit fare slabs / toggle active |
| PUT | `/api/admin/users/:id/suspension` | Admin | Deactivate/reactivate |
| GET | `/api/admin/settings` | Admin | Get platform settings (commission) |
| PUT | `/api/admin/settings` | Admin | Set commission percent (0 = free) |

### Push
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/push/public-key` | Public | VAPID public key |
| POST | `/api/push/subscribe` | Protected | Save browser subscription |
| POST | `/api/push/unsubscribe` | Protected | Remove subscription |

---

## How the Trip Flow Works

```
Rider requests a trip
   → Trip saved as 'requested'
   → Socket.io broadcasts 'trip:new' to  city:<City>:drivers  room
   → Online drivers in that city see it instantly (+ can be pushed)

Driver accepts
   → Atomic findOneAndUpdate (status still 'requested') claims it → 'accepted'
     (prevents two drivers grabbing the same trip)
   → Rider gets 'trip:updated' via Socket.io + a Web Push "Driver assigned!"

Driver: start → complete
   → each transition validated (accepted→started→completed only)
   → rider notified each step; final fare recorded on completion

Rider rates the driver
   → driver's ratingAvg / ratingCount updated
```

Fare (MVP), by mode (`server/utils/fare.js`):
- `trip` (in-city) = `baseFare + perKm × km`
- `hire` = `perDay × days`
- `outstation` = `baseFare + perKm × km`, with `km` doubled for a **round-trip** (there and back)

No maps/distance API yet — intentionally simple. The rider gives an approximate distance
and the driver confirms the final fare. This can be swapped for a real distance API later
without changing any callers.

---

## Deployment

Same zero-cost path as ProMedicoz:
- **Database:** MongoDB Atlas (free M0)
- **Backend:** Render (set env vars incl. `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`)
- **Frontend:** Vercel (set `VITE_API_URL` to the Render API URL, and `VITE_SOCKET_URL`
  to the Render host for websockets)

Push to GitHub → Render + Vercel auto-redeploy.

---

## Roadmap (Phase 2+)

**Done in Phase 2:**
- **Web Push notifications** ✅ — free phone alerts for trip events (driver assigned, trip
  started/completed, nearby request). Logged-in users get a dismissible "Enable" prompt; the
  service worker shows the notification even when the app is closed. Requires the `VAPID_*`
  env vars set on the backend (see below) — without them it stays quietly off.
- **PWA install** ✅ — installable on phones (web manifest + icons + a conservative
  network-first service worker). An "Install" button appears in the navbar on Android/Chrome;
  iOS users get "Add to Home Screen" guidance. Fully free, no third-party services.
- **Live GPS tracking** ✅ — while a trip is `accepted`/`started`, the driver streams
  location and the rider watches the vehicle move on a **free OpenStreetMap (Leaflet)** map
  (no maps API key / billing). Relayed rider-only via Socket.io (`trip:driver-location`).
  See [HOW_IT_WORKS.md](./HOW_IT_WORKS.md#live-gps-tracking-phase-2).
- **Nearest-driver dispatch** ✅ — when a rider requests a trip, the closest online
  approved drivers (within 15 km, via the `2dsphere` geo index) get a prioritized
  `trip:nearby` ping + Web Push, on top of the city-wide broadcast fallback. The rider
  booking form captures pickup GPS; the driver dashboard streams location while online.
  See [HOW_IT_WORKS.md](./HOW_IT_WORKS.md#nearest-driver-dispatch-phase-2).

Still deferred:
- **Distance-based auto-fare** via a maps distance API (would make the outstation/trip
  fare estimate automatic instead of the rider-entered approximate distance). This is the
  one piece that needs a paid maps provider (Google/Mapbox) + billing.
- **Native mobile apps** for smoother background location than a web tab allows.
- **Online payments** (Razorpay/UPI collect) + optional commission.
- **Document upload UI** for driver verification (schema + endpoints already exist).
- **PWA install** + more Hindi localization (Home already has bilingual vehicle labels).
- **SOS / trip sharing** for safety.
- Expansion to more Mithilanchal cities (just add a City row — everything is city-scoped).
```

---

## Documentation

| Doc | What's inside |
|-----|---------------|
| [README.md](./README.md) | Setup, environment, run instructions, and API reference (this file) |
| [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) | Architecture, database structure, security model, real-time rooms, and step-by-step user journeys (driver onboarding, booking, the race-safe accept, lifecycle, ratings) |

If you're new to the codebase, read **HOW_IT_WORKS.md** first for the mental model, then
use this README's [Local Setup](#local-setup) to run it. The "Where Things Live" table at
the end of HOW_IT_WORKS.md is a quick "I want to change X → look in Y" map.

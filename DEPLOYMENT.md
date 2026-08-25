# Deploying MithilaVahan

This gets MithilaVahan **live** on the same free stack as ProMedicoz:
**MongoDB Atlas** (database) + **Render** (backend API) + **Vercel** (frontend).

You already have all three accounts from ProMedicoz — you're adding a new project
to each, not signing up again. Total cost: **₹0** on free tiers.

> The code is already on GitHub: `https://github.com/kndnkmr/MithilaVahan`.
> These steps happen in the Atlas / Render / Vercel dashboards.

---

## Overview

```
Vercel (client/)  ──HTTP + WebSocket──▶  Render (server/)  ──▶  MongoDB Atlas
  the website                              the API + Socket.io      the database
```

Deploy order: **Atlas → Render → Vercel → link them.**

---

## Step 1 — MongoDB Atlas (database)

Reuse your existing ProMedicoz cluster (simplest) — just use a different database name.

1. In Atlas, open your cluster → **Connect** → **Drivers** → copy the connection string.
2. Set the database name to `mithilavahan` at the end:
   ```
   mongodb+srv://USER:PASSWORD@yourcluster.mongodb.net/mithilavahan
   ```
   (Atlas creates the `mithilavahan` database automatically on first write — it stays
   separate from your `docconnect`/ProMedicoz data on the same cluster.)
3. **Network Access** → make sure it allows Render. Either keep `0.0.0.0/0` (simplest,
   less secure) or add Render's outbound IPs (Render → your service → **Connect** →
   **Outbound**) once the service exists in Step 2.

Keep this connection string handy for Step 2.

---

## Step 2 — Render (backend API)

You can use the included **Blueprint** (`render.yaml`) or configure manually.

### Option A — Blueprint (recommended, auto-fills settings)
1. Render dashboard → **New +** → **Blueprint**.
2. Connect the `kndnkmr/MithilaVahan` repo. Render reads `render.yaml` and proposes a
   web service named `mithilavahan-api` (root dir `server`, build `npm install`,
   start `npm start`, health check `/api/health`).
3. It will prompt for the secret env vars (below). Fill them and **Apply**.

### Option B — Manual
1. **New +** → **Web Service** → connect the repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Environment variables (both options)

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | your Atlas string ending `/mithilavahan` | **required** |
| `JWT_SECRET` | a long random string | **required** — use a NEW one, not ProMedicoz's |
| `NODE_ENV` | `production` | |
| `CLIENT_URL` | your Vercel URL | fill after Step 3 (or leave, update later) |
| `ADMIN_PHONE` | your 10-digit mobile | auto-creates the admin account |
| `ADMIN_PASSWORD` | a strong password | admin login password |
| `ADMIN_NAME` | e.g. `Administrator` | optional |
| `VAPID_PUBLIC_KEY` | generated key | optional — enables Web Push |
| `VAPID_PRIVATE_KEY` | generated key | optional |
| `VAPID_SUBJECT` | `mailto:you@example.com` | optional |

Generate the VAPID keys once, locally:
```bash
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

3. Deploy. You'll get a URL like `https://mithilavahan-api.onrender.com`.
4. **Verify:** open `https://mithilavahan-api.onrender.com/api/health` — it should return
   `{"status":"OK","database":"Connected"}`. If `Disconnected`, re-check `MONGODB_URI`
   and Atlas Network Access.

---

## Step 3 — Vercel (frontend)

1. Vercel dashboard → **Add New** → **Project** → import `kndnkmr/MithilaVahan`.
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (auto-detected)
   - Build command `npm run build`, output `dist` (auto-filled)
3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://mithilavahan-api.onrender.com/api` (your Render URL + `/api`) |
| `VITE_SOCKET_URL` | `https://mithilavahan-api.onrender.com` (Render URL, **no** `/api`) |

> `VITE_SOCKET_URL` matters here — real-time trip requests, live tracking, and SOS
> alerts go over the WebSocket. Without it, those won't reach users live.

4. Deploy. You'll get a URL like `https://mithilavahan.vercel.app`.

---

## Step 4 — Link them

1. Back in **Render** → your service → **Environment** → set `CLIENT_URL` to the Vercel
   URL, and **Manual Deploy → Deploy latest commit** (or it redeploys on save).
2. Open the Vercel URL. You're live.

---

## Step 5 — Smoke test on the live site

1. Open the Vercel URL → **Register** a rider ("I want to ride").
2. In an incognito window → **Register** a driver ("I have a vehicle").
3. Log in as **admin** (the `ADMIN_PHONE` / `ADMIN_PASSWORD` you set) → `/admin`:
   - Approve the driver.
   - (Driver adds a vehicle from their dashboard first) → approve the vehicle.
4. As the **driver**: go online.
5. As the **rider**: request a trip in the same city → it should appear on the driver
   dashboard in real time → accept → start → complete.
6. As the rider: try **Share trip** (opens a `/t/...` link) and **SOS**.

If real-time doesn't work, check `VITE_SOCKET_URL` (Vercel) and that the Render service
is awake (free tier sleeps after 15 min — the first request wakes it in ~50s).

---

## Notes & gotchas

- **HTTPS is automatic** on Vercel/Render — required for PWA install and Web Push. They
  "just work" once live.
- **Cold starts:** Render free tier sleeps after 15 min inactivity; first hit takes ~50s.
  For a real launch, the **$7/mo** Render plan removes sleeping (matters more for a ride
  app than it did for ProMedicoz).
- **Uploads:** vehicle photos / QR are URL fields for now (paste a link). For hosted
  uploads later, add the `CLOUDINARY_*` env vars (the code already supports them).
- **Push stays off** until the `VAPID_*` vars are set — everything else works without them.
- **Custom domain** (e.g. `mithilavahan.in`): buy it, then add it in Vercel → Domains
  (and update `CLIENT_URL` on Render to match).

---

## Auto-deploys

Once connected, every `git push` to `main` triggers:
- Render → rebuilds the backend (~2–3 min)
- Vercel → rebuilds the frontend (~1–2 min)

No manual redeploy needed after the initial setup.

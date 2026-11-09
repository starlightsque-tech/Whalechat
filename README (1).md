# WhaleChat 🐋

A premium **social + marketplace + wallet** app with a real backend: cross‑device accounts, live messaging, closed‑app push notifications and an admin console. Installable as a PWA on Android, iPhone and desktop.

```
whalechat.html          the entire app (logo, artwork and icons embedded — works standalone)
server.js               sync + push server (serves the app too)
package.json            npm start
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline shell + push handling)
assets/                 app icons, logo, artwork
```

---

## 0. Entry points

- `index.html` — branded entry that forwards to the app (use this as your site root).
- `whalechat.html` — the app itself. The logo, artwork and icons are embedded, so it renders correctly even when moved or opened alone.

## 1. Run it (one command = whole product)

```bash
npm install      # installs web-push
npm start        # http://localhost:8090/whalechat.html
```

Open the URL on your computer, then open the **same URL from your phone on the same Wi‑Fi** (use your computer's LAN IP, e.g. `http://192.168.1.20:8090/whalechat.html`) — you are now on two devices sharing one database. Messages, orders, balances and admin changes sync live.

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8090` | HTTP port |
| `DATA_DIR` | `./data` | state + push subscription storage |
| `PUBLIC_URL` | – | your public https URL (informational) |
| `VAPID_EMAIL` | `support@whalechat.app` | contact address for push |

### Production deployment (HTTPS required for PWA + push)

Any Node host works: Render, Railway, Fly.io, a VPS behind Caddy/Nginx, etc.

- Start command: `npm start`, Node 18+.
- Point a domain at it and terminate TLS (Caddy/Nginx) — `https://chat.yourdomain.com`.
- Persist `DATA_DIR` (mount a volume) so the database and push subscriptions survive restarts.
- Reverse proxies must not buffer the SSE stream (`/api/events`). Nginx: `proxy_buffering off; proxy_read_timeout 3600s;`.

---

## 2. Two ways to run

**A. With the server (recommended, cross‑device).** The server injects a marker into the page, so the app connects automatically — no configuration. Accounts created on one device can sign in on any other.

**B. Static hosting (no server).** Drop `whalechat.html`, `manifest.webmanifest`, `sw.js` and `assets/` on any static host. The app runs fully in local mode (per‑device data) and shows **Local device only** in Settings. You can connect it to a running server later from **Settings → Cross‑device sync → Connect**.

---

## 3. Admin tools & policies

- **Log in as user:** Users → Manage (or the key icon) → “Log in as this user”. No password or username is needed; a bar at the top lets you return to the admin console at any time.
- **Password-free login:** Admin → Payment Settings → “Login without password”. When ON, anyone can sign in to a known username/email with any password. Use with care, and turn it off when not needed.
- **Maintenance mode:** Admin → Payment Settings (or the Access controls card on Overview) → set minutes, edit the notice, start. Every non-admin device shows a full-page countdown and regains access automatically; “End now” releases everyone immediately.
- **Withdrawal edits:** When an admin changes a pending/approved request (amount, network, address), the user’s Wallet activity row, notification and status update to match.

## 4. Admin

| Field | Value |
|---|---|
| Username | `Admin` |
| Password | `Admin@12345` |

Change it immediately in **Payment Settings → Admin security** (or Profile → Change password). The database starts with only the admin account plus a small company wholesale catalogue — no demo users.

---

## 5. Push notifications (closed app)

1. Deploy over **HTTPS** (localhost is also treated as secure).
2. Open the app → **Settings → Enable push alerts** → allow notifications.
3. Tap **Send test** — a notification should arrive even with the app closed/backgrounded.
4. Tap it: the service worker opens the exact chat/order/notification route.

How it works: the client registers a VAPID subscription; when any device adds a notification for a user, the server pushes it (`web-push`) to every registered device for that user. Incoming messages show `"Sender: message preview"`. VAPID keys are generated automatically on first run and stored in `DATA_DIR/vapid.json`.

> iPhone: push works for apps **added to the Home Screen** (iOS 16.4+) — the install banner guides you through Share → Add to Home Screen.

---

## 6. What's inside

- **Auth & onboarding** — splash, welcome, signup with unique username/email/phone + referral code, login, password reset, 4–6 digit withdrawal PIN, hashed credentials.
- **Chat** — contacts‑only 1:1, text/photo/video/voice notes, sent/delivered/seen ticks, typing + online, edit (15 min, "Edited"), forward (no label on voice notes), mute/block/delete, media viewer, live cross‑device delivery.
- **Status** — text/photo/video (30 s max), 24 h expiry, viewers, replies, privacy (contacts/everyone/selected), buy‑from‑status.
- **Wallet** — 1 WC = $0.50, crypto/bank deposits managed by admin, USDT withdrawals with PIN + network, transaction history, 10 WC referral reward on a friend's first approved deposit.
- **Vendor** — vendor profile, company wholesale buying, listing/pricing in USD, stock auto‑hide at zero, orders, sales history.
- **Marketplace** — categories, search, stars, multi‑vendor cart, delivery checkout, "Request processing" flow, order timeline, and a package tracker that opens in a secure new tab (optional in‑app view) so host access policies can never break the app.
- **Admin** — KPIs, users (balance/trust/ban/delete/notify/chat), vendors, company products with image upload, order status workflow + tracking, deposit/withdrawal approve‑reject‑edit‑delete, payment methods, USDT networks, notification broadcast/edit/delete, support inbox.
- **Admin access tools** — “Log in as user” (no password, keeps the admin session with a Return-to-admin bar), password‑free login toggle (any password opens a known account), and site‑wide maintenance mode with an editable countdown that auto‑reopens access when it ends or can be ended instantly.
- **Support** — Smartsupp live chat is embedded; the support chat shows a “Connect on live chat” button automatically when the admin hasn’t replied for 10 minutes, and the widget is pre-filled with the user’s name/email.
- **Seasonal** — a Happy New Month greeting pops up once per account during the first 7 days of every month.
- **PWA** — install prompt (Android + iOS instructions), offline shell, app icon badge, dark/light themes, fully responsive.

---

## 7. Architecture

```
client (whalechat.html)
  │  GET  /api/state                 full snapshot + revision
  │  POST /api/ops                   diff ops (push/update/remove/set)
  │  GET  /api/events                Server-Sent Events (realtime)
  │  POST /api/push/subscribe        device subscription
  ▼
server.js  ──► data/state.json       shared database (atomic writes)
           ──► data/push-subscriptions.json
           ──► web-push ──► FCM / APNs / Mozilla
```

The client keeps its existing business logic and writes to a local copy; every change is diffed and pushed as generic ops. Other devices receive an SSE event, pull the new revision and re-render instantly. Conflicts resolve last‑write‑wins per record — suitable for this app's per‑user data ownership.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Banner says "Local device only" | You're on a static host — open the app from the server URL, or connect it in Settings |
| Push test says "permission" | Allow notifications for the site in browser settings, then reload |
| Push test says "No push device registered" | Ensure HTTPS, then enable alerts again (iOS needs Home Screen install) |
| Live updates stop | Reverse proxy is buffering `/api/events`; disable buffering and allow long‑lived connections |
| Data disappeared on another device | That device is in local mode, or the server `DATA_DIR` was not persisted |
| `AccessDenied` (S3/CloudFront XML) | It is a storage/bucket denial, not an app error. The tracker portal is now opened in a new tab (never auto-embedded). If a stale service worker cached an error page, open `whalechat.html#/reset-cache` or run `A.repair()` in the console to clear the worker + caches |
| Reset everything | Stop the server, delete `DATA_DIR/state.json`, restart (admin is recreated on first client visit) |

**Security note:** this is a complete product prototype. Authentication, PINs and wallet logic run in the client against the shared database; put it behind HTTPS, change the admin password, and add token‑based auth + server‑side validation before handling real money.

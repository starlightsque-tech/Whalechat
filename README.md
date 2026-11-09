# WhaleChat 🐋

A premium, fully responsive **social + e-commerce + wallet** app — installable as a PWA on Android, iPhone and desktop.

**Live file:** `whalechat.html` (open it, or serve the folder over HTTPS/localhost for PWA features).

---

## Quick start

1. Open `whalechat.html`.
2. Create an account (or sign in as admin).
3. Set your 4–6 digit withdrawal PIN.
4. Deposit Whale Coin (admin approves it), then shop, chat or open a vendor store.

### Default administrator

| Field | Value |
|---|---|
| Username | `Admin` |
| Password | `Admin@12345` |

Change the admin password from **Payment Settings → Admin security** (or Profile → Change password).
The database starts empty except the admin account and a small company wholesale catalogue.

---

## What's included

### Auth & onboarding
Splash, welcome, sign up (full name, unique username, email, phone, password, referral code), login by username/email, forgot password, PIN creation.

### Chat (WhatsApp-style)
- Contacts only — add by username, phone or email; no random chats
- 1-to-1 text, photos, videos and voice notes (MediaRecorder)
- Sent / delivered / seen ticks, online + typing indicators
- Long-press message → edit (15 min window, "Edited" label), copy, forward, delete
- Forwarded label (deliberately hidden for forwarded voice notes)
- Mute, block, delete chat, media preview viewer, chat search via global search

### Status
Text (5 gradient backgrounds), photo or video (max 30 s, validated), 24-hour auto-expiry, viewers list, reply-to-status, delete, privacy (contacts / everyone / selected contacts), attach a product with **Buy now** straight from the status.

### Wallet — Whale Coin
1 Whale Coin = **$0.50 USD**; conversions everywhere use `coins = USD ÷ 0.5`.
Deposit via admin-managed crypto addresses or bank transfer, withdraw USDT only (admin-managed networks) with withdrawal PIN, full transaction history, pending/approved/rejected states, notifications, referral rewards (10 WC on a friend's first approved deposit).

### Vendor system
Become-a-vendor flow (vendor username + password confirmation), vendor dashboard with balance, KPIs, inventory, company wholesale purchasing, listing/pricing in USD (auto-converted), stock management with auto-hide at zero, orders and sales history.

### Marketplace
Category filters, search, product detail, stars, multi-vendor cart, checkout with delivery form, balance payment, "Request processing" confirmation, order timeline, embedded tracker (`package-airtracker.zite.so`).

### Admin console
Overview KPIs, user management (edit balance/trust/sales, ban, delete, notify, chat), vendor management, company product CRUD with image upload, all orders with buyer delivery details and status workflow + tracking ref, deposit approve/reject, withdrawal approve/reject/edit/delete + network editor, notification broadcast/edit/delete, crypto/bank payment method editor, admin password change, support inbox.

### PWA
Web app manifest, custom icons, service worker (offline shell + notification click routing), smart install banner (Android `beforeinstallprompt`, iOS Share → Add to Home Screen instructions, "Don't show again", once-per-day dismissal), theme-aware UI, app badge support.

---

## Technical notes

- **Single-file app** (`whalechat.html`) — HTML, CSS and vanilla JS, no build step, no external JS dependencies.
- **Data** is stored in `localStorage` (database) + **IndexedDB** (photos, videos, voice notes) per browser profile, and synced live across tabs with `BroadcastChannel` / `storage` events.
- Passwords and PINs are hashed (SHA-256 via WebCrypto, with a fallback for non-secure contexts). Media is compressed client-side before upload.
- Uses the **Notification API** for in-browser alerts and the service worker `push` handler is ready for a server-driven push payload.

### Known boundary
Because this build ships without a server, accounts and messages live on the device/browser that created them. Two different phones will not see each other's data until the same UI is connected to a hosted API/database (the data model in `DB` maps 1:1 to users, vendors, products, orders, messages, statuses, wallets, transactions, referrals and notifications). True closed-app push also requires a push service (VAPID) on that backend.

### Serving
```
# any static server works
npx serve .        # or: python3 -m http.server 8080
```
Then open `http://localhost:8080/whalechat.html`. HTTPS (or localhost) is required for service worker, camera/mic and notifications.

---

## File map
```
whalechat.html          the entire app
manifest.webmanifest    PWA manifest
sw.js                   service worker
assets/logo.png         circular whale logo (in-app)
assets/icon-192.png     app icon
assets/icon-512.png     app icon / maskable
assets/whale.jpg        whale artwork
assets/hero.jpg         original design reference
```

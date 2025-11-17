QuickScores – clean, text‑only news
=================================

Overview
- Minimal news app mirroring the QuickScores ASCII UI and CSS.
- Aggregates NPR RSS feeds (no API key), caches for 5 minutes.

Getting started
- npm install
- Copy `.env.example` to `.env` (optional; defaults are fine)
- For SMS notifications: set up Twilio credentials in `.env`
- npm run dev (or npm start)
- Open http://localhost:4000

Endpoints
- GET /api/news – all categories
- GET /api/news/:category – one category (top, world, business, technology, us, politics, science, health, culture)
- GET /api/news/categories – list categories
- POST /api/subscribe – subscribe to SMS notifications
- GET /api/subscriptions – view all subscriptions (debug)

SMS Notifications
- Users can subscribe to SMS notifications for specific news categories
- Requires Twilio account and credentials
- Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- SMS messages are sent when new articles are published in subscribed categories

Styling
- Static assets are served from `public/` (including `public/styles.css`).
- The UI is ASCII‑styled and works in light/dark mode.

Deploy
- Railway/Render/Heroku/Fly: set start command to `node server.js` and expose port `$PORT`.
- Optional env: `PORT` (default 4000).

Notes
- The client now fetches available categories from `/api/news/categories` at load to avoid drift.

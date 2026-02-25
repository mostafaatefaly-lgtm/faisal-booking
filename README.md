# Faisal Meeting Room Booking — Vercel (Next.js + Vercel KV)

## What is this?
- Next.js (App Router) React front-end (Arabic RTL)
- Serverless API routes under `/app/api/*`
- Persistent storage using **Vercel KV** (free tier)
- Role-based login (admin/user)
- Conflict detection for time slots

## One-time setup on Vercel
1. Create project from GitHub or Upload.
2. In Project → Storage → **Add Vercel KV** → create database.
3. In Project → Settings → Environment Variables, add:
   - `ADMIN_PASSWORD` = `F@isal@2030`
   - `USER_PASSWORD`  = `Faisal@2026`
   - (KV variables are auto-injected when you link Storage)
4. Deploy.

## API endpoints
- `POST /api/login`
- `GET  /api/reservations?date=YYYY-MM-DD&role=user|admin&email=x@y.com`
- `POST /api/reservations`
- `POST /api/reservations/:id/approve` (admin)
- `POST /api/reservations/:id/cancel` (admin)
- `GET  /api/notifications`

## Notes
- To enable email notifications, integrate Resend and call from API.
- Data model is simple: `reservations:{date}` (SET of ids), `reservation:{id}` (object), `notifications` (LIST).
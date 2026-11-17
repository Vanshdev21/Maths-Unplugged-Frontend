# Maths Unplugged website

Next.js 16 frontend (Redux Toolkit + RTK Query, Tailwind v4, light and dark themes). The API lives in the **Maths-Unplugged-Backend** repo.

## Run locally

```bash
cp .env.example .env.local   # BACKEND_URL=http://localhost:8000
npm install
npm run dev                  # http://localhost:3000
```

The browser only calls `/api/v1/*` on this site; Next.js forwards those requests to `BACKEND_URL`, so login cookies stay first-party.

## Deploy on Vercel

Import this repo (Root Directory empty) and set:

| Variable | Example |
|---|---|
| `BACKEND_URL` | `https://maths-unplugged-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://maths-unplugged.vercel.app` |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `false` (every course free) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | your Google OAuth web client ID |

If Vercel rejects the region in `vercel.json`, delete that file.

## Scripts

`npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`. CI (`.github/workflows/ci.yml`) runs lint, type-check and build on every push.

The PDF viewer's worker is copied to `public/pdf.worker.min.mjs` on `npm install` (ignored by git).

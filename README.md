<<<<<<< HEAD
# Terry Tracker

Personal full-stack fintech portfolio app — track expenses, visualize spending by category, and fund a wallet via Paystack test payments.

**Standalone repo** — not tied to any other project.

## Features

- JWT auth with bcrypt-hashed passwords and HTTP-only session cookies
- Expense CRUD (category, amount, date)
- Dashboard with spending-by-category charts (Recharts)
- Wallet top-ups via Paystack sandbox (initialize → checkout → verify → webhook)
- Zod validation, rate-limited login/signup, env-based secrets

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js App Router, Tailwind CSS |
| Backend | Next.js API routes |
| Database | PostgreSQL + Prisma |
| Payments | Paystack Test API |

## Quick start

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, Paystack test keys

npm install
npm run db:migrate   # name the migration: init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Paystack test card

`4084 0840 8408 4081` · any future expiry · CVV `408` · PIN `0000` · OTP `123456`

## Deploy

| Service | Role |
|---|---|
| **Vercel** | Next.js app + API routes |
| **Railway / Render** | PostgreSQL |

1. Push to your own GitHub repo
2. Set all env vars from `.env.example` on Vercel
3. Run `npx prisma migrate deploy` against production `DATABASE_URL`
4. Set Paystack webhook to `https://your-app.vercel.app/api/webhooks/paystack`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply migrations (local) |
| `npm run db:deploy` | Apply migrations (production) |

Built as a portfolio project for fintech internship applications.
=======
# Terry-Expense-Tracker
>>>>>>> 8180c03ec61aa3a40eefcedab2e0ac904173b42a

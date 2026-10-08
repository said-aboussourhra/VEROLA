# VEROLA — Print what you imagine

The online storefront and production platform for **VÉLORA**, a single printing shop in Casablanca: a real browser design canvas,
a branded catalogue with a live pricing engine, a live press floor and a complete order pipeline.

Built by **BAOUCOUS — Web Developer & Digital Creator**.

---

## What's inside

| Area | Where | Notes |
|---|---|---|
| Print customizer | `/customize` | Fabric.js canvas · layers · undo/redo · snapping · DPI preflight · print areas · print proof |
| Press floor | `/floor` | live machine telemetry over Server-Sent Events |
| Admin CMS | `/admin` | hero, media, orders, notifications, branding, developer page |
| Auth | `/login` · `/signup` | scrypt password hashing, server sessions, admin access code |
| Design library | `/designs` | free + subscription vector designs (SVG) |
| Order tracking | `/track/[code]` | glowing production timeline |
| Developer page | `/developer` | fully editable identity |

**Admin access:** set `ADMIN_CODE` in `.env` (local development falls back to `SAID2002`; production never does). Enter it at `/login` → *Administrator access*.

---

## 1. Push to GitHub

```bash
# from the project folder
git init
git add .
git commit -m "chore: VEROLA printing platform"

# create the repo on github.com (or with the GitHub CLI):
#   gh repo create verola --private --source=. --push
git remote add origin https://github.com/<you>/verola.git
git branch -M main
git push -u origin main
```

> `.gitignore` already excludes `.env`, `node_modules`, `.next` and user uploads.
> **Never commit `.env`.**

---

## 2. Deploy to Vercel

1. **vercel.com → Add New → Project → Import** your GitHub repo.
2. Vercel detects **Next.js** automatically. Keep the defaults
   (`npm run build`, framework preset Next.js).
3. **Environment Variables** → add at minimum:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your pooled Postgres URL (Vercel Postgres / Neon / Supabase) |
   | `ADMIN_CODE` | a private code of your choice (required in production) |
   | `ADMIN_EMAILS` | your email, comma separated |
   | `STORAGE_DRIVER` | `blob` on Vercel |
   | `BLOB_READ_WRITE_TOKEN` | from Vercel → Storage → Blob |

4. **Deploy.** Then open `https://<project>.vercel.app`.

### Database

```bash
# local
npm install
npm run db:migrate       # applies the migrations in ./drizzle
npm run dev
```

On Vercel, create a Postgres store (Vercel Postgres / Neon / Supabase),
copy the **pooled** connection string into `DATABASE_URL`, then run
`npm run db:migrate` locally against it once. After changing `src/db/schema.ts`, run `npm run db:generate` and commit the new migration.

### File storage (important)

Vercel functions have a **read-only filesystem**. Either:

* `STORAGE_DRIVER=blob` + `BLOB_READ_WRITE_TOKEN` (recommended, persistent), or
* `UPLOAD_DIR=/tmp/verola-uploads` (works, but files are lost on cold start).

Self-hosting / local: leave `STORAGE_DRIVER=fs` and `UPLOAD_DIR=./data/uploads`.

### Custom domain

Point your domain (e.g. `velora.ma`) at the Vercel project and set `NEXT_PUBLIC_SITE_URL` to the same URL.

---

## 3. Scripts

```bash
npm run dev         # development
npm run build       # production build
npm run start       # serve the build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # unit tests (pricing engine)
npm run db:generate # create a migration from schema changes
npm run db:migrate  # apply migrations
```

---

## 4. Environment

Copy `.env.example` → `.env`. Every secret lives there; nothing sensitive is
ever exposed to the client bundle. The only client-readable values are
`NEXT_PUBLIC_*`.

---

## 5. Design system

Tokens, components and rules live in [`DESIGN.md`](./DESIGN.md). Preview them at `/design-system`.

---

## 6. Architecture notes

* **TypeScript strict**, App Router, server components where possible.
* **Drizzle ORM + PostgreSQL** — relational schema: users, sessions, orders,
  jobs, media, notifications, saved designs, order messages, dev profile.
* **Pricing engine** (`src/lib/pricing.ts`) is pure and server-validated.
* **Shop config** (`src/lib/shop.ts`) holds the single shop's name, contact, currency and colours.
* **Storage, email and OAuth** are isolated behind single service modules —
  swapping providers touches one file each.
* **RTL** for Arabic using logical CSS properties.
* **Accessibility**: semantic HTML, keyboard nav, focus rings, `prefers-reduced-motion`.

---

© VEROLA — All Rights Reserved
Designed & Developed by **BAOUCOUS**
